import { useQuery } from "@tanstack/react-query"


export const useGet = ({ apiFn, key, params = {}, options = {} }) => {
  const query = useQuery({
    queryKey: [key, params], 
    queryFn: async () => {
      try {
        const res = await apiFn(params);
        return res;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    ...options,
  });

  const data = query?.data?.data?.data ?? [];

  return { ...query, data };
};