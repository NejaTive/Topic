import { computed, ref, type Ref } from 'vue';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'topic-theme';

const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: '#F8F9FA',
  dark: '#0C0C10',
};

let preference: Ref<ThemePreference> | null = null;
let mediaQuery: MediaQueryList | null = null;
let domSynced = false;

function readStoredPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    /* private mode / blocked storage */
  }
  return 'system';
}

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolve(pref: ThemePreference): ResolvedTheme {
  return pref === 'system' ? systemTheme() : pref;
}

function applyDom(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;

  const metaScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaScheme) metaScheme.setAttribute('content', resolved);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', THEME_COLOR[resolved]);
}

function ensurePreference(): Ref<ThemePreference> {
  if (!preference) {
    preference = ref(readStoredPreference());
  }
  return preference;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function canAnimateTheme(): boolean {
  return (
    typeof document !== 'undefined' && 'startViewTransition' in document && !prefersReducedMotion()
  );
}

function setToggleOrigin(x: number, y: number) {
  const root = document.documentElement;
  const maxX = Math.max(x, window.innerWidth - x);
  const maxY = Math.max(y, window.innerHeight - y);
  const radius = Math.hypot(maxX, maxY);
  root.style.setProperty('--theme-toggle-x', `${x}px`);
  root.style.setProperty('--theme-toggle-y', `${y}px`);
  root.style.setProperty('--theme-toggle-r', `${radius}px`);
}

function ensureMediaListener(onChange: () => void) {
  if (typeof window === 'undefined' || mediaQuery) return;
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', onChange);
}

export function useTheme() {
  const pref = ensurePreference();
  const resolved = computed<ResolvedTheme>(() => resolve(pref.value));

  if (typeof document !== 'undefined' && !domSynced) {
    applyDom(resolve(pref.value));
    domSynced = true;
  }

  function persist(next: ThemePreference) {
    pref.value = next;
    try {
      if (next === 'system') {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      }
    } catch {
      /* ignore */
    }
  }

  function applyTheme(next: ThemePreference) {
    persist(next);
    applyDom(resolve(next));
  }

  function setTheme(next: ThemePreference) {
    applyTheme(next);
  }

  function toggle(event?: MouseEvent) {
    const next: ResolvedTheme = resolved.value === 'dark' ? 'light' : 'dark';

    if (!canAnimateTheme()) {
      applyTheme(next);
      return;
    }

    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;
    setToggleOrigin(x, y);

    const start = document.startViewTransition;
    if (!start) {
      applyTheme(next);
      return;
    }

    start.call(document, () => {
      applyTheme(next);
    });
  }

  function syncFromSystem() {
    if (pref.value !== 'system') return;
    applyDom(systemTheme());
  }

  ensureMediaListener(syncFromSystem);

  return {
    preference: pref,
    resolved,
    setTheme,
    toggle,
  };
}
