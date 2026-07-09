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

      queryClient.setQueryData(finalKey, (oldData) => {
        if (!oldData?.pages?.length) return oldData;
        const firstPage = oldData.pages[0];
        const existingItems = firstPage?.data?.data ?? firstPage?.data ?? [];

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
      });

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
