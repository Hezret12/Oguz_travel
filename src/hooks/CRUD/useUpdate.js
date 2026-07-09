import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hdlSuccessResMsg, hdlErrResMsg } from "../../functions/generalHelpers";

export const useUpdate = ({
  apiFn,
  key,
  idKey,
  onSuccessUpdate,
  invalidateQueries = [],
  isInfiniteQuery = false,
}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables) => {
      const res = await apiFn(variables);
      const updatedItem = res.data?.data || res.data;
      const message = res.data?.message || res.message;

      return { updatedItem, message };
    },

    onSuccess: ({ updatedItem, message }) => {
      const finalKey = Array.isArray(key) ? key : [key];

      const mergeItem = (oldItem) =>
        oldItem?.[idKey] === updatedItem[idKey]
          ? { ...oldItem, ...updatedItem }
          : oldItem;

      queryClient.setQueriesData(
        { queryKey: finalKey, exact: false },
        (old) => {
          if (!old) return old;

          if (isInfiniteQuery) {
            if (!old.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page) => {
                const pageData = page?.data?.data;
                if (!Array.isArray(pageData)) return page;
                return {
                  ...page,
                  data: { ...page.data, data: pageData.map(mergeItem) },
                };
              }),
            };
          }

          if (Array.isArray(old)) {
            return old.map(mergeItem);
          }

          if (Array.isArray(old?.data?.data)) {
            return {
              ...old,
              data: { ...old.data, data: old.data.data.map(mergeItem) },
            };
          }
          if (Array.isArray(old?.data)) {
            return { ...old, data: old.data.map(mergeItem) };
          }

          return old;
        },
      );

      invalidateQueries?.forEach((queryKey) => {
        queryClient.invalidateQueries({
          queryKey: [queryKey],
          refetchType: "active",
        });
      });

      hdlSuccessResMsg({ data: { message } });
      onSuccessUpdate?.();
    },

    onError: (err) => hdlErrResMsg(err),
  });

  return mutation;
};
