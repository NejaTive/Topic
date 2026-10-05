<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useMeQuery } from '@/composables/useMeQuery';

useMeQuery();
</script>

<template>
  <RouterView />
</template>
