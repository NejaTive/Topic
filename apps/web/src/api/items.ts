import { apiClient } from './client';
import type { components } from './schema';

export type ItemDto = components['schemas']['ItemDto'];
export type ItemList = components['schemas']['ItemListDto'];

export class ItemsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ItemsApiError';
  }
}

/** GET /api/topics/:topicId/items — inbox + ranked (BAC-11). */
export async function fetchTopicItems(topicId: string): Promise<ItemList> {
  const { data, error, response } = await apiClient.GET(
    '/api/topics/{topicId}/items',
    { params: { path: { topicId } } },
  );
  if (response.status === 401) {
    throw new ItemsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new ItemsApiError('Топик не найден', 404);
  }
  if (error || !data) {
    throw new ItemsApiError('Не удалось загрузить элементы', response.status);
  }
  return data;
}

/** POST /api/topics/:topicId/items/:itemId/rank — в конец ranked (BAC-11). */
export async function rankItem(topicId: string, itemId: string): Promise<ItemDto> {
  const { data, error, response } = await apiClient.POST(
    '/api/topics/{topicId}/items/{itemId}/rank',
    { params: { path: { topicId, itemId } } },
  );
  if (response.status === 401) {
    throw new ItemsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new ItemsApiError('Элемент не найден', 404);
  }
  if (error || !data) {
    throw new ItemsApiError('Не удалось перенести в рейтинг', response.status);
  }
  return data;
}

/** POST /api/topics/:topicId/items/reorder — полная перестановка ranked (BAC-12). */
export async function reorderItems(
  topicId: string,
  orderedItemIds: string[],
): Promise<ItemList> {
  const { data, error, response } = await apiClient.POST(
    '/api/topics/{topicId}/items/reorder',
    {
      params: { path: { topicId } },
      body: { orderedItemIds },
    },
  );
  if (response.status === 401) {
    throw new ItemsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new ItemsApiError('Топик не найден', 404);
  }
  if (response.status === 422) {
    throw new ItemsApiError('Некорректный порядок рейтинга', 422);
  }
  if (error || !data) {
    throw new ItemsApiError('Не удалось сохранить порядок', response.status);
  }
  return data;
}
