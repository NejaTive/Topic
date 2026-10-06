<script setup lang="ts">
import { computed, useId } from 'vue';

export type AppInputType = 'text' | 'password' | 'email';

const props = withDefaults(
  defineProps<{
    label: string;
    type?: AppInputType;
    error?: string;
    /** Error border without message (e.g. login 401 on email). */
    invalid?: boolean;
    disabled?: boolean;
    placeholder?: string;
    autocomplete?: string;
    id?: string;
  }>(),
  {
    type: 'text',
    error: '',
    invalid: false,
    disabled: false,
    placeholder: '',
    autocomplete: undefined,
    id: undefined,
  },
);

const model = defineModel<string>({ default: '' });

const autoId = useId();
const inputId = computed(() => props.id ?? `app-input-${autoId}`);
const errorId = computed(() => `${inputId.value}-error`);

const hasError = computed(() => Boolean(props.error) || props.invalid);
const isFilled = computed(() => model.value.length > 0);

const fieldClass = computed(() => {
  const base = [
    'h-[var(--size-control-md)] w-full rounded-md border bg-surface px-3 text-body text-ink',
    'placeholder:text-subtle',
    'transition-colors outline-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
  ];

  if (props.disabled) {
    base.push('border-line bg-surface-sunken text-subtle cursor-not-allowed');
    return base.join(' ');
  }

  if (hasError.value) {
    base.push('border-danger hover:border-danger');
    return base.join(' ');
  }

  base.push('border-line-strong hover:border-ink/30');
  if (isFilled.value) {
    base.push('border-line-strong');
  }
  return base.join(' ');
});
</script>

<template>
  <div class="flex w-full flex-col gap-1.5">
    <label :for="inputId" class="text-label text-ink" :class="disabled && 'text-subtle'">
      {{ label }}
    </label>
    <input
      :id="inputId"
      v-model="model"
      :type="type"
      :disabled="disabled"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="hasError || undefined"
      :aria-describedby="error ? errorId : undefined"
      :class="fieldClass"
    />
    <p v-if="error" :id="errorId" class="text-caption text-danger" role="alert">
      {{ error }}
    </p>
  </div>
</template>
