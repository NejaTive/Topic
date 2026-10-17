<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ShareApiError } from '@/api/share';
import type { TopicCategory } from '@/api/topics';
import { ContentPageWrapper, PageShell } from '@/components/layout';
import CopyItemToTopicModal from '@/components/share/CopyItemToTopicModal.vue';
import { TError, TRankRow } from '@/components/ui-kit';
import TLoader from '@/components/ui-kit/TLoader.vue';
import { useShareQuery } from '@/composables/useShareQuery';
import { RouteName } from '@/router/route-names';
import { useSessionStore } from '@/stores/session';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();

const shareId = computed(() => String(route.params.shareId ?? ''));
const shareQuery = useShareQuery(shareId);

const share = computed(() => shareQuery.data.value);
const rankedItems = computed(() => share.value?.items ?? []);
const isEmptyRanked = computed(() => shareQuery.isSuccess.value && rankedItems.value.length === 0);

const canCopy = computed(() => {
  if (!share.value) return false;
  if (session.status === 'authed' && session.user?.nick === share.value.ownerNick) {
    return false;
  }
  return true;
});

const pickerOpen = ref(false);
const pickerItemId = ref('');
const copyFeedback = ref('');
let feedbackTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => shareQuery.error.value,
  (err) => {
    if (!(err instanceof ShareApiError)) return;
    if (err.status === 403) {
      router.replace({ name: RouteName.ShareForbidden });
      return;
    }
    if (err.status === 404) {
      router.replace({ name: RouteName.ShareNotFound });
      return;
    }
  },
  { immediate: true },
);

function onRetry() {
  shareQuery.refetch();
}

function goItem(itemId: string) {
  void router.push({
    name: RouteName.ShareItemView,
    params: { shareId: shareId.value, itemId },
  });
}

function onAddClick(itemId: string, event: MouseEvent) {
  event.stopPropagation();
  event.preventDefault();
  if (session.status !== 'authed') {
    void router.push({ name: RouteName.Login, query: { returnUrl: route.fullPath } });
    return;
  }
  pickerItemId.value = itemId;
  pickerOpen.value = true;
}

function onCopied() {
  copyFeedback.value = 'Добавлено в inbox выбранного топика';
  if (feedbackTimer) clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    copyFeedback.value = '';
  }, 2500);
}
</script>

<template>
  <PageShell v-if="shareQuery.isPending.value">
    <TLoader />
  </PageShell>
  <PageShell v-else-if="shareQuery.isError.value">
    <TError @retry="onRetry" />
  </PageShell>

  <ContentPageWrapper
    v-else-if="share"
    :title="share.title"
    :route-to="{ name: RouteName.UserProfile, params: { nick: share.ownerNick } }"
    :text-to="`@${share.ownerNick}`"
  >
    <p v-if="copyFeedback" class="mb-3 text-caption text-muted" role="status">
      {{ copyFeedback }}
    </p>

    <p v-if="isEmptyRanked" class="text-title text-ink">Пока нечего показать</p>

    <ul v-else class="flex flex-col gap-3" aria-label="Рейтинг">
      <li v-for="item in rankedItems" :key="item.id" class="flex items-stretch gap-2">
        <TRankRow
          class="min-w-0 max-w-none! flex-1"
          mode="ranked"
          :show-drag-handle="false"
          :rank="item.rankPosition"
          :title="item.title"
          :cover-url="item.coverUrl ?? undefined"
          @click="goItem(item.id)"
        />
        <button
          v-if="canCopy"
          type="button"
          class="glass flex w-11 shrink-0 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface-glass-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          aria-label="Добавить к себе"
          @click="onAddClick(item.id, $event)"
        >
          <svg class="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </li>
    </ul>

    <CopyItemToTopicModal
      v-if="canCopy && session.status === 'authed'"
      v-model:open="pickerOpen"
      :share-id="shareId"
      :item-id="pickerItemId"
      :category="share.category as TopicCategory"
      @copied="onCopied"
    />
  </ContentPageWrapper>
</template>
