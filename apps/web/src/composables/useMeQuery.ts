import { useQuery } from '@tanstack/vue-query';
import { fetchMe } from '@/api/auth';
import { queryKeys } from '@/query/keys';
import { useSessionStore } from '@/stores/session';

export function useMeQuery() {
  const session = useSessionStore();

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const user = await fetchMe();
      if (user) session.setUser(user);
      else session.clear();
      return user;
    },
    retry: false,
    staleTime: 60_000,
  });
}
