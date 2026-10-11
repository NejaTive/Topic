<script setup lang="ts">
import { nextTick, onScopeDispose, useTemplateRef, watch } from 'vue';
import TButton from './TButton.vue';

interface TApproveModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
}

interface TApproveModalEmits {
  (e: 'update:open', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<TApproveModalProps>(), {
  description: '',
  confirmLabel: 'Подтвердить',
  cancelLabel: 'Отмена',
  confirmLoading: false,
});

const emit = defineEmits<TApproveModalEmits>();

const confirmRef = useTemplateRef('confirmRef');

function close() {
  if (props.confirmLoading) return;
  emit('update:open', false);
  emit('cancel');
}

function onConfirm() {
  if (props.confirmLoading) return;
  emit('confirm');
}

function onScrimClick(event: MouseEvent) {
  if (event.target !== event.currentTarget) return;
  close();
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
  }
}

function focusConfirm() {
  const inst = confirmRef.value as { $el?: unknown } | null;
  const el = inst?.$el;
  if (el instanceof HTMLElement) el.focus();
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', onKeydown);
      document.body.style.overflow = 'hidden';
      await nextTick();
      focusConfirm();
      return;
    }
    document.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = '';
  },
);

onScopeDispose(() => {
  document.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="t-approve-modal" role="presentation" @click="onScrimClick">
      <div
        class="t-approve-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="t-approve-modal-title"
        :aria-describedby="description ? 't-approve-modal-desc' : undefined"
      >
        <h2 id="t-approve-modal-title" class="t-approve-modal__title">{{ title }}</h2>
        <p v-if="description" id="t-approve-modal-desc" class="t-approve-modal__description">
          {{ description }}
        </p>

        <div class="t-approve-modal__actions">
          <TButton
            variant="secondary"
            class="t-approve-modal__btn"
            :disabled="confirmLoading"
            @click="close"
          >
            {{ cancelLabel }}
          </TButton>
          <TButton
            ref="confirmRef"
            variant="danger-ghost"
            class="t-approve-modal__btn"
            :loading="confirmLoading"
            @click="onConfirm"
          >
            {{ confirmLabel }}
          </TButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.t-approve-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 12px;
  background: color-mix(in srgb, var(--color-bg) 50%, transparent);
}

.t-approve-modal__panel {
  display: flex;
  width: 100%;
  max-width: 390px;
  flex-direction: column;
  gap: 12px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-glass-line);
  background-color: var(--color-surface-glass);
  -webkit-backdrop-filter: blur(var(--blur-glass)) saturate(1.15);
  backdrop-filter: blur(var(--blur-glass)) saturate(1.15);
  box-shadow: var(--shadow-float);
  padding: 24px;
}

.t-approve-modal__title {
  margin: 0;
  font-size: var(--text-h3);
  line-height: var(--text-h3--line-height);
  letter-spacing: var(--text-h3--letter-spacing);
  font-weight: var(--text-h3--font-weight);
  color: var(--color-ink);
}

.t-approve-modal__description {
  margin: 0;
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-muted);
}

.t-approve-modal__actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  margin-top: 8px;
}

.t-approve-modal__btn {
  width: 100%;
}

@media (min-width: 768px) {
  .t-approve-modal {
    align-items: center;
  }

  .t-approve-modal__panel {
    max-width: 480px;
  }

  .t-approve-modal__actions {
    flex-direction: row;
    justify-content: flex-end;
  }

  .t-approve-modal__btn {
    width: auto;
  }
}

@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .t-approve-modal__panel {
    background-color: var(--color-surface);
  }
}
</style>
