<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AppButton, AppNav, TopicRow } from '@/components/ui';
import { useTopicsQuery } from '@/composables/useTopicsQuery';
import { previewCoverUrls } from '@/lib/cover-url';
import { formatTopicUpdatedAt } from '@/lib/format-topic-meta';

const router = useRouter();
const topicsQuery = useTopicsQuery();

const compactPrivacy = ref(true);

function syncCompactPrivacy() {
  compactPrivacy.value = !window.matchMedia('(min-width: 768px)').matches;
}

onMounted(() => {
  syncCompactPrivacy();
  window.addEventListener('resize', syncCompactPrivacy);
});

onUnmounted(() => {
  window.removeEventListener('resize', syncCompactPrivacy);
});

const topics = computed(() => topicsQuery.data.value ?? []);
const isEmpty = computed(() => topicsQuery.isSuccess.value && topics.value.length === 0);
function goCreate() {
  void router.push({ name: 'app-topic-create' });
}

function goTopic(id: string) {
  void router.push({ name: 'app-topic-detail', params: { id } });
}

function onRetry() {
  void topicsQuery.refetch();
}
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <AppNav />

    <main
      class="mx-auto w-full max-w-[366px] px-4 pb-28 pt-6 md:max-w-[720px] md:px-8 md:pb-10 md:pt-28"
    >
      <header class="flex items-center justify-between gap-3">
        <h1 class="text-h1 text-ink">Мои топики</h1>
        <AppButton
          v-if="!isEmpty && topicsQuery.isSuccess.value"
          class="hidden shrink-0 md:inline-flex"
          @click="goCreate"
        >
          Создать топик
        </AppButton>
      </header>

      <p v-if="topicsQuery.isPending.value" class="mt-10 text-body text-muted" role="status">
        Загрузка…
      </p>

      <div
        v-else-if="topicsQuery.isError.value"
        class="mt-10 flex flex-col items-start gap-3"
        role="alert"
      >
        <p class="text-body text-danger">Не удалось загрузить топики</p>
        <AppButton variant="secondary" size="sm" @click="onRetry">Повторить</AppButton>
      </div>

      <div v-else-if="isEmpty" class="mt-16 flex flex-col items-center gap-4 text-center md:mt-24">
        <p class="text-title text-ink">Создайте первый топик</p>
        <p class="max-w-[280px] text-body-sm text-muted">
          Соберите рейтинг фильмов, книг или чего угодно — и поделитесь ссылкой.
        </p>
        <AppButton class="mt-1" @click="goCreate">Создать топик</AppButton>
      </div>

      <ul v-else class="mt-6 flex list-none flex-col gap-1 p-0" aria-label="Список топиков">
        <li v-for="topic in topics" :key="topic.id">
          <TopicRow
            :title="topic.title"
            :meta="formatTopicUpdatedAt(topic.updatedAt)"
            :privacy="topic.privacy"
            :covers="previewCoverUrls(topic.previewCovers)"
            :compact-privacy="compactPrivacy"
            @click="goTopic(topic.id)"
          />
        </li>
      </ul>
    </main>

    <!-- FAB: list state, mobile (desktop CTA в header) -->
    <button
      v-if="!isEmpty && topicsQuery.isSuccess.value"
      type="button"
      class="fixed right-4 bottom-24 z-30 flex size-14 items-center justify-center rounded-lg bg-accent text-accent-on shadow-float outline-none transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring md:hidden"
      aria-label="Создать топик"
      @click="goCreate"
    >
      <svg class="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>
