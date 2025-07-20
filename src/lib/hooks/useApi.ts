import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { handleClientError } from '@/lib/errors';

export interface UseApiOptions {
  enabled?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  apiCall: () => Promise<{ success: boolean; data?: T; error?: string }>,
  dependencies: React.DependencyList = [],
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { enabled = true, onSuccess, onError } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'An error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiCall, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Hook for authenticated API calls
export function useAuthenticatedApi<T>(
  apiCall: () => Promise<{ success: boolean; data?: T; error?: string }>,
  dependencies: unknown[] = [],
  options: UseApiOptions = {}
) {
  const { isSignedIn, isLoaded } = useUser();
  
  return useApi(
    apiCall,
    dependencies,
    {
      ...options,
      enabled: options.enabled !== false && isLoaded && isSignedIn,
    }
  );
}

// Mutation hook for API calls that modify data
export function useMutation<TData, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<{ success: boolean; data?: TData; error?: string }>,
  options: {
    onSuccess?: (data: TData) => void;
    onError?: (error: string) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (variables: TVariables) => {
    setLoading(true);
    setError(null);

    try {
      const response = await mutationFn(variables);
      
      if (response.success && response.data) {
        options.onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMessage = response.error || 'An error occurred';
        setError(errorMessage);
        options.onError?.(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
}
