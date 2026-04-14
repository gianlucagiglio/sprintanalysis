-- Allow comment owners to delete their own comments
CREATE POLICY "Comment owners can delete" ON comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
