<script lang="ts">
/** Title-hint chips on S04 (Фильмы / …) — emit label into title field; no presetKey. */
export const MAIN_CHIP_LABELS = ['Фильмы', 'Сериалы', 'Книги', 'Игры'] as const;
export type MainChipLabel = (typeof MAIN_CHIP_LABELS)[number];
</script>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    selected?: boolean;
  }>(),
  {
    selected: false,
  },
);

const emit = defineEmits<{
  select: [label: string];
}>();
</script>

<template>
  <button
    type="button"
    class="inline-flex h-8 items-center justify-center rounded-sm px-3 text-caption font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    :class="
      selected
        ? 'bg-warning-hover text-warning'
        : 'bg-warning-soft text-warning hover:bg-warning-hover'
    "
    :aria-pressed="selected"
    @click="emit('select', label)"
  >
    {{ label }}
  </button>
</template>
