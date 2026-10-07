<script setup lang="ts">
import { type IDragEvent } from '@vue-dnd-kit/core';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ItemsApiError, type ItemDto } from '@/api/items';
import { TopicsApiError } from '@/api/topics';
import {
  AppButton,
  AppNav,
  PrivacyChip,
  RankedDropZone,
  RankRowDraggable,
  type PrivacyValue,
} from '@/components/ui';
import {
  applyOptimisticInboxToRank,
  useDeleteTopicMutation,
  useRankItemMutation,
  useReorderItemsMutation,
  useUpdateTopicPrivacyMutation,
} from '@/composables/useTopicMutations';
import { useRankedLiveGap } from '@/composables/useRankedLiveGap';
import { useTopicItemsQuery } from '@/composables/useTopicItemsQuery';
import { useTopicQuery } from '@/composables/useTopicQuery';
import { playDropSettleAnimation } from '@/lib/dnd-drop-settle';
import { queryKeys } from '@/query/keys';

const PRIVACY_OPTIONS: PrivacyValue[] = ['private', 'unlisted', 'public'];

/** Стабильные пустые refs — identity для suggestSort. */
const EMPTY_INBOX: ItemDto[] = [];
const EMPTY_RANKED: ItemDto[] = [];

const route = useRoute();
const router = useRouter();

const topicId = computed(() => String(route.params.id ?? ''));

const queryClient = useQueryClient();
const topicQuery = useTopicQuery(topicId);
const itemsQuery = useTopicItemsQuery(topicId);
const updatePrivacy = useUpdateTopicPrivacyMutation(() => topicId.value);
const deleteTopicMut = useDeleteTopicMutation();
const rankItemMut = useRankItemMutation(() => topicId.value);
const reorderMut = useReorderItemsMutation(() => topicId.value);

const privacyOpen = ref(false);
const actionError = ref('');
const copyFeedback = ref('');

const isMdUp = ref(false);

function syncViewport() {
  isMdUp.value = window.matchMedia('(min-width: 768px)').matches;
}

onMounted(() => {
  syncViewport();
  window.addEventListener('resize', syncViewport);
});

onUnmounted(() => {
  window.removeEventListener('resize', syncViewport);
});

const topic = computed(() => topicQuery.data.value);
const inbox = computed(() => itemsQuery.data.value?.inbox ?? EMPTY_INBOX);
const ranked = computed(() => itemsQuery.data.value?.ranked ?? EMPTY_RANKED);

const rankedGap = useRankedLiveGap(ranked, inbox);

const isInboxOnly = computed(
  () => itemsQuery.isSuccess.value && inbox.value.length > 0 && ranked.value.length === 0,
);

const shareUrl = computed(() => {
  const shareId = topic.value?.shareId;
  if (!shareId || typeof window === 'undefined') return '';
  return `${window.location.origin}/t/${shareId}`;
});

const isUnlisted = computed(() => topic.value?.privacy === 'unlisted');
const busyPrivacy = computed(() => updatePrivacy.isPending.value);
const busyDelete = computed(() => deleteTopicMut.isPending.value);

function clearActionError() {
  actionError.value = '';
}

function applyApiError(err: unknown, fallback: string) {
  if (err instanceof TopicsApiError || err instanceof ItemsApiError) {
    if (err.status === 401) {
      void router.replace(`/login?returnUrl=${encodeURIComponent(route.fullPath)}`);
      return;
    }
    actionError.value = err.message || fallback;
    return;
  }
  actionError.value = fallback;
}

function togglePrivacyPicker() {
  clearActionError();
  privacyOpen.value = !privacyOpen.value;
}

async function onPrivacySelect(value: PrivacyValue) {
  if (!topic.value || value === topic.value.privacy) {
    privacyOpen.value = false;
    return;
  }
  clearActionError();
  try {
    await updatePrivacy.mutateAsync(value);
    privacyOpen.value = false;
  } catch (err) {
    applyApiError(err, 'Не удалось сменить приватность');
  }
}

async function onCopyLink() {
  clearActionError();
  copyFeedback.value = '';
  const url = shareUrl.value;
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    copyFeedback.value = 'Ссылка скопирована';
    window.setTimeout(() => {
      if (copyFeedback.value === 'Ссылка скопирована') copyFeedback.value = '';
    }, 2000);
  } catch {
    actionError.value = 'Не удалось скопировать ссылку';
  }
}

async function onDeleteTopic() {
  clearActionError();
  const ok = window.confirm('Удалить топик безвозвратно?');
  if (!ok) return;
  try {
    await deleteTopicMut.mutateAsync(topicId.value);
    await router.replace({ name: 'app-topics' });
  } catch (err) {
    applyApiError(err, 'Не удалось удалить топик');
  }
}

