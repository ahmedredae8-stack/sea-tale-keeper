ALTER POLICY "admins upload artwork files" ON storage.objects WITH CHECK (bucket_id = 'game-artwork' AND private.has_role(auth.uid(), 'admin') AND (storage.foldername(name))[1] = auth.uid()::text AND lower(storage.extension(name)) IN ('png','jpg','jpeg','webp','mp4','webm'));
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='artwork_poses') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.artwork_poses;
  END IF;
END $$;