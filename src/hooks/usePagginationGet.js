import { useQuery } from "@tanstack/react-query";

export const usePagginationGet = ({ apiFn, key, params = {}, options = {} }) => {
  const query = useQuery({
    queryKey: [key, params],
    queryFn: async () => {
      try {
        const res = await apiFn(params);
        return res;
      } catch (err) {
        console.error(`Error fetching paginated data for key "${key}":`, err);
        throw err;
      }
    },
    ...options,
  });

  const data = query?.data?.data?.data ?? query?.data?.data ?? [];

  const totalCount =
    query?.data?.data?.totalCount ??
    query?.data?.data?.total ??
    query?.data?.data?.count ??
    query?.data?.data?.totalRows ??
    (Array.isArray(data) ? data.length : 0);

  const limit = params.pageSize || 20;
  const pageCount =
    query?.data?.data?.totalPages ??
    query?.data?.data?.pageCount ??
    (Math.ceil(totalCount / limit) || 1);

  return {
    ...query,
    data,
    totalCount,
    pageCount,
  };
};
