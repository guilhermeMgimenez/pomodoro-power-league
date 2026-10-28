CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id)
);
CREATE UNIQUE INDEX friendships_pair_idx ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
GRANT SELECT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parties read friendships" ON public.friendships FOR SELECT TO authenticated USING (auth.uid() IN (requester_id, addressee_id));
CREATE POLICY "addressee accepts" ON public.friendships FOR UPDATE TO authenticated USING (auth.uid() = addressee_id) WITH CHECK (auth.uid() = addressee_id AND status = 'accepted');
CREATE POLICY "parties remove friendships" ON public.friendships FOR DELETE TO authenticated USING (auth.uid() IN (requester_id, addressee_id));

CREATE OR REPLACE FUNCTION public.send_friend_request(_email text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre para continuar.'; END IF;
  SELECT id INTO target FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF target IS NULL THEN RETURN 'not_found'; END IF;
  IF target = auth.uid() THEN RETURN 'self'; END IF;
  IF EXISTS (SELECT 1 FROM friendships WHERE LEAST(requester_id, addressee_id) = LEAST(auth.uid(), target) AND GREATEST(requester_id, addressee_id) = GREATEST(auth.uid(), target)) THEN RETURN 'exists'; END IF;
  INSERT INTO friendships (requester_id, addressee_id) VALUES (auth.uid(), target);
  RETURN 'sent';
END; $$;

CREATE OR REPLACE FUNCTION public.friend_requests()
RETURNS TABLE (id uuid, other_name text, status text, incoming boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id, COALESCE(p.display_name, ''), f.status, f.addressee_id = auth.uid()
  FROM friendships f
  JOIN profiles p ON p.id = CASE WHEN f.requester_id = auth.uid() THEN f.addressee_id ELSE f.requester_id END
  WHERE auth.uid() IN (f.requester_id, f.addressee_id)
  ORDER BY f.created_at;
$$;

CREATE OR REPLACE FUNCTION public.friend_leaderboard(_week_start timestamptz)
RETURNS TABLE (user_id uuid, display_name text, stardust integer, is_me boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH people AS (
    SELECT auth.uid() AS uid
    UNION SELECT CASE WHEN requester_id = auth.uid() THEN addressee_id ELSE requester_id END
    FROM friendships WHERE status = 'accepted' AND auth.uid() IN (requester_id, addressee_id)
  )
  SELECT pe.uid, COALESCE(p.display_name, ''),
    COALESCE((SELECT SUM(s.minutes)::int FROM focus_sessions s WHERE s.user_id = pe.uid AND s.mode = 'focus' AND s.completed_at >= _week_start AND s.completed_at < _week_start + interval '7 days'), 0),
    pe.uid = auth.uid()
  FROM people pe LEFT JOIN profiles p ON p.id = pe.uid
  WHERE auth.uid() IS NOT NULL;
$$;
REVOKE EXECUTE ON FUNCTION public.send_friend_request(text), public.friend_requests(), public.friend_leaderboard(timestamptz) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.send_friend_request(text), public.friend_requests(), public.friend_leaderboard(timestamptz) TO authenticated;