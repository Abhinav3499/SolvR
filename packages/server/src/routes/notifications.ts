import type { FastifyPluginAsync } from 'fastify';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticateSupabaseUser } from '../plugins/auth.js';

export const notificationsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/notifications - List user unread notifications
  fastify.get(
    '/api/notifications',
    { preHandler: [authenticateSupabaseUser] },
    async (request, reply) => {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      if (!supabaseAdmin) {
        return reply.send({ notifications: [] });
      }

      try {
        const { data, error } = await supabaseAdmin
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          return reply.status(500).send({ error: error.message });
        }

        return reply.send({ notifications: data || [] });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    }
  );

  // PATCH /api/notifications/:id/read - Mark notification as read
  fastify.patch<{ Params: { id: string } }>(
    '/api/notifications/:id/read',
    { preHandler: [authenticateSupabaseUser] },
    async (request, reply) => {
      const { id } = request.params;
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      if (!supabaseAdmin) {
        return reply.send({ success: true, message: 'Offline mode active' });
      }

      try {
        const { error } = await supabaseAdmin
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          return reply.status(500).send({ error: error.message });
        }

        return reply.send({ success: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    }
  );
};
