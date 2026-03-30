-- Row Level Security for Supabase (PostgREST / anon / authenticated JWT).
-- Prisma uses the direct postgres connection as table owner and bypasses RLS.
-- Policies assume Supabase Auth users exist with the same email as portal User rows.

-- Helpers (SECURITY DEFINER so they can read User / StudioTeamMember under RLS)
CREATE OR REPLACE FUNCTION public.app_jwt_email()
RETURNS TEXT AS $$
  SELECT LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')));
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_current_user_id()
RETURNS TEXT AS $$
  SELECT u.id FROM "User" u
  WHERE LOWER(u.email) = public.app_jwt_email()
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_is_issy()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "User" u
    INNER JOIN "StudioTeamMember" s ON s."userId" = u.id
    WHERE s."personaSlug" = 'isabella' AND LOWER(u.email) = public.app_jwt_email()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_is_harriet()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "User" u
    INNER JOIN "StudioTeamMember" s ON s."userId" = u.id
    WHERE s."personaSlug" = 'harriet' AND LOWER(u.email) = public.app_jwt_email()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_is_may()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "User" u
    INNER JOIN "StudioTeamMember" s ON s."userId" = u.id
    WHERE s."personaSlug" = 'may' AND LOWER(u.email) = public.app_jwt_email()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_harriet_user_id()
RETURNS TEXT AS $$
  SELECT u.id FROM "User" u
  INNER JOIN "StudioTeamMember" s ON s."userId" = u.id
  WHERE s."personaSlug" = 'harriet' LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_may_user_id()
RETURNS TEXT AS $$
  SELECT u.id FROM "User" u
  INNER JOIN "StudioTeamMember" s ON s."userId" = u.id
  WHERE s."personaSlug" = 'may' LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Project visibility for studio personas (JWT / Data API)
