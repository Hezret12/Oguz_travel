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

  const rawData = query?.data?.data;
  const data = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData?.items)
    ? rawData.items
    : rawData?.data ?? (typeof rawData === "object" && rawData !== null ? rawData : []);

  return { ...query, rawResponse: query?.data, rawData, data };
};