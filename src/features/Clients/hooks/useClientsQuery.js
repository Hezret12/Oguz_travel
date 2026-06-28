import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient, getClients } from '../api/clientStore';

export const CLIENTS_QUERY_KEY = ['clients'];

export const useClientsQuery = () =>
  useQuery({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: getClients,
  });

export const useCreateClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
  });
};

export const useClientById = (clientId) => {
  const query = useClientsQuery();

  return {
    ...query,
    client: query.data?.find((client) => client.id === clientId) ?? null,
  };
};
