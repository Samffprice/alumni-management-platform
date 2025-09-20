import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('Testing contacts API...')
    
    // Get runtime config
    const config = useRuntimeConfig()
    
    // Create admin client with service role
    const adminSupabase = createClient(
      config.public.supabaseUrl, 
      config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Test 1: Check if contacts table exists
    const { data: contactsData, error: contactsError } = await adminSupabase
      .from('contacts')
      .select('id, name, email, added_by, created_at')
      .limit(5)

    console.log('Contacts table test:', { contactsData, contactsError })

    // Test 2: Check if user_profiles table exists
    const { data: profilesData, error: profilesError } = await adminSupabase
      .from('user_profiles')
      .select('id, user_id, full_name, user_position')
      .limit(5)

    console.log('User profiles table test:', { profilesData, profilesError })

    // Test 3: Check if contacts_with_user_info view exists
    const { data: viewData, error: viewError } = await adminSupabase
      .from('contacts_with_user_info')
      .select('id, name, email, added_by_name, added_by_position')
      .limit(5)

    console.log('Contacts with user info view test:', { viewData, viewError })

    return {
      success: true,
      tests: {
        contacts: { data: contactsData, error: contactsError?.message },
        profiles: { data: profilesData, error: profilesError?.message },
        view: { data: viewData, error: viewError?.message }
      }
    }
  } catch (error) {
    console.error('Test API error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})