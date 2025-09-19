// Global type declarations for the alumni management platform

import type { Database } from './database'

declare global {
  // Supabase database types
  type DatabaseType = Database

  // Global utility types
  namespace App {
    interface User {
      id: string
      email: string
      app_metadata: {
        role: 'member' | 'officer' | 'vp'
        is_approved: boolean
      }
    }

    interface Contact {
      id: string
      name: string
      email: string
      phone_number?: string
      business_sector?: string
      business_name?: string
      business_details?: string
      contact_type: 'Alumni' | 'Mentor' | 'Other'
      created_at: string
      added_by: string
      contact_meta?: ContactMeta
    }

    interface ContactMeta {
      id: string
      contact_id: string
      source_description: string
      created_at: string
    }
  }

  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL: string
      SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY?: string
    }
  }
}

export {}