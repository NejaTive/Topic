<script setup lang="ts">
import { computed } from 'vue';
import TPrivacyChip from './TPrivacyChip.vue';
import type { PrivacyValue } from './TPrivacyChip.vue';

interface TTopicRowProps {
  title: string;
  meta: string;
  privacy: PrivacyValue;
  compactPrivacy?: boolean;
  covers?: Array<string | null | undefined>;
  href?: string;
}

interface TTopicRowEmits {
  (e: 'click', event: MouseEvent): void;
}

const props = withDefaults(defineProps<TTopicRowProps>(), {
  compactPrivacy: false,
  covers: () => [],
  href: undefined,
});

const emit = defineEmits<TTopicRowEmits>();

const coverSlots = computed(() => {
  const src = props.covers.slice(0, 3);
  return Array.from({ length: 3 }, (_, i) => src[i] ?? null);
});

const placeholderTone = ['bg-surface-sunken', 'bg-line', 'bg-subtle'] as const;
</script>

<template>
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

    <TPrivacyChip class="shrink-0" :privacy="privacy" :compact="compactPrivacy" />
  </component>
</template>
