<script setup lang="ts">
import { computed } from 'vue';
import PrivacyChip from './PrivacyChip.vue';
import type { PrivacyValue } from './PrivacyChip.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    /** Secondary line: last-edited (Figma: «обновлён вчера»). */
    meta: string;
    privacy: PrivacyValue;
    /** Mobile list: icon-only privacy chip. */
    compactPrivacy?: boolean;
    /** Up to 3 cover thumbs (32×40); missing → placeholder. */
    covers?: Array<string | null | undefined>;
    href?: string;
  }>(),
  {
    compactPrivacy: false,
    covers: () => [],
    href: undefined,
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

/** Figma Topic row: всегда 3 слота 32×40, gap 4. */
const coverSlots = computed(() => {
  const src = props.covers.slice(0, 3);
  return Array.from({ length: 3 }, (_, i) => src[i] ?? null);
});

const placeholderTone = ['bg-surface-sunken', 'bg-line', 'bg-subtle'] as const;
</script>

<template>
  <!-- Figma B · DS row: surface + line, radius 8, h≈80, covers | text | privacy -->
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : 'button'"
    class="group flex w-full min-h-20 cursor-pointer items-center gap-3 rounded-md border border-line bg-surface px-4 py-5 text-left transition-colors outline-none hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    @click="emit('click', $event)"
  >
    <div class="flex shrink-0 gap-1" aria-hidden="true">
      <div
        v-for="(src, index) in coverSlots"
        :key="index"
        class="h-10 w-8 overflow-hidden rounded-sm"
        :class="src ? 'bg-surface-sunken' : placeholderTone[index]"
      >
        <img v-if="src" :src="src" alt="" class="size-full object-cover" draggable="false" />
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-body-sm font-semibold text-ink">{{ title }}</p>
      <p class="mt-0.5 truncate text-caption font-normal text-muted">{{ meta }}</p>
    </div>

    <PrivacyChip class="shrink-0" :privacy="privacy" :compact="compactPrivacy" />
  </component>
</template>
