import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { QueryClient } from '@tanstack/react-query';

// Import AppRouter type from server package using relative path
import type { AppRouter } from '../../../server/src/trpc/router';

export const trpc = createTRPCReact<AppRouter>();

/**
 * QueryClient instance for React Query
 * Configured with default options for the application
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: true,
            refetchOnWindowFocus: false,
            staleTime: 0,
            gcTime: 0,
        },
    },
});

/**
 * tRPC client instance
 * Type-safe API client that connects to the backend router
 */
import { TRPCClientError } from '@trpc/client';
import { observable } from '@trpc/server/observable';

export const trpcClient = trpc.createClient({
    links: [
        () =>
            ({ op, next }) => {
                return observable((observer) => {
                    const unsubscribe = next(op).subscribe({
                        next(value) {
                            if (
                                value.result?.type === 'data' &&
                                (value.result.data as any)?.error?.data?.code === 'UNAUTHORIZED'
                            ) {
                                const redirectUri = encodeURIComponent(window.location.href);
                                window.location.href = `https://aai.cstcloud.net/oidc/authorize?response_type=code&client_id=14093&scope=openid&redirect_uri=${redirectUri}`;
                            }
                            observer.next(value);
                        },
                        error(err) {
                            if (err.data?.code === 'UNAUTHORIZED') {
                                const redirectUri = encodeURIComponent(window.location.href);
                                window.location.href = `https://aai.cstcloud.net/oidc/authorize?response_type=code&client_id=14093&scope=openid&redirect_uri=${redirectUri}`;
                            }
                            observer.error(err);
                        },
                        complete() {
                            observer.complete();
                        },
                    });
                    return unsubscribe;
                });
            },
        httpBatchLink({
            url: '/trpc',
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    cache: 'no-store', // Disable HTTP caching
                });
            },
            headers() {
                const token = localStorage.getItem('aai_token');
                if (token) {
                    return {
                        Authorization: `Bearer ${token}`,
                    };
                }
                return {};
            },
        }),
    ],
});
