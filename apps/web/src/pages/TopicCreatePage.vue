<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { TopicsApiError, type TopicCategory } from '@/api/topics';
import { TButton, TInput, TMainChip, TPrivacyChip, type PrivacyValue } from '@/components/ui-kit';
import { ContentPageWrapper } from '@/components/layout';
import { useCreateTopicMutation } from '@/composables/useCreateTopicMutation';
import { RouteName } from '@/router/route-names';

interface FieldErrors {
  title?: string;
}

interface CategoryOption {
  value: TopicCategory;
  label: string;
}

const PRIVACY_OPTIONS: PrivacyValue[] = ['private', 'unlisted', 'public'];

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'movies', label: 'Фильмы' },
  { value: 'custom', label: 'Своё' },
];

const MOVIES_TITLE_PREFILL = 'Фильмы';

const router = useRouter();
const createTopic = useCreateTopicMutation();

const title = ref('');
const category = ref<TopicCategory>('custom');
const privacy = ref<PrivacyValue>('unlisted');
const privacyTouched = ref(false);
const fieldErrors = ref<FieldErrors>({});
const formError = ref('');

const isSubmitting = computed(() => createTopic.isPending.value);

function clearErrors() {
  fieldErrors.value = {};
  formError.value = '';
}

function onCategorySelect(value: TopicCategory) {
  category.value = value;
  if (value === 'movies') {
    title.value = MOVIES_TITLE_PREFILL;
    if (fieldErrors.value.title) {
      fieldErrors.value = { ...fieldErrors.value, title: undefined };
    }
  }
}

function onCategoryChipSelect(label: string) {
  const option = CATEGORY_OPTIONS.find((item) => item.label === label);
  if (option) onCategorySelect(option.value);
}

function onPrivacySelect(value: PrivacyValue) {
  privacy.value = value;
  privacyTouched.value = true;
}

function applyCreateError(err: unknown) {
  clearErrors();
  if (!(err instanceof TopicsApiError)) {
    formError.value = 'Не удалось создать топик';
    return;
  }

  if (err.status === 401) {
    router.replace({
      name: RouteName.Login,
      query: {
        returnUrl: router.resolve({ name: RouteName.AppTopicCreate }).fullPath,
      },
    });
    return;
  }

  if (err.status === 400 || err.status === 422) {
    if (err.fields && Object.keys(err.fields).length > 0) {
      fieldErrors.value = {
        title: err.fields.title,
      };
      return;
    }
    if (err.field === 'title') {
      fieldErrors.value = { [err.field]: err.message };
      return;
    }
    formError.value = err.message || 'Проверьте данные формы';
    return;
  }

  formError.value = err.message || 'Не удалось создать топик';
}

async function onSubmit() {
  clearErrors();
  const trimmed = title.value.trim();

  if (!trimmed) {
    fieldErrors.value = { title: 'Укажите название' };
    return;
  }

  try {
    const privacyParam = privacyTouched.value ? { privacy: privacy.value } : {};
    const topic = await createTopic.mutateAsync({
      title: trimmed,
      category: category.value,
      ...privacyParam,
    });

    await router.replace({ name: RouteName.AppTopicDetail, params: { id: topic.id } });
  } catch (err) {
    applyCreateError(err);
  }
}
</script>

<template>
  <ContentPageWrapper :route-to="RouteName.AppTopics" text-to="Мои топики" title="Новый топик">
    <form class="flex flex-col gap-5" @submit.prevent="onSubmit">
      <fieldset>
        <legend class="mb-2 text-label">Категория</legend>
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Категория топика">
          <TMainChip
            v-for="option in CATEGORY_OPTIONS"
            :key="option.value"
            :label="option.label"
            :selected="category === option.value"
            :disabled="isSubmitting"
            @select="onCategoryChipSelect"
          />
        </div>
      </fieldset>

      <TInput
        v-model="title"
        label="Название"
        type="text"
        autocomplete="off"
        placeholder="Например, Фильмы"
        :error="fieldErrors.title"
        :disabled="isSubmitting"
      />

      <fieldset>
        <legend class="mb-2 text-label">Приватность</legend>
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Приватность топика">
          <button
            v-for="option in PRIVACY_OPTIONS"
            :key="option"
            type="button"
            role="radio"
            class="cursor-pointer transition-opacity hover:enabled:opacity-70"
            :aria-checked="privacy === option"
            :disabled="isSubmitting"
            @click="onPrivacySelect(option)"
          >
            <TPrivacyChip :privacy="option" :selected="privacy === option" />
          </button>
        </div>
      </fieldset>

      <p v-if="formError" class="text-caption text-danger" role="alert">{{ formError }}</p>

      <div class="fixed inset-x-0 bottom-23 z-30 flex justify-center md:static md:z-auto md:block">
        <div
          class="flex w-full max-w-91.5 flex-col gap-3 px-3 md:w-auto md:max-w-none md:flex-row md:items-center md:px-0"
        >
          <TButton
            type="submit"
            class="w-full shadow-float md:w-auto md:shadow-none"
            :loading="isSubmitting"
          >
            Создать
          </TButton>
        </div>
      </div>
    </form>
  </ContentPageWrapper>
</template>
