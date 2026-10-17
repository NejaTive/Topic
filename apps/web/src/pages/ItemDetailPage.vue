<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ItemsApiError } from '@/api/items';
import { TopicsApiError } from '@/api/topics';
import RecommendItemModal from '@/components/recommendations/RecommendItemModal.vue';
import {
  TApproveModal,
  TButton,
  TCoverUpload,
  TError,
  TInput,
  TLoader,
  TTextarea,
} from '@/components/ui-kit';
import {
  useDeleteItemCoverMutation,
  useDeleteItemMutation,
  useRankItemOnDetailMutation,
  useUnrankItemMutation,
  useUpdateItemMutation,
  useUploadItemCoverMutation,
} from '@/composables/useItemMutations';
import { useItemQuery } from '@/composables/useItemQuery';
import { useTopicQuery } from '@/composables/useTopicQuery';
import { RouteName } from '@/router/route-names';
import { ContentPageWrapper } from '@/components/layout';

interface FieldErrors {
  title?: string;
}

const route = useRoute();
const router = useRouter();

const topicId = computed(() => String(route.params.id ?? ''));
const itemId = computed(() => String(route.params.itemId ?? ''));

const topicQuery = useTopicQuery(topicId);
const itemQuery = useItemQuery(topicId, itemId);

const updateItem = useUpdateItemMutation(
  () => topicId.value,
  () => itemId.value,
);
const uploadCover = useUploadItemCoverMutation(
  () => topicId.value,
  () => itemId.value,
);
const deleteCover = useDeleteItemCoverMutation(
  () => topicId.value,
  () => itemId.value,
);
const deleteItemMut = useDeleteItemMutation(() => topicId.value);
const rankMut = useRankItemOnDetailMutation(
  () => topicId.value,
  () => itemId.value,
);
const unrankMut = useUnrankItemMutation(
  () => topicId.value,
  () => itemId.value,
);

const title = ref('');
const description = ref('');
const director = ref('');
const genre = ref('');
const country = ref('');
const coverFile = ref<File | null>(null);
const coverPreviewUrl = ref<string | null>(null);
const coverRemoved = ref(false);
const coverError = ref<string | null>(null);
const fieldErrors = ref<FieldErrors>({});
const formError = ref('');
const actionError = ref('');
const recommendFeedback = ref('');
const approveOpen = ref(false);
const recommendOpen = ref(false);
let recommendFeedbackTimer: ReturnType<typeof setTimeout> | null = null;

const topicTitle = computed(() => topicQuery.data.value?.title ?? 'Топик');
const category = computed(() => topicQuery.data.value?.category);
const isCatalogTopic = computed(
  () => category.value === 'movies' || category.value === 'series' || category.value === 'games',
);
const directorLabel = computed(() => {
  if (category.value === 'games') return 'Разработчик';
  if (category.value === 'series') return 'Создатель';
  return 'Режиссёр';
});
const isGamesTopic = computed(() => category.value === 'games');
const item = computed(() => itemQuery.data.value);

const remoteCoverUrl = computed(() => item.value?.coverUrl ?? null);
const displayCoverUrl = computed(() => {
  if (coverPreviewUrl.value) return coverPreviewUrl.value;
  if (coverRemoved.value) return null;
  return remoteCoverUrl.value;
});

const isBusy = computed(
  () =>
    updateItem.isPending.value ||
    uploadCover.isPending.value ||
    deleteCover.isPending.value ||
    deleteItemMut.isPending.value ||
    rankMut.isPending.value ||
    unrankMut.isPending.value,
);

watch(
  () => item.value,
  (next) => {
    if (!next) return;
    title.value = next.title;
    description.value = next.meta?.description ?? '';
    director.value = next.meta?.director ?? '';
    genre.value = next.meta?.genre ?? '';
    country.value = next.meta?.country ?? '';
  },
  { immediate: true },
);

function revokeLocalPreview() {
  if (coverPreviewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(coverPreviewUrl.value);
  }
  coverPreviewUrl.value = null;
}

onUnmounted(() => {
  revokeLocalPreview();
  if (recommendFeedbackTimer) clearTimeout(recommendFeedbackTimer);
});

function clearFormErrors() {
  fieldErrors.value = {};
  formError.value = '';
  coverError.value = null;
}

function clearActionError() {
  actionError.value = '';
}

function applyError(err: unknown, fallback: string, preferCover = false) {
  if (err instanceof TopicsApiError || err instanceof ItemsApiError) {
    if (err.status === 401) {
      router.replace({ name: RouteName.Login, query: { returnUrl: route.fullPath } });
      return;
    }
    if (preferCover && (err.status === 400 || err.status === 413)) {
      coverError.value = err.message;
      return;
    }
    if (err.status === 400 || err.status === 422) {
      fieldErrors.value = { title: err.message };
      return;
    }
    formError.value = err.message || fallback;
    return;
  }
  formError.value = fallback;
}

function applyActionError(err: unknown, fallback: string) {
  if (err instanceof TopicsApiError || err instanceof ItemsApiError) {
    if (err.status === 401) {
      router.replace({ name: RouteName.Login, query: { returnUrl: route.fullPath } });
      return;
    }
    actionError.value = err.message || fallback;
    return;
  }
  actionError.value = fallback;
}

function onCoverFile(file: File) {
  coverError.value = null;
  coverRemoved.value = false;
  revokeLocalPreview();
  coverFile.value = file;
  coverPreviewUrl.value = URL.createObjectURL(file);
}

function onCoverClear() {
  coverError.value = null;
  coverFile.value = null;
  revokeLocalPreview();
  coverRemoved.value = true;
}

