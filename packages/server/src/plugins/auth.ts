import type { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin, isSupabaseConfigured } from '../services/supabase.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function authenticateSupabaseUser(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.substring(7);

  // If Supabase is not configured (e.g. offline dev mode), allow mock token for local testing
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    request.user = { id: 'mock-user-id', email: 'dev@solvr.local' };
    return;
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      reply.status(401).send({ error: 'Invalid or expired session token' });
      return;
    }

    request.user = {
      id: user.id,
      email: user.email,
    };
  } catch {
    reply.status(401).send({ error: 'Authentication verification failed' });
  }
}
