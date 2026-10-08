<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import { AppNav, GuestNav } from '@/components/layout';
import { useSessionStore } from '@/stores/session';

const session = useSessionStore();
const isAuthed = computed(() => session.status === 'authed');
</script>

<template>
  <AppNav v-if="isAuthed" />
  <GuestNav v-else />
  <main class="main-layout">
    <RouterView />
  </main>
</template>

<style lang="scss" scoped>
.main-layout {
  height: 100dvh;
  max-width: 366px;
  margin-inline: auto;
  padding: 24px 12px 112px;

  @media (min-width: 768px) {
    max-width: 804px;
    padding-top: 112px;
    padding-bottom: 40px;
  }

  @media (min-width: 1024px) {
    max-width: 1256px;
  }
}
</style>
