import { useState } from 'react';
import { useLoading } from '../context/LoadingContext';
import api from '../services/api';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

type ApiMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export function useApiRequest<T = any>() {
  const [response, setResponse] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  });
  
  const { setIsLoading } = useLoading();

  const executeRequest = async (
    method: ApiMethod,
    url: string,
    data?: any,
    options?: any
  ) => {
    try {
      setResponse(prev => ({ ...prev, loading: true, error: null }));
      setIsLoading(true);
      
      const apiResponse = await api[method](url, data, options);
      
      setResponse({
        data: apiResponse.data,
        error: null,
        loading: false,
      });
      
      return apiResponse.data;
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.status);
        if(error.response.status === 401){
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        errorMessage = error.response.data.message || 'Server error';
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setResponse({
        data: null,
        error: errorMessage,
        loading: false,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...response,
    executeRequest,
  };
} 