async function onRankedDrop(e: IDragEvent) {
  const dragged = e.draggedItems[0];
  if (!dragged) return;

  const meta = dragged.data as { id?: string; mode?: 'ranked' | 'inbox' } | undefined;
  const itemId = meta?.id ?? (dragged.item as ItemDto | undefined)?.id;
  if (!itemId) return;

  const fromInbox = meta?.mode === 'inbox' || dragged.items === inbox.value;
  const inboxInsertAt = rankedGap.peekInsertAt();

  let nextIds: string[] | null = null;
  if (!fromInbox) {
    const result = e.helpers.suggestSort('vertical');
    if (result) {
      nextIds = (result.targetItems as ItemDto[]).map((row) => row.id);
    }
  }

  await playDropSettleAnimation(e);

  // Optimistic в кэш, потом reset щели — иначе мигает пустое место.
  if (fromInbox) {
    const prevIds = ranked.value.map((row) => row.id);
    const at = Math.min(Math.max(0, inboxInsertAt ?? prevIds.length), prevIds.length);
    const ordered = [...prevIds];
    ordered.splice(at, 0, itemId);
    const previous = applyOptimisticInboxToRank(queryClient, topicId.value, itemId, at);
    rankedGap.reset();
    await nextTick();

    clearActionError();
    try {
      await rankItemMut.mutateAsync(itemId);
      if (at < prevIds.length) {
        await reorderMut.mutateAsync(ordered);
      }
    } catch (err) {
      if (previous) {
        queryClient.setQueryData(queryKeys.topics.items(topicId.value), previous);
      }
      applyApiError(err, 'Не удалось перенести в рейтинг');
    }
    return;
  }

  if (!nextIds?.length) {
    rankedGap.reset();
    return;
  }
  if (nextIds.join(',') === ranked.value.map((row) => row.id).join(',')) {
    rankedGap.reset();
    return;
  }

  clearActionError();
  try {
    const pending = reorderMut.mutateAsync(nextIds);
    rankedGap.reset();
    await nextTick();
    await pending;
  } catch (err) {
    applyApiError(err, 'Не удалось сохранить порядок');
  }
}

function goAddItem() {
  void router.push({
    name: 'app-topic-item-create',
    params: { id: topicId.value },
  });
}

function goItem(itemId: string) {
  void router.push({
    name: 'app-topic-item-detail',
    params: { id: topicId.value, itemId },
  });
}

