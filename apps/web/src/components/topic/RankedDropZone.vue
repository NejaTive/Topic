<script setup lang="ts">
import { type IDragEvent, makeDroppable } from '@vue-dnd-kit/core';
import { useTemplateRef } from 'vue';
import type { ItemDto } from '@/api/items';
import { TOPIC_ITEMS_DND_GROUP } from './RankRowDraggable.vue';

interface RankedDropZoneProps {
  items: ItemDto[];
  onDropEvent: (event: IDragEvent) => void | Promise<void>;
}

const props = defineProps<RankedDropZoneProps>();

const rootRef = useTemplateRef<HTMLElement>('rootRef');

makeDroppable(
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
  <section ref="rootRef" class="rounded-lg md:border md:border-line md:bg-surface md:p-5">
    <slot />
  </section>
</template>
