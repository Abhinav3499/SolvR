-- ==============================================================================
-- SolvR Platform Enrichment Migration
-- Adds company tags, in-app notifications, user reminder settings,
-- hybrid shared sheets, sync metadata, and Realtime publications.
-- ==============================================================================

-- 1. Curated Company Tags Table
CREATE TABLE IF NOT EXISTS public.company_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL DEFAULT 'LeetCode',
  problem_slug TEXT NOT NULL,
  company_name TEXT NOT NULL,
  frequency_score NUMERIC(5,2) DEFAULT 1.0,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_platform_problem_company UNIQUE(platform, problem_slug, company_name)
);

CREATE INDEX IF NOT EXISTS idx_company_tags_lookup ON public.company_tags (company_name, platform);
CREATE INDEX IF NOT EXISTS idx_company_tags_slug ON public.company_tags (problem_slug);

ALTER TABLE public.company_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for company tags"
  ON public.company_tags FOR SELECT
  USING (true);

-- 2. In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'spaced_repetition', 'streak_risk', 'company_update', 'system'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. User Notification & Reminder Preferences Table
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_reminders_enabled BOOLEAN DEFAULT TRUE,
  preferred_reminder_hour_utc SMALLINT DEFAULT 8 CHECK (preferred_reminder_hour_utc BETWEEN 0 AND 23),
  reminder_frequency TEXT DEFAULT 'daily' CHECK (reminder_frequency IN ('daily', 'weekly')),
  unsubscribe_token UUID DEFAULT gen_random_uuid(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification settings"
  ON public.user_notification_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Hybrid Shared Sheets Table (for payloads > 2 KB)
CREATE TABLE IF NOT EXISTS public.shared_sheets (
  short_id TEXT PRIMARY KEY, -- 8-character nanoid
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '180 days')
);

CREATE INDEX IF NOT EXISTS idx_shared_sheets_created ON public.shared_sheets (created_at DESC);

ALTER TABLE public.shared_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for shared sheets"
  ON public.shared_sheets FOR SELECT
  USING (true);

CREATE POLICY "Users can insert shared sheets"
  ON public.shared_sheets FOR INSERT
  WITH CHECK (true);

-- 5. Sync Metadata Table (stores Git commit SHA and crawler state)
CREATE TABLE IF NOT EXISTS public.sync_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for sync metadata"
  ON public.sync_metadata FOR SELECT
  USING (true);

-- 6. Realtime Publication Enablement
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
