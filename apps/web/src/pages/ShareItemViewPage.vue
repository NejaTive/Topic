<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ShareApiError } from '@/api/share';
import type { TopicCategory } from '@/api/topics';
import { ContentPageWrapper, PageShell } from '@/components/layout';
import RecommendItemModal from '@/components/recommendations/RecommendItemModal.vue';
import CopyItemToTopicModal from '@/components/share/CopyItemToTopicModal.vue';
import { TButton, TError, TLoader } from '@/components/ui-kit';
import { useShareQuery } from '@/composables/useShareQuery';
import { RouteName } from '@/router/route-names';
import { useSessionStore } from '@/stores/session';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();

const shareId = computed(() => String(route.params.shareId ?? ''));
const itemId = computed(() => String(route.params.itemId ?? ''));
const shareQuery = useShareQuery(shareId);

const share = computed(() => shareQuery.data.value);
const item = computed(() => share.value?.items.find((entry) => entry.id === itemId.value));
const category = computed(() => share.value?.category);
const showMeta = computed(
  () => category.value === 'movies' || category.value === 'series' || category.value === 'games',
);
const directorLabel = computed(() => {
  if (category.value === 'games') return 'Разработчик';
  if (category.value === 'series') return 'Создатель';
  return 'Режиссёр';
});
const isGamesTopic = computed(() => category.value === 'games');
const meta = computed(() => item.value?.meta ?? null);

const isOwner = computed(
  () =>
    session.status === 'authed' && !!share.value && session.user?.nick === share.value.ownerNick,
);

const canCopy = computed(() => {
  if (!share.value) return false;
  if (isOwner.value) return false;
  return true;
});

const canRecommend = computed(() => isOwner.value);

const pickerOpen = ref(false);
const copyFeedback = ref('');
let feedbackTimer: ReturnType<typeof setTimeout> | undefined;

const recommendOpen = ref(false);
const recommendFeedback = ref('');
let recommendFeedbackTimer: ReturnType<typeof setTimeout> | undefined;

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
    }
  },
  { immediate: true },
);

watch(
  () => ({
    ready: shareQuery.isSuccess.value,
    item: item.value,
  }),
  ({ ready, item: current }) => {
    if (!ready) return;
    if (!current) {
      router.replace({ name: RouteName.NotFound });
    }
  },
  { immediate: true },
);

function onRetry() {
  shareQuery.refetch();
}

function onAddClick() {
  if (session.status !== 'authed') {
    void router.push({ name: RouteName.Login, query: { returnUrl: route.fullPath } });
    return;
  }
  pickerOpen.value = true;
}

function onCopied() {
  copyFeedback.value = 'Добавлено в inbox выбранного топика';
  if (feedbackTimer) clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    copyFeedback.value = '';
  }, 2500);
}

function openRecommend() {
  recommendFeedback.value = '';
  recommendOpen.value = true;
}

function onRecommendSent() {
  recommendFeedback.value = 'Рекомендация отправлена';
  if (recommendFeedbackTimer) clearTimeout(recommendFeedbackTimer);
  recommendFeedbackTimer = setTimeout(() => {
    recommendFeedback.value = '';
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
    v-else-if="share && item"
    :title="item.title"
    :route-to="{ name: RouteName.ShareView, params: { shareId } }"
    :text-to="share.title"
  >
    <div class="flex flex-col gap-5 md:flex-row-reverse md:items-start md:gap-8">
      <div
        class="h-48 w-36 shrink-0 overflow-hidden rounded-sm bg-surface-sunken"
        aria-hidden="true"
      >
        <img v-if="item.coverUrl" :src="item.coverUrl" alt="" class="size-full object-cover" />
      </div>

      <div v-if="showMeta && meta" class="flex min-w-0 flex-1 flex-col gap-5">
        <section v-if="meta.description" class="flex flex-col gap-1">
          <h2 class="text-label text-muted">Описание</h2>
          <p class="whitespace-pre-wrap text-body text-ink">{{ meta.description }}</p>
        </section>
        <section v-if="meta.genre" class="flex flex-col gap-1">
          <h2 class="text-label text-muted">Жанр</h2>
          <p class="text-body text-ink">{{ meta.genre }}</p>
        </section>
        <section v-if="meta.director" class="flex flex-col gap-1">
          <h2 class="text-label text-muted">{{ directorLabel }}</h2>
          <p class="text-body text-ink">{{ meta.director }}</p>
        </section>
        <section v-if="!isGamesTopic && meta.country" class="flex flex-col gap-1">
          <h2 class="text-label text-muted">Страна</h2>
          <p class="text-body text-ink">{{ meta.country }}</p>
        </section>
        <section v-if="meta.sourceUrl" class="flex flex-col gap-1">
          <h2 class="text-label text-muted">Источник</h2>
          <a
            :href="meta.sourceUrl"
            class="break-all text-body text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ meta.sourceUrl }}
          </a>
        </section>
      </div>
    </div>

    <p v-if="copyFeedback" class="mt-5 text-caption text-muted" role="status">
      {{ copyFeedback }}
    </p>
    <p v-if="recommendFeedback" class="mt-5 text-caption text-muted" role="status">
      {{ recommendFeedback }}
    </p>

    <div v-if="canCopy || canRecommend" class="mt-8">
      <TButton v-if="canCopy" class="w-full md:w-auto" @click="onAddClick">
        Добавить к себе
      </TButton>
      <TButton
        v-else-if="canRecommend"
        variant="secondary"
        class="w-full md:w-auto"
        @click="openRecommend"
      >
        Рекомендовать
      </TButton>
    </div>

    <CopyItemToTopicModal
      v-if="canCopy && session.status === 'authed' && category"
      v-model:open="pickerOpen"
      :share-id="shareId"
      :item-id="itemId"
      :category="category as TopicCategory"
      @copied="onCopied"
    />
    <RecommendItemModal
      v-if="canRecommend"
      v-model:open="recommendOpen"
      :item-id="itemId"
      @sent="onRecommendSent"
    />
  </ContentPageWrapper>
</template>
