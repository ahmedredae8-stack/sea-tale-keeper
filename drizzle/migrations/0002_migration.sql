DO $$ DECLARE c text; BEGIN
  FOR c IN SELECT conname FROM pg_constraint WHERE conrelid='public.artwork_poses'::regclass AND contype='c' LOOP
    EXECUTE format('ALTER TABLE public.artwork_poses DROP CONSTRAINT %I', c);
  END LOOP; END $$;
ALTER TABLE public.artwork_poses ADD CONSTRAINT artwork_category_chk CHECK (category IN ('ship','rocket','background'));
ALTER TABLE public.artwork_poses ADD CONSTRAINT artwork_pose_chk CHECK (pose IN ('idle','cast','submerged','haul','flight','explosion','fire','smoke','fade','day','night'));