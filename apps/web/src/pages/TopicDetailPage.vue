<script setup lang="ts">
import { type IDragEvent } from '@vue-dnd-kit/core';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, nextTick, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ItemsApiError, type ItemDto } from '@/api/items';
import { TopicsApiError } from '@/api/topics';
import { ContentPageWrapper, PageShell } from '@/components/layout';
import { RankedDropZone, RankRowDraggable } from '@/components/topic';
import {
  TApproveModal,
  TButton,
  TError,
  TInput,
  TLoader,
  TPrivacyChip,
  type PrivacyValue,
} from '@/components/ui-kit';
import { useTailwindBreakpoints } from '@/composables/useTailwindBreakpoints';
import {
  applyOptimisticInboxToRank,
  useDeleteTopicMutation,
  useRankItemMutation,
  useReorderItemsMutation,
  useUpdateTopicPrivacyMutation,
  useUpdateTopicTitleMutation,
} from '@/composables/useTopicMutations';
import { useRankedLiveGap } from '@/composables/useRankedLiveGap';
import { useTopicItemsQuery } from '@/composables/useTopicItemsQuery';
import { useTopicQuery } from '@/composables/useTopicQuery';
import { copyText } from '@/lib/copy-text';
import { playDropSettleAnimation } from '@/lib/dnd-drop-settle';
import { queryKeys } from '@/query/keys';
import { RouteName } from '@/router/route-names';

const PRIVACY_OPTIONS: PrivacyValue[] = ['private', 'unlisted', 'public'];

const EMPTY_INBOX: ItemDto[] = [];
const EMPTY_RANKED: ItemDto[] = [];

const route = useRoute();
const router = useRouter();

const topicId = computed(() => String(route.params.id ?? ''));

const queryClient = useQueryClient();
const topicQuery = useTopicQuery(topicId);
const itemsQuery = useTopicItemsQuery(topicId);
const updatePrivacy = useUpdateTopicPrivacyMutation(() => topicId.value);
const updateTitle = useUpdateTopicTitleMutation(() => topicId.value);
const deleteTopicMut = useDeleteTopicMutation();
const rankItemMut = useRankItemMutation(() => topicId.value);
const reorderMut = useReorderItemsMutation(() => topicId.value);

const privacyOpen = ref(false);
const actionError = ref('');
const copyFeedback = ref('');
const approveOpen = ref(false);
const titleEditing = ref(false);
const draftTitle = ref('');
const titleError = ref('');

const TITLE_INPUT_ID = 'topic-detail-title';

const breakpoints = useTailwindBreakpoints();
const isMdUp = breakpoints.greaterOrEqual('md');

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
const busyTitle = computed(() => updateTitle.isPending.value);
const busyDelete = computed(() => deleteTopicMut.isPending.value);
const isPending = computed(() => topicQuery.isPending.value || itemsQuery.isPending.value);
const isError = computed(() => topicQuery.isError.value || itemsQuery.isError.value);

function clearActionError() {
  actionError.value = '';
}

function clearTitleError() {
  titleError.value = '';
}

async function startTitleEdit() {
  if (!topic.value || busyTitle.value) return;
  clearActionError();
  clearTitleError();
  privacyOpen.value = false;
  draftTitle.value = topic.value.title;
  titleEditing.value = true;
  await nextTick();
  document.getElementById(TITLE_INPUT_ID)?.focus();
}

function cancelTitleEdit() {
  if (busyTitle.value) return;
  titleEditing.value = false;
  draftTitle.value = '';
  clearTitleError();
}

async function saveTitle() {
  if (!topic.value || busyTitle.value) return;
  clearTitleError();
  clearActionError();

  const trimmed = draftTitle.value.trim();
  if (!trimmed) {
    titleError.value = 'Укажите название';
    return;
  }
  if (trimmed === topic.value.title) {
    cancelTitleEdit();
    return;
  }

  try {
    await updateTitle.mutateAsync(trimmed);
    titleEditing.value = false;
    draftTitle.value = '';
  } catch (err) {
    if (err instanceof TopicsApiError) {
      if (err.status === 401) {
        void router.replace({ name: RouteName.Login, query: { returnUrl: route.fullPath } });
        return;
      }
      titleError.value = err.fields?.title || err.message || 'Не удалось сохранить название';
      return;
    }
    titleError.value = 'Не удалось сохранить название';
  }
}

