import { apiClient } from './client';
import type { components } from './schema';

export type TopicListItem = components['schemas']['TopicListItemDto'];

export class TopicsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'TopicsApiError';
  }
}

/** GET /api/topics — список топиков владельца (BAC-10). */
export async function fetchTopics(): Promise<TopicListItem[]> {
  const { data, error, response } = await apiClient.GET('/api/topics');
  if (response.status === 401) {
    throw new TopicsApiError('Требуется вход', 401);
  }
  if (error || !data) {
    throw new TopicsApiError('Не удалось загрузить топики', response.status);
  }
  return data;
}
