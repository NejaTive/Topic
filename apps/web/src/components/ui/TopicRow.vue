<script setup lang="ts">
import PrivacyChip from './PrivacyChip.vue';
import type { PrivacyValue } from './PrivacyChip.vue';

withDefaults(
  defineProps<{
    title: string;
    /** Secondary line: last-edited date (and optional owner label). */
    meta: string;
    privacy: PrivacyValue;
    /** Mobile list: icon-only privacy chip. */
    compactPrivacy?: boolean;
    /** Up to 3 cover thumbs (32×40) for top items — optional for S03. */
    covers?: string[];
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
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : 'button'"
    class="group flex w-full items-center gap-3 rounded-md border border-transparent bg-transparent px-2 py-2 text-left transition-colors outline-none hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    @click="emit('click', $event)"
  >
    <div v-if="covers.length" class="flex shrink-0 -space-x-2" aria-hidden="true">
      <img
        v-for="(src, index) in covers.slice(0, 3)"
        :key="`${src}-${index}`"
        :src="src"
        alt=""
        class="h-10 w-8 rounded-sm border border-line object-cover bg-surface-sunken"
        :style="{ zIndex: 3 - index }"
      />
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-title text-ink">{{ title }}</p>
      <p class="mt-0.5 truncate text-caption text-muted">{{ meta }}</p>
    </div>

    <PrivacyChip class="shrink-0" :privacy="privacy" :compact="compactPrivacy" />
  </component>
</template>
