import dotenv from 'dotenv';
dotenv.config();

export interface ServerConfig {
  port: number;
  host: string;
  redisUrl: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  resendApiKey: string;
  githubToken?: string;
  nodeEnv: string;
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  githubToken: process.env.GITHUB_TOKEN,
  nodeEnv: process.env.NODE_ENV || 'development',
};
