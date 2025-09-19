# Database Setup Instructions

This document provides instructions for setting up the database schema for the Alumni Management Platform.

## Prerequisites

- Supabase project created
- Supabase CLI installed (optional, for local development)
- Access to Supabase SQL Editor or psql connection

## Migration Script

The `supabase-migration.sql` file contains the complete database schema setup including:

1. **contact_type_enum**: Enum type with values ('Alumni', 'Mentor', 'Other')
2. **contacts table**: Main table for storing contact information
3. **contact_meta table**: Additional metadata for contacts (source description)
4. **get_user_role() function**: Extracts user role from JWT token
5. **get_user_approval_status() function**: Checks if user is approved
6. **Row Level Security policies**: Implements role-based access control

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase-migration.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

### Option 2: Using Supabase CLI (Local Development)

```bash
# If using Supabase CLI locally
supabase db reset
# Then apply the migration through the dashboard or CLI
```

### Option 3: Using psql (Advanced)

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Run the migration
\i supabase-migration.sql
```

## Verification

After running the migration, verify the setup by checking:

1. **Tables created**: `contacts` and `contact_meta` tables exist
2. **Enum created**: `contact_type_enum` type exists
3. **Functions created**: `get_user_role()` and `get_user_approval_status()` functions exist
4. **RLS enabled**: Both tables have Row Level Security enabled
5. **Policies created**: Multiple RLS policies exist for both tables

You can verify with these SQL queries:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('contacts', 'contact_meta');

-- Check enum
SELECT typname FROM pg_type WHERE typname = 'contact_type_enum';

-- Check functions
SELECT proname FROM pg_proc WHERE proname IN ('get_user_role', 'get_user_approval_status');

-- Check RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE tablename IN ('contacts', 'contact_meta');
```

## Role-Based Access Control Summary

The RLS policies implement the following access control:

### Members (role: 'member')
- Can insert contacts (only their own)
- Can view contacts they added
- Cannot edit or delete any contacts
- Must be approved to perform any operations

### Officers (role: 'officer')
- Can view all contacts
- Can edit all contacts
- Cannot delete contacts
- Must be approved to perform any operations

### VPs (role: 'vp')
- Can view all contacts
- Can edit all contacts
- Can delete contacts
- Must be approved to perform any operations

All operations require the user to be approved (`is_approved: true` in user metadata).