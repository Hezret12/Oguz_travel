import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hdlErrResMsg, hdlSuccessResMsg } from "../../functions/generalHelpers";

export const useDelete = ({
  deleteFn,
  queryKey,
  idKey,
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
      const targetGuids = Array.isArray(guid) ? guid : [guid];

      if (isPaginated) {
        queryClient.invalidateQueries({
          queryKey: finalKey,
          refetchType: "active",
        });
      } else if (isInfiniteQuery) {
        queryClient.setQueriesData({ queryKey: finalKey, exact: false }, (old) => {
          if (!old?.pages) return old;

          const updatedPages = old.pages.map((page) => {
            const pageData = page?.data?.data || page?.data || [];

            const filteredData = Array.isArray(pageData)
              ? pageData.filter((item) => !targetGuids.includes(item?.[idKey]))
              : pageData;

            return {
              ...page,
              data: {
                ...(page?.data || {}),
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
        queryClient.setQueriesData({ queryKey: finalKey, exact: false }, (prev) => {
          if (!prev) return prev;

          if (Array.isArray(prev?.data?.data)) {
            return {
              ...prev,
              data: {
                ...prev.data,
                data: prev.data.data.filter((item) => !targetGuids.includes(item?.[idKey])),
                ...(prev.data.meta && {
                  meta: {
                    ...prev.data.meta,
                    totalItems: Math.max(0, (prev.data.meta.totalItems || prev.data.data.length) - targetGuids.length),
                  },
                }),
              },
            };
          }

          if (Array.isArray(prev?.data)) {
            return {
              ...prev,
              data: prev.data.filter((item) => !targetGuids.includes(item?.[idKey])),
            };
          }

          if (Array.isArray(prev)) {
            return prev.filter((item) => !targetGuids.includes(item?.[idKey]));
          }

          return prev;
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
