import { apiClient } from './client';
import type { components } from './schema';

export type TopicListItem = components['schemas']['TopicListItemDto'];
export type TopicDetail = components['schemas']['TopicDetailDto'];
export type CreateTopicBody = components['schemas']['CreateTopicDto'];

export type TopicsErrorField = 'title' | 'privacy';

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

function mapCreateValidationFields(
  messages: string[],
): Partial<Record<TopicsErrorField, string>> {
  const fields: Partial<Record<TopicsErrorField, string>> = {};
  for (const msg of messages) {
    const lower = msg.toLowerCase();
    if (lower.includes('title') && !fields.title) fields.title = msg;
    else if (lower.includes('privacy') && !fields.privacy) fields.privacy = msg;
  }
  return fields;
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

/**
 * POST /api/topics — создать топик (BAC-10).
 * `privacy` optional на API (default unlisted); если не передали — не шлём поле.
 */
export async function createTopic(body: {
  title: string;
  privacy?: CreateTopicBody['privacy'];
}): Promise<TopicDetail> {
  const payload = {
    title: body.title,
    ...(body.privacy !== undefined ? { privacy: body.privacy } : {}),
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
