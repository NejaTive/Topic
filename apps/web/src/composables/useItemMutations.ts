import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  createItem,
  createItemFromCatalog,
  deleteItem,
  deleteItemCover,
  rankItem,
  unrankItem,
  updateItem,
  uploadItemCover,
  type CreateItemBody,
  type FromCatalogItemBody,
  type ItemDto,
  type UpdateItemBody,
} from '@/api/items';
import { queryKeys } from '@/query/keys';

function invalidateTopicLists(queryClient: ReturnType<typeof useQueryClient>, topicId: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.topics.items(topicId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
}

export function useCreateItemMutation(topicId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateItemBody) => createItem(topicId(), body),
    onSuccess: (item: ItemDto) => {
      const id = topicId();
      queryClient.setQueryData(queryKeys.topics.item(id, item.id), item);
      invalidateTopicLists(queryClient, id);
    },
  });
}

export function useCreateItemFromCatalogMutation(topicId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FromCatalogItemBody) => createItemFromCatalog(topicId(), body),
    onSuccess: (item: ItemDto) => {
      const id = topicId();
      queryClient.setQueryData(queryKeys.topics.item(id, item.id), item);
      invalidateTopicLists(queryClient, id);
    },
  });
}

export function useUpdateItemMutation(topicId: () => string, itemId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateItemBody) => updateItem(topicId(), itemId(), body),
    onSuccess: (item: ItemDto) => {
      const tid = topicId();
      queryClient.setQueryData(queryKeys.topics.item(tid, item.id), item);
      invalidateTopicLists(queryClient, tid);
    },
  });
}

export function useDeleteItemMutation(topicId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => deleteItem(topicId(), itemId),
    onSuccess: (_void, itemId) => {
      const tid = topicId();
      queryClient.removeQueries({ queryKey: queryKeys.topics.item(tid, itemId) });
      invalidateTopicLists(queryClient, tid);
    },
  });
}

export function useUploadItemCoverMutation(topicId: () => string, itemId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadItemCover(topicId(), itemId(), file),
    onSuccess: (item: ItemDto) => {
      const tid = topicId();
      queryClient.setQueryData(queryKeys.topics.item(tid, item.id), item);
      invalidateTopicLists(queryClient, tid);
    },
  });
}

export function useDeleteItemCoverMutation(topicId: () => string, itemId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteItemCover(topicId(), itemId()),
    onSuccess: (item: ItemDto) => {
      const tid = topicId();
      queryClient.setQueryData(queryKeys.topics.item(tid, item.id), item);
      invalidateTopicLists(queryClient, tid);
    },
  });
}

export function useRankItemOnDetailMutation(topicId: () => string, itemId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rankItem(topicId(), itemId()),
    onSuccess: (item: ItemDto) => {
      const tid = topicId();
      queryClient.setQueryData(queryKeys.topics.item(tid, item.id), item);
      invalidateTopicLists(queryClient, tid);
    },
  });
}

export function useUnrankItemMutation(topicId: () => string, itemId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unrankItem(topicId(), itemId()),
    onSuccess: (item: ItemDto) => {
      const tid = topicId();
      queryClient.setQueryData(queryKeys.topics.item(tid, item.id), item);
      invalidateTopicLists(queryClient, tid);
    },
  });
}