async function onSave() {
  clearFormErrors();
  clearActionError();

  const trimmed = title.value.trim();
  if (!trimmed) {
    fieldErrors.value = { title: 'Укажите название' };
    return;
  }

  try {
    const nextMeta = isCatalogTopic.value
      ? {
          description: description.value.trim(),
          director: director.value.trim(),
          genre: genre.value.trim(),
          ...(!isGamesTopic.value ? { country: country.value.trim() } : {}),
        }
      : undefined;
    const prevMeta = item.value?.meta;
    const metaChanged =
      isCatalogTopic.value &&
      (nextMeta!.description !== (prevMeta?.description ?? '') ||
        nextMeta!.director !== (prevMeta?.director ?? '') ||
        nextMeta!.genre !== (prevMeta?.genre ?? '') ||
        (!isGamesTopic.value && nextMeta!.country !== (prevMeta?.country ?? '')));

    if (!item.value || trimmed !== item.value.title || metaChanged) {
      await updateItem.mutateAsync({
        title: trimmed,
        ...(metaChanged ? { meta: nextMeta } : {}),
      });
    }

    if (coverFile.value) {
      await uploadCover.mutateAsync(coverFile.value);
      coverFile.value = null;
      revokeLocalPreview();
      coverRemoved.value = false;
    } else if (coverRemoved.value && remoteCoverUrl.value) {
      await deleteCover.mutateAsync();
      coverRemoved.value = false;
    }

    await router.replace({
      name: RouteName.AppTopicDetail,
      params: { id: topicId.value },
    });
  } catch (err) {
    applyError(err, 'Не удалось сохранить элемент', Boolean(coverFile.value));
  }
}

function openDelete() {
  clearActionError();
  approveOpen.value = true;
}

function openRecommend() {
  clearActionError();
  recommendFeedback.value = '';
  recommendOpen.value = true;
}

function onRecommendSent() {
  recommendFeedback.value = 'Рекомендация отправлена';
  if (recommendFeedbackTimer) clearTimeout(recommendFeedbackTimer);
  recommendFeedbackTimer = setTimeout(() => {
    recommendFeedback.value = '';
    recommendFeedbackTimer = null;
  }, 2500);
}

async function onApproveDelete() {
  clearActionError();
  try {
    await deleteItemMut.mutateAsync(itemId.value);
    approveOpen.value = false;
    await router.replace({
      name: RouteName.AppTopicDetail,
      params: { id: topicId.value },
    });
  } catch (err) {
    applyActionError(err, 'Не удалось удалить элемент');
  }
}

function onRetry() {
  void topicQuery.refetch();
  void itemQuery.refetch();
}
</script>

<template>
  <ContentPageWrapper
    title="Изменить элемент"
    :route-to="{ name: RouteName.AppTopicDetail, params: { id: topicId } }"
    :text-to="topicTitle"
  >
    <TLoader v-if="topicQuery.isPending.value || itemQuery.isPending.value" />
    <TError v-else-if="topicQuery.isError.value || itemQuery.isError.value" @retry="onRetry" />

    <template v-else-if="item">
      <form class="flex flex-col gap-5" @submit.prevent="onSave">
        <TCoverUpload
          :preview-url="displayCoverUrl"
          :error="coverError"
          :disabled="isBusy"
          @file="onCoverFile"
          @clear="onCoverClear"
        />

        <TInput
          v-model="title"
          label="Название"
          type="text"
          autocomplete="off"
          :error="fieldErrors.title"
          :disabled="isBusy"
        />

        <template v-if="isCatalogTopic">
          <TTextarea v-model="description" label="Описание" :disabled="isBusy" />
          <TInput v-model="genre" label="Жанр" type="text" autocomplete="off" :disabled="isBusy" />
          <TInput
            v-model="director"
            :label="directorLabel"
            type="text"
            autocomplete="off"
            :disabled="isBusy"
          />
          <TInput
            v-if="!isGamesTopic"
            v-model="country"
            label="Страна"
            type="text"
            autocomplete="off"
            :disabled="isBusy"
          />
          <div v-if="item.meta?.sourceUrl" class="flex flex-col gap-1">
            <span class="text-label text-muted">Источник</span>
            <a
              :href="item.meta.sourceUrl"
              class="text-body text-accent break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ item.meta.sourceUrl }}
            </a>
          </div>
        </template>

        <p v-if="formError" class="text-caption text-danger">
          {{ formError }}
        </p>
        <p v-if="actionError" class="text-caption text-danger">
          {{ actionError }}
        </p>
        <p v-if="recommendFeedback" class="text-caption text-muted">
          {{ recommendFeedback }}
        </p>

        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <TButton
            type="submit"
            class="w-full md:w-auto"
            :loading="
              updateItem.isPending.value ||
              uploadCover.isPending.value ||
              deleteCover.isPending.value
            "
          >
            Сохранить
          </TButton>
          <TButton
            type="button"
            variant="secondary"
            class="w-full md:w-auto"
            :disabled="isBusy"
            @click="openRecommend"
          >
            Рекомендовать
          </TButton>
          <TButton
            type="button"
            variant="danger-ghost"
            class="w-full md:w-auto"
            :disabled="isBusy"
            @click="openDelete"
          >
            Удалить
          </TButton>
        </div>
      </form>
    </template>

    <TApproveModal
      v-model:open="approveOpen"
      title="Удалить элемент?"
      description="Безвозвратно."
      confirm-label="Удалить"
      :confirm-loading="deleteItemMut.isPending.value"
      @confirm="onApproveDelete"
    />
    <RecommendItemModal v-model:open="recommendOpen" :item-id="itemId" @sent="onRecommendSent" />
  </ContentPageWrapper>
</template>