function onRetry() {
  void topicQuery.refetch();
  void itemsQuery.refetch();
}
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <AppNav />

    <main class="mx-auto w-full max-w-91.5 px-4 pb-28 pt-6 md:max-w-7xl md:px-10 md:pb-10 md:pt-28">
      <RouterLink
        to="/app/topics"
        class="w-fit text-body-sm font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        ← Мои топики
      </RouterLink>

      <p
        v-if="topicQuery.isPending.value || itemsQuery.isPending.value"
        class="mt-10 text-body text-muted"
        role="status"
      >
        Загрузка…
      </p>

      <div
        v-else-if="topicQuery.isError.value || itemsQuery.isError.value"
        class="mt-10 flex flex-col items-start gap-3"
        role="alert"
      >
        <p class="text-body text-danger">
          {{
            topicQuery.error.value instanceof TopicsApiError &&
            topicQuery.error.value.status === 404
              ? 'Топик не найден'
              : 'Не удалось загрузить топик'
          }}
        </p>
        <AppButton variant="secondary" size="sm" @click="onRetry">Повторить</AppButton>
      </div>

      <template v-else-if="topic">
        <h1 class="mt-4 text-h1 text-ink md:text-[28px] md:leading-9">
          {{ topic.title }}
        </h1>

        <div class="mt-3 flex items-center justify-between gap-3 md:mt-4">
          <div class="flex min-w-0 items-center gap-2">
            <button
              type="button"
              class="rounded-sm outline-none transition-opacity hover:enabled:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring cursor-pointer"
              :aria-expanded="privacyOpen"
              aria-haspopup="listbox"
              aria-label="Приватность топика"
              :disabled="busyPrivacy"
              @click="togglePrivacyPicker"
            >
              <PrivacyChip :privacy="topic.privacy" :selected="privacyOpen" />
            </button>

            <button
              v-if="isUnlisted && !isMdUp"
              type="button"
              class="flex size-6 shrink-0 items-center justify-center rounded-sm text-info outline-none transition-colors hover:bg-info-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              aria-label="Скопировать ссылку"
              @click="onCopyLink"
            >
              <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect
                  x="5.5"
                  y="5.5"
                  width="8"
                  height="8"
                  rx="1.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>

            <AppButton
              v-if="isUnlisted && isMdUp"
              variant="ghost"
              size="sm"
              class="shrink-0"
              @click="onCopyLink"
            >
              Скопировать ссылку
            </AppButton>
          </div>

          <AppButton
            variant="danger-ghost"
            class="shrink-0"
            :disabled="busyDelete"
            :loading="busyDelete"
            @click="onDeleteTopic"
          >
            Удалить топик
          </AppButton>
        </div>

        <div
          v-if="privacyOpen"
          class="mt-3 flex flex-wrap gap-2"
          role="listbox"
          aria-label="Выбор приватности"
        >
          <button
            v-for="option in PRIVACY_OPTIONS"
            :key="option"
            type="button"
            role="option"
            class="rounded-sm outline-none transition-opacity hover:enabled:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring cursor-pointer"
            :aria-selected="topic.privacy === option"
            :disabled="busyPrivacy"
            @click="onPrivacySelect(option)"
          >
            <PrivacyChip :privacy="option" :selected="topic.privacy === option" />
          </button>
        </div>

        <p v-if="copyFeedback" class="mt-2 text-caption text-accent" role="status">
          {{ copyFeedback }}
        </p>
        <p v-if="actionError" class="mt-2 text-caption text-danger" role="alert">
          {{ actionError }}
        </p>

        <div
          class="mt-8 flex flex-col gap-8 md:mt-6 md:grid md:grid-cols-2 md:items-stretch md:gap-6"
        >
          <section
            class="md:rounded-lg md:border md:border-line md:bg-surface md:p-5"
            aria-labelledby="s05-inbox-heading"
          >
            <h2
              id="s05-inbox-heading"
              class="text-body-sm font-bold text-ink md:text-body md:font-bold"
            >
              Ещё не оценены
            </h2>
            <ul
              class="rank-dnd-list mt-3 flex list-none flex-col gap-3 p-0"
              aria-label="Ещё не оценены"
            >
              <template v-for="(item, index) in inbox" :key="item.id">
                <li
                  class="rank-dnd-drop-slot"
                  :class="{ 'is-open': rankedGap.showInboxSpacerBefore(index, item.id) }"
                  aria-hidden="true"
                />
                <li
                  class="rank-dnd-item"
                  :class="{ 'rank-dnd-source-collapsed': rankedGap.isSource(item.id) }"
                >
                  <RankRowDraggable
                    mode="inbox"
                    :index="index"
                    :items="inbox"
                    :item-id="item.id"
                    :title="item.title"
                    :cover-url="item.coverUrl ?? undefined"
                    @click="goItem(item.id)"
                    @drag-start="rankedGap.onDragStart"
                    @drag-move="rankedGap.onDragMove"
                    @drag-end="rankedGap.onDragEndOrCancel"
                    @drag-cancel="rankedGap.onDragEndOrCancel"
                  />
                </li>
              </template>
              <li
                class="rank-dnd-drop-slot"
                :class="{ 'is-open': rankedGap.showInboxEndSpacer() }"
                aria-hidden="true"
              />
            </ul>
            <p v-if="inbox.length === 0" class="mt-3 text-body-sm text-muted">Пока пусто</p>
            <button
              type="button"
              class="mt-3 text-body-sm font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring cursor-pointer"
              @click="goAddItem"
            >
              + Добавить элемент
            </button>
          </section>

          <RankedDropZone
            :items="ranked"
            :on-drop-event="onRankedDrop"
            aria-labelledby="s05-rank-heading"
          >
            <h2
              id="s05-rank-heading"
              class="text-body-sm font-bold text-ink md:text-body md:font-bold"
            >
              Рейтинг
            </h2>
            <p v-if="isInboxOnly" class="mt-3 text-body-sm text-muted">
              Перенесите в рейтинг, когда будете готовы
            </p>
            <div
              v-if="isInboxOnly"
              class="rank-dnd-drop-slot"
              :class="{ 'is-open mt-3': rankedGap.showEndSpacer() }"
              :data-rank-drop-slot="rankedGap.showEndSpacer() ? '' : undefined"
              aria-hidden="true"
            />
            <ul
              v-if="!isInboxOnly"
              class="rank-dnd-list mt-3 flex list-none flex-col gap-3 p-0"
              aria-label="Рейтинг"
            >
              <template v-for="(item, index) in ranked" :key="item.id">
                <li
                  class="rank-dnd-drop-slot"
                  :class="{ 'is-open': rankedGap.showSpacerBefore(index, item.id) }"
                  :data-rank-drop-slot="rankedGap.showSpacerBefore(index, item.id) ? '' : undefined"
                  aria-hidden="true"
                />
                <li
                  class="rank-dnd-item"
                  :class="{ 'rank-dnd-source-collapsed': rankedGap.isSource(item.id) }"
                >
                  <RankRowDraggable
                    mode="ranked"
                    :index="index"
                    :items="ranked"
                    :item-id="item.id"
                    :rank="item.rankPosition ?? undefined"
                    :title="item.title"
                    :cover-url="item.coverUrl ?? undefined"
                    @click="goItem(item.id)"
                    @drag-start="rankedGap.onDragStart"
                    @drag-move="rankedGap.onDragMove"
                    @drag-end="rankedGap.onDragEndOrCancel"
                    @drag-cancel="rankedGap.onDragEndOrCancel"
                  />
                </li>
              </template>
              <li
                class="rank-dnd-drop-slot"
                :class="{ 'is-open': rankedGap.showEndSpacer() }"
                :data-rank-drop-slot="rankedGap.showEndSpacer() ? '' : undefined"
                aria-hidden="true"
              />
            </ul>
            <p v-if="ranked.length === 0 && !isInboxOnly" class="mt-3 text-body-sm text-muted">
              Пока пусто
            </p>
          </RankedDropZone>
        </div>
      </template>
    </main>
  </div>
</template>
