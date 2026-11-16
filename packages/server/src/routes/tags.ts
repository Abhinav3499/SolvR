import type { FastifyPluginAsync } from 'fastify';
import { supabaseAdmin } from '../services/supabase.js';
import { DEFAULT_CURATED_TAGS } from '../workers/companyTagsWorker.js';

export const tagsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/tags/companies - List popular companies with tag counts
  fastify.get('/api/tags/companies', async (request, reply) => {
    if (!supabaseAdmin) {
      // Offline fallback: aggregate from DEFAULT_CURATED_TAGS
      const companies = Array.from(new Set(DEFAULT_CURATED_TAGS.map((t) => t.company))).map(
        (name) => ({
          company: name,
          count: DEFAULT_CURATED_TAGS.filter((t) => t.company === name).length,
        })
      );
      return reply.send({ companies });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('company_tags')
        .select('company_name');

      if (error || !data) {
        return reply.status(500).send({ error: 'Failed to fetch company tags' });
      }

      const counts = (data as Array<{ company_name: string }>).reduce(
        (acc: Record<string, number>, row) => {
          acc[row.company_name] = (acc[row.company_name] || 0) + 1;
          return acc;
        },
        {}
      );

      const companies = Object.entries(counts).map(([name, count]) => ({
        company: name,
        count,
      }));

      return reply.send({ companies });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(500).send({ error: message });
    }
  });

  // GET /api/tags/companies/:name - List problem slugs for a specific company
  fastify.get<{ Params: { name: string } }>('/api/tags/companies/:name', async (request, reply) => {
    const companyName = request.params.name;

    if (!supabaseAdmin) {
      const matched = DEFAULT_CURATED_TAGS.filter(
        (t) => t.company.toLowerCase() === companyName.toLowerCase()
      );
      return reply.send({ company: companyName, problems: matched });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('company_tags')
        .select('*')
        .ilike('company_name', companyName)
        .order('frequency_score', { ascending: false });

      if (error || !data) {
        return reply.status(500).send({ error: 'Failed to fetch problems for company' });
      }

      return reply.send({ company: companyName, problems: data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(500).send({ error: message });
    }
  });
};
