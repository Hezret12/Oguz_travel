import { useQuery, keepPreviousData } from "@tanstack/react-query";

export function usePagginationGet({ apiFn, key, params }) {
  const queryKey = Array.isArray(key) ? [...key, params] : [key, params];

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => apiFn(params),
    placeholderData: keepPreviousData,
  });

  const responseBody = data?.data;

  return {
    data: responseBody?.data ?? [],
    totalItems: responseBody?.meta?.totalItems ?? 0,
    pageCount: responseBody?.meta?.totalPages ?? 0,
    currentPage: responseBody?.meta?.currentPage ?? 1,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}
