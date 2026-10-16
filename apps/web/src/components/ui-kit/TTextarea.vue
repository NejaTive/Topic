<script setup lang="ts">
import { computed, useId } from 'vue';

interface TTextareaProps {
  label: string;
  error?: string;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  id?: string;
}

const props = withDefaults(defineProps<TTextareaProps>(), {
  error: '',
  invalid: false,
  disabled: false,
  placeholder: '',
  rows: 5,
  id: undefined,
});

const model = defineModel<string>({ default: '' });

const autoId = useId();
const fieldId = computed(() => props.id ?? `t-textarea-${autoId}`);
const errorId = computed(() => `${fieldId.value}-error`);

const hasError = computed(() => Boolean(props.error) || props.invalid);
const isFilled = computed(() => model.value.length > 0);
</script>

<template>
  <div class="t-textarea" :class="{ 't-textarea--disabled': disabled }">
    <label :for="fieldId" class="t-textarea__label">{{ label }}</label>
    <textarea
      :id="fieldId"
      v-model="model"
      class="t-textarea__field"
      :class="{
        't-textarea__field--error': hasError,
        't-textarea__field--filled': isFilled && !hasError && !disabled,
      }"
      :disabled="disabled"
      :placeholder="placeholder"
      :rows="rows"
      :aria-invalid="hasError || undefined"
      :aria-describedby="error ? errorId : undefined"
    />
    <p v-if="error" :id="errorId" class="t-textarea__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.t-textarea {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.375rem;

  &__label {
    font-size: var(--text-label);
    line-height: var(--text-label--line-height);
    font-weight: var(--text-label--font-weight);
    color: var(--color-ink);
  }

  &__field {
    box-sizing: border-box;
    min-height: 7.5rem;
    width: 100%;
    resize: vertical;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-line-strong);
    background: var(--color-surface);
    padding: 0.75rem;
    font-size: var(--text-body);
    line-height: var(--text-body--line-height);
    font-weight: var(--text-body--font-weight);
    color: var(--color-ink);
    outline: none;
    transition: border-color 0.15s ease;

    &::placeholder {
      color: var(--color-subtle);
    }

    &:hover:not(:disabled) {
      border-color: color-mix(in srgb, var(--color-ink) 30%, var(--color-line-strong));
    }

    &:focus-visible {
      outline: 2px solid var(--color-focus-ring);
      outline-offset: 2px;
    }

    &--filled {
      border-color: var(--color-line-strong);
    }

    &--error {
      border-color: var(--color-danger);

      &:hover:not(:disabled) {
        border-color: var(--color-danger);
      }
    }

    &:disabled {
      cursor: not-allowed;
      border-color: var(--color-line);
      background: var(--color-surface-sunken);
      color: var(--color-subtle);
    }
  }

  &__error {
    margin: 0;
    font-size: var(--text-caption);
    line-height: var(--text-caption--line-height);
    font-weight: var(--text-caption--font-weight);
    color: var(--color-danger);
  }

  &--disabled &__label {
    color: var(--color-subtle);
  }
}
</style>
