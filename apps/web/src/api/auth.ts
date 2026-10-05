import { apiClient } from './client';
import type { components } from './schema';

export type AuthUser = components['schemas']['UserResponseDto'];
export type RegisterBody = components['schemas']['RegisterDto'];
export type LoginBody = components['schemas']['LoginDto'];

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly field?: 'email' | 'nick',
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
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
