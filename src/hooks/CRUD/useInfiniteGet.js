import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * Clean production-grade infinite pagination CRUD hook for Oguz Travel
 * Wraps TanStack React Query's useInfiniteQuery for seamless scroll fetching & cache management.
 */
export const useInfiniteGet = ({ apiFn, key, params = {}, options = {} }) => {
  const queryKey = Array.isArray(key) ? [...key, params] : [key, params];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiFn({ ...params, page: pageParam });
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      let pageData = lastPage?.data?.data?.data ?? lastPage?.data?.data ?? lastPage?.data;
      if (!Array.isArray(pageData)) {
        pageData = [];
      }

      const limit = params.limit || 10;
      // If last page retrieved full batch, request next page
      if (pageData.length >= limit) {
        return allPages.length + 1;
      }
      return undefined;
    },
    ...options,
  });

  const data = query.data?.pages?.flatMap((page) => {
    let items = page?.data?.data?.data ?? page?.data?.data ?? page?.data;
    return Array.isArray(items) ? items : [];
  }) ?? [];

  return {
    ...query,
    data,
  };
};
