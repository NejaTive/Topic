import { apiClient } from './client';
import type { components } from './schema';

export type ShareTopic = components['schemas']['ShareTopicDto'];

export class ShareApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ShareApiError';
  }
}

export async function fetchShare(shareId: string): Promise<ShareTopic> {
  const { data, error, response } = await apiClient.GET('/api/t/{shareId}', {
    params: { path: { shareId } },
  });

  if (response.status === 403) {
    const msg =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Топик недоступен';
    throw new ShareApiError(msg || 'Топик недоступен', 403);
  }

  if (response.status === 404) {
    throw new ShareApiError('Топик не найден', 404);
  }

  if (error || !data) {
    throw new ShareApiError('Не удалось загрузить топик', response.status || 500);
  }

  return data;
}
