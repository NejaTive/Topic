<script lang="ts">
export const TOPIC_ITEMS_DND_GROUP = 'topic-items';
</script>

<script setup lang="ts">
import { type IDragEvent, makeDraggable } from '@vue-dnd-kit/core';
import { useTemplateRef } from 'vue';
import type { ItemDto } from '@/api/items';
import TRankRow, { type TRankRowMode } from '@/components/ui-kit/TRankRow.vue';

interface RankRowDraggableProps {
  title: string;
  rank?: number;
  coverUrl?: string;
  mode?: TRankRowMode;
  index: number;
  items: ItemDto[];
  itemId: string;
}

interface RankRowDraggableEmits {
  (e: 'click', event: MouseEvent): void;
  (e: 'dragStart', event: IDragEvent): void;
  (e: 'dragMove', event: IDragEvent): void;
  (e: 'dragEnd', event: IDragEvent): void;
  (e: 'dragCancel', event: IDragEvent): void;
}

const props = withDefaults(defineProps<RankRowDraggableProps>(), {
  rank: undefined,
  coverUrl: undefined,
  mode: 'ranked',
});

const emit = defineEmits<RankRowDraggableEmits>();

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
    <TRankRow
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
