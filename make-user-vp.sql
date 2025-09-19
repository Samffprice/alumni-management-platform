-- Script to make a user a VP with approval
-- Replace 'USER_ID_HERE' with the actual user ID

-- Method 1: Update user metadata directly (recommended)
UPDATE auth.users 
SET 
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'role', 'vp',
      'is_approved', true
    )
WHERE id = 'USER_ID_HERE';

-- Method 2: If you want to be more specific and preserve other metadata
UPDATE auth.users 
SET 
  raw_app_meta_data = jsonb_set(
    jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{role}', 
      '"vp"'
    ),
    '{is_approved}', 
    'true'
  )
WHERE id = 'USER_ID_HERE';

-- Verify the update worked
SELECT 
  id,
  email,
  raw_app_meta_data->>'role' as role,
  (raw_app_meta_data->>'is_approved')::boolean as is_approved,
  created_at
FROM auth.users 
WHERE id = 'USER_ID_HERE';

-- Optional: View all users and their roles
SELECT 
  id,
  email,
  raw_app_meta_data->>'role' as role,
  (raw_app_meta_data->>'is_approved')::boolean as is_approved,
  created_at
FROM auth.users 
ORDER BY created_at DESC;