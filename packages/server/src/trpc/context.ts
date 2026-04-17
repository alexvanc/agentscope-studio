import * as trpcExpress from '@trpc/server/adapters/express';
import { TRPCError } from '@trpc/server';

export interface User {
    id: string;
    email: string;
    name?: string;
    raw_token: string;
}

export const createContext = async ({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions) => {
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        token = authHeader.split(' ')[1];
    }

    return {
        req,
        res,
        token,
        user: null as User | null, // To be populated by middleware
    };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
