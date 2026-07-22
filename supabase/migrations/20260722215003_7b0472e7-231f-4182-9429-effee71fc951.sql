
DROP POLICY IF EXISTS "receipts owner upload" ON storage.objects;
CREATE POLICY "receipts owner upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "receipts owner read" ON storage.objects;
CREATE POLICY "receipts owner read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin')));

ALTER TABLE public.deposits REPLICA IDENTITY FULL;
ALTER TABLE public.withdrawals REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
