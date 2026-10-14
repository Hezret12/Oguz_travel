import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hdlErrResMsg, hdlSuccessResMsg } from "../../functions/generalHelpers";

export const useCreate = ({
  apiFn,
  key = "",
  onSuccess,
  invalidateQueries = [],
  isPaginated = false,
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

      if (isPaginated) {
        queryClient.invalidateQueries({
          queryKey: finalKey,
          refetchType: "active",
        });
      } else {
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
                  totalItems:
                    (oldData.data.totalItems ??
                      oldData.data.total ??
                      oldData.data.data.length) + 1,
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
      }

      if (invalidateQueries?.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({
            queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
            refetchType: "active",
          });
        });
      }

      onSuccess?.(newItem);
      hdlSuccessResMsg(newItem);
    },

    onError: (err) => {
      hdlErrResMsg(err);
    },
  });

  // One create at a time: a call made while the previous request is still on
  // its way (a double click that got past the form) gets that request's
  // promise instead of sending a duplicate record.
  const inFlight = useRef(null);
  const { mutateAsync: send } = mutation;

  const mutateAsync = useCallback(
    (variables, options) => {
      if (inFlight.current) return inFlight.current;
      const request = send(variables, options).finally(() => {
        inFlight.current = null;
      });
      inFlight.current = request;
      return request;
    },
    [send],
  );

  // Like react-query's `mutate`: errors are already shown by onError.
  const mutate = useCallback(
    (variables, options) => {
      mutateAsync(variables, options).catch(() => {});
    },
    [mutateAsync],
  );

  return { ...mutation, mutate, mutateAsync };
};
