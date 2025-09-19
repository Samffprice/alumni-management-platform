-- Test script for Row Level Security policies
-- This script helps verify that RLS policies are working correctly

-- Note: This script should be run by different users with different roles
-- to properly test the RLS policies

-- Test 1: Verify enum values
SELECT unnest(enum_range(NULL::contact_type_enum)) AS contact_types;

-- Test 2: Check if functions exist and work
SELECT public.get_user_role() AS current_user_role;
SELECT public.get_user_approval_status() AS current_user_approved;

-- Test 3: Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('contacts', 'contact_meta');

-- Test 4: List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('contacts', 'contact_meta')
ORDER BY tablename, policyname;

-- Test 5: Insert test data (should work for approved users)
-- This will only work if the current user is approved
INSERT INTO public.contacts (name, email, contact_type, added_by) 
VALUES ('Test Contact', 'test@example.com', 'Alumni', auth.uid());

-- Test 6: Try to view contacts (results depend on user role)
SELECT id, name, email, contact_type, added_by 
FROM public.contacts 
LIMIT 5;

-- Test 7: Count contacts visible to current user
SELECT COUNT(*) as visible_contacts FROM public.contacts;

-- Test 8: Try to insert contact_meta
-- Get the ID of a contact first
WITH latest_contact AS (
  SELECT id FROM public.contacts ORDER BY created_at DESC LIMIT 1
)
INSERT INTO public.contact_meta (contact_id, source_description)
SELECT id, 'Test source description'
FROM latest_contact;

-- Test 9: View contact_meta
SELECT cm.id, cm.source_description, c.name, c.email
FROM public.contact_meta cm
JOIN public.contacts c ON cm.contact_id = c.id
LIMIT 5;

-- Cleanup test data (only VPs should be able to delete)
-- DELETE FROM public.contacts WHERE email = 'test@example.com';