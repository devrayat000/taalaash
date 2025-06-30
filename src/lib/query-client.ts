import { QueryCache, QueryClient } from "@tanstack/react-query";

export const queryCache = new QueryCache();

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			retry: 1,
			staleTime: 1000 * 60 * 5, // 5 minutes
		},
		mutations: {
			retry: 1,
		},
	},
	queryCache,
});
