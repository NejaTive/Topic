<script setup lang="ts">
import { DragPreview } from '@vue-dnd-kit/core';

/** Снимок своего RankRow из dnd-kit — не сырой user HTML. */
function bindPreviewHtml(el: unknown, html: string | undefined) {
  if (!(el instanceof HTMLElement) || !html) return;
  if (el.innerHTML !== html) el.innerHTML = html;
}
</script>

<template>
  <DragPreview v-slot="{ draggingMap }">
    <div
      v-for="[, draggable] in draggingMap"
      :key="draggable.id"
      class="dnd-preview-lift pointer-events-none"
    >
      <component :is="draggable.render" v-if="draggable.render" />
      <div
        v-else
        :ref="(el) => bindPreviewHtml(el, draggable.initialOuterHTML)"
        :style="{
          width: `${draggable.initialRect.width}px`,
          height: `${draggable.initialRect.height}px`,
        }"
      />
    </div>
  </DragPreview>
</template>

<style scoped>
.dnd-preview-lift {
  transform-origin: 0 0;
  filter: drop-shadow(0 12px 28px rgb(0 0 0 / 0.18));
}
</style>
