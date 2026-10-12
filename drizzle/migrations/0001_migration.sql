INSERT INTO public.user_roles(user_id, role) VALUES ('ac66c52f-baaf-4d8f-a54d-95e8d5b72094','admin') ON CONFLICT DO NOTHING;

CREATE TABLE public.ship_overrides (
  product_id text PRIMARY KEY,
  name text,
  description text,
  price integer,
  hidden boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ship_overrides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ship_overrides TO authenticated;
GRANT ALL ON public.ship_overrides TO service_role;
ALTER TABLE public.ship_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view overrides" ON public.ship_overrides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write overrides" ON public.ship_overrides FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

CREATE TABLE public.catches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  fish_id text NOT NULL,
  qty integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.catches TO authenticated;
GRANT ALL ON public.catches TO service_role;
ALTER TABLE public.catches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own catches read" ON public.catches FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own catches add" ON public.catches FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND qty BETWEEN 1 AND 50);
CREATE POLICY "own catches sell" ON public.catches FOR DELETE TO authenticated USING (user_id = auth.uid());