// Database-specific types for Supabase operations

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string
          name: string
          email: string
          phone_number: string | null
          business_sector: string | null
          business_name: string | null
          business_details: string | null
          contact_type: 'Alumni' | 'Mentor' | 'Other'
          created_at: string
          added_by: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone_number?: string | null
          business_sector?: string | null
          business_name?: string | null
          business_details?: string | null
          contact_type?: 'Alumni' | 'Mentor' | 'Other'
          created_at?: string
          added_by: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone_number?: string | null
          business_sector?: string | null
          business_name?: string | null
          business_details?: string | null
          contact_type?: 'Alumni' | 'Mentor' | 'Other'
          created_at?: string
          added_by?: string
        }
      }
      contact_meta: {
        Row: {
          id: string
          contact_id: string
          source_description: string
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          source_description: string
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          source_description?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: 'member' | 'officer' | 'vp'
      }
    }
    Enums: {
      contact_type_enum: 'Alumni' | 'Mentor' | 'Other'
    }
  }
}

// Type helpers for database operations
export type ContactRow = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export type ContactMetaRow = Database['public']['Tables']['contact_meta']['Row']
export type ContactMetaInsert = Database['public']['Tables']['contact_meta']['Insert']
export type ContactMetaUpdate = Database['public']['Tables']['contact_meta']['Update']