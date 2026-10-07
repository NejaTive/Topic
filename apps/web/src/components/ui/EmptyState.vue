<script setup lang="ts">
import AppButton from './AppButton.vue';

withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    ctaLabel?: string;
    /** Figma: Empty state / With CTA */
    showCta?: boolean;
  }>(),
  {
    title: 'Создайте первый топик',
    description: 'Добавьте элементы и расставьте их получится ваш рейтинг.',
    ctaLabel: 'Создать топик',
    showCta: true,
  },
);

const emit = defineEmits<{
  create: [event: MouseEvent];
}>();
</script>

<template>
  <div
    class="flex w-full flex-col items-center gap-3 rounded-lg border border-line bg-surface px-8 py-13 text-center"
    role="status"
  >
    <div
      class="flex size-14 flex-col items-start justify-center gap-1.5 rounded-lg bg-surface-sunken px-3.5"
      aria-hidden="true"
    >
      <span class="h-1 w-7 rounded-sm bg-accent" />
      <span class="h-1 w-7 rounded-sm bg-subtle" />
      <span class="h-1 w-4.5 rounded-sm bg-subtle" />
    </div>

    <p class="text-title text-ink">{{ title }}</p>
    <p class="max-w-80 text-body-sm text-muted">{{ description }}</p>

    <AppButton v-if="showCta" @click="emit('create', $event)">
      {{ ctaLabel }}
    </AppButton>
  </div>
</template>
