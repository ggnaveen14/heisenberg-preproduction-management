CREATE POLICY "Owners view project members" ON public.project_members
  FOR SELECT USING (public.is_project_owner(project_id));