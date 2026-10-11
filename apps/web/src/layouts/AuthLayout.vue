<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <main class="auth-layout">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page-fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>
  </main>
</template>

<style lang="scss" scoped>
.auth-layout {
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px 112px;
}
</style>
