import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hdlErrResMsg, hdlSuccessResMsg } from "../../functions/generalHelpers";

export const useDelete = ({
  deleteFn,
  queryKey,
  idKey,
  apiName,
  invalidateQueries = [],
  isInfiniteQuery = false,
  isPaginated = false,
}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (guid) => {
      try {
        const res = await deleteFn({guid});
        return res.data ?? res;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    onSuccess: (resData, guid) => {
      hdlSuccessResMsg(resData);
      const finalKey = Array.isArray(queryKey) ? queryKey : [queryKey];
      if (isPaginated) {
        // For paginated queries, invalidate so the current page refetches.
        // Optimistic removal is unsafe here because removing an item shifts
        // items across pages, which would cause incorrect counts/gaps.
        queryClient.invalidateQueries({
          queryKey: finalKey,
          refetchType: "active",
        });
      } else if (isInfiniteQuery) {
        queryClient.setQueryData(finalKey, (old) => {
          if (!old?.pages) return old;

          const updatedPages = old.pages.map((page) => {
            const pageData = page?.data?.data || [];

            const filteredData = pageData.filter(
              (item) => !guid.includes(item[idKey]),
            );

            return {
              ...page,
              data: {
                ...page.data,
                data: filteredData,
              },
            };
          });

          return {
            ...old,
            pages: updatedPages,
          };
        });
      } else {
        queryClient.setQueryData(finalKey, (prev) => {
          if (!prev?.data?.data) return prev;
          return {
            ...prev,
            data: {
              ...prev.data,
              data: prev.data.data.filter((item) => !guid.includes(item[idKey])),
            },
          };
        });
      }

      if (invalidateQueries?.length > 0) {
        invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({
            queryKey: [key],
            refetchType: "active",
          });
        });
      }
    },
    onError: (err) => {
      hdlErrResMsg(err);
    },
  });

  return mutation;
};
