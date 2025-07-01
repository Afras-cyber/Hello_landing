
import { supabase } from './client';

/**
 * Check if the current user is an admin
 * 
 * This function uses the new simplified is_admin() RPC function
 * to avoid infinite recursion issues with RLS policies
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    // First check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData?.session) {
      return false;
    }
    
    // Get the admin status via the simplified RPC call
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in checkIsAdmin function:', error);
    return false;
  }
}
