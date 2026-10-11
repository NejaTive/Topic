import { apiClient } from './client';
import type { components } from './schema';

export type UserProfile = components['schemas']['UserProfileDto'];
export type ProfileTopic = components['schemas']['ProfileTopicDto'];
export type Feed = components['schemas']['FeedDto'];
export type FeedItem = components['schemas']['FeedItemDto'];

export class SocialApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'SocialApiError';
  }
}

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

export async function getUserProfile(nick: string): Promise<UserProfile> {
  const { data, error, response } = await apiClient.GET('/api/users/{nick}', {
    params: { path: { nick } },
  });

  if (response.status === 404) {
    throw new SocialApiError(errorMessage(error, 'Пользователь не найден'), 404);
  }

  if (error || !data) {
    throw new SocialApiError(
      errorMessage(error, 'Не удалось загрузить профиль'),
      response.status || 500,
    );
  }

  return data;
}

export async function followUser(nick: string): Promise<void> {
  const { error, response } = await apiClient.POST('/api/users/{nick}/follow', {
    params: { path: { nick } },
  });

  if (response.status === 204) return;

  if (response.status === 401) {
    throw new SocialApiError('Требуется вход', 401);
  }

  if (response.status === 400) {
    throw new SocialApiError(errorMessage(error, 'Нельзя подписаться'), 400);
  }

  if (response.status === 404) {
    throw new SocialApiError(errorMessage(error, 'Пользователь не найден'), 404);
  }

  if (error) {
    throw new SocialApiError(errorMessage(error, 'Не удалось подписаться'), response.status || 500);
  }
}

export async function unfollowUser(nick: string): Promise<void> {
  const { error, response } = await apiClient.DELETE('/api/users/{nick}/follow', {
    params: { path: { nick } },
  });

  if (response.status === 204) return;

  if (response.status === 401) {
    throw new SocialApiError('Требуется вход', 401);
  }

  if (response.status === 404) {
    throw new SocialApiError(errorMessage(error, 'Пользователь не найден'), 404);
  }

  if (error) {
    throw new SocialApiError(errorMessage(error, 'Не удалось отписаться'), response.status || 500);
  }
}

export async function getFeed(): Promise<Feed> {
  const { data, error, response } = await apiClient.GET('/api/feed');

  if (response.status === 401) {
    throw new SocialApiError('Требуется вход', 401);
  }

  if (error || !data) {
    throw new SocialApiError(
      errorMessage(error, 'Не удалось загрузить ленту'),
      response.status || 500,
    );
  }

  return data;
}
