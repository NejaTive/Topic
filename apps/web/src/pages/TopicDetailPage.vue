<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ItemsApiError } from '@/api/items';
import { TopicsApiError } from '@/api/topics';
import {
  AppButton,
  AppNav,
  PrivacyChip,
  RankRow,
  type PrivacyValue,
  type RankRowDragPoint,
} from '@/components/ui';
import {
  useDeleteTopicMutation,
  useRankItemMutation,
  useReorderItemsMutation,
  useUpdateTopicPrivacyMutation,
} from '@/composables/useTopicMutations';
import { useTopicItemsQuery } from '@/composables/useTopicItemsQuery';
import { useTopicQuery } from '@/composables/useTopicQuery';

const PRIVACY_OPTIONS: PrivacyValue[] = ['private', 'unlisted', 'public'];

type ActiveDrag = { source: 'ranked' | 'inbox'; itemId: string };

const route = useRoute();
const router = useRouter();

const topicId = computed(() => String(route.params.id ?? ''));

const topicQuery = useTopicQuery(topicId);
const itemsQuery = useTopicItemsQuery(topicId);
const updatePrivacy = useUpdateTopicPrivacyMutation(() => topicId.value);
const deleteTopicMut = useDeleteTopicMutation();
const rankItemMut = useRankItemMutation(() => topicId.value);
const reorderMut = useReorderItemsMutation(() => topicId.value);

const privacyOpen = ref(false);
const actionError = ref('');
const copyFeedback = ref('');
const draggingId = ref<string | null>(null);
const rankedDropActive = ref(false);
const activeDrag = ref<ActiveDrag | null>(null);
const rankedSectionRef = ref<HTMLElement | null>(null);
const rankedListRef = ref<HTMLElement | null>(null);

/** Mobile chip compact for meta? Figma S05 meta uses labeled chip even on M. */
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
  unlockScrollForDrag();
});

const topic = computed(() => topicQuery.data.value);
const inbox = computed(() => itemsQuery.data.value?.inbox ?? []);
const ranked = computed(() => itemsQuery.data.value?.ranked ?? []);

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

async function onToRank(itemId: string) {
  clearActionError();
  try {
    await rankItemMut.mutateAsync(itemId);
  } catch (err) {
    applyApiError(err, 'Не удалось перенести в рейтинг');
  }
}

/** Slot index 0…N by pointer Y relative to ranked `<li>` midpoints. */
function dropIndexFromY(clientY: number, listEl: HTMLElement): number {
  const rows = [...listEl.querySelectorAll(':scope > li')];
  for (let i = 0; i < rows.length; i++) {
    const rect = rows[i]!.getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) return i;
  }
  return rows.length;
}

function moveId(ids: string[], itemId: string, toIndex: number): string[] {
  const fromIndex = ids.indexOf(itemId);
  if (fromIndex < 0) return ids;
  const next = [...ids];
  next.splice(fromIndex, 1);
  const adjusted = fromIndex < toIndex ? toIndex - 1 : toIndex;
  next.splice(adjusted, 0, itemId);
  return next;
}

function pointInRect(x: number, y: number, rect: DOMRect): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function isOverRanked(point: RankRowDragPoint): boolean {
  const el = rankedSectionRef.value;
  if (!el) return false;
  return pointInRect(point.clientX, point.clientY, el.getBoundingClientRect());
}

function lockScrollForDrag() {
  document.body.style.overflow = 'hidden';
  document.body.style.touchAction = 'none';
}

function unlockScrollForDrag() {
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
}

function onRowDragBegin(source: ActiveDrag['source'], itemId: string) {
  activeDrag.value = { source, itemId };
  draggingId.value = itemId;
  rankedDropActive.value = true;
  lockScrollForDrag();
  clearActionError();
}

function onRowDragMove(point: RankRowDragPoint) {
  if (!activeDrag.value) return;
  rankedDropActive.value = isOverRanked(point);
}

