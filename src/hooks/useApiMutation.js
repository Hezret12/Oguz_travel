import { useMutation } from '@tanstack/react-query';

export const useApiMutation = (mutationFn, options = {}) => {
  return useMutation({
    mutationFn,
    ...options,
  });
};
