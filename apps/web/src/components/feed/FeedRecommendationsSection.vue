<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Recommendation } from '@/api/recommendations';
import AcceptRecommendationModal from '@/components/feed/AcceptRecommendationModal.vue';
import RecommendationCard from '@/components/feed/RecommendationCard.vue';
import { useRecommendationsQuery } from '@/composables/useRecommendationsQuery';

const recommendationsQuery = useRecommendationsQuery();

const items = computed(() => recommendationsQuery.data.value?.items ?? []);
const showSection = computed(() => recommendationsQuery.isSuccess.value && items.value.length > 0);

const pickerOpen = ref(false);
const activeRecommendation = ref<Recommendation | null>(null);

function onAccept(id: string) {
  const found = items.value.find((item) => item.id === id) ?? null;
  activeRecommendation.value = found;
  pickerOpen.value = Boolean(found);
}

function onPickerOpenUpdate(open: boolean) {
  pickerOpen.value = open;
  if (!open) activeRecommendation.value = null;
}
</script>

<template>
  <section v-if="showSection" class="mb-6 flex flex-col gap-3" aria-label="Мои рекомендации">
    <h2 class="text-h3 text-ink">Мои рекомендации</h2>
    <ul class="flex flex-col gap-3" aria-label="Список рекомендаций">
      <li v-for="item in items" :key="item.id">
        <RecommendationCard :recommendation="item" @accept="onAccept" />
      </li>
    </ul>

    <AcceptRecommendationModal
      v-if="activeRecommendation"
      :open="pickerOpen"
      :recommendation-id="activeRecommendation.id"
      :category="activeRecommendation.category"
      @update:open="onPickerOpenUpdate"
    />
  </section>
</template>
