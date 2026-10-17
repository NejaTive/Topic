<script setup lang="ts">
import { computed, nextTick, onScopeDispose, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { RecommendationsApiError } from '@/api/recommendations';
import type { TopicCategory } from '@/api/topics';
import { TButton, TError, TLoader, TTopicRow } from '@/components/ui-kit';
import { useAcceptRecommendationMutation } from '@/composables/useRecommendationMutations';
import { useTopicsQuery } from '@/composables/useTopicsQuery';
import { previewCoverUrls } from '@/lib/cover-url';
import { formatTopicUpdatedAt } from '@/lib/format-topic-meta';
import { topicCategoryLabel } from '@/lib/topic-category';
import { RouteName } from '@/router/route-names';

interface AcceptRecommendationModalProps {
  open: boolean;
  recommendationId: string;
  category: TopicCategory;
}

interface AcceptRecommendationModalEmits {
  (e: 'update:open', value: boolean): void;
  (e: 'accepted', topicId: string): void;
}

const props = defineProps<AcceptRecommendationModalProps>();
const emit = defineEmits<AcceptRecommendationModalEmits>();

const router = useRouter();
const topicsQuery = useTopicsQuery();
const acceptMutation = useAcceptRecommendationMutation();

const panelRef = useTemplateRef('panelRef');
const errorMessage = ref('');
const pendingTopicId = ref<string | null>(null);

const matchingTopics = computed(() =>
  (topicsQuery.data.value ?? []).filter((topic) => topic.category === props.category),
);
const isEmpty = computed(() => topicsQuery.isSuccess.value && matchingTopics.value.length === 0);
const isBusy = computed(() => acceptMutation.isPending.value);

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

function goCreateTopic() {
  close();
  void router.push({ name: RouteName.AppTopicCreate });
}

async function onPickTopic(topicId: string) {
  if (isBusy.value) return;
  errorMessage.value = '';
  pendingTopicId.value = topicId;
  try {
    await acceptMutation.mutateAsync({
      id: props.recommendationId,
      body: { topicId },
    });
    emit('accepted', topicId);
    emit('update:open', false);
  } catch (err) {
    if (err instanceof RecommendationsApiError) {
      errorMessage.value = err.message;
      return;
    }
    errorMessage.value = 'Не удалось добавить в топик';
  } finally {
    pendingTopicId.value = null;
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      errorMessage.value = '';
      pendingTopicId.value = null;
      document.addEventListener('keydown', onKeydown);
      document.body.style.overflow = 'hidden';
      void topicsQuery.refetch();
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
    <div v-if="open" class="accept-rec-modal" role="presentation" @click="onScrimClick">
      <div
        ref="panelRef"
        class="accept-rec-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="accept-rec-modal-title"
        tabindex="-1"
      >
        <h2 id="accept-rec-modal-title" class="accept-rec-modal__title">Добавить в топик</h2>
        <p class="accept-rec-modal__hint">
          Только топики категории «{{ topicCategoryLabel(category) }}»
        </p>

        <div v-if="topicsQuery.isPending.value" class="accept-rec-modal__state">
          <TLoader />
        </div>
        <div v-else-if="topicsQuery.isError.value" class="accept-rec-modal__state">
          <TError @retry="topicsQuery.refetch()" />
        </div>
        <div v-else-if="isEmpty" class="accept-rec-modal__empty">
          <p class="accept-rec-modal__empty-text">
            Нет топиков этой категории. Создайте топик, затем добавьте элемент снова.
          </p>
          <TButton class="accept-rec-modal__btn" @click="goCreateTopic">Создать топик</TButton>
        </div>
        <ul v-else class="accept-rec-modal__list" aria-label="Мои топики">
          <li v-for="topic in matchingTopics" :key="topic.id">
            <TTopicRow
              :title="topic.title"
              :meta="formatTopicUpdatedAt(topic.updatedAt)"
              :category="topic.category"
              :privacy="topic.privacy"
              :covers="previewCoverUrls(topic.previewCovers)"
              compact-privacy
              :class="{ 'opacity-60': pendingTopicId === topic.id }"
              @click="onPickTopic(topic.id)"
            />
          </li>
        </ul>

        <p v-if="errorMessage" class="accept-rec-modal__error" role="alert">
          {{ errorMessage }}
        </p>

        <TButton
          variant="secondary"
          class="accept-rec-modal__btn"
          :disabled="isBusy"
          @click="close"
        >
          Отмена
        </TButton>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.accept-rec-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 12px;
  background: color-mix(in srgb, var(--color-bg) 50%, transparent);
}

.accept-rec-modal__panel {
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

.accept-rec-modal__title {
  margin: 0;
  font-size: var(--text-h3);
  line-height: var(--text-h3--line-height);
  letter-spacing: var(--text-h3--letter-spacing);
  font-weight: var(--text-h3--font-weight);
  color: var(--color-ink);
}

.accept-rec-modal__hint {
  margin: 0;
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-muted);
}

.accept-rec-modal__state,
.accept-rec-modal__empty {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.accept-rec-modal__empty-text {
  margin: 0;
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-muted);
}

.accept-rec-modal__list {
  display: flex;
  margin: 0;
  padding: 0;
  flex-direction: column;
  gap: 8px;
  list-style: none;
}

.accept-rec-modal__error {
  margin: 0;
  font-size: var(--text-caption);
  line-height: var(--text-caption--line-height);
  color: var(--color-danger);
}

.accept-rec-modal__btn {
  width: 100%;
}

@media (min-width: 768px) {
  .accept-rec-modal {
    align-items: center;
  }

  .accept-rec-modal__panel {
    max-width: 480px;
  }
}

@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .accept-rec-modal__panel {
    background-color: var(--color-surface);
  }
}
</style>
