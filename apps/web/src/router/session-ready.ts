import { fetchMe } from '@/api/auth';
import { queryClient } from '@/query/client';
import { queryKeys } from '@/query/keys';
import { useSessionStore } from '@/stores/session';

/** Дождаться первого me и синхронизировать Pinia (unknown → guest|authed). */
export async function ensureSessionReady(): Promise<void> {
  const session = useSessionStore();
  if (session.status !== 'unknown') return;

  await queryClient.fetchQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const user = await fetchMe();
      if (user) session.setUser(user);
      else session.clear();
      return user;
    },
    staleTime: 60_000,
  });
}
