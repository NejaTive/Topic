<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const topicId = computed(() => String(route.params.id ?? ''));
</script>

<template>
  <main class="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 bg-bg p-8">
    <RouterLink
      to="/app/topics"
      class="w-fit text-label font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      ← Мои топики
    </RouterLink>
    <h1 class="text-title text-ink">Топик</h1>
    <p class="text-body text-muted">
      Экран S05 появится в FRO-12. Заглушка
      <code class="text-body-sm">/app/topics/{{ topicId }}</code>.
    </p>
  </main>
</template>
