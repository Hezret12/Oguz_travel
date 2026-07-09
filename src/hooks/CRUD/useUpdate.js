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
      const { [idKey]: id, ...rest } = variables;
      const res = await apiFn({ [idKey]: id, ...rest });
      hdlSuccessResMsg(res);
      return res.data?.data || res.data;
    },

    onSuccess: (updatedItem) => {
      const finalKey = Array.isArray(key) ? key : [key];
       if (isInfiniteQuery) {
        queryClient.setQueryData(finalKey, (old) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page) => {
              const pageData = page?.data?.data;
              if (!Array.isArray(pageData)) return page;

              return {
                ...page,
                data: {
                  ...page.data,
                  data: pageData.map((item) =>
                    item[idKey] === updatedItem[idKey] ? updatedItem : item,
                  ),
                },
              };
            }),
          };
        });
      } else {
        queryClient.setQueryData(finalKey, (old) => {
          if (!old) return old;
          const list = Array.isArray(old)
            ? [...old]
            : old.data?.data
              ? [...old.data.data]
              : [];

          const index = list.findIndex(
            (item) => item[idKey] === updatedItem[idKey],
          );
          if (index === -1) return old;

          list[index] = updatedItem;

          if (Array.isArray(old)) {
            return list;
          }

          return {
            ...old,
            data: {
              ...old.data,
              data: list,
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

      onSuccessUpdate();
    },

    onError: (err) => hdlErrResMsg(err),
  });

  return mutation;
};
