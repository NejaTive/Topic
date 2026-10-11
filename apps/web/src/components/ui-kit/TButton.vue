<script setup lang="ts">
import { computed } from 'vue';

export type TButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
export type TButtonSize = 'md' | 'sm';

interface TButtonProps {
  variant?: TButtonVariant;
  size?: TButtonSize;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
}

interface TButtonEmits {
  (e: 'click', event: MouseEvent): void;
}

const props = withDefaults(defineProps<TButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
});

const emit = defineEmits<TButtonEmits>();

const isInteractive = computed(() => !props.disabled && !props.loading);

const sizeClass = computed(() =>
  props.size === 'sm'
    ? 'h-(--size-control-sm) px-3 text-body-sm'
    : 'h-(--size-control-md) px-6 text-label',
);

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return [
        'bg-surface text-ink border border-line-strong',
        'hover:enabled:bg-surface-sunken',
      ].join(' ');
    case 'ghost':
      return ['bg-transparent text-accent', 'hover:enabled:bg-accent-soft'].join(' ');
    case 'danger':
      return [
        'bg-danger text-accent-on border border-transparent',
        'hover:enabled:opacity-90',
      ].join(' ');
    case 'danger-ghost':
      return ['bg-transparent text-danger', 'hover:enabled:bg-danger-soft'].join(' ');
    case 'primary':
    default:
      return [
        'bg-accent text-accent-on border border-transparent',
        'hover:enabled:bg-accent-hover',
      ].join(' ');
  }
});

const disabledClass = computed(() => {
  if (!props.disabled && !props.loading) return '';
  if (props.variant === 'primary' || props.variant === 'danger') {
    return 'disabled:bg-surface-sunken disabled:text-subtle disabled:border-transparent';
  }
  if (props.variant === 'secondary') {
    return 'disabled:bg-surface-sunken disabled:text-subtle disabled:border-line';
  }
  return 'disabled:bg-transparent disabled:text-subtle';
});

function onClick(event: MouseEvent) {
  if (!isInteractive.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit('click', event);
}
</script>

<template>
  <button
    :type="type"
    class="inline-flex items-center justify-center gap-2 rounded-md font-sans font-semibold transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer"
    :class="[sizeClass, variantClass, disabledClass, loading && 'pointer-events-none']"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :aria-disabled="disabled || loading || undefined"
    @click="onClick"
  >
    <span
      v-if="loading"
      class="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
      aria-hidden="true"
    />
    <span :class="loading ? 'opacity-80' : undefined">
      <slot />
    </span>
  </button>
</template>
