-- ============ project_members table ============
CREATE TABLE public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  member_user_id uuid,
  invited_email text NOT NULL,
  role app_role NOT NULL DEFAULT 'assistant_director',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, invited_email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;

-- ============ access-control functions ============
CREATE OR REPLACE FUNCTION public.is_project_owner(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.projects WHERE id = _project_id AND user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.can_access_project(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.projects WHERE id = _project_id AND user_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.project_members m
        WHERE m.project_id = _project_id
          AND m.status = 'active'
          AND (m.member_user_id = auth.uid()
               OR lower(m.invited_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
      )
$$;

REVOKE EXECUTE ON FUNCTION public.is_project_owner(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_access_project(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_owner(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_access_project(uuid) TO service_role;

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage project members" ON public.project_members
  FOR ALL USING (public.is_project_owner(project_id)) WITH CHECK (public.is_project_owner(project_id));

CREATE POLICY "Members view own membership" ON public.project_members
  FOR SELECT USING (
    member_user_id = auth.uid()
    OR lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

CREATE TRIGGER update_project_members_updated_at BEFORE UPDATE ON public.project_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ costumes table (separate department) ============
CREATE TABLE public.costumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  character_name text,
  actor_name text,
  scene_references text,
  size text,
  status text DEFAULT 'Designed',
  responsible_person text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.costumes TO authenticated;
GRANT ALL ON public.costumes TO service_role;

ALTER TABLE public.costumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can manage costumes" ON public.costumes
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

CREATE TRIGGER update_costumes_updated_at BEFORE UPDATE ON public.costumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ open module tables to team members ============
DROP POLICY "Users manage own attachments" ON public.attachments;
CREATE POLICY "Team manage attachments" ON public.attachments
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

DROP POLICY "Users manage own call sheets" ON public.call_sheets;
CREATE POLICY "Team manage call sheets" ON public.call_sheets
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

DROP POLICY "Users manage own characters" ON public.characters;
CREATE POLICY "Team manage characters" ON public.characters
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

DROP POLICY "Users manage own exports" ON public.export_history;
CREATE POLICY "Team manage exports" ON public.export_history
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

DROP POLICY "Users manage own locations" ON public.locations;
CREATE POLICY "Team manage locations" ON public.locations
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

DROP POLICY "Users manage own notes" ON public.production_notes;
CREATE POLICY "Team manage notes" ON public.production_notes
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

DROP POLICY "Users manage own props" ON public.props_costumes;
CREATE POLICY "Team manage props" ON public.props_costumes
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

DROP POLICY "Users manage own scripts" ON public.scripts;
CREATE POLICY "Team manage scripts" ON public.scripts
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

DROP POLICY "Users manage own schedule" ON public.shooting_schedule;
CREATE POLICY "Team manage schedule" ON public.shooting_schedule
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

DROP POLICY "Users manage own beats" ON public.story_beats;
CREATE POLICY "Team manage beats" ON public.story_beats
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

DROP POLICY "Users manage own storyboards" ON public.storyboards;
CREATE POLICY "Team manage storyboards" ON public.storyboards
  FOR ALL USING (public.can_access_project(project_id)) WITH CHECK (public.can_access_project(project_id));

-- ============ let members view shared projects ============
CREATE POLICY "Members view shared projects" ON public.projects
  FOR SELECT USING (public.can_access_project(id));