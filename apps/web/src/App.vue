<script setup lang="ts">
import { DnDProvider } from '@vue-dnd-kit/core';
import { RouterView } from 'vue-router';
import { DnDAnimatedPreview } from '@/components/ui';
import { useMeQuery } from '@/composables/useMeQuery';

useMeQuery();
</script>

<template>
  <!-- Provider на корне: inject для makeDraggable/makeDroppable -->
  <DnDProvider :auto-scroll-viewport="true">
    <template #preview>
      <DnDAnimatedPreview />
    </template>
    <RouterView />
  </DnDProvider>
</template>
