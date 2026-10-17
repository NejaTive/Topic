<script setup lang="ts">
import { onClickOutside, onKeyStroke } from '@vueuse/core';
import { ref, useId, useTemplateRef } from 'vue';
import { useTailwindBreakpoints } from '@/composables/useTailwindBreakpoints';

interface FieldHintProps {
  text: string;
  label: string;
}

const props = defineProps<FieldHintProps>();

const open = ref(false);
const root = useTemplateRef<HTMLElement>('root');
const tooltipId = `field-hint-${useId()}`;
const breakpoints = useTailwindBreakpoints();
const isDesktop = breakpoints.greaterOrEqual('md');

onClickOutside(root, () => {
  if (!isDesktop.value) open.value = false;
});

onKeyStroke('Escape', () => {
  open.value = false;
});

function onClick() {
  if (isDesktop.value) return;
  open.value = !open.value;
}

function onEnter() {
  if (isDesktop.value) open.value = true;
}

function onLeave() {
  if (isDesktop.value) open.value = false;
}
</script>

<template>
  <span ref="root" class="relative inline-flex" @mouseenter="onEnter" @mouseleave="onLeave">
    <button
      type="button"
      class="inline-flex size-4.5 items-center justify-center rounded-full border border-line text-caption leading-none text-muted transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      :aria-label="props.label"
      :aria-expanded="open"
      :aria-controls="tooltipId"
      @click.stop="onClick"
      @focus="onEnter"
      @blur="onLeave"
    >
      ?
    </button>
    <span
      v-if="open"
      :id="tooltipId"
      role="tooltip"
      class="absolute top-full left-0 z-20 mt-1.5 w-64 rounded-md border border-line bg-surface px-3 py-2 text-caption font-normal text-muted shadow-float"
    >
      {{ props.text }}
    </span>
  </span>
</template>
