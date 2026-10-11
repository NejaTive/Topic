<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { PageShell } from '@/components/layout';
import { TError, TLoader, TEmptyState, TTopicRow } from '@/components/ui-kit';
import { useFeedQuery } from '@/composables/useFeedQuery';
import { previewCoverUrls } from '@/lib/cover-url';
import { formatFeedUpdatedAt } from '@/lib/format-topic-meta';
import { RouteName } from '@/router/route-names';

const router = useRouter();
const feedQuery = useFeedQuery();

const feed = computed(() => feedQuery.data.value);
const items = computed(() => feed.value?.items ?? []);
const followingCount = computed(() => feed.value?.followingCount ?? 0);

const isPending = computed(() => feedQuery.isPending.value);
const isError = computed(() => feedQuery.isError.value);
const isEmpty = computed(
  () => feedQuery.isSuccess.value && items.value.length === 0 && followingCount.value === 0,
);
const isEmptySubscribed = computed(
  () => feedQuery.isSuccess.value && items.value.length === 0 && followingCount.value > 0,
);
const showList = computed(() => feedQuery.isSuccess.value && items.value.length > 0);

function goShare(shareId: string) {
  router.push({ name: RouteName.ShareView, params: { shareId } });
}

function goProfile(nick: string) {
  router.push({ name: RouteName.UserProfile, params: { nick } });
}

function onRetry() {
  feedQuery.refetch();
}
</script>

<template>
  <PageShell>
    <template #header>
      <header>
        <h1 class="text-h1 text-ink">Лента</h1>
      </header>
    </template>

    <div v-if="isPending || isError || isEmpty || isEmptySubscribed" class="max-w-84.5 mx-auto">
      <TLoader v-if="isPending" />
      <TError v-else-if="isError" @retry="onRetry" />
      <TEmptyState
        v-else-if="isEmpty"
        title="Лента пуста"
        description="Откройте профиль по ссылке и нажмите «Подписаться»"
        :show-cta="false"
      />
      <TEmptyState
        v-else-if="isEmptySubscribed"
        title="Пока тихо"
        description="У тех, на кого вы подписаны, пока нет топиков"
        :show-cta="false"
      />
    </div>

    <ul v-else-if="showList" class="flex flex-col gap-3" aria-label="Лента топиков">
      <li v-for="item in items" :key="item.id">
        <TTopicRow
          :title="item.title"
          :meta="formatFeedUpdatedAt(item.updatedAt)"
          :covers="previewCoverUrls(item.previewCovers)"
          :owner-nick="item.ownerNick"
          @click="goShare(item.shareId)"
          @owner-click="goProfile(item.ownerNick)"
        />
      </li>
    </ul>
  </PageShell>
</template>
