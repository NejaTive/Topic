<script lang="ts">
/** UI copy + client check; server multipart limit is 5 MB (BAC-11). */
export const COVER_MAX_BYTES = 5 * 1024 * 1024;
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Object URL or remote cover preview. */
    previewUrl?: string | null;
    error?: string | null;
    disabled?: boolean;
  }>(),
  {
    previewUrl: null,
    error: null,
    disabled: false,
  },
);

const emit = defineEmits<{
  /** Selected file for multipart upload (caller → BAC-11). */
  file: [file: File];
  clear: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isHover = ref(false);
const isDragOver = ref(false);
const localError = ref<string | null>(null);

const displayError = computed(() => localError.value ?? props.error ?? null);
const hasPreview = computed(() => Boolean(props.previewUrl));
const state = computed(() => {
  if (displayError.value) return 'error' as const;
  if (hasPreview.value) return 'filled' as const;
  if (isDragOver.value || isHover.value) return 'hover' as const;
  return 'empty' as const;
});

watch(
  () => props.previewUrl,
  () => {
    localError.value = null;
  },
);

function openPicker() {
  if (props.disabled) return;
  inputRef.value?.click();
}

function onFileList(files: FileList | null) {
  const file = files?.[0];
  if (!file) return;

  if (file.size > COVER_MAX_BYTES) {
    localError.value = 'Файл больше 5 МБ';
    return;
  }

  localError.value = null;
  emit('file', file);
}

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  onFileList(input.files);
  input.value = '';
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
  if (props.disabled) return;
  onFileList(event.dataTransfer?.files ?? null);
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (props.disabled) return;
  isDragOver.value = true;
}

function clearCover(event: MouseEvent) {
  event.stopPropagation();
  localError.value = null;
  emit('clear');
}
</script>

<template>
  <div class="inline-flex flex-col gap-2">
    <div
      role="button"
      tabindex="0"
      class="relative flex h-48 w-36 flex-col items-center justify-center overflow-hidden rounded-sm border outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      :class="[
        disabled ? 'pointer-events-none cursor-not-allowed opacity-60' : 'cursor-pointer',
        state === 'error'
          ? 'border-danger bg-danger-soft'
          : state === 'filled'
            ? 'border-line bg-surface'
            : state === 'hover'
              ? 'border-accent bg-accent-soft'
              : 'border-dashed border-line-strong bg-surface-sunken',
      ]"
      :aria-label="hasPreview ? 'Заменить обложку' : 'Загрузить обложку'"
      :aria-disabled="disabled || undefined"
      :aria-invalid="displayError ? true : undefined"
      :data-state="state"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
      @dragenter="onDragOver"
      @dragover="onDragOver"
      @dragleave="isDragOver = false"
      @drop="onDrop"
    >
      <img
        v-if="hasPreview && previewUrl"
        :src="previewUrl"
        alt=""
        class="absolute inset-0 size-full object-cover"
      />

      <div
        v-if="!hasPreview"
        class="relative z-10 flex flex-col items-center gap-1 px-3 text-center"
      >
        <svg class="size-8 text-subtle" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect
            x="4"
            y="6"
            width="24"
            height="20"
            rx="2"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <circle cx="12" cy="14" r="2.5" stroke="currentColor" stroke-width="1.5" />
          <path
            d="M4 22l6.5-6.5 4 4L22 12l6 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="text-caption text-muted">Обложка</span>
        <span class="text-caption text-subtle">до 5 МБ</span>
      </div>

      <div
        v-else
        class="absolute inset-x-0 bottom-0 z-10 bg-ink/60 px-2 py-1.5 text-center text-caption text-accent-on transition-opacity"
        :class="isHover || isDragOver ? 'opacity-100' : 'opacity-0'"
      >
        Заменить
      </div>

      <input
        ref="inputRef"
        type="file"
        class="sr-only"
        accept="image/*"
        :disabled="disabled"
        @change="onInputChange"
      />
    </div>

    <p v-if="displayError" class="max-w-36 text-caption text-danger" role="alert">
      {{ displayError }}
    </p>

    <button
      v-if="hasPreview && !disabled"
      type="button"
      class="text-left text-caption font-semibold text-danger outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      @click="clearCover"
    >
      Убрать
    </button>
  </div>
</template>
