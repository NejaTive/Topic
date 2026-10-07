import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchTopic } from '@/api/topics';
import { queryKeys } from '@/query/keys';

/** GET /api/topics/:id → S05 meta. */
export function useTopicQuery(topicId: MaybeRefOrGetter<string>) {
  const id = computed(() => toValue(topicId));

  return useQuery({
    queryKey: computed(() => queryKeys.topics.detail(id.value)),
    queryFn: () => fetchTopic(id.value),
    enabled: computed(() => Boolean(id.value)),
    staleTime: 30_000,
  });
}
