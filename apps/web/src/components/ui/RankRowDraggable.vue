<script lang="ts">
export const TOPIC_ITEMS_DND_GROUP = 'topic-items';
</script>

<script setup lang="ts">
import { type IDragEvent, makeDraggable } from '@vue-dnd-kit/core';
import { useTemplateRef } from 'vue';
import type { ItemDto } from '@/api/items';
import RankRow, { type RankRowMode } from './RankRow.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    rank?: number;
    coverUrl?: string;
    mode?: RankRowMode;
    index: number;
    items: ItemDto[];
    itemId: string;
  }>(),
  {
    rank: undefined,
    coverUrl: undefined,
    mode: 'ranked',
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
  dragStart: [event: IDragEvent];
  dragMove: [event: IDragEvent];
  dragEnd: [event: IDragEvent];
  dragCancel: [event: IDragEvent];
}>();

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const { isDragging } = makeDraggable(
  rootRef,
  {
    id: props.itemId,
    dragHandle: '[data-slot="drag-handle"]',
    activation: { distance: 6 },
    groups: [TOPIC_ITEMS_DND_GROUP],
    data: () => ({ id: props.itemId, mode: props.mode }),
    events: {
      onSelfDragStart: (e) => emit('dragStart', e),
      onSelfDragMove: (e) => emit('dragMove', e),
      onSelfDragEnd: (e) => emit('dragEnd', e),
      onSelfDragCancel: (e) => emit('dragCancel', e),
    },
  },
  () => [props.index, props.items],
);

function onClick(event: MouseEvent) {
  if (isDragging.value) return;
  emit('click', event);
}
</script>

<template>
  <div ref="rootRef" class="w-full">
    <RankRow
      class="max-w-none! w-full"
      :mode="mode"
      :title="title"
      :rank="rank"
      :cover-url="coverUrl"
      drag-enabled
      :dragging="isDragging"
      @click="onClick"
    />
  </div>
</template>