CREATE OR REPLACE FUNCTION public.app_project_visible_studio(p_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "Project" p WHERE p.id = p_id AND (
      public.app_is_issy()
      OR (public.app_is_harriet() AND p."assignedStudioUserId" = public.app_harriet_user_id())
      OR (
        public.app_is_may()
        AND p."assignedStudioUserId" = public.app_may_user_id()
        AND p."portalKind" IN ('SOCIAL', 'MULTI')
      )
    )
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_project_visible_client(p_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "Project" pr
    WHERE pr.id = p_id
      AND pr."userId" IS NOT NULL
      AND pr."userId" = public.app_current_user_id()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_project_visible(p_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT public.app_project_visible_client(p_id) OR public.app_project_visible_studio(p_id);
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Enable RLS on all app tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectInternalNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserBrandKit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClientNotification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudioTeamMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudioTeamChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudioNotification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudioAgencyInboxDismissal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgencyTodo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudioTimeOff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectQuote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PublishedClientReview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatQuestionStat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FaqSuggestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteFaq" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebsitePageBrief" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContentCalendarItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReviewAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectMessage" ENABLE ROW LEVEL SECURITY;

-- ---------- User ----------
DROP POLICY IF EXISTS "user_self_or_issy" ON "User";
CREATE POLICY "user_self_or_issy" ON "User" FOR ALL TO authenticated
  USING (id = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK (id = public.app_current_user_id() OR public.app_is_issy());

DROP POLICY IF EXISTS "user_studio_harriet_may_read" ON "User";
CREATE POLICY "user_studio_harriet_may_read" ON "User" FOR SELECT TO authenticated
  USING (
    public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p."assignedStudioUserId" = public.app_harriet_user_id()
          AND (p."userId" = "User".id OR LOWER(p."invitedClientEmail") = LOWER("User".email))
      )
    )
    OR (
      public.app_is_may()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p."assignedStudioUserId" = public.app_may_user_id()
          AND p."portalKind" IN ('SOCIAL', 'MULTI')
          AND (p."userId" = "User".id OR LOWER(p."invitedClientEmail") = LOWER("User".email))
      )
    )
  );

-- Harriet/May write on User: Issy-only for broad writes (policy above limits FOR ALL)
-- Split: clients update self; Issy all; Harriet/May only SELECT via second policy
DROP POLICY IF EXISTS "user_no_broad_write_harriet_may" ON "User";
CREATE POLICY "user_no_broad_write_harriet_may" ON "User" FOR UPDATE TO authenticated
  USING (public.app_is_issy() OR id = public.app_current_user_id())
  WITH CHECK (public.app_is_issy() OR id = public.app_current_user_id());

DROP POLICY IF EXISTS "user_insert_issy" ON "User";
CREATE POLICY "user_insert_issy" ON "User" FOR INSERT TO authenticated
  WITH CHECK (public.app_is_issy());

-- ---------- Project ----------
DROP POLICY IF EXISTS "project_access" ON "Project";
CREATE POLICY "project_access" ON "Project" FOR ALL TO authenticated
  USING (
    ("userId" IS NOT NULL AND "userId" = public.app_current_user_id())
    OR public.app_is_issy()
    OR (public.app_is_harriet() AND "assignedStudioUserId" = public.app_harriet_user_id())
    OR (
      public.app_is_may()
      AND "assignedStudioUserId" = public.app_may_user_id()
      AND "portalKind" IN ('SOCIAL', 'MULTI')
    )
  )
  WITH CHECK (
    public.app_is_issy()
    OR ("userId" IS NOT NULL AND "userId" = public.app_current_user_id())
    OR (public.app_is_harriet() AND "assignedStudioUserId" = public.app_harriet_user_id())
    OR (
      public.app_is_may()
      AND "assignedStudioUserId" = public.app_may_user_id()
      AND "portalKind" IN ('SOCIAL', 'MULTI')
    )
  );

-- Child tables: project-scoped
DROP POLICY IF EXISTS "p_child" ON "ProjectInternalNote";

DROP POLICY IF EXISTS "ubk_self" ON "UserBrandKit";
CREATE POLICY "ubk_self" ON "UserBrandKit" FOR ALL TO authenticated
  USING ("userId" = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK ("userId" = public.app_current_user_id() OR public.app_is_issy());

DROP POLICY IF EXISTS "cn_self" ON "ClientNotification";
CREATE POLICY "cn_self" ON "ClientNotification" FOR ALL TO authenticated
  USING ("userId" = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK ("userId" = public.app_current_user_id() OR public.app_is_issy());

DROP POLICY IF EXISTS "stm_self_issy" ON "StudioTeamMember";
CREATE POLICY "stm_self_issy" ON "StudioTeamMember" FOR ALL TO authenticated
  USING ("userId" = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK (public.app_is_issy());

DROP POLICY IF EXISTS "stcm_studio" ON "StudioTeamChatMessage";
CREATE POLICY "stcm_studio" ON "StudioTeamChatMessage" FOR ALL TO authenticated
  USING (
    public.app_is_issy()
    OR public.app_is_harriet()
    OR public.app_is_may()
  )
  WITH CHECK (
    public.app_is_issy()
    OR public.app_is_harriet()
    OR public.app_is_may()
  );

DROP POLICY IF EXISTS "sn_self_issy" ON "StudioNotification";
CREATE POLICY "sn_self_issy" ON "StudioNotification" FOR ALL TO authenticated
  USING ("userId" = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK ("userId" = public.app_current_user_id() OR public.app_is_issy());

DROP POLICY IF EXISTS "said_studio" ON "StudioAgencyInboxDismissal";
CREATE POLICY "said_studio" ON "StudioAgencyInboxDismissal" FOR ALL TO authenticated
  USING (
    "userId" = public.app_current_user_id()
    OR public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId" AND p."assignedStudioUserId" = public.app_harriet_user_id()
      )
    )
    OR (
      public.app_is_may()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId"
          AND p."assignedStudioUserId" = public.app_may_user_id()
          AND p."portalKind" IN ('SOCIAL', 'MULTI')
      )
    )
  )
  WITH CHECK (
    "userId" = public.app_current_user_id()
    OR public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId" AND p."assignedStudioUserId" = public.app_harriet_user_id()
      )
    )
    OR (
      public.app_is_may()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId"
          AND p."assignedStudioUserId" = public.app_may_user_id()
          AND p."portalKind" IN ('SOCIAL', 'MULTI')
      )
    )
  );

