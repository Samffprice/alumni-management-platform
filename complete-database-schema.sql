-- Alumni Management Platform - Complete Database Schema
-- This script represents the current state of the database after all successful migrations
-- Run this script on a fresh Supabase project to recreate the complete schema

-- =============================================================================
-- ENUMS AND TYPES
-- =============================================================================

-- Create contact_type enum
CREATE TYPE contact_type_enum AS ENUM ('Alumni', 'Mentor', 'Other');

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Create contacts table
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone_number text,
  business_sector text,
  business_name text,
  business_details text,
  contact_type contact_type_enum NOT NULL DEFAULT 'Alumni',
  created_at timestamptz DEFAULT now(),
  added_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Create contact_meta table
CREATE TABLE public.contact_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  source_description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

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

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Create function to extract user role from JWT
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'app_metadata')::json ->> 'role',
    'member'
  );
END;
$$;

-- Create function to check if user is approved
CREATE OR REPLACE FUNCTION public.get_user_approval_status()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN COALESCE(
    ((auth.jwt() ->> 'app_metadata')::json ->> 'is_approved')::boolean,
    false
  );
END;
$$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

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
    au.email::text,
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

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Create trigger to automatically update updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- VIEWS
-- =============================================================================

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

-- Set security barrier on the view
ALTER VIEW public.contacts_with_user_info SET (security_barrier = true);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts table

-- Members can insert contacts (only if approved)
CREATE POLICY "Members can insert contacts" ON public.contacts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = added_by 
    AND public.get_user_role() IN ('member', 'officer', 'vp')
    AND public.get_user_approval_status() = true
  );

-- Members can view their own contacts (only if approved)
CREATE POLICY "Members can view own contacts" ON public.contacts
  FOR SELECT TO authenticated
  USING (
    added_by = auth.uid() 
    AND public.get_user_role() = 'member'
    AND public.get_user_approval_status() = true
  );

-- Officers and VPs can view all contacts (only if approved)
CREATE POLICY "Officers and VPs can view all contacts" ON public.contacts
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('officer', 'vp')
    AND public.get_user_approval_status() = true
  );

-- Officers and VPs can update contacts (only if approved)
CREATE POLICY "Officers and VPs can update contacts" ON public.contacts
  FOR UPDATE TO authenticated
  USING (
    public.get_user_role() IN ('officer', 'vp')
    AND public.get_user_approval_status() = true
  );

-- Only VPs can delete contacts (only if approved)
CREATE POLICY "VPs can delete contacts" ON public.contacts
  FOR DELETE TO authenticated
  USING (
    public.get_user_role() = 'vp'
    AND public.get_user_approval_status() = true
  );

-- RLS Policies for contact_meta table

-- Users can insert contact_meta for contacts they can insert
CREATE POLICY "Users can insert contact_meta for their contacts" ON public.contact_meta
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = contact_id 
      AND (
        (added_by = auth.uid() AND public.get_user_role() IN ('member', 'officer', 'vp'))
        OR public.get_user_role() IN ('officer', 'vp')
      )
    )
    AND public.get_user_approval_status() = true
  );

-- Members can view contact_meta for their own contacts
CREATE POLICY "Members can view own contact_meta" ON public.contact_meta
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = contact_id 
      AND added_by = auth.uid()
    )
    AND public.get_user_role() = 'member'
    AND public.get_user_approval_status() = true
  );

-- Officers and VPs can view all contact_meta
CREATE POLICY "Officers and VPs can view all contact_meta" ON public.contact_meta
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('officer', 'vp')
    AND public.get_user_approval_status() = true
  );

-- Officers and VPs can update contact_meta
CREATE POLICY "Officers and VPs can update contact_meta" ON public.contact_meta
  FOR UPDATE TO authenticated
  USING (
    public.get_user_role() IN ('officer', 'vp')
    AND public.get_user_approval_status() = true
  );

-- VPs can delete contact_meta
CREATE POLICY "VPs can delete contact_meta" ON public.contact_meta
  FOR DELETE TO authenticated
  USING (
    public.get_user_role() = 'vp'
    AND public.get_user_approval_status() = true
  );

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

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for contacts table
CREATE INDEX idx_contacts_added_by ON public.contacts(added_by);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_contact_type ON public.contacts(contact_type);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at);

-- Indexes for contact_meta table
CREATE INDEX idx_contact_meta_contact_id ON public.contact_meta(contact_id);

-- Indexes for user_profiles table
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_full_name ON public.user_profiles(full_name);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at);

-- =============================================================================
-- PERMISSIONS
-- =============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.contacts TO authenticated;
GRANT ALL ON public.contact_meta TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.contacts_with_user_info TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_approval_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_profile(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================

-- Add helpful comments
COMMENT ON TABLE public.contacts IS 'Alumni and mentor contact information with role-based access control';
COMMENT ON TABLE public.contact_meta IS 'Additional metadata for contacts including source information';
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information including full name, phone, and position';
COMMENT ON VIEW public.contacts_with_user_info IS 'Contacts joined with user profile information for display purposes';

COMMENT ON FUNCTION public.get_user_role() IS 'Extract user role from JWT token with default fallback';
COMMENT ON FUNCTION public.get_user_approval_status() IS 'Check if user is approved from JWT token';
COMMENT ON FUNCTION public.get_user_profile(uuid) IS 'Securely retrieve user profile information with proper access control';
COMMENT ON FUNCTION public.upsert_user_profile(text, text, text) IS 'Create or update user profile with validation and role-based position mapping';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

/*
-- Run these queries after setup to verify everything is working:

-- 1. Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('contacts', 'contact_meta', 'user_profiles');

-- 2. Verify view was created
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' AND viewname = 'contacts_with_user_info';

-- 3. Verify functions exist
SELECT proname FROM pg_proc 
WHERE proname IN ('get_user_role', 'get_user_approval_status', 'get_user_profile', 'upsert_user_profile');

-- 4. Verify RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE tablename IN ('contacts', 'contact_meta', 'user_profiles')
ORDER BY tablename, policyname;

-- 5. Test utility functions (should work when authenticated)
SELECT public.get_user_role() AS current_user_role;
SELECT public.get_user_approval_status() AS current_user_approved;

-- 6. Verify indexes
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('contacts', 'contact_meta', 'user_profiles')
ORDER BY tablename, indexname;
*/