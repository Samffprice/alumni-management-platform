# TypeScript Types

This directory contains all TypeScript type definitions for the Alumni Management Platform.

## File Structure

- **`index.ts`** - Main export file that re-exports all types
- **`database.ts`** - Database-specific types for Supabase operations
- **`components.ts`** - Component props, emits, and UI-related types
- **`api.ts`** - API request/response types and server-side interfaces
- **`utils.ts`** - Utility types and generic type helpers
- **`validation.ts`** - Form validation types and schemas
- **`global.d.ts`** - Global type declarations and ambient types

## Core Types

### User Roles
- `member` - Can view and add their own contacts
- `officer` - Can view all contacts and edit any contact
- `vp` - Full access including user management and contact deletion

### Contact Types
- `Alumni` - Former students
- `Mentor` - Industry mentors
- `Other` - Other professional contacts

## Usage

Import types from the main index file:

```typescript
import type { 
  Contact, 
  ContactInput, 
  User, 
  UserRole, 
  ContactType 
} from '~/types'
```

Or import specific type modules:

```typescript
import type { Database } from '~/types/database'
import type { ContactFormProps } from '~/types/components'
import type { ApiResponse } from '~/types/api'
```

## Key Interfaces

### Contact
Main contact entity with all contact information and metadata.

### ContactInput
Input type for forms, excludes auto-generated fields like `id` and `created_at`.

### User
User entity with role and approval status in app_metadata.

### ApiResponse<T>
Generic wrapper for all API responses with success/error handling.

## Validation

The `validation.ts` file contains:
- Validation schemas for forms
- Error message templates
- Validation rule interfaces

## Database Types

The `database.ts` file provides:
- Supabase-generated database types
- Row, Insert, and Update types for each table
- Function and enum definitions