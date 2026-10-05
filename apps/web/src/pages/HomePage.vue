<script setup lang="ts">
import { computed } from 'vue';
import { useHealthQuery } from '@/composables/useHealthQuery';

const healthQuery = useHealthQuery();

const apiStatusLabel = computed(() => {
  if (healthQuery.isPending.value) return 'API: проверка…';
  if (healthQuery.isSuccess.value) return 'API: ok';
  return 'API: недоступен';
});
</script>

<template>
  <main class="min-h-dvh p-8">
    <h1 class="text-display">Topic</h1>
    <!-- TEMP: заменит лендинг S00 -->
    <p class="mt-4 font-mono text-rank-m text-rank">{{ apiStatusLabel }}</p>
  </main>
</template>
