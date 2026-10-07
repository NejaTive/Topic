<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AppButton, AppNav, EmptyState, TopicRow } from '@/components/ui';
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
const showCreateCta = computed(() => !isEmpty.value && topicsQuery.isSuccess.value);

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
  <!-- Figma S03 List / Empty: M 390 · D content 960 -->
  <div class="flex min-h-dvh flex-col bg-bg">
    <AppNav />

    <main
      class="mx-auto flex w-full max-w-91.5 flex-1 flex-col px-4 pb-28 pt-6 md:max-w-240 md:px-0 md:pb-10 md:pt-28"
    >
      <header class="flex items-center justify-between gap-3">
        <h1 class="text-h1 text-ink">Мои топики</h1>
        <!-- Только desktop: у AppButton свой inline-flex перебивает utility hidden -->
        <div v-if="showCreateCta" class="hidden shrink-0 md:block">
          <AppButton @click="goCreate">Создать топик</AppButton>
        </div>
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

      <!-- Empty: вертикально по центру оставшегося viewport (Figma empty-slot) -->
      <div v-else-if="isEmpty" class="flex flex-1 flex-col items-center justify-center py-10">
        <EmptyState class="w-full max-w-84.5" @create="goCreate" />
      </div>

      <ul v-else class="mt-6 flex list-none flex-col gap-3 p-0 md:mt-4" aria-label="Список топиков">
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

    <!-- M List: primary CTA над dock (не icon-FAB) -->
    <div
      v-if="showCreateCta"
      class="pointer-events-none fixed inset-x-0 bottom-23 z-30 flex justify-center px-4 md:hidden"
    >
      <AppButton class="pointer-events-auto min-w-40 shadow-float" @click="goCreate">
        Создать топик
      </AppButton>
    </div>
  </div>
</template>
