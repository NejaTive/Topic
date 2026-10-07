<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ItemsApiError } from '@/api/items';
import { TopicsApiError } from '@/api/topics';
import { AppButton, AppInput, AppNav, CoverUpload } from '@/components/ui';
import { useCreateItemMutation, useUploadItemCoverMutation } from '@/composables/useItemMutations';
import { useTopicQuery } from '@/composables/useTopicQuery';

const route = useRoute();
const router = useRouter();

const topicId = computed(() => String(route.params.id ?? ''));
const topicQuery = useTopicQuery(topicId);
const createItem = useCreateItemMutation(() => topicId.value);
/** itemId resolved after create — upload uses this getter. */
const pendingItemId = ref('');
const uploadCover = useUploadItemCoverMutation(
  () => topicId.value,
  () => pendingItemId.value,
);

const title = ref('');
const coverFile = ref<File | null>(null);
const coverPreviewUrl = ref<string | null>(null);
const coverError = ref<string | null>(null);
const fieldErrors = ref<{ title?: string }>({});
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
      void router.replace(`/login?returnUrl=${encodeURIComponent(route.fullPath)}`);
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
        // Элемент уже в inbox — открываем S07, чтобы повторить обложку.
        applyError(coverErr, true);
        await router.replace({
          name: 'app-topic-item-detail',
          params: { id: topicId.value, itemId: item.id },
        });
        return;
      }
    }

    await router.replace({
      name: 'app-topic-detail',
      params: { id: topicId.value },
    });
  } catch (err) {
    applyError(err);
  }
}
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <AppNav />

    <main class="mx-auto w-full max-w-91.5 px-4 pb-28 pt-6 md:max-w-160 md:px-8 md:pb-10 md:pt-28">
      <RouterLink
        :to="{ name: 'app-topic-detail', params: { id: topicId } }"
        class="w-fit text-label font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        ← {{ topicTitle }}
      </RouterLink>

      <h1 class="mt-4 text-h1 text-ink">Добавить элемент</h1>
      <p v-if="topicQuery.isError.value" class="mt-6 text-body text-danger" role="alert">
        {{
          topicQuery.error.value instanceof TopicsApiError && topicQuery.error.value.status === 404
            ? 'Топик не найден'
            : 'Не удалось загрузить топик'
        }}
      </p>

      <form v-else class="mt-6 flex flex-col gap-5" @submit.prevent="onSubmit">
        <AppInput
          v-model="title"
          label="Название *"
          type="text"
          autocomplete="off"
          placeholder="Например, Интерстеллар"
          :error="fieldErrors.title"
          :disabled="isSubmitting"
        />

        <CoverUpload
          :preview-url="coverPreviewUrl"
          :error="coverError"
          :disabled="isSubmitting"
          @file="onCoverFile"
          @clear="onCoverClear"
        />

        <p v-if="formError" class="text-caption text-danger" role="alert">
          {{ formError }}
        </p>

        <AppButton type="submit" :loading="isSubmitting" class="w-full md:w-auto md:min-w-50">
          Добавить
        </AppButton>
      </form>
    </main>
  </div>
</template>
