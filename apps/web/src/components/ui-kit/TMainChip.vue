<script lang="ts">
export const MAIN_CHIP_LABELS = [
  'Фильмы',
  'Сериалы',
  'Книги',
  'Игры',
  'Аниме',
  'Манга',
  'Комиксы',
  'Мультфильмы',
  'Документалки',
  'Подкасты',
  'Музыка',
  'Альбомы',
  'Клипы',
  'Концерты',
  'Спектакли',
  'Выставки',
  'Фестивали',
  'Лекции',
  'Курсы',
  'Настолки',
  'РПГ',
  'Шутеры',
  'Стратегии',
  'Инди-игры',
  'Рестораны',
  'Кафе',
  'Кофейни',
  'Бары',
  'Пицца',
  'Суши',
  'Коктейли',
  'Вино',
  'Пиво',
  'Рецепты',
  'Десерты',
  'Завтраки',
  'Города',
  'Страны',
  'Пляжи',
  'Парки',
  'Музеи',
  'Отели',
  'Спорт',
  'Тренировки',
  'Хобби',
  'Приложения',
  'Сайты',
  'Гаджеты',
  'Смартфоны',
  'Ноутбуки',
  'Наушники',
  'Клавиатуры',
  'Кроссовки',
  'Парфюм',
] as const;
export type TMainChipLabel = (typeof MAIN_CHIP_LABELS)[number];
</script>

<script setup lang="ts">
interface TMainChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
}

interface TMainChipEmits {
  (e: 'select', label: string): void;
}

withDefaults(defineProps<TMainChipProps>(), {
  selected: false,
  disabled: false,
});

const emit = defineEmits<TMainChipEmits>();
</script>

<template>
  <button
    type="button"
    class="inline-flex h-8 items-center justify-center rounded-sm px-3 text-caption font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50"
    :class="
      selected
        ? 'bg-warning-hover text-warning'
        : 'bg-warning-soft text-warning hover:enabled:bg-warning-hover'
    "
    :aria-pressed="selected"
    :disabled="disabled"
    @click="emit('select', label)"
  >
    {{ label }}
  </button>
</template>
