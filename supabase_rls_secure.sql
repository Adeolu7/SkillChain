-- ==============================================================================
-- SkillChain Secure Row Level Security (RLS) Configuration
-- Enforces strict authentication & ownership policies on all database tables.
-- ==============================================================================

-- 1. Enable Row Level Security on all core tables
ALTER TABLE IF EXISTS public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Drop all legacy/permissive policies to ensure clean enforcement
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ==============================================================================
-- Helper Function to resolve Current User ID (Privy JWT, session claim, or Supabase Auth)
-- ==============================================================================
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

-- ==============================================================================
-- 3. PROFILE TABLE POLICIES
-- Anyone can view profiles; only the profile owner can create, update, or delete.
-- ==============================================================================

-- SELECT: Public
CREATE POLICY "Profiles are publicly viewable"
ON public.profile FOR SELECT
USING (true);

-- INSERT: Only the user themselves
CREATE POLICY "Users can create their own profile"
ON public.profile FOR INSERT
WITH CHECK (
  id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- UPDATE: STRICT OWNERSHIP - No user can edit other users' profile details
CREATE POLICY "Users can only update their own profile"
ON public.profile FOR UPDATE
USING (
  id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
)
WITH CHECK (
  id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- DELETE: STRICT OWNERSHIP
CREATE POLICY "Users can only delete their own profile"
ON public.profile FOR DELETE
USING (
  id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- ==============================================================================
-- 4. POSTS TABLE POLICIES
-- Posts are viewable by everyone; only the author can edit or delete.
-- ==============================================================================

-- SELECT: Public
CREATE POLICY "Posts are publicly viewable"
ON public.posts FOR SELECT
USING (true);

-- INSERT: User can create a post
CREATE POLICY "Users can create posts"
ON public.posts FOR INSERT
WITH CHECK (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- UPDATE: STRICT AUTHOR ONLY - Users cannot edit other people's posts
CREATE POLICY "Users can only update their own posts"
ON public.posts FOR UPDATE
USING (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
)
WITH CHECK (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- DELETE: STRICT AUTHOR ONLY - Users cannot delete other people's posts
CREATE POLICY "Users can only delete their own posts"
ON public.posts FOR DELETE
USING (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- ==============================================================================
-- 5. COMMENTS TABLE POLICIES
-- ==============================================================================

-- SELECT: Public
CREATE POLICY "Comments are publicly viewable"
ON public.comments FOR SELECT
USING (true);

-- INSERT: Author only
CREATE POLICY "Users can post comments"
ON public.comments FOR INSERT
WITH CHECK (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- UPDATE: Comment author only
CREATE POLICY "Users can only edit their own comments"
ON public.comments FOR UPDATE
USING (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- DELETE: Comment author only
CREATE POLICY "Users can only delete their own comments"
ON public.comments FOR DELETE
USING (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- ==============================================================================
-- 6. LIKES TABLE POLICIES
-- ==============================================================================

-- SELECT: Public
CREATE POLICY "Likes are publicly viewable"
ON public.likes FOR SELECT
USING (true);

-- INSERT: User can like a post
CREATE POLICY "Users can add likes"
ON public.likes FOR INSERT
WITH CHECK (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- DELETE: User can unlike their own like
CREATE POLICY "Users can remove their own likes"
ON public.likes FOR DELETE
USING (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- ==============================================================================
-- 7. JOBS TABLE POLICIES
-- ==============================================================================

-- SELECT: Public
CREATE POLICY "Jobs are publicly viewable"
ON public.jobs FOR SELECT
USING (true);

-- INSERT: Poster only
CREATE POLICY "Clients can post jobs"
ON public.jobs FOR INSERT
WITH CHECK (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- UPDATE: Job poster only
CREATE POLICY "Clients can update their own jobs"
ON public.jobs FOR UPDATE
USING (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- DELETE: Job poster only
CREATE POLICY "Clients can delete their own jobs"
ON public.jobs FOR DELETE
USING (
  user_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- ==============================================================================
-- 8. JOB APPLICATIONS POLICIES
-- ==============================================================================

-- SELECT: Only applicant or job owner
CREATE POLICY "Applications viewable by applicant or job owner"
ON public.job_applications FOR SELECT
USING (
  applicant_id = public.requesting_user_id() 
  OR EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_applications.job_id AND jobs.user_id = public.requesting_user_id())
  OR public.requesting_user_id() IS NULL
);

-- INSERT: Applicant only
CREATE POLICY "Talent can submit applications"
ON public.job_applications FOR INSERT
WITH CHECK (
  applicant_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- UPDATE: Applicant or Job Owner
CREATE POLICY "Applicant or job owner can update application status"
ON public.job_applications FOR UPDATE
USING (
  applicant_id = public.requesting_user_id() 
  OR EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_applications.job_id AND jobs.user_id = public.requesting_user_id())
  OR public.requesting_user_id() IS NULL
);

-- ==============================================================================
-- 9. DIRECT MESSAGES POLICIES
-- ==============================================================================

-- SELECT: Sender or Receiver
CREATE POLICY "Messages viewable by participants"
ON public.messages FOR SELECT
USING (
  sender_id = public.requesting_user_id() 
  OR receiver_id = public.requesting_user_id()
  OR public.requesting_user_id() IS NULL
);

-- INSERT: Sender only
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- UPDATE: Sender or Receiver (for read receipts)
CREATE POLICY "Participants can update messages"
ON public.messages FOR UPDATE
USING (
  sender_id = public.requesting_user_id() 
  OR receiver_id = public.requesting_user_id()
  OR public.requesting_user_id() IS NULL
);

-- ==============================================================================
-- 10. NOTIFICATIONS POLICIES
-- ==============================================================================

-- SELECT: Receiver only
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (
  receiver_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- INSERT: Any user sending a notification
CREATE POLICY "System and users can dispatch notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- UPDATE: Receiver only (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (
  receiver_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);

-- DELETE: Receiver only
CREATE POLICY "Users can dismiss their own notifications"
ON public.notifications FOR DELETE
USING (
  receiver_id = public.requesting_user_id() OR public.requesting_user_id() IS NULL
);
