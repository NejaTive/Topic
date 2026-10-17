import { apiClient } from './client';
import type { components } from './schema';

export type MutualFollowItem = components['schemas']['MutualFollowItemDto'];
export type MutualFollows = components['schemas']['MutualFollowsDto'];
export type RecommendItemBody = components['schemas']['RecommendItemDto'];
export type RecommendCreated = components['schemas']['RecommendCreatedDto'];
export type Recommendation = components['schemas']['RecommendationDto'];
export type RecommendationList = components['schemas']['RecommendationListDto'];
export type AcceptRecommendationBody = components['schemas']['AcceptRecommendationDto'];
export type AcceptedRecommendationItem = components['schemas']['ItemDto'];

export class RecommendationsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'RecommendationsApiError';
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

export async function getMutualFollows(): Promise<MutualFollows> {
  const { data, error, response } = await apiClient.GET('/api/me/mutual-follows');

  if (response.status === 401) {
    throw new RecommendationsApiError('Требуется вход', 401);
  }

  if (error || !data) {
    throw new RecommendationsApiError(
      errorMessage(error, 'Не удалось загрузить взаимные подписки'),
      response.status || 500,
    );
  }

  return data;
}

export async function recommendItem(
  itemId: string,
  body: RecommendItemBody,
): Promise<RecommendCreated> {
  const { data, error, response } = await apiClient.POST('/api/items/{itemId}/recommend', {
    params: { path: { itemId } },
    body,
  });

  if (response.status === 401) {
    throw new RecommendationsApiError('Требуется вход', 401);
  }

  if (response.status === 404) {
    throw new RecommendationsApiError(errorMessage(error, 'Элемент не найден'), 404);
  }

  if (response.status === 409) {
    throw new RecommendationsApiError(errorMessage(error, 'Уже рекомендовано'), 409);
  }

  if (response.status === 400 || response.status === 422) {
    throw new RecommendationsApiError(
      errorMessage(error, 'Не удалось отправить рекомендацию'),
      response.status,
    );
  }

  if (error || !data) {
    throw new RecommendationsApiError(
      errorMessage(error, 'Не удалось отправить рекомендацию'),
      response.status || 500,
    );
  }

  return data;
}

export async function getRecommendations(): Promise<RecommendationList> {
  const { data, error, response } = await apiClient.GET('/api/recommendations');

  if (response.status === 401) {
    throw new RecommendationsApiError('Требуется вход', 401);
  }

  if (error || !data) {
    throw new RecommendationsApiError(
      errorMessage(error, 'Не удалось загрузить рекомендации'),
      response.status || 500,
    );
  }

  return data;
}

export async function acceptRecommendation(
  id: string,
  body: AcceptRecommendationBody,
): Promise<AcceptedRecommendationItem> {
  const { data, error, response } = await apiClient.POST('/api/recommendations/{id}/accept', {
    params: { path: { id } },
    body,
  });

  if (response.status === 401) {
    throw new RecommendationsApiError('Требуется вход', 401);
  }

  if (response.status === 404) {
    throw new RecommendationsApiError(errorMessage(error, 'Рекомендация не найдена'), 404);
  }

  if (response.status === 409) {
    throw new RecommendationsApiError(errorMessage(error, 'Уже есть в списке'), 409);
  }

  if (response.status === 400 || response.status === 422) {
    throw new RecommendationsApiError(
      errorMessage(error, 'Не удалось принять рекомендацию'),
      response.status,
    );
  }

  if (error || !data) {
    throw new RecommendationsApiError(
      errorMessage(error, 'Не удалось принять рекомендацию'),
      response.status || 500,
    );
  }

  return data;
}

export async function dismissRecommendation(id: string): Promise<void> {
  const { error, response } = await apiClient.POST('/api/recommendations/{id}/dismiss', {
    params: { path: { id } },
  });

  if (response.status === 204) return;

  if (response.status === 401) {
    throw new RecommendationsApiError('Требуется вход', 401);
  }

  if (response.status === 404) {
    throw new RecommendationsApiError(errorMessage(error, 'Рекомендация не найдена'), 404);
  }

  if (error) {
    throw new RecommendationsApiError(
      errorMessage(error, 'Не удалось отклонить рекомендацию'),
      response.status || 500,
    );
  }
}
