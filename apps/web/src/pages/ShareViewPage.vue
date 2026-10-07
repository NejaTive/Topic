<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ShareApiError } from '@/api/share';
import { AppNav, GuestNav, RankRow } from '@/components/ui';
import { useShareQuery } from '@/composables/useShareQuery';
import { useSessionStore } from '@/stores/session';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();

const shareId = computed(() => String(route.params.shareId ?? ''));
const shareQuery = useShareQuery(shareId);

const share = computed(() => shareQuery.data.value);
const rankedItems = computed(() => share.value?.items ?? []);
const isEmptyRanked = computed(() => shareQuery.isSuccess.value && rankedItems.value.length === 0);
const isAuthed = computed(() => session.status === 'authed');

watch(
  () => shareQuery.error.value,
  (err) => {
    if (!(err instanceof ShareApiError)) return;
    if (err.status === 403) {
      void router.replace({ name: 'share-forbidden' });
      return;
    }
    if (err.status === 404) {
      void router.replace({ name: 'share-not-found' });
    }
  },
  { immediate: true },
);

function onRetry() {
  void shareQuery.refetch();
}
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <AppNav v-if="isAuthed" />
    <GuestNav v-else cta-mode="share" />

    <main
      class="mx-auto w-full max-w-[366px] px-4 pb-28 pt-6 md:max-w-[804px] md:px-0 md:pb-10 md:pt-28"
    >
      <p v-if="shareQuery.isPending.value" class="text-body text-muted" role="status">Загрузка…</p>

      <div
        v-else-if="
          shareQuery.isError.value &&
          !(
            shareQuery.error.value instanceof ShareApiError &&
            (shareQuery.error.value.status === 403 || shareQuery.error.value.status === 404)
          )
        "
        class="flex flex-col items-start gap-3"
        role="alert"
      >
        <p class="text-body text-danger">Не удалось загрузить топик</p>
        <button
          type="button"
          class="rounded-md border border-line bg-surface px-3 py-1.5 text-body-sm font-semibold text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          @click="onRetry"
        >
          Повторить
        </button>
      </div>

      <template v-else-if="share">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-label font-semibold text-muted"> @{{ share.ownerNick }} </span>
        </div>

        <h1 class="mt-2 text-h1 text-ink md:text-[32px] md:leading-[41px]">
          {{ share.title }}
        </h1>

        <p v-if="isEmptyRanked" class="mt-12 text-title text-ink md:mt-16" role="status">
          Пока нечего показать
        </p>

        <ul v-else class="mt-8 flex list-none flex-col gap-3 p-0 md:mt-10" aria-label="Рейтинг">
          <li v-for="item in rankedItems" :key="item.id">
            <RankRow
              class="!max-w-none w-full"
              mode="ranked"
              readonly
              :show-drag-handle="false"
              :rank="item.rankPosition"
              :title="item.title"
              :cover-url="item.coverUrl ?? undefined"
            />
          </li>
        </ul>
      </template>
    </main>
  </div>
</template>
