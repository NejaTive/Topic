<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { PageShell } from '@/components/layout';
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
  <PageShell>
    <template #header>
      <header class="flex items-center justify-between gap-3">
        <h1 class="min-w-0 truncate text-h1 text-ink">Мои топики</h1>
        <button
          v-if="isMobileView"
          type="button"
          class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-accent-soft text-accent transition-colors hover:opacity-80"
          aria-label="Создать топик"
          @click="goCreate"
        >
          <svg
            class="size-5"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M10 4.5v11M4.5 10h11" />
          </svg>
        </button>
        <TButton v-else class="shrink-0" @click="goCreate">Создать топик</TButton>
      </header>
    </template>

    <div v-if="isPending || isError || isEmpty" class="max-w-84.5 mx-auto">
      <TLoader v-if="isPending" />
      <TError v-else-if="isError" @retry="onRetry" />
      <TEmptyState v-else-if="isEmpty" @create="goCreate" />
    </div>

    <ul v-else class="flex flex-col gap-3" aria-label="Список топиков">
      <li v-for="topic in topics" :key="topic.id">
        <TTopicRow
          :title="topic.title"
          :meta="formatTopicUpdatedAt(topic.updatedAt)"
          :category="topic.category"
          :privacy="topic.privacy"
          :covers="previewCoverUrls(topic.previewCovers)"
          :compact-privacy="isMobileView"
          @click="goTopic(topic.id)"
        />
      </li>
    </ul>
  </PageShell>
</template>
