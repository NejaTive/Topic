<script setup lang="ts">
import { GuestNav } from '@/components/ui';

defineProps<{
  title: string;
  subtitle: string;
}>();
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <GuestNav cta-mode="error" />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-[366px] flex-col items-center justify-center px-4 pb-28 pt-6 text-center md:max-w-[804px] md:pb-10 md:pt-20"
    >
      <h1 class="text-h1 text-ink">{{ title }}</h1>
      <p class="mt-4 max-w-sm text-body-sm text-muted">{{ subtitle }}</p>
    </main>
  </div>
</template>
