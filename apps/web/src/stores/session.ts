import { defineStore } from 'pinia';
import { ref } from 'vue';

export type SessionUser = {
  id: string;
  email: string;
  nick: string;
};

export type SessionStatus = 'unknown' | 'guest' | 'authed';

export const useSessionStore = defineStore('session', () => {
  const user = ref<SessionUser | null>(null);
  const status = ref<SessionStatus>('unknown');

  function setUser(next: SessionUser) {
    user.value = next;
    status.value = 'authed';
  }

  function clear() {
    user.value = null;
    status.value = 'guest';
  }

  return { user, status, setUser, clear };
});
