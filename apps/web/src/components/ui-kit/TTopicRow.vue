<script setup lang="ts">
import { computed } from 'vue';
import TPrivacyChip from './TPrivacyChip.vue';
import type { PrivacyValue } from './TPrivacyChip.vue';

interface TTopicRowProps {
  title: string;
  meta: string;
  privacy?: PrivacyValue;
  compactPrivacy?: boolean;
  covers?: Array<string | null | undefined>;
  href?: string;
  ownerNick?: string;
}

interface TTopicRowEmits {
  (e: 'click', event: MouseEvent): void;
  (e: 'owner-click', event: MouseEvent): void;
}

const props = withDefaults(defineProps<TTopicRowProps>(), {
  privacy: undefined,
  compactPrivacy: false,
  covers: () => [],
  href: undefined,
  ownerNick: undefined,
});

const emit = defineEmits<TTopicRowEmits>();

const coverSlots = computed(() => {
  const src = props.covers.slice(0, 3);
  return Array.from({ length: 3 }, (_, i) => src[i] ?? null);
});

const rootTag = computed(() => {
  if (props.href) return 'a';
  if (props.ownerNick) return 'div';
  return 'button';
});

const placeholderTone = ['bg-surface-sunken', 'bg-line', 'bg-subtle'] as const;

function onActivate(event: MouseEvent | KeyboardEvent) {
  if (event instanceof KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
  }
  emit('click', event as MouseEvent);
}
</script>

<template>
  <component
    :is="rootTag"
    :href="href"
    :type="rootTag === 'button' ? 'button' : undefined"
    :role="rootTag === 'div' ? 'button' : undefined"
    :tabindex="rootTag === 'div' ? 0 : undefined"
    class="glass group flex w-full min-h-20 cursor-pointer items-center gap-3 rounded-md px-4 py-5 text-left transition-colors outline-none hover:bg-surface-glass-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    @click="onActivate"
    @keydown="rootTag === 'div' ? onActivate($event) : undefined"
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
      <p class="mt-0.5 truncate text-caption font-normal text-muted">
        <template v-if="ownerNick">
          <button
            type="button"
            class="text-caption font-normal text-muted hover:text-ink"
            @click.stop="emit('owner-click', $event)"
          >
            @{{ ownerNick }}
          </button>
          <span v-if="meta"> · {{ meta }}</span>
        </template>
        <template v-else>{{ meta }}</template>
      </p>
    </div>

    <TPrivacyChip v-if="privacy" class="shrink-0" :privacy="privacy" :compact="compactPrivacy" />
  </component>
</template>
