import { apiClient } from './client';
import type { components } from './schema';

export type AuthUser = components['schemas']['UserResponseDto'];
export type RegisterBody = components['schemas']['RegisterDto'];
export type LoginBody = components['schemas']['LoginDto'];

export type AuthErrorField = 'email' | 'nick' | 'password';

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly field?: AuthErrorField,
    readonly fields?: Partial<Record<AuthErrorField, string>>,
  ) {
    super(message);
    this.name = 'AuthApiError';
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

function mapLoginValidationFields(
  messages: string[],
): Partial<Record<'email' | 'password', string>> {
  const fields: Partial<Record<'email' | 'password', string>> = {};
  for (const msg of messages) {
    const lower = msg.toLowerCase();
    if (lower.includes('email') && !fields.email) fields.email = msg;
    else if (lower.includes('password') && !fields.password) fields.password = msg;
  }
  return fields;
}

function mapRegisterValidationFields(
  messages: string[],
): Partial<Record<AuthErrorField, string>> {
  const fields: Partial<Record<AuthErrorField, string>> = {};
  for (const msg of messages) {
    const lower = msg.toLowerCase();
    if (lower.includes('nick') && !fields.nick) fields.nick = msg;
    else if (lower.includes('email') && !fields.email) fields.email = msg;
    else if (lower.includes('password') && !fields.password) fields.password = msg;
  }
  return fields;
}

export async function fetchMe(): Promise<AuthUser | null> {
  const { data, response } = await apiClient.GET('/api/auth/me');
  if (response.status === 401) return null;
  if (!data) throw new AuthApiError('Не удалось получить сессию', response.status);
  return data;
}

export async function registerUser(body: RegisterBody): Promise<AuthUser> {
  const { data, error, response } = await apiClient.POST('/api/auth/register', { body });
  if (response.status === 409 && error && typeof error === 'object' && 'message' in error) {
    const conflict = error as components['schemas']['ConflictResponseDto'];
    throw new AuthApiError(conflict.message, 409, conflict.field);
  }
  if (response.status === 400 || response.status === 422) {
    const messages = validationMessages(error);
    const fields = mapRegisterValidationFields(messages);
    const fallback = messages[0] ?? 'Проверьте данные формы';
    throw new AuthApiError(fallback, response.status, undefined, fields);
  }
  if (error || !data) {
    throw new AuthApiError('Не удалось зарегистрироваться', response.status);
  }
  return data;
}

export async function loginUser(body: LoginBody): Promise<AuthUser> {
  const { data, error, response } = await apiClient.POST('/api/auth/login', { body });
  if (response.status === 401) {
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'Неверный email или пароль';
    throw new AuthApiError(message, 401);
  }
  if (response.status === 400 || response.status === 422) {
    const messages = validationMessages(error);
    const fields = mapLoginValidationFields(messages);
    const fallback = messages[0] ?? 'Проверьте данные формы';
    throw new AuthApiError(fallback, response.status, undefined, fields);
  }
  if (error || !data) {
    throw new AuthApiError('Не удалось войти', response.status);
  }
  return data;
}

export async function logoutUser(): Promise<void> {
  const { response } = await apiClient.POST('/api/auth/logout');
  if (!response.ok) {
    throw new AuthApiError('Не удалось выйти', response.status);
  }
}
