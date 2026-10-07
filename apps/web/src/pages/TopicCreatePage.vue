<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { TopicsApiError } from '@/api/topics';
import {
  AppButton,
  AppInput,
  AppNav,
  MAIN_CHIP_LABELS,
  MainChip,
  PrivacyChip,
  type PrivacyValue,
} from '@/components/ui';
import { useCreateTopicMutation } from '@/composables/useCreateTopicMutation';

const PRIVACY_OPTIONS: PrivacyValue[] = ['private', 'unlisted', 'public'];

const router = useRouter();
const createTopic = useCreateTopicMutation();

const title = ref('');
/** Default unlisted; omit from body until user picks (AC). */
const privacy = ref<PrivacyValue>('unlisted');
const privacyTouched = ref(false);
const fieldErrors = ref<{ title?: string; privacy?: string }>({});
const formError = ref('');

const isSubmitting = computed(() => createTopic.isPending.value);
const selectedChip = computed(() => MAIN_CHIP_LABELS.find((label) => title.value === label));

function clearErrors() {
  fieldErrors.value = {};
  formError.value = '';
}

function onChipSelect(label: string) {
  title.value = label;
  if (fieldErrors.value.title) {
    fieldErrors.value = { ...fieldErrors.value, title: undefined };
  }
}

function onPrivacySelect(value: PrivacyValue) {
  privacy.value = value;
  privacyTouched.value = true;
  if (fieldErrors.value.privacy) {
    fieldErrors.value = { ...fieldErrors.value, privacy: undefined };
  }
}

function applyCreateError(err: unknown) {
  clearErrors();
  if (!(err instanceof TopicsApiError)) {
    formError.value = 'Не удалось создать топик';
    return;
  }

  if (err.status === 401) {
    void router.replace(`/login?returnUrl=${encodeURIComponent('/app/topics/new')}`);
    return;
  }

  if (err.status === 400 || err.status === 422) {
    if (err.fields && Object.keys(err.fields).length > 0) {
      fieldErrors.value = {
        title: err.fields.title,
        privacy: err.fields.privacy,
      };
      return;
    }
    if (err.field === 'title' || err.field === 'privacy') {
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
    const topic = await createTopic.mutateAsync({
      title: trimmed,
      ...(privacyTouched.value ? { privacy: privacy.value } : {}),
    });
    await router.replace({ name: 'app-topic-detail', params: { id: topic.id } });
  } catch (err) {
    applyCreateError(err);
  }
}
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <AppNav />

    <main
      class="mx-auto w-full max-w-[366px] px-4 pb-28 pt-6 md:max-w-[440px] md:px-8 md:pb-10 md:pt-28"
    >
      <RouterLink
        to="/app/topics"
        class="w-fit text-label font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        ← Мои топики
      </RouterLink>

      <h1 class="mt-4 text-h1 text-ink">Новый топик</h1>
      <p class="mt-2 text-body-sm text-muted">
        Подсказка подставит название — можно изменить. Приватность по умолчанию — по ссылке.
      </p>

      <form class="mt-6 flex flex-col gap-5" @submit.prevent="onSubmit">
        <div class="flex flex-col gap-2">
          <AppInput
            v-model="title"
            label="Название"
            type="text"
            autocomplete="off"
            placeholder="Например, Фильмы"
            :error="fieldErrors.title"
            :disabled="isSubmitting"
          />
          <div class="flex flex-wrap gap-2" role="group" aria-label="Подсказки названия">
            <MainChip
              v-for="label in MAIN_CHIP_LABELS"
              :key="label"
              :label="label"
              :selected="selectedChip === label"
              :disabled="isSubmitting"
              @select="onChipSelect"
            />
          </div>
        </div>

        <fieldset class="flex flex-col gap-2 border-0 p-0">
          <legend class="text-label text-ink">Приватность</legend>
          <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Приватность топика">
            <button
              v-for="option in PRIVACY_OPTIONS"
              :key="option"
              type="button"
              role="radio"
              class="rounded-sm outline-none transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              :class="
                privacy === option
                  ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg'
                  : 'hover:opacity-90'
              "
              :aria-checked="privacy === option"
              :disabled="isSubmitting"
              @click="onPrivacySelect(option)"
            >
              <PrivacyChip :privacy="option" />
            </button>
          </div>
          <p v-if="fieldErrors.privacy" class="text-caption text-danger" role="alert">
            {{ fieldErrors.privacy }}
          </p>
        </fieldset>

        <p v-if="formError" class="text-caption text-danger" role="alert">
          {{ formError }}
        </p>

        <AppButton type="submit" :loading="isSubmitting" class="w-full"> Создать </AppButton>
      </form>
    </main>
  </div>
</template>
