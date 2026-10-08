<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <main class="auth-layout">
    <RouterView />
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
