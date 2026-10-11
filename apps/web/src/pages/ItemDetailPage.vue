<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ItemsApiError } from '@/api/items';
import { TopicsApiError } from '@/api/topics';
import { TButton, TError, TInput, TLoader, TCoverUpload } from '@/components/ui-kit';
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
const coverFile = ref<File | null>(null);
const coverPreviewUrl = ref<string | null>(null);
const coverRemoved = ref(false);
const coverError = ref<string | null>(null);
const fieldErrors = ref<FieldErrors>({});
const formError = ref('');
const actionError = ref('');

const topicTitle = computed(() => topicQuery.data.value?.title ?? 'Топик');
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
  () => item.value?.title,
  (next) => {
    if (next != null) title.value = next;
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
    if (!item.value || trimmed !== item.value.title) {
      await updateItem.mutateAsync({ title: trimmed });
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

async function onDelete() {
  clearActionError();

  const ok = window.confirm('Удалить элемент безвозвратно?');
  if (!ok) return;
  try {
    await deleteItemMut.mutateAsync(itemId.value);
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
        <TInput
          v-model="title"
          label="Название"
          type="text"
          autocomplete="off"
          :error="fieldErrors.title"
          :disabled="isBusy"
        />

        <TCoverUpload
          :preview-url="displayCoverUrl"
          :error="coverError"
          :disabled="isBusy"
          @file="onCoverFile"
          @clear="onCoverClear"
        />

        <p v-if="formError" class="text-caption text-danger">
          {{ formError }}
        </p>
        <p v-if="actionError" class="text-caption text-danger">
          {{ actionError }}
        </p>

        <div
          class="fixed inset-x-0 bottom-23 z-30 flex justify-center md:static md:z-auto md:block"
        >
          <div
            class="flex w-full max-w-91.5 flex-col gap-3 px-3 md:w-auto md:max-w-none md:flex-row md:items-center md:px-0"
          >
            <TButton
              type="submit"
              class="w-full shadow-float md:w-auto md:shadow-none"
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
              variant="danger-ghost"
              class="w-full md:w-auto"
              :disabled="isBusy"
              @click="onDelete"
            >
              Удалить
            </TButton>
          </div>
        </div>
      </form>
    </template>
  </ContentPageWrapper>
</template>
