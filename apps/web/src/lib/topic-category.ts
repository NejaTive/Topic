import type { TopicCategory } from '@/api/topics';

export const TOPIC_CATEGORY_LABELS: Record<TopicCategory, string> = {
  movies: 'Фильмы',
  series: 'Сериалы',
  games: 'Игры',
  custom: 'Своё',
};

export function topicCategoryLabel(category: TopicCategory): string {
  return TOPIC_CATEGORY_LABELS[category];
}