function applyApiError(err: unknown, fallback: string) {
  if (err instanceof TopicsApiError || err instanceof ItemsApiError) {
    if (err.status === 401) {
      void router.replace({ name: RouteName.Login, query: { returnUrl: route.fullPath } });
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
    await copyText(url);
    copyFeedback.value = 'Ссылка скопирована';
    window.setTimeout(() => {
      if (copyFeedback.value === 'Ссылка скопирована') copyFeedback.value = '';
    }, 2000);
  } catch {
    actionError.value = 'Не удалось скопировать ссылку';
  }
}

function openDeleteTopic() {
  clearActionError();
  approveOpen.value = true;
}

async function onApproveDeleteTopic() {
  clearActionError();
  try {
    await deleteTopicMut.mutateAsync(topicId.value);
    approveOpen.value = false;
    await router.replace({ name: RouteName.AppTopics });
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
    name: RouteName.AppTopicItemCreate,
    params: { id: topicId.value },
  });
}

function goItem(itemId: string) {
  void router.push({
    name: RouteName.AppTopicItemDetail,
    params: { id: topicId.value, itemId },
  });
}

function onRetry() {
  void topicQuery.refetch();
  void itemsQuery.refetch();
}
</script>

<template>
  <PageShell v-if="isPending">
    <TLoader />
  </PageShell>
  <PageShell v-else-if="isError">
    <TError @retry="onRetry" />
  </PageShell>

  <ContentPageWrapper
    v-else-if="topic"
    :route-to="RouteName.AppTopics"
    text-to="Мои топики"
    :title="topic.title"
  >
    <template #title>
      <div v-if="titleEditing" class="mt-4 flex flex-col gap-3">
        <TInput
          :id="TITLE_INPUT_ID"
          v-model="draftTitle"
          label="Название"
          type="text"
          autocomplete="off"
          :error="titleError"
          :disabled="busyTitle"
        />
        <div class="flex flex-wrap gap-2">
          <TButton size="sm" :loading="busyTitle" @click="saveTitle">Сохранить</TButton>
          <TButton variant="danger-ghost" size="sm" :disabled="busyTitle" @click="cancelTitleEdit">
            Отмена
          </TButton>
        </div>
      </div>
      <h1 v-else class="mt-4 text-h1 text-ink">
        <button
          type="button"
          class="cursor-pointer border-0 bg-transparent p-0 text-left text-inherit transition-opacity hover:enabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          aria-label="Изменить название топика"
          @click="startTitleEdit"
        >
          {{ topic.title }}
        </button>
      </h1>
    </template>
    <template #chrome>
      <div class="mt-3 flex items-center justify-between gap-3 md:mt-4">
        <div class="flex min-w-0 items-center gap-2">
          <button
            type="button"
            class="cursor-pointer transition-opacity hover:enabled:opacity-70"
            :aria-expanded="privacyOpen"
            aria-haspopup="listbox"
            aria-label="Приватность топика"
            :disabled="busyPrivacy"
            @click="togglePrivacyPicker"
          >
            <TPrivacyChip :privacy="topic.privacy" :selected="privacyOpen" />
          </button>

          <button
            v-if="isUnlisted && !isMdUp"
            type="button"
            class="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-info transition-colors hover:bg-info-soft"
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

          <TButton
            v-if="isUnlisted && isMdUp"
            variant="ghost"
            size="sm"
            class="shrink-0"
            @click="onCopyLink"
          >
            Скопировать ссылку
          </TButton>
        </div>

        <TButton
          variant="danger-ghost"
          class="shrink-0"
          :disabled="busyDelete"
          @click="openDeleteTopic"
        >
          Удалить топик
        </TButton>
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
          class="cursor-pointer transition-opacity hover:enabled:opacity-70"
          :aria-selected="topic.privacy === option"
          :disabled="busyPrivacy"
          @click="onPrivacySelect(option)"
        >
          <TPrivacyChip :privacy="option" :selected="topic.privacy === option" />
        </button>
      </div>

      <p v-if="copyFeedback" class="mt-2 text-caption text-success" role="status">
        {{ copyFeedback }}
      </p>
      <p v-if="actionError" class="mt-2 text-caption text-danger" role="alert">
        {{ actionError }}
      </p>
    </template>

    <div class="flex flex-col gap-8 md:grid md:grid-cols-2 md:items-stretch md:gap-6">
      <section class="md:glass md:rounded-lg md:p-5" aria-labelledby="s05-inbox-heading">
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
          class="mt-3 cursor-pointer text-body-sm font-semibold text-accent"
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
        <h2 id="s05-rank-heading" class="text-body-sm font-bold text-ink md:text-body md:font-bold">
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

    <TApproveModal
      v-model:open="approveOpen"
      title="Удалить топик?"
      description="Безвозвратно. Элементы тоже удалятся."
      confirm-label="Удалить"
      :confirm-loading="busyDelete"
      @confirm="onApproveDeleteTopic"
    />
  </ContentPageWrapper>
</template>
