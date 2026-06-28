import { useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';
import { useClientsQuery } from '../features/Clients/hooks/useClientsQuery';

export const useClientSearch = () => {
  const { data = [], isLoading } = useClientsQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);

  const clients = useMemo(() => {
    if (!debouncedQuery.trim()) return data;

    const normalizedQuery = debouncedQuery.toLowerCase();
    return data.filter((client) =>
      [
        client.clientId,
        client.fullName,
        client.passportNumber,
        client.phoneNumber,
        client.passportCountryOfIssue,
        client.gender,
      ].some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery)),
    );
  }, [data, debouncedQuery]);

  return {
    clients,
    allRawClients: data,
    isLoading,
    searchQuery,
    setSearchQuery,
  };
};

export default useClientSearch;
