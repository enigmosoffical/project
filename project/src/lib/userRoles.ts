import { supabase } from './supabase';
import { auth } from './firebase';

export type UserRole = 'admin' | 'user';

export interface UserRoleData {
  id: number;
  user_id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Get user role from Supabase
 */
export const getUserRole = async (email: string): Promise<UserRole | null> => {
  try {
    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      return null;
    }

    console.log('🔍 Checking role for:', email);

    const { data, error } = await (supabase as any)
      .from('user_roles')
      .select('role')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      console.error('❌ Error fetching user role:', error);
      console.error('📋 Error details:', error.message, error.code);
      return null;
    }

    console.log('✅ Role found:', data?.role);
    return data?.role || null;
  } catch (error) {
    console.error('❌ Exception in getUserRole:', error);
    return null;
  }
};

/**
 * Check if user is admin
 */
export const isUserAdmin = async (email: string | null): Promise<boolean> => {
  if (!email) return false;
  const role = await getUserRole(email);
  return role === 'admin';
};

/**
 * Create user role entry (called after Firebase signup)
 */
export const createUserRole = async (
  userId: string,
  email: string,
  role: UserRole = 'user'
): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      return false;
    }

    console.log(`🔄 Creating user role: ${email} → ${role}`);

    const { data, error } = await (supabase as any)
      .from('user_roles')
      .insert({
        user_id: userId,
        email: email.toLowerCase(),
        role: role
      })
      .select();

    if (error) {
      console.error('❌ Error creating user role:', error);
      console.error('📋 Error details:', error.message, error.code);
      console.error('📋 Error hint:', error.hint);
      return false;
    }

    console.log(`✅ User role created: ${email} → ${role}`, data);
    return true;
  } catch (error) {
    console.error('Error in createUserRole:', error);
    return false;
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
  email: string,
  newRole: UserRole
): Promise<boolean> => {
  try {
    if (!supabase) return false;

    // Check if current user is admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return false;

    const isAdmin = await isUserAdmin(session.user.email);
    if (!isAdmin) {
      console.error('Only admins can update roles');
      return false;
    }

    const { error } = await (supabase as any)
      .from('user_roles')
      .update({ role: newRole })
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }

    console.log(`✅ User role updated: ${email} → ${newRole}`);
    return true;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return false;
  }
};

/**
 * Get all users with their roles (admin only)
 */
export const getAllUsersWithRoles = async (): Promise<UserRoleData[]> => {
  try {
    if (!supabase) return [];

    // Check if current user is admin
    const currentUser = auth.currentUser;
    if (!currentUser?.email) return [];

    const isAdmin = await isUserAdmin(currentUser.email);
    if (!isAdmin) {
      console.error('Only admins can view all users');
      return [];
    }

    const { data, error } = await (supabase as any)
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllUsersWithRoles:', error);
    return [];
  }
};

/**
 * Delete user role (admin only)
 */
export const deleteUserRole = async (email: string): Promise<boolean> => {
  try {
    if (!supabase) return false;

    // Check if current user is admin
    const currentUser = auth.currentUser;
    if (!currentUser?.email) return false;

    const isAdmin = await isUserAdmin(currentUser.email);
    if (!isAdmin) {
      console.error('Only admins can delete users');
      return false;
    }

    const { error } = await (supabase as any)
      .from('user_roles')
      .delete()
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Error deleting user role:', error);
      return false;
    }

    console.log(`✅ User role deleted: ${email}`);
    return true;
  } catch (error) {
    console.error('Error in deleteUserRole:', error);
    return false;
  }
};
