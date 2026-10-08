import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchShare } from '@/api/share';
import { queryKeys } from '@/query/keys';

export function useShareQuery(shareId: MaybeRefOrGetter<string>) {
  const id = computed(() => toValue(shareId));

  return useQuery({
    queryKey: computed(() => queryKeys.share.detail(id.value)),
    queryFn: () => fetchShare(id.value),
    enabled: computed(() => Boolean(id.value)),
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        (error.status === 403 || error.status === 404)
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
