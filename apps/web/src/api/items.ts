import { apiClient } from './client';
import type { components } from './schema';

export type ItemDto = components['schemas']['ItemDto'];
export type ItemList = components['schemas']['ItemListDto'];
export type CreateItemBody = components['schemas']['CreateItemDto'];
export type UpdateItemBody = components['schemas']['UpdateItemDto'];

export class ItemsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ItemsApiError';
  }
}

function errorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const message = (error as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message)) {
    const first = message.find((item): item is string => typeof item === 'string');
    if (first) return first;
  }
  return fallback;
}

/** GET /api/topics/:topicId/items — inbox + ranked (BAC-11). */
export async function fetchTopicItems(topicId: string): Promise<ItemList> {
  const { data, error, response } = await apiClient.GET('/api/topics/{topicId}/items', {
    params: { path: { topicId } },
  });
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

/** GET /api/topics/:topicId/items/:itemId — карточка элемента (S07). */
export async function fetchItem(topicId: string, itemId: string): Promise<ItemDto> {
  const { data, error, response } = await apiClient.GET('/api/topics/{topicId}/items/{itemId}', {
    params: { path: { topicId, itemId } },
  });
  if (response.status === 401) {
    throw new ItemsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new ItemsApiError('Элемент не найден', 404);
  }
  if (error || !data) {
    throw new ItemsApiError('Не удалось загрузить элемент', response.status);
  }
  return data;
}

/** POST /api/topics/:topicId/items — создать в inbox (S06). */
export async function createItem(topicId: string, body: CreateItemBody): Promise<ItemDto> {
  const { data, error, response } = await apiClient.POST('/api/topics/{topicId}/items', {
    params: { path: { topicId } },
    body,
  });
  if (response.status === 401) {
    throw new ItemsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new ItemsApiError('Топик не найден', 404);
  }
  if (response.status === 400 || response.status === 422) {
    throw new ItemsApiError(errorMessage(error, 'Проверьте название элемента'), response.status);
  }
  if (error || !data) {
    throw new ItemsApiError('Не удалось создать элемент', response.status);
  }
  return data;
}

/** PATCH /api/topics/:topicId/items/:itemId — правка title (S07). */
export async function updateItem(
  topicId: string,
  itemId: string,
  body: UpdateItemBody,
): Promise<ItemDto> {
  const { data, error, response } = await apiClient.PATCH('/api/topics/{topicId}/items/{itemId}', {
    params: { path: { topicId, itemId } },
    body,
  });
  if (response.status === 401) {
    throw new ItemsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new ItemsApiError('Элемент не найден', 404);
  }
  if (response.status === 400 || response.status === 422) {
    throw new ItemsApiError(errorMessage(error, 'Проверьте название элемента'), response.status);
  }
  if (error || !data) {
    throw new ItemsApiError('Не удалось сохранить элемент', response.status);
  }
  return data;
}

/** DELETE /api/topics/:topicId/items/:itemId. */
export async function deleteItem(topicId: string, itemId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE('/api/topics/{topicId}/items/{itemId}', {
    params: { path: { topicId, itemId } },
  });
  if (response.status === 401) {
    throw new ItemsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new ItemsApiError('Элемент не найден', 404);
  }
  if (error || !response.ok) {
    throw new ItemsApiError('Не удалось удалить элемент', response.status);
  }
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

/** POST /api/topics/:topicId/items/:itemId/unrank — обратно в inbox (BAC-11). */
export async function unrankItem(topicId: string, itemId: string): Promise<ItemDto> {
  const { data, error, response } = await apiClient.POST(
    '/api/topics/{topicId}/items/{itemId}/unrank',
    { params: { path: { topicId, itemId } } },
  );
  if (response.status === 401) {
    throw new ItemsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new ItemsApiError('Элемент не найден', 404);
  }
  if (error || !data) {
    throw new ItemsApiError('Не удалось вернуть в inbox', response.status);
  }
  return data;
}

/** POST /api/topics/:topicId/items/reorder — полная перестановка ranked (BAC-12). */
export async function reorderItems(topicId: string, orderedItemIds: string[]): Promise<ItemList> {
  const { data, error, response } = await apiClient.POST('/api/topics/{topicId}/items/reorder', {
    params: { path: { topicId } },
    body: { orderedItemIds },
  });
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

function coverUploadError(error: unknown, status: number): ItemsApiError {
  if (status === 401) return new ItemsApiError('Требуется вход', 401);
  if (status === 404) return new ItemsApiError('Элемент не найден', 404);
  if (status === 413) {
    return new ItemsApiError(errorMessage(error, 'Файл обложки больше 5 МБ'), 413);
  }
  if (status === 400) {
    return new ItemsApiError(
      errorMessage(error, 'Обложка должна быть JPEG, PNG, WebP или GIF'),
      400,
    );
  }
  return new ItemsApiError(errorMessage(error, 'Не удалось загрузить обложку'), status);
}

/** POST multipart cover ≤5 МБ (BAC-11). */
export async function uploadItemCover(
  topicId: string,
  itemId: string,
  file: File,
): Promise<ItemDto> {
  const { data, error, response } = await apiClient.POST(
    '/api/topics/{topicId}/items/{itemId}/cover',
    {
      params: { path: { topicId, itemId } },
      // OpenAPI marks binary as string; runtime sends File via FormData.
      body: { file } as unknown as { file: string },
      bodySerializer(body) {
        const form = new FormData();
        form.append('file', body.file as unknown as Blob);
        return form;
      },
    },
  );
  if (!response.ok || error || !data) {
    throw coverUploadError(error, response.status);
  }
  return data;
}

/** DELETE cover of item. */
export async function deleteItemCover(topicId: string, itemId: string): Promise<ItemDto> {
  const { data, error, response } = await apiClient.DELETE(
    '/api/topics/{topicId}/items/{itemId}/cover',
    { params: { path: { topicId, itemId } } },
  );
  if (response.status === 401) {
    throw new ItemsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new ItemsApiError('Элемент не найден', 404);
  }
  if (error || !data) {
    throw new ItemsApiError('Не удалось удалить обложку', response.status);
  }
  return data;
}
