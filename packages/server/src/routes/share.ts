import type { FastifyPluginAsync } from 'fastify';
import { nanoid } from 'nanoid';
import { supabaseAdmin } from '../services/supabase.js';

interface ShareRequestBody {
  title: string;
  payload: Record<string, unknown>;
  creatorId?: string;
}

export const shareRoutes: FastifyPluginAsync = async (fastify) => {
  // In-memory fallback map if running offline/without database
  const localSheetsMap = new Map<string, { title: string; payload: unknown; views: number }>();

  // POST /api/share - Stores large sheet payload (>2 KB) and returns shortId
  fastify.post<{ Body: ShareRequestBody }>('/api/share', async (request, reply) => {
    const { title, payload, creatorId } = request.body || {};

    if (!title || !payload) {
      return reply.status(400).send({ error: 'Title and payload are required' });
    }

    const shortId = nanoid(8);

    if (!supabaseAdmin) {
      localSheetsMap.set(shortId, { title, payload, views: 0 });
      return reply.send({
        shortId,
        shareUrl: `/share/${shortId}`,
        message: 'Saved to in-memory store (offline mode)',
      });
    }

    try {
      const { error } = await supabaseAdmin.from('shared_sheets').insert({
        short_id: shortId,
        title,
        payload_json: payload,
        creator_id: creatorId || null,
      });

      if (error) {
        return reply.status(500).send({ error: error.message });
      }

      return reply.send({
        shortId,
        shareUrl: `/share/${shortId}`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(500).send({ error: message });
    }
  });

  // GET /api/share/:shortId - Retrieves shared sheet by shortId
  fastify.get<{ Params: { shortId: string } }>('/api/share/:shortId', async (request, reply) => {
    const { shortId } = request.params;

    if (!supabaseAdmin) {
      const sheet = localSheetsMap.get(shortId);
      if (!sheet) {
        return reply.status(404).send({ error: 'Shared sheet not found' });
      }
      sheet.views++;
      return reply.send(sheet);
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('shared_sheets')
        .select('*')
        .eq('short_id', shortId)
        .single();

      if (error || !data) {
        return reply.status(404).send({ error: 'Shared sheet not found' });
      }

      // Increment view count asynchronously
      supabaseAdmin
        .from('shared_sheets')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('short_id', shortId)
        .then();

      return reply.send({
        title: data.title,
        payload: data.payload_json,
        viewCount: data.view_count,
        createdAt: data.created_at,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(500).send({ error: message });
    }
  });
};
