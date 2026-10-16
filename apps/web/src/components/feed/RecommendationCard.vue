<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Recommendation } from '@/api/recommendations';
import { RecommendationsApiError } from '@/api/recommendations';
import { TButton, TCategoryChip } from '@/components/ui-kit';
import { useDismissRecommendationMutation } from '@/composables/useRecommendationMutations';
import { RouteName } from '@/router/route-names';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

interface RecommendationCardEmits {
  (e: 'accept', id: string): void;
}

const props = defineProps<RecommendationCardProps>();
const emit = defineEmits<RecommendationCardEmits>();

const router = useRouter();
const dismissMutation = useDismissRecommendationMutation();

const dismissError = ref('');
const isDismissing = computed(() => dismissMutation.isPending.value);

function goFromProfile() {
  void router.push({
    name: RouteName.UserProfile,
    params: { nick: props.recommendation.fromNick },
  });
}

function onAccept() {
  if (isDismissing.value) return;
  emit('accept', props.recommendation.id);
}

async function onDismiss() {
  if (isDismissing.value) return;
  dismissError.value = '';
  try {
    await dismissMutation.mutateAsync(props.recommendation.id);
  } catch (err) {
    if (err instanceof RecommendationsApiError) {
      dismissError.value = err.message;
      return;
    }
    dismissError.value = 'Не удалось отклонить';
  }
}
</script>

<template>
  <article
    class="glass flex w-full flex-col gap-3 rounded-md px-4 py-4"
    :aria-label="recommendation.title"
  >
    <div class="flex items-center gap-3">
      <div
        class="h-14 w-11 shrink-0 overflow-hidden rounded-sm bg-surface-sunken"
        aria-hidden="true"
      >
        <img
          v-if="recommendation.coverUrl"
          :src="recommendation.coverUrl"
          alt=""
          class="size-full object-cover"
          draggable="false"
        />
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-body-sm font-semibold text-ink">{{ recommendation.title }}</p>
        <p class="mt-0.5 truncate text-caption text-muted">
          <button
            type="button"
            class="text-caption font-normal text-muted hover:text-ink"
            @click="goFromProfile"
          >
            @{{ recommendation.fromNick }}
          </button>
        </p>
      </div>

      <TCategoryChip :category="recommendation.category" />
    </div>

    <div class="flex gap-2">
      <TButton class="min-w-0 flex-1" size="sm" :disabled="isDismissing" @click="onAccept">
        Принять
      </TButton>
      <TButton
        class="min-w-0 flex-1"
        variant="secondary"
        size="sm"
        :loading="isDismissing"
        :disabled="isDismissing"
        @click="onDismiss"
      >
        Отклонить
      </TButton>
    </div>

    <p v-if="dismissError" class="text-caption text-danger" role="alert">{{ dismissError }}</p>
  </article>
</template>
