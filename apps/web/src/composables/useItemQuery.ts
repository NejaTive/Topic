import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchItem } from '@/api/items';
import { queryKeys } from '@/query/keys';

export function useItemQuery(topicId: MaybeRefOrGetter<string>, itemId: MaybeRefOrGetter<string>) {
  const tid = computed(() => toValue(topicId));
  const iid = computed(() => toValue(itemId));

  return useQuery({
    queryKey: computed(() => queryKeys.topics.item(tid.value, iid.value)),
    queryFn: () => fetchItem(tid.value, iid.value),
    enabled: computed(() => Boolean(tid.value && iid.value)),
    staleTime: 15_000,
  });
}
