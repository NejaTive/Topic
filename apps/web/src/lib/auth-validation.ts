/** Client-side auth form checks (mirror LoginDto / RegisterDto). API remains the source of truth. */

export type LoginFieldErrors = { email?: string; password?: string };
export type RegisterFieldErrors = {
  email?: string;
  nick?: string;
  password?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NICK_RE = /^[a-zA-Z0-9_]{3,30}$/;

function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

export function validateLoginForm(input: {
  email: string;
  password: string;
}): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  const email = input.email.trim();

  if (!email || !isEmail(email)) {
    errors.email = 'Укажите корректный email';
  }

  if (!input.password) {
    errors.password = 'Укажите пароль';
  } else if (input.password.length < 8) {
    errors.password = 'Пароль должен быть не короче 8 символов';
  }

  return errors;
}

export function validateRegisterForm(input: {
  email: string;
  nick: string;
  password: string;
}): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};
  const email = input.email.trim();
  const nick = input.nick.trim();

  if (!email || !isEmail(email)) {
    errors.email = 'Укажите корректный email';
  }

  if (!input.password) {
    errors.password = 'Укажите пароль';
  } else if (input.password.length < 8) {
    errors.password = 'Пароль должен быть не короче 8 символов';
  }

  if (!nick) {
    errors.nick = 'Укажите ник';
  } else if (nick.length < 3) {
    errors.nick = 'Ник должен быть не короче 3 символов';
  } else if (nick.length > 30) {
    errors.nick = 'Ник должен быть не длиннее 30 символов';
  } else if (!NICK_RE.test(nick)) {
    errors.nick = 'В нике допустимы только a-z, 0-9 и _; длина 3–30';
  }

  return errors;
}

export function hasFieldErrors(
  errors: Record<string, string | undefined>,
): boolean {
  return Object.values(errors).some((msg) => Boolean(msg));
}
