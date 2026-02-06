// React Query configuration and custom hooks
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import storyEngine from './storyEngine';
import nasaApi from './nasaApi';

// Create query client with default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Custom hooks for data fetching
export const useStoryQuery = (userData) => {
  return useQuery({
    queryKey: ['story', userData.location, userData.timeframe, userData.topic],
    queryFn: () => storyEngine.generateStory(userData),
    enabled: !!userData.location && !!userData.timeframe,
    placeholderData: (previousData) => previousData,
  });
};

export const useClimateDataQuery = (location, timeframe) => {
  return useQuery({
    queryKey: ['climateData', location, timeframe],
    queryFn: () => nasaApi.fetchClimateData(location, timeframe),
    enabled: !!location && !!timeframe,
  });
};

export const useCachedStoryQuery = (userData) => {
  return useQuery({
    queryKey: ['cachedStory', userData.location, userData.timeframe],
    queryFn: () => storyEngine.getCachedStory(userData),
    enabled: !!userData.location && !!userData.timeframe,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

// Prefetch common data
export const prefetchCommonData = async () => {
  // Prefetch popular locations data
  const popularLocations = ['New York', 'London', 'Sydney', 'Mumbai'];
  const timeframes = ['2030', '2040', '2050'];
  
  for (const location of popularLocations) {
    for (const timeframe of timeframes) {
      queryClient.prefetchQuery({
        queryKey: ['climateData', location, timeframe],
        queryFn: () => nasaApi.fetchClimateData(location, timeframe),
      });
    }
  }
};

export { QueryClientProvider };