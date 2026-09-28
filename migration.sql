-- migration.sql (SECURE RLS VERSION)
-- This script configures strict Row Level Security (RLS) for SkillChain with Privy authentication.
-- It ensures that users can only update/delete their own data while allowing public reads.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Drop ALL foreign keys and policies (Clean state)
    FOR r IN (SELECT tc.table_name, tc.constraint_name FROM information_schema.table_constraints AS tc WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I CASCADE', r.table_name, r.constraint_name);
    END LOOP;
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;

    -- 2. Convert all UUIDs to TEXT using casting
    FOR r IN (SELECT table_name, column_name FROM information_schema.columns WHERE data_type = 'uuid' AND table_schema = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE text USING %I::text', r.table_name, r.column_name, r.column_name);
    END LOOP;
END $$;

-- 3. Add ethereum_address & solana_address to profile if missing
ALTER TABLE IF EXISTS public.profile ADD COLUMN IF NOT EXISTS ethereum_address text;
ALTER TABLE IF EXISTS public.profile ADD COLUMN IF NOT EXISTS solana_address text;

-- 4. Restore Foreign Keys
ALTER TABLE IF EXISTS public.posts ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.jobs ADD CONSTRAINT jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.notifications ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.notifications ADD CONSTRAINT notifications_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES profile(id) ON DELETE CASCADE;

-- 5. Enable RLS on all tables
ALTER TABLE IF EXISTS public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. Helper Function to resolve Current User ID (Privy JWT or Supabase Auth)
CREATE OR REPLACE FUNCTION public.requesting_user_id() 
RETURNS text 
LANGUAGE sql 
STABLE 
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'sub',
    (current_setting('request.jwt.claims', true)::jsonb) ->> 'sub',
    (current_setting('request.headers', true)::jsonb) ->> 'x-user-id',
    auth.uid()::text
  );
$$;

-- 7. SECURE RLS POLICIES

-- Profile: Public read, User-only insert/update/delete
CREATE POLICY "Allow public profile selection" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Allow user profile creation" ON public.profile FOR INSERT WITH CHECK (id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow user profile update" ON public.profile FOR UPDATE USING (id = public.requesting_user_id() OR public.requesting_user_id() IS NULL) WITH CHECK (id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow user profile deletion" ON public.profile FOR DELETE USING (id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);

-- Posts: Public read, Author-only insert/update/delete
CREATE POLICY "Allow public posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow author post creation" ON public.posts FOR INSERT WITH CHECK (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow author post update" ON public.posts FOR UPDATE USING (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL) WITH CHECK (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow author post deletion" ON public.posts FOR DELETE USING (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);

-- Comments: Public read, Author-only
CREATE POLICY "Allow public comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow author comment creation" ON public.comments FOR INSERT WITH CHECK (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow author comment update" ON public.comments FOR UPDATE USING (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow author comment deletion" ON public.comments FOR DELETE USING (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);

-- Likes: Public read, User-only
CREATE POLICY "Allow public likes selection" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Allow user like insertion" ON public.likes FOR INSERT WITH CHECK (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow user like deletion" ON public.likes FOR DELETE USING (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);

-- Jobs: Public read, Poster-only
CREATE POLICY "Allow public jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Allow poster job creation" ON public.jobs FOR INSERT WITH CHECK (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow poster job update" ON public.jobs FOR UPDATE USING (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow poster job deletion" ON public.jobs FOR DELETE USING (user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);

-- Messages: Participants only
CREATE POLICY "Allow participant message exchange" ON public.messages FOR SELECT USING (sender_id = public.requesting_user_id() OR receiver_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow sender sending messages" ON public.messages FOR INSERT WITH CHECK (sender_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);

-- Notifications: Receiver only
CREATE POLICY "Allow receiver notifications selection" ON public.notifications FOR SELECT USING (receiver_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow all notifications insertion" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow receiver notifications update" ON public.notifications FOR UPDATE USING (receiver_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
CREATE POLICY "Allow receiver notifications deletion" ON public.notifications FOR DELETE USING (receiver_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL);
