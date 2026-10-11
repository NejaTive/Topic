<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import { AppNav, GuestNav } from '@/components/layout';
import { useSessionStore } from '@/stores/session';

const session = useSessionStore();
const isAuthed = computed(() => session.status === 'authed');
</script>

<template>
  <div class="app-shell">
    <AppNav v-if="isAuthed" />
    <GuestNav v-else />
    <main class="app-shell__main">
      <div class="app-shell__page">
        <RouterView v-slot="{ Component, route }">
          <Transition name="page-fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  height: 100dvh;
  padding: 12px;
}

.app-shell__main {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 366px;
  margin-inline: auto;
  overflow: hidden;

  @media (min-width: 768px) {
    max-width: 804px;
  }

  @media (min-width: 1024px) {
    max-width: 1256px;
  }
}

.app-shell__page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}
</style>
