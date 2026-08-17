import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfiniteGet({ apiFn, key, params = {}, options = {} }) {
  const queryKey = Array.isArray(key) ? [...key, params] : [key, params];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      return await apiFn({ ...params, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const responseBody = lastPage?.data;
      const totalPages =
        responseBody?.data?.totalPages ??
        responseBody?.totalPages ??
        responseBody?.meta?.totalPages ??
        responseBody?.data?.meta?.totalPages ??
        null;

      const currentPage = allPages.length;
      if (totalPages !== null && totalPages !== undefined) {
        return currentPage < totalPages ? currentPage + 1 : undefined;
      }

      const items =
        responseBody?.data?.data ??
        responseBody?.data ??
        responseBody?.items ??
        [];

      if (!Array.isArray(items) || items.length === 0) {
        return undefined;
      }

      const limit = params.limit || 15;
      if (items.length < limit) {
        return undefined;
      }

      return currentPage + 1;
    },
    ...options,
  });

  const items = (query.data?.pages || []).flatMap((page) => {
    const responseBody = page?.data;
    if (Array.isArray(responseBody?.data?.data)) return responseBody.data.data;
    if (Array.isArray(responseBody?.data)) return responseBody.data;
    if (Array.isArray(responseBody?.items)) return responseBody.items;
    if (Array.isArray(responseBody)) return responseBody;
    return [];
  });

  const firstPageBody = query.data?.pages?.[0]?.data;
  const totalItems =
    firstPageBody?.data?.totalItems ??
    firstPageBody?.totalItems ??
    firstPageBody?.meta?.totalItems ??
    firstPageBody?.data?.meta?.totalItems ??
    items.length;

  return {
    ...query,
    data: items,
    totalItems,
  };
}
