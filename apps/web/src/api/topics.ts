import { apiClient } from './client';
import type { components } from './schema';

export type TopicListItem = components['schemas']['TopicListItemDto'];
export type TopicDetail = components['schemas']['TopicDetailDto'];
export type CreateTopicBody = components['schemas']['CreateTopicDto'];
export type TopicCategory = CreateTopicBody['category'];

export type TopicsErrorField = 'title' | 'privacy' | 'category';

export class TopicsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly field?: TopicsErrorField,
    readonly fields?: Partial<Record<TopicsErrorField, string>>,
  ) {
    super(message);
    this.name = 'TopicsApiError';
  }
}

function validationMessages(error: unknown): string[] {
  if (!error || typeof error !== 'object') return [];
  const message = (error as { message?: unknown }).message;
  if (typeof message === 'string') return [message];
  if (Array.isArray(message)) {
    return message.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function mapCreateValidationFields(messages: string[]): Partial<Record<TopicsErrorField, string>> {
  const fields: Partial<Record<TopicsErrorField, string>> = {};
  for (const msg of messages) {
    const lower = msg.toLowerCase();
    if (lower.includes('title') && !fields.title) fields.title = msg;
    else if (lower.includes('privacy') && !fields.privacy) fields.privacy = msg;
    else if (lower.includes('category') && !fields.category) fields.category = msg;
  }
  return fields;
}

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

export async function createTopic(body: {
  title: string;
  privacy?: CreateTopicBody['privacy'];
  category?: CreateTopicBody['category'];
}): Promise<TopicDetail> {
  const payload = {
    title: body.title,
    ...(body.privacy !== undefined ? { privacy: body.privacy } : {}),
    ...(body.category !== undefined ? { category: body.category } : {}),
  } as CreateTopicBody;

  const { data, error, response } = await apiClient.POST('/api/topics', {
    body: payload,
  });

  if (response.status === 401) {
    throw new TopicsApiError('Требуется вход', 401);
  }

  if (response.status === 400 || response.status === 422) {
    const messages = validationMessages(error);
    const fields = mapCreateValidationFields(messages);
    const fallback = messages[0] ?? 'Проверьте данные формы';
    throw new TopicsApiError(fallback, response.status, undefined, fields);
  }

  if (error || !data) {
    throw new TopicsApiError('Не удалось создать топик', response.status);
  }

  return data;
}

export async function fetchTopic(id: string): Promise<TopicDetail> {
  const { data, error, response } = await apiClient.GET('/api/topics/{id}', {
    params: { path: { id } },
  });
  if (response.status === 401) {
    throw new TopicsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new TopicsApiError('Топик не найден', 404);
  }
  if (error || !data) {
    throw new TopicsApiError('Не удалось загрузить топик', response.status);
  }
  return data;
}

export async function updateTopic(
  id: string,
  body: components['schemas']['UpdateTopicDto'],
): Promise<TopicDetail> {
  const { data, error, response } = await apiClient.PATCH('/api/topics/{id}', {
    params: { path: { id } },
    body,
  });
  if (response.status === 401) {
    throw new TopicsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new TopicsApiError('Топик не найден', 404);
  }
  if (response.status === 400 || response.status === 422) {
    const messages = validationMessages(error);
    const fields = mapCreateValidationFields(messages);
    const fallback = messages[0] ?? 'Проверьте данные';
    throw new TopicsApiError(fallback, response.status, undefined, fields);
  }
  if (error || !data) {
    throw new TopicsApiError('Не удалось обновить топик', response.status);
  }
  return data;
}

export async function deleteTopic(id: string): Promise<void> {
  const { error, response } = await apiClient.DELETE('/api/topics/{id}', {
    params: { path: { id } },
  });
  if (response.status === 401) {
    throw new TopicsApiError('Требуется вход', 401);
  }
  if (response.status === 404) {
    throw new TopicsApiError('Топик не найден', 404);
  }
  if (response.status !== 204 && error) {
    throw new TopicsApiError('Не удалось удалить топик', response.status);
  }
}
