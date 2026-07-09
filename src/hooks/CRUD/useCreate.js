import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hdlErrResMsg, hdlSuccessResMsg } from "../../functions/generalHelpers";

export const useCreate = ({
  apiFn,
  key = "",
  onSuccess,
  invalidateQueries = [],
}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiFn(data);
      return res;
    },

    onSuccess: (newItem) => {
      const finalKey = Array.isArray(key) ? key : [key];
      const createdItem = newItem?.data?.data || newItem?.data;

      queryClient.setQueriesData(
        { queryKey: finalKey, exact: false },
        (oldData) => {
          if (!oldData) return oldData;
          if (oldData?.pages?.length) {
            const firstPage = oldData.pages[0];
            const existingItems =
              firstPage?.data?.data ?? firstPage?.data ?? [];

            const updatedFirstPage = {
              ...firstPage,
              data: {
                ...(firstPage?.data || {}),
                data: [createdItem, ...existingItems],
              },
            };

            return {
              ...oldData,
              pages: [updatedFirstPage, ...oldData.pages.slice(1)],
            };
          }
          if (Array.isArray(oldData?.data?.data)) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                data: [createdItem, ...oldData.data.data],
                total: (oldData.data.total ?? oldData.data.data.length) + 1,
                totalRowCount:
                  oldData.data.totalRowCount != null
                    ? oldData.data.totalRowCount + 1
                    : undefined,
              },
            };
          }
          if (Array.isArray(oldData?.data)) {
            return {
              ...oldData,
              data: [createdItem, ...oldData.data],
            };
          }
          return oldData;
        },
      );

      if (invalidateQueries?.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({
            queryKey: [queryKey],
            refetchType: "active",
          });
        });
      }

      onSuccess?.();
      hdlSuccessResMsg(newItem);
    },

    onError: (err) => {
      hdlErrResMsg(err);
    },
  });

  return mutation;
};
