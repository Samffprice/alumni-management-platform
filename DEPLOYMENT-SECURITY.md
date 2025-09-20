# Security Deployment Guide

## ⚠️ IMPORTANT: Read This Before Running SQL Scripts

Your security fixes include both **database changes** and **application changes**. You must deploy them in the correct order to avoid breaking your app.

## 🚨 Critical Pre-Deployment Steps

### 1. Rotate Exposed Keys (DO THIS FIRST)
```bash
# 1. Go to Supabase Dashboard > Settings > API
# 2. Click "Reset" on Service Role Key
# 3. Update your production environment variables
# 4. Test that your app still works with new keys
```

### 2. Deploy Application Changes First
Deploy these files to your application **BEFORE** running SQL scripts:
- `composables/useSecureApi.ts` (new file)
- `components/UserManagementTable.vue` (updated)
- Any other components that call admin APIs

### 3. Test Application Works
Verify that:
- VP users can still access user management
- API calls include proper JWT tokens
- All admin functions work correctly

## 📋 Deployment Checklist

### Phase 1: Application Updates
- [ ] Deploy `useSecureApi.ts` composable
- [ ] Deploy updated `UserManagementTable.vue`
- [ ] Test admin functionality works
- [ ] Verify JWT tokens are being sent

### Phase 2: Database Security Fixes
Only after confirming the app works, run:
```sql
-- Run this in your Supabase SQL editor
\i security-fixes.sql
```

### Phase 3: Verification
- [ ] Test all user roles (member, officer, VP)
- [ ] Verify RLS policies work correctly
- [ ] Check that unapproved users can't access data
- [ ] Test API authentication is working

## 🔧 What Each Fix Does

### Database Changes (security-fixes.sql)
1. **Enhanced User Profile Security**: Prevents unapproved users from accessing profiles
2. **Secure View**: Makes `contacts_with_user_info` view more secure
3. **Session Validation**: Adds server-side session validation functions
4. **Audit Logging**: Tracks administrative actions
5. **Rate Limiting**: Infrastructure for API rate limiting

### Application Changes
1. **Secure API Composable**: Automatically includes JWT tokens in API calls
2. **Updated Components**: Uses secure API calls for admin functions

## 🚨 Rollback Plan

If something breaks after deployment:

### Rollback Database Changes
```sql
-- Rollback user profile policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Rollback view changes
DROP VIEW IF EXISTS public.contacts_with_user_info;
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
```

### Rollback Application Changes
1. Revert `UserManagementTable.vue` to use `$fetch` instead of `secureApiCall`
2. Remove `useSecureApi.ts` composable

## 🔍 Testing Your Deployment

### Test with Different User Types

1. **Unapproved User**:
   - Should not be able to access any data
   - Should be redirected to pending approval page

2. **Approved Member**:
   - Can view their own contacts
   - Cannot access admin functions
   - Can view their own profile

3. **Approved Officer**:
   - Can view all contacts
   - Can edit contacts
   - Cannot delete users

4. **Approved VP**:
   - Can view all contacts
   - Can edit/delete contacts
   - Can manage users
   - Can delete users

### API Testing
```bash
# Test that APIs require authentication
curl -X GET https://your-app.com/api/users
# Should return: {"error": "Authentication required"}

# Test with valid token (replace TOKEN with actual JWT)
curl -X GET https://your-app.com/api/users \
  -H "Authorization: Bearer TOKEN"
# Should return user list for VPs
```

## 📊 Monitoring After Deployment

Watch for these issues in the first 24 hours:
- Authentication errors in logs
- Users unable to access admin functions
- API calls failing with 401/403 errors
- RLS policy violations

## 🆘 Emergency Contacts

If you encounter issues during deployment:
1. Check application logs for authentication errors
2. Verify JWT tokens are being generated correctly
3. Test RLS policies with different user roles
4. Use rollback procedures if necessary

## ✅ Success Indicators

Your deployment is successful when:
- All user roles can access their appropriate functions
- Admin APIs require and validate JWT tokens
- RLS policies properly restrict data access
- No authentication errors in logs
- Audit logging is working (check `audit_log` table)

Remember: **Security is only as strong as its weakest link**. Test thoroughly!