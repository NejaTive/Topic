<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ItemsApiError } from '@/api/items';
import { TopicsApiError } from '@/api/topics';
import { TButton, TError, TInput, TCoverUpload } from '@/components/ui-kit';
import { useCreateItemMutation, useUploadItemCoverMutation } from '@/composables/useItemMutations';
import { useTopicQuery } from '@/composables/useTopicQuery';
import { RouteName } from '@/router/route-names';
import { ContentPageWrapper } from '@/components/layout';

interface FieldErrors {
  title?: string;
}

const route = useRoute();
const router = useRouter();

const topicId = computed(() => String(route.params.id ?? ''));

const topicQuery = useTopicQuery(topicId);
const createItem = useCreateItemMutation(() => topicId.value);

const pendingItemId = ref('');
const uploadCover = useUploadItemCoverMutation(
  () => topicId.value,
  () => pendingItemId.value,
);

const title = ref('');
const coverFile = ref<File | null>(null);
const coverPreviewUrl = ref<string | null>(null);
const coverError = ref<string | null>(null);
const fieldErrors = ref<FieldErrors>({});
const formError = ref('');

const topicTitle = computed(() => topicQuery.data.value?.title ?? 'Топик');
const isSubmitting = computed(() => createItem.isPending.value || uploadCover.isPending.value);

function revokePreview() {
  if (coverPreviewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(coverPreviewUrl.value);
  }

  coverPreviewUrl.value = null;
}

onUnmounted(() => {
  revokePreview();
});

function clearErrors() {
  fieldErrors.value = {};
  formError.value = '';
  coverError.value = null;
}

function onCoverFile(file: File) {
  coverError.value = null;
  revokePreview();
  coverFile.value = file;
  coverPreviewUrl.value = URL.createObjectURL(file);
}

function onCoverClear() {
  coverError.value = null;
  coverFile.value = null;
  revokePreview();
}

function applyError(err: unknown, preferCover = false) {
  if (err instanceof TopicsApiError || err instanceof ItemsApiError) {
    if (err.status === 401) {
      router.replace({ name: RouteName.Login, query: { returnUrl: route.fullPath } });
      return;
    }
    if (err.status === 404) {
      formError.value = err.message || 'Топик не найден';
      return;
    }
    if (preferCover || err.status === 413) {
      coverError.value = err.message;
      return;
    }
    if (err.status === 400 || err.status === 422) {
      fieldErrors.value = { title: err.message };
      return;
    }
    formError.value = err.message || 'Не удалось добавить элемент';
    return;
  }
  formError.value = 'Не удалось добавить элемент';
}

async function onSubmit() {
  clearErrors();

  const trimmed = title.value.trim();
  if (!trimmed) {
    fieldErrors.value = { title: 'Укажите название' };
    return;
  }

  try {
    const item = await createItem.mutateAsync({ title: trimmed });
    pendingItemId.value = item.id;

    if (coverFile.value) {
      try {
        await uploadCover.mutateAsync(coverFile.value);
      } catch (coverErr) {
        applyError(coverErr, true);
        await router.replace({
          name: RouteName.AppTopicItemDetail,
          params: { id: topicId.value, itemId: item.id },
        });
        return;
      }
    }

    await router.replace({
      name: RouteName.AppTopicDetail,
      params: { id: topicId.value },
    });
  } catch (err) {
    applyError(err);
  }
}
</script>

<template>
  <ContentPageWrapper
    title="Добавить элемент"
    :route-to="{ name: RouteName.AppTopicDetail, params: { id: topicId } }"
    :text-to="topicTitle"
  >
    <TError v-if="topicQuery.isError.value" class="mt-6" />
    <form v-else class="flex flex-col gap-5 mt-6" @submit.prevent="onSubmit">
      <TInput
        v-model="title"
        label="Название *"
        type="text"
        autocomplete="off"
        placeholder="Например, Интерстеллар"
        :error="fieldErrors.title"
        :disabled="isSubmitting"
      />

      <TCoverUpload
        :preview-url="coverPreviewUrl"
        :error="coverError"
        :disabled="isSubmitting"
        @file="onCoverFile"
        @clear="onCoverClear"
      />

      <p v-if="formError" class="text-caption text-danger">
        {{ formError }}
      </p>

      <div class="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
        <TButton type="submit" :loading="isSubmitting">Добавить</TButton>
      </div>
    </form>
  </ContentPageWrapper>
</template>
