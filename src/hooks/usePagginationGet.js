import { useQuery, keepPreviousData } from "@tanstack/react-query";

export function usePagginationGet({ apiFn, key, params }) {
  const queryKey = Array.isArray(key) ? [...key, params] : [key, params];

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => apiFn(params),
    placeholderData: keepPreviousData,
  });

  const responseBody = data?.data;
  const rawData = responseBody?.data ?? (Array.isArray(responseBody) ? responseBody : []);
  const list = Array.isArray(rawData) ? rawData : [];

  const totalItems =
    responseBody?.meta?.totalItems ??
    responseBody?.totalItems ??
    responseBody?.totalCount ??
    responseBody?.total ??
    list.length;

  const calculatedPageCount =
    responseBody?.meta?.totalPages ??
    responseBody?.pageCount ??
    responseBody?.totalPages ??
    (params?.limit ? Math.ceil(totalItems / params.limit) : 1);
  const pageCount = calculatedPageCount || 1;

  const currentPage =
    responseBody?.meta?.currentPage ??
    responseBody?.currentPage ??
    params?.page ??
    1;

  return {
    data: list,
    totalItems,
    pageCount,
    currentPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}
