<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { TButton, TError, TLoader, TEmptyState, TTopicRow } from '@/components/ui-kit';
import { useTailwindBreakpoints } from '@/composables/useTailwindBreakpoints';
import { useTopicsQuery } from '@/composables/useTopicsQuery';
import { previewCoverUrls } from '@/lib/cover-url';
import { formatTopicUpdatedAt } from '@/lib/format-topic-meta';
import { RouteName } from '@/router/route-names';

const router = useRouter();
const topicsQuery = useTopicsQuery();
const breakpoints = useTailwindBreakpoints();

const isMobileView = computed(() => breakpoints.smaller('md').value);
const topics = computed(() => topicsQuery.data.value ?? []);
const isEmpty = computed(() => topicsQuery.isSuccess.value && topics.value.length === 0);
const isError = computed(() => topicsQuery.isError.value);
const isPending = computed(() => topicsQuery.isPending.value);

function goCreate() {
  router.push({ name: RouteName.AppTopicCreate });
}

function goTopic(id: string) {
  router.push({ name: RouteName.AppTopicDetail, params: { id } });
}

function onRetry() {
  topicsQuery.refetch();
}
</script>

<template>
  <header class="flex items-center justify-between gap-3">
    <h1 class="text-h1 text-ink">Мои топики</h1>
    <TButton v-if="!isMobileView" @click="goCreate">Создать топик</TButton>
  </header>

  <div v-if="isPending || isError || isEmpty" class="max-w-84.5 mx-auto mt-10">
    <TLoader v-if="isPending" />
    <TError v-else-if="isError" @retry="onRetry" />
    <TEmptyState v-else-if="isEmpty" @create="goCreate" />
  </div>

  <ul v-else class="mt-6 flex flex-col gap-3 md:mt-4" aria-label="Список топиков">
    <li v-for="topic in topics" :key="topic.id">
      <TTopicRow
        :title="topic.title"
        :meta="formatTopicUpdatedAt(topic.updatedAt)"
        :privacy="topic.privacy"
        :covers="previewCoverUrls(topic.previewCovers)"
        :compact-privacy="isMobileView"
        @click="goTopic(topic.id)"
      />
    </li>
  </ul>

  <div v-if="isMobileView" class="fixed inset-x-0 bottom-23 z-30 flex justify-center">
    <TButton class="shadow-float" @click="goCreate">Создать топик</TButton>
  </div>
</template>
