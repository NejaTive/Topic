<script setup lang="ts">
import { computed } from 'vue';
import type { TopicCategory } from '@/api/topics';
import { topicCategoryLabel } from '@/lib/topic-category';

interface TCategoryChipProps {
  category: TopicCategory;
}

const props = defineProps<TCategoryChipProps>();

const label = computed(() => topicCategoryLabel(props.category));
</script>

<template>
  <span
    class="inline-flex h-6 shrink-0 items-center justify-center rounded-sm border border-transparent bg-warning-soft px-2 text-caption font-medium text-warning"
    :aria-label="label"
  >
    {{ label }}
  </span>
</template>
