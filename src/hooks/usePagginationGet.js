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

  // Global meta aggregation: extract explicit meta and any additional non-row attributes
  const explicitMeta =
    responseBody?.data?.meta ??
    responseBody?.meta ??
    data?.meta ??
    {};

  const extraMeta = {};
  if (responseBody && typeof responseBody === "object" && !Array.isArray(responseBody)) {
    for (const [k, v] of Object.entries(responseBody)) {
      if (!["data", "items", "status", "message", "meta"].includes(k)) {
        extraMeta[k] = v;
      }
    }
  }

  if (
    responseBody?.data &&
    typeof responseBody.data === "object" &&
    !Array.isArray(responseBody.data)
  ) {
    for (const [k, v] of Object.entries(responseBody.data)) {
      if (!["data", "items", "status", "message", "meta"].includes(k)) {
        extraMeta[k] = v;
      }
    }
  }

  const meta = {
    ...extraMeta,
    ...(typeof explicitMeta === "object" ? explicitMeta : {}),
    totalItems,
    pageCount,
    totalPages: pageCount,
    currentPage,
  };

  return {
    data: items,
    totalItems,
    pageCount,
    currentPage,
    meta,
    totalPrice: meta?.totalPrice ?? 0,
    totalExpense: meta?.totalExpense ?? meta?.totalExpensePrice ?? 0,
    totalExpensePrice: meta?.totalExpensePrice ?? meta?.totalExpense ?? 0,
    totalProfit: meta?.totalProfit ?? 0,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    responseBody,
    rawResponse: data,
  };
}
