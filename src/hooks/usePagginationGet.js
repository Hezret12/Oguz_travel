import { useQuery, keepPreviousData } from "@tanstack/react-query";

export function usePagginationGet({ apiFn, key, params, options = {} }) {
  const queryKey = Array.isArray(key) ? [...key, params] : [key, params];

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => apiFn(params),
    placeholderData: keepPreviousData,
    ...options,
  });

  const responseBody = data?.data;

  let items = [];
  if (Array.isArray(responseBody?.data?.data)) {
    items = responseBody.data.data;
  } else if (Array.isArray(responseBody?.data)) {
    items = responseBody.data;
  } else if (Array.isArray(responseBody?.items)) {
    items = responseBody.items;
  } else if (Array.isArray(responseBody)) {
    items = responseBody;
  }

  const totalItems =
    responseBody?.data?.totalItems ??
    responseBody?.totalItems ??
    responseBody?.meta?.totalItems ??
    responseBody?.data?.meta?.totalItems ??
    items.length;

  const pageCount =
    responseBody?.data?.totalPages ??
    responseBody?.totalPages ??
    responseBody?.meta?.totalPages ??
    responseBody?.data?.meta?.totalPages ??
    1;

  const currentPage =
    responseBody?.data?.currentPage ??
    responseBody?.currentPage ??
    responseBody?.meta?.currentPage ??
    responseBody?.data?.meta?.currentPage ??
    1;

  return {
    data: items,
    totalItems,
    pageCount,
    currentPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    responseBody,
    rawResponse: data,
  };
}
