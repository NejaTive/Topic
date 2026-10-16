<script setup lang="ts">
import { computed } from 'vue';
import { useSessionStore } from '@/stores/session';
import AppNav from './AppNav.vue';
import GuestNav from './GuestNav.vue';

interface ErrorStateViewProps {
  title: string;
  subtitle: string;
}

defineProps<ErrorStateViewProps>();

const session = useSessionStore();
const isAuthed = computed(() => session.status === 'authed');
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <AppNav v-if="isAuthed" />
    <GuestNav v-else />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-91.5 flex-col items-center justify-center px-3 pb-28 pt-6 text-center md:max-w-201 md:pb-10 md:pt-20 lg:max-w-314"
    >
      <h1 class="text-h1 text-ink">{{ title }}</h1>
      <p class="mt-4 max-w-sm text-body-sm text-muted">{{ subtitle }}</p>
    </main>
  </div>
</template>
