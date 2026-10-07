<script setup lang="ts">
import { type IDragEvent, makeDroppable } from '@vue-dnd-kit/core';
import { useTemplateRef } from 'vue';
import type { ItemDto } from '@/api/items';
import { TOPIC_ITEMS_DND_GROUP } from './RankRowDraggable.vue';

const props = defineProps<{
  items: ItemDto[];
  /** Promise — библиотека ждёт до dragEnd (settle). */
  onDropEvent: (event: IDragEvent) => void | Promise<void>;
}>();

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const { isDragOver } = makeDroppable(
  rootRef,
  {
    groups: [TOPIC_ITEMS_DND_GROUP],
    events: {
      onDrop(e) {
        return props.onDropEvent(e);
      },
    },
  },
  () => props.items,
);
</script>

<template>
  <section
    ref="rootRef"
    class="rounded-lg ring-2 ring-inset transition-shadow md:border md:border-line md:bg-surface md:p-5"
    :class="isDragOver ? 'ring-accent' : 'ring-transparent'"
  >
    <slot />
  </section>
</template>
