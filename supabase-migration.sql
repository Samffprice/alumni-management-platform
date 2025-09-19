-- Alumni Management Platform Database Migration
-- This script sets up the complete database schema with RLS policies

-- Create contact_type enum
CREATE TYPE contact_type_enum AS ENUM ('Alumni', 'Mentor', 'Other');

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

-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on contact_meta table
ALTER TABLE public.contact_meta ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for better performance
CREATE INDEX idx_contacts_added_by ON public.contacts(added_by);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_contact_type ON public.contacts(contact_type);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at);
CREATE INDEX idx_contact_meta_contact_id ON public.contact_meta(contact_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.contacts TO authenticated;
GRANT ALL ON public.contact_meta TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_approval_status() TO authenticated;