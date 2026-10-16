<script setup lang="ts">
import { computed, nextTick, onScopeDispose, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { RecommendationsApiError } from '@/api/recommendations';
import { TButton, TError, TLoader } from '@/components/ui-kit';
import { useMutualFollowsQuery } from '@/composables/useMutualFollowsQuery';
import { useRecommendItemMutation } from '@/composables/useRecommendationMutations';
import { RouteName } from '@/router/route-names';

interface RecommendItemModalProps {
  open: boolean;
  itemId: string;
}

interface RecommendItemModalEmits {
  (e: 'update:open', value: boolean): void;
  (e: 'sent'): void;
}

const props = defineProps<RecommendItemModalProps>();
const emit = defineEmits<RecommendItemModalEmits>();

const router = useRouter();
const mutualQuery = useMutualFollowsQuery();
const recommendMutation = useRecommendItemMutation();

const panelRef = useTemplateRef('panelRef');
const selectedIds = ref<Set<string>>(new Set());
const errorMessage = ref('');
const submitMode = ref<'selected' | 'all' | null>(null);

const items = computed(() => mutualQuery.data.value?.items ?? []);
const isEmpty = computed(() => mutualQuery.isSuccess.value && items.value.length === 0);
const isBusy = computed(() => recommendMutation.isPending.value);
const hasSelection = computed(() => selectedIds.value.size > 0);

function close() {
  if (isBusy.value) return;
  emit('update:open', false);
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

function isSelected(id: string) {
  return selectedIds.value.has(id);
}

function toggleRecipient(id: string) {
  if (isBusy.value) return;
  const next = new Set(selectedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedIds.value = next;
  errorMessage.value = '';
}

function applyError(err: unknown) {
  if (err instanceof RecommendationsApiError) {
    if (err.status === 401) {
      close();
      void router.replace({ name: RouteName.Login });
      return;
    }
    if (err.status === 400 || err.status === 409) {
      errorMessage.value = err.message;
      return;
    }
    errorMessage.value = err.message || 'Не удалось отправить рекомендацию';
    return;
  }
  errorMessage.value = 'Не удалось отправить рекомендацию';
}

async function submit(mode: 'selected' | 'all', body: { recipientIds: string[] } | { all: true }) {
  if (isBusy.value) return;
  errorMessage.value = '';
  submitMode.value = mode;
  try {
    await recommendMutation.mutateAsync({ itemId: props.itemId, body });
    emit('sent');
    emit('update:open', false);
  } catch (err) {
    applyError(err);
  } finally {
    submitMode.value = null;
  }
}

async function onSendSelected() {
  if (!hasSelection.value) return;
  await submit('selected', { recipientIds: [...selectedIds.value] });
}

async function onSendAll() {
  await submit('all', { all: true });
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      selectedIds.value = new Set();
      errorMessage.value = '';
      submitMode.value = null;
      document.addEventListener('keydown', onKeydown);
      document.body.style.overflow = 'hidden';
      void mutualQuery.refetch();
      await nextTick();
      const el = panelRef.value;
      if (el instanceof HTMLElement) el.focus();
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
    <div v-if="open" class="recommend-modal" role="presentation" @click="onScrimClick">
      <div
        ref="panelRef"
        class="recommend-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recommend-modal-title"
        tabindex="-1"
      >
        <h2 id="recommend-modal-title" class="recommend-modal__title">Кому рекомендовать</h2>

        <div v-if="mutualQuery.isPending.value" class="recommend-modal__state">
          <TLoader />
        </div>
        <div v-else-if="mutualQuery.isError.value" class="recommend-modal__state">
          <TError @retry="mutualQuery.refetch()" />
        </div>
        <div v-else-if="isEmpty" class="recommend-modal__empty">
          <p class="recommend-modal__empty-text">Пока нет взаимных подписок</p>
        </div>
        <template v-else>
          <ul class="recommend-modal__list" aria-label="Взаимные подписки">
            <li v-for="user in items" :key="user.id">
              <label class="recommend-modal__row">
                <input
                  type="checkbox"
                  class="recommend-modal__checkbox"
                  :checked="isSelected(user.id)"
                  :disabled="isBusy"
                  @change="toggleRecipient(user.id)"
                />
                <span class="recommend-modal__nick">{{ user.nick }}</span>
              </label>
            </li>
          </ul>

          <div class="recommend-modal__actions">
            <TButton
              class="recommend-modal__btn"
              :disabled="!hasSelection || isBusy"
              :loading="submitMode === 'selected'"
              @click="onSendSelected"
            >
              Отправить
            </TButton>
            <TButton
              variant="secondary"
              class="recommend-modal__btn"
              :disabled="isBusy"
              :loading="submitMode === 'all'"
              @click="onSendAll"
            >
              Отправить всем
            </TButton>
          </div>
        </template>

        <p v-if="errorMessage" class="recommend-modal__error" role="alert">
          {{ errorMessage }}
        </p>

        <TButton variant="secondary" class="recommend-modal__btn" :disabled="isBusy" @click="close">
          Отмена
        </TButton>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.recommend-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 12px;
  background: color-mix(in srgb, var(--color-bg) 50%, transparent);
}

.recommend-modal__panel {
  display: flex;
  width: 100%;
  max-width: 390px;
  max-height: min(80dvh, 640px);
  flex-direction: column;
  gap: 12px;
  overflow: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-glass-line);
  background-color: var(--color-surface-glass);
  -webkit-backdrop-filter: blur(var(--blur-glass)) saturate(1.15);
  backdrop-filter: blur(var(--blur-glass)) saturate(1.15);
  box-shadow: var(--shadow-float);
  padding: 24px;
  outline: none;
}

.recommend-modal__title {
  margin: 0;
  font-size: var(--text-h3);
  line-height: var(--text-h3--line-height);
  letter-spacing: var(--text-h3--letter-spacing);
  font-weight: var(--text-h3--font-weight);
  color: var(--color-ink);
}

.recommend-modal__state,
.recommend-modal__empty {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.recommend-modal__empty-text {
  margin: 0;
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-muted);
}

.recommend-modal__list {
  display: flex;
  margin: 0;
  padding: 0;
  flex-direction: column;
  gap: 4px;
  list-style: none;
}

.recommend-modal__row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--size-control-md);
  padding: 4px 0;
  cursor: pointer;
}

.recommend-modal__checkbox {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: var(--color-accent);
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
}

.recommend-modal__nick {
  font-size: var(--text-body);
  line-height: var(--text-body--line-height);
  color: var(--color-ink);
}

.recommend-modal__error {
  margin: 0;
  font-size: var(--text-caption);
  line-height: var(--text-caption--line-height);
  color: var(--color-danger);
}

.recommend-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.recommend-modal__btn {
  width: 100%;
}

@media (min-width: 768px) {
  .recommend-modal {
    align-items: center;
  }

  .recommend-modal__panel {
    max-width: 480px;
  }
}

@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .recommend-modal__panel {
    background-color: var(--color-surface);
  }
}
</style>
