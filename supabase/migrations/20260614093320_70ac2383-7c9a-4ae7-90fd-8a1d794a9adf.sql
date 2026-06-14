
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'student-documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view their documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'student-documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update their documents" ON storage.objects FOR UPDATE
  USING (bucket_id = 'student-documents' AND auth.uid() IS NOT NULL);
