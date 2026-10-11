import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { getUserProfile } from '@/api/social';
import { queryKeys } from '@/query/keys';

export function useUserProfileQuery(nick: MaybeRefOrGetter<string>) {
  const nickValue = computed(() => toValue(nick));

  return useQuery({
    queryKey: computed(() => queryKeys.users.profile(nickValue.value)),
    queryFn: () => getUserProfile(nickValue.value),
    enabled: computed(() => Boolean(nickValue.value)),
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
