<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ShareApiError } from '@/api/share';
import { TError, TRankRow } from '@/components/ui-kit';
import { useShareQuery } from '@/composables/useShareQuery';
import { RouteName } from '@/router/route-names';
import TLoader from '@/components/ui-kit/TLoader.vue';
import { ContentPageWrapper, PageShell } from '@/components/layout';

const route = useRoute();
const router = useRouter();

const shareId = computed(() => String(route.params.shareId ?? ''));
const shareQuery = useShareQuery(shareId);

const share = computed(() => shareQuery.data.value);
const rankedItems = computed(() => share.value?.items ?? []);
const isEmptyRanked = computed(() => shareQuery.isSuccess.value && rankedItems.value.length === 0);

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
</script>

<template>
  <PageShell v-if="shareQuery.isPending.value">
    <TLoader />
  </PageShell>
  <PageShell v-else-if="shareQuery.isError.value">
    <TError @retry="onRetry" />
  </PageShell>

  <ContentPageWrapper v-else-if="share" :title="share.title">
    <p v-if="isEmptyRanked" class="text-title text-ink">Пока нечего показать</p>

    <ul v-else class="flex flex-col gap-3" aria-label="Рейтинг">
      <li v-for="item in rankedItems" :key="item.id">
        <TRankRow
          class="max-w-none! w-full"
          mode="ranked"
          readonly
          :show-drag-handle="false"
          :rank="item.rankPosition"
          :title="item.title"
          :cover-url="item.coverUrl ?? undefined"
        />
      </li>
    </ul>
  </ContentPageWrapper>
</template>
