-- User Profile Enhancement Migration
-- This migration adds user profile fields and enhances contact tracking
-- Run this AFTER the initial supabase-migration.sql

-- Create user_profiles table to store additional user information
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone_number text,
  user_position text, -- e.g., "Alumni Relations Officer", "Vice President", etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles table

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own profile (only once)
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Officers and VPs can view all profiles (for contact attribution)
CREATE POLICY "Officers and VPs can view all profiles" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('officer', 'vp')
    AND public.get_user_approval_status() = true
  );

-- VPs can update any profile (for administrative purposes)
CREATE POLICY "VPs can update any profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (
    public.get_user_role() = 'vp'
    AND public.get_user_approval_status() = true
  );

-- Create view for contact details with user profile information
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

-- Create function to get user profile by user ID (for API use)
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
    au.email,
    au.created_at as account_created,
    up.created_at as profile_created,
    up.updated_at as profile_updated
  FROM public.user_profiles up
  JOIN auth.users au ON up.user_id = au.id
  WHERE up.user_id = target_user_id;
END;
$$;

-- Create function to create or update user profile
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

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_full_name ON public.user_profiles(full_name);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_profile(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;

-- Create trigger function to ensure user profile exists when user signs up
-- This will be handled by the application, but we can create a helper function
CREATE OR REPLACE FUNCTION public.ensure_user_profile_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This trigger would run on auth.users, but we can't create triggers on auth schema
  -- Instead, this will be handled by the application after user registration
  RETURN NEW;
END;
$$;

-- Add helpful comments
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information including full name, phone, and position';
COMMENT ON COLUMN public.user_profiles.full_name IS 'User''s full name as provided during registration';
COMMENT ON COLUMN public.user_profiles.phone_number IS 'User''s phone number (optional)';
COMMENT ON COLUMN public.user_profiles.user_position IS 'User''s position or title within the organization';
COMMENT ON VIEW public.contacts_with_user_info IS 'Contacts joined with user profile information for display purposes';
COMMENT ON FUNCTION public.get_user_profile(uuid) IS 'Securely retrieve user profile information with proper access control';
COMMENT ON FUNCTION public.upsert_user_profile(text, text, text) IS 'Create or update user profile with validation';

-- Verification queries (run these after migration to verify setup)
/*
-- Verify tables and functions were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_profiles';

SELECT viewname FROM pg_views 
WHERE schemaname = 'public' AND viewname = 'contacts_with_user_info';

SELECT proname FROM pg_proc 
WHERE proname IN ('get_user_profile', 'upsert_user_profile', 'update_updated_at_column');

-- Verify RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Test the view (after creating some test data)
-- SELECT * FROM public.contacts_with_user_info LIMIT 5;
*/