DROP POLICY IF EXISTS "at_studio" ON "AgencyTodo";
CREATE POLICY "at_studio" ON "AgencyTodo" FOR ALL TO authenticated
  USING (
    "assigneeUserId" = public.app_current_user_id()
    OR public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND "assigneeUserId" = public.app_harriet_user_id()
    )
    OR (
      public.app_is_may()
      AND "assigneeUserId" = public.app_may_user_id()
    )
  )
  WITH CHECK (
    public.app_is_issy()
    OR "assigneeUserId" = public.app_current_user_id()
    OR (
      public.app_is_harriet()
      AND "assigneeUserId" = public.app_harriet_user_id()
    )
    OR (
      public.app_is_may()
      AND "assigneeUserId" = public.app_may_user_id()
    )
  );

DROP POLICY IF EXISTS "sto_self" ON "StudioTimeOff";
CREATE POLICY "sto_self" ON "StudioTimeOff" FOR ALL TO authenticated
  USING ("userId" = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK ("userId" = public.app_current_user_id() OR public.app_is_issy());

DROP POLICY IF EXISTS "pq_project" ON "ProjectQuote";
CREATE POLICY "pq_project" ON "ProjectQuote" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));

DROP POLICY IF EXISTS "pcr_project" ON "PublishedClientReview";
CREATE POLICY "pcr_project" ON "PublishedClientReview" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));

DROP POLICY IF EXISTS "wpb_project" ON "WebsitePageBrief";
CREATE POLICY "wpb_project" ON "WebsitePageBrief" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));

DROP POLICY IF EXISTS "cci_project" ON "ContentCalendarItem";
CREATE POLICY "cci_project" ON "ContentCalendarItem" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));

DROP POLICY IF EXISTS "ra_project" ON "ReviewAsset";
CREATE POLICY "ra_project" ON "ReviewAsset" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));

DROP POLICY IF EXISTS "pm_project" ON "ProjectMessage";
CREATE POLICY "pm_project" ON "ProjectMessage" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));

DROP POLICY IF EXISTS "pin_project" ON "ProjectInternalNote";
CREATE POLICY "pin_project" ON "ProjectInternalNote" FOR ALL TO authenticated
  USING (
    public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId" AND p."assignedStudioUserId" = public.app_harriet_user_id()
      )
    )
    OR (
      public.app_is_may()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId"
          AND p."assignedStudioUserId" = public.app_may_user_id()
          AND p."portalKind" IN ('SOCIAL', 'MULTI')
      )
    )
  )
  WITH CHECK (
    public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId" AND p."assignedStudioUserId" = public.app_harriet_user_id()
      )
    )
    OR (
      public.app_is_may()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId"
          AND p."assignedStudioUserId" = public.app_may_user_id()
          AND p."portalKind" IN ('SOCIAL', 'MULTI')
      )
    )
  );

-- Marketing / admin stats: Issy only (studio); block clients from mutating others' data
DROP POLICY IF EXISTS "cqs_issy" ON "ChatQuestionStat";
CREATE POLICY "cqs_issy" ON "ChatQuestionStat" FOR ALL TO authenticated
  USING (public.app_is_issy())
  WITH CHECK (public.app_is_issy());

DROP POLICY IF EXISTS "fs_issy" ON "FaqSuggestion";
CREATE POLICY "fs_issy" ON "FaqSuggestion" FOR ALL TO authenticated
  USING (public.app_is_issy())
  WITH CHECK (public.app_is_issy());

DROP POLICY IF EXISTS "sf_public_read_issy_write" ON "SiteFaq";
CREATE POLICY "sf_public_read_issy_write" ON "SiteFaq" FOR SELECT TO authenticated
  USING (true);
DROP POLICY IF EXISTS "sf_issy_write" ON "SiteFaq";
CREATE POLICY "sf_issy_write" ON "SiteFaq" FOR INSERT TO authenticated
  WITH CHECK (public.app_is_issy());
DROP POLICY IF EXISTS "sf_issy_update" ON "SiteFaq";
CREATE POLICY "sf_issy_update" ON "SiteFaq" FOR UPDATE TO authenticated
  USING (public.app_is_issy())
  WITH CHECK (public.app_is_issy());
DROP POLICY IF EXISTS "sf_issy_delete" ON "SiteFaq";
CREATE POLICY "sf_issy_delete" ON "SiteFaq" FOR DELETE TO authenticated
  USING (public.app_is_issy());
