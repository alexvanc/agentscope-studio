import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';
import crypto from 'crypto';

export const t = initTRPC.context<Context>().create();

// Simple cache for AAI OIDC user info
const tokenCache = new Map<string, { data: any, expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const isAuthed = t.middleware(async ({ ctx, next }) => {
    if (!ctx.token) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No auth token provided' });
    }

    // Check cache
    const tokenHash = crypto.createHash('md5').update(ctx.token).digest('hex');
    const cached = tokenCache.get(tokenHash);
    let userInfo = null;

    if (cached && cached.expiresAt > Date.now()) {
        userInfo = cached.data;
    } else {
        // Fetch from AAI
        try {
            const res = await fetch('https://aai.cstcloud.net/oidc/userinfo', {
                headers: {
                    'Authorization': `Bearer ${ctx.token}`
                }
            });

            if (!res.ok) {
                throw new Error('AAI validation failed');
            }

            userInfo = await res.json();
            
            // Validate userInfo
            if (!userInfo || !userInfo.sub) {
                throw new Error('Invalid user info from AAI');
            }

            tokenCache.set(tokenHash, {
                data: userInfo,
                expiresAt: Date.now() + CACHE_TTL
            });
        } catch (error) {
            console.error('Auth error:', error);
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired token' });
        }
    }

    ctx.user = {
        id: userInfo.sub,
        email: userInfo.email || `${userInfo.sub}@aai.cstcloud.net`,
        name: userInfo.name,
        raw_token: ctx.token
    };

    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
        },
    });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
