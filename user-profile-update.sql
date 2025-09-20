-- User Profile Update Script
-- This script updates the existing user_profiles table and adds missing components
-- Run this INSTEAD of the full migration if user_profiles table already exists

-- First, let's check if the view exists and drop it if it does
DROP VIEW IF EXISTS public.contacts_with_user_info;

-- Update the upsert_user_profile function to handle role-based positions
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  p_full_name text,
  p_phone_number text DEFAULT NULL,
  p_user_position text DEFAULT NULL
)
RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result public.user_profiles;
  user_role text;
  position_name text;
BEGIN
  -- Validate input
  IF p_full_name IS NULL OR trim(p_full_name) = '' THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;

  -- Get user role from auth metadata
  user_role := public.get_user_role();
  
  -- Map role to position if not explicitly provided
  IF p_user_position IS NULL THEN
    CASE user_role
      WHEN 'vp' THEN position_name := 'Vice President';
      WHEN 'officer' THEN position_name := 'Officer';
      ELSE position_name := 'Member';
    END CASE;
  ELSE
    position_name := p_user_position;
  END IF;

  -- Insert or update profile
  INSERT INTO public.user_profiles (user_id, full_name, phone_number, user_position)
  VALUES (auth.uid(), trim(p_full_name), p_phone_number, position_name)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    full_name = trim(p_full_name),
    phone_number = p_phone_number,
    user_position = position_name,
    updated_at = now()
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- Recreate the view for contact details with user profile information
CREATE OR REPLACE VIEW public.contacts_with_user_info AS
SELECT 
  c.*,
  up.full_name as added_by_name,
  up.user_position as added_by_position,
  up.phone_number as added_by_phone,
  au.email as added_by_email,
  au.created_at as added_by_account_created
FROM public.contacts c
LEFT JOIN public.user_profiles up ON c.added_by = up.user_id
LEFT JOIN auth.users au ON c.added_by = au.id;

-- Grant permissions on the view
GRANT SELECT ON public.contacts_with_user_info TO authenticated;

-- Create RLS policy for the view (inherits from contacts table policies)
ALTER VIEW public.contacts_with_user_info SET (security_barrier = true);

-- Update the get_user_profile function to ensure it works correctly
CREATE OR REPLACE FUNCTION public.get_user_profile(target_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  phone_number text,
  user_position text,
  email text,
  account_created timestamptz,
  profile_created timestamptz,
  profile_updated timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user has permission to view profiles
  IF NOT (
    auth.uid() = target_user_id OR 
    public.get_user_role() IN ('officer', 'vp')
  ) THEN
    RAISE EXCEPTION 'Access denied: insufficient permissions to view user profile';
  END IF;

  -- Check if user is approved (except for viewing own profile)
  IF auth.uid() != target_user_id AND NOT public.get_user_approval_status() THEN
    RAISE EXCEPTION 'Access denied: user not approved';
  END IF;

  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    up.full_name,
    up.phone_number,
    up.user_position,
    au.email::text,
    au.created_at as account_created,
    up.created_at as profile_created,
    up.updated_at as profile_updated
  FROM public.user_profiles up
  JOIN auth.users au ON up.user_id = au.id
  WHERE up.user_id = target_user_id;
END;
$$;

-- Ensure all necessary permissions are granted
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_profile(text, text, text) TO authenticated;

-- Add helpful comments
COMMENT ON VIEW public.contacts_with_user_info IS 'Contacts joined with user profile information for display purposes';
COMMENT ON FUNCTION public.get_user_profile(uuid) IS 'Securely retrieve user profile information with proper access control';
COMMENT ON FUNCTION public.upsert_user_profile(text, text, text) IS 'Create or update user profile with validation and role-based position mapping';

-- Verification queries (run these after update to verify setup)
/*
-- Verify the view was created
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' AND viewname = 'contacts_with_user_info';

-- Test the view (after creating some test data)
-- SELECT * FROM public.contacts_with_user_info LIMIT 5;

-- Verify functions exist
SELECT proname FROM pg_proc 
WHERE proname IN ('get_user_profile', 'upsert_user_profile');
*/