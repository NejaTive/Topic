<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <main class="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 bg-bg p-8">
    <RouterLink
      to="/app/topics"
      class="w-fit text-label font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      ← Мои топики
    </RouterLink>
    <h1 class="text-title text-ink">Создание топика</h1>
    <p class="text-body text-muted">
      Экран S04 появится в FRO-11. Сейчас это заглушка маршрута
      <code class="text-body-sm">/app/topics/new</code>.
    </p>
  </main>
</template>
