<script setup lang="ts">
import { useDnDProvider } from '@vue-dnd-kit/core';
import { onScopeDispose, useSlots, useTemplateRef, watch } from 'vue';

const slots = useSlots();
const bodyRef = useTemplateRef<HTMLElement>('bodyRef');
const dnd = useDnDProvider();

const EDGE_PX = 80;
const SPEED = 10;
const FRAME_MS = 16;

let rafId: number | null = null;
let lastTs: number | null = null;

function stopAutoScroll() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  lastTs = null;
}

function autoScrollFrame(ts: number) {
  const el = bodyRef.value;
  if (!el || dnd.state.value !== 'dragging') {
    stopAutoScroll();
    return;
  }

  const pos = dnd.preview.position.value;
  if (!pos) {
    rafId = requestAnimationFrame(autoScrollFrame);
    return;
  }

  if (lastTs == null) lastTs = ts;
  const dt = ts - lastTs;
  if (dt < FRAME_MS) {
    rafId = requestAnimationFrame(autoScrollFrame);
    return;
  }

  const step = SPEED * (dt / FRAME_MS);
  lastTs = ts;

  const size = dnd.preview.size.value;
  const y = size?.height ? pos.y + size.height / 2 : pos.y;
  const rect = el.getBoundingClientRect();

  if (y - rect.top < EDGE_PX) {
    el.scrollTop -= step;
  } else if (rect.bottom - y < EDGE_PX) {
    el.scrollTop += step;
  }

  rafId = requestAnimationFrame(autoScrollFrame);
}

watch(
  () => dnd.state.value,
  (state) => {
    if (state === 'dragging') {
      if (rafId == null) rafId = requestAnimationFrame(autoScrollFrame);
      return;
    }
    stopAutoScroll();
  },
);

onScopeDispose(stopAutoScroll);
</script>

<template>
  <div class="page-shell">
    <div v-if="slots.header" class="page-shell__header">
      <slot name="header" />
    </div>
    <div ref="bodyRef" class="page-shell__body">
      <slot />
    </div>
    <slot name="overlay" />
  </div>
</template>

<style lang="scss" scoped>
.page-shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.page-shell__header {
  flex-shrink: 0;
  padding-bottom: 16px;
}

.page-shell__body {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: 88px;

  @media (min-width: 768px) {
    padding-bottom: 0;
  }
}
</style>
