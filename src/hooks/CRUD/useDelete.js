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
    mutationFn: async (ids) => {
      try {
        const res = await deleteFn({ [apiName]: ids });
        return res.data ?? res;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    onSuccess: (resData, ids) => {
      hdlSuccessResMsg(resData);
      const finalKey = Array.isArray(queryKey) ? queryKey : [queryKey];
      if (isPaginated) {
        // testing infinite query delete
      } else if (isInfiniteQuery) {
        queryClient.setQueryData(finalKey, (old) => {
          if (!old?.pages) return old;

          const updatedPages = old.pages.map((page) => {
            const pageData = page?.data?.data || [];

            const filteredData = pageData.filter(
              (item) => !ids.includes(item[idKey]),
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
              data: prev.data.data.filter((item) => !ids.includes(item[idKey])),
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
