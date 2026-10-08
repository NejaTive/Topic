import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchTopicItems } from '@/api/items';
import { queryKeys } from '@/query/keys';

export function useTopicItemsQuery(topicId: MaybeRefOrGetter<string>) {
  const id = computed(() => toValue(topicId));

  return useQuery({
    queryKey: computed(() => queryKeys.topics.items(id.value)),
    queryFn: () => fetchTopicItems(id.value),
    enabled: computed(() => Boolean(id.value)),
    staleTime: 15_000,
  });
}
