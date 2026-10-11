<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const nick = computed(() => {
  const value = route.params.nick;
  return typeof value === 'string' ? value : '';
});
</script>

<template>
  <h1 class="text-h1 text-ink">{{ nick }}</h1>
  <p class="mt-4 text-body text-muted">Профиль скоро будет здесь.</p>
</template>