function onRowDragCancel() {
  activeDrag.value = null;
  draggingId.value = null;
  rankedDropActive.value = false;
  unlockScrollForDrag();
}

async function onRowDragFinish(point: RankRowDragPoint) {
  const drag = activeDrag.value;
  activeDrag.value = null;
  draggingId.value = null;
  rankedDropActive.value = false;
  unlockScrollForDrag();
  if (!drag) return;

  if (!isOverRanked(point)) return;

  if (drag.source === 'inbox') {
    // Без S08: inbox → только в конец ranked (не mid-insert).
    await onToRank(drag.itemId);
    return;
  }

  const currentIds = ranked.value.map((item) => item.id);
  if (!currentIds.includes(drag.itemId)) return;

  const listEl = rankedListRef.value;
  const toIndex = listEl ? dropIndexFromY(point.clientY, listEl) : currentIds.length;
  const nextIds = moveId(currentIds, drag.itemId, toIndex);
  if (nextIds.join(',') === currentIds.join(',')) return;

  clearActionError();
  try {
    await reorderMut.mutateAsync(nextIds);
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

    <main
      class="mx-auto w-full max-w-[366px] px-4 pb-28 pt-6 md:max-w-[1280px] md:px-10 md:pb-10 md:pt-28"
    >
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

        <!-- Meta: privacy (+ copy unlisted) | delete — Figma SPACE_BETWEEN -->
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

            <!-- Mobile Unlisted: icon copy 24 -->
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

            <!-- Desktop Unlisted: ghost «Скопировать ссылку» -->
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

        <!-- Lists: mobile stack / desktop 2 колонки-панели (Figma col-inbox | col-ranked) -->
        <div
          class="mt-8 flex flex-col gap-8 md:mt-6 md:grid md:grid-cols-2 md:items-stretch md:gap-6"
        >
          <!-- Inbox column -->
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
            <ul class="mt-3 flex list-none flex-col gap-3 p-0" aria-label="Ещё не оценены">
              <li v-for="item in inbox" :key="item.id">
                <RankRow
                  class="!max-w-none w-full"
                  mode="inbox"
                  drag-enabled
                  :dragging="draggingId === item.id"
                  :title="item.title"
                  :cover-url="item.coverUrl ?? undefined"
                  @click="goItem(item.id)"
                  @drag-begin="onRowDragBegin('inbox', item.id)"
                  @drag-move="onRowDragMove"
                  @drag-finish="onRowDragFinish"
                  @drag-cancel="onRowDragCancel"
                />
              </li>
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

          <!-- Ranked column (drop target: reorder + inbox→end) -->
          <section
            ref="rankedSectionRef"
            class="md:rounded-lg md:border md:border-line md:bg-surface md:p-5"
            aria-labelledby="s05-rank-heading"
            :class="rankedDropActive ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : null"
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
            <ul
              v-else
              ref="rankedListRef"
              class="mt-3 flex list-none flex-col gap-3 p-0"
              aria-label="Рейтинг"
            >
              <li v-for="item in ranked" :key="item.id">
                <RankRow
                  class="!max-w-none w-full"
                  mode="ranked"
                  drag-enabled
                  :dragging="draggingId === item.id"
                  :rank="item.rankPosition ?? undefined"
                  :title="item.title"
                  :cover-url="item.coverUrl ?? undefined"
                  @click="goItem(item.id)"
                  @drag-begin="onRowDragBegin('ranked', item.id)"
                  @drag-move="onRowDragMove"
                  @drag-finish="onRowDragFinish"
                  @drag-cancel="onRowDragCancel"
                />
              </li>
            </ul>
            <p v-if="ranked.length === 0 && !isInboxOnly" class="mt-3 text-body-sm text-muted">
              Пока пусто
            </p>
          </section>
        </div>
      </template>
    </main>
  </div>
</template>
