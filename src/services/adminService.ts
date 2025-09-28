import { projectId } from '../utils/supabase/info';
import { User } from './authService';

class AdminService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-218dc5b7`;

  async getAllUsers(token: string): Promise<{ users: User[] } | { error: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to fetch users' };
      }

      return { users: data };
    } catch (error) {
      console.error('Get users error:', error);
      return { error: 'Network error while fetching users' };
    }
  }

  async updateUserRole(
    userId: string, 
    role: 'admin' | 'porter', 
    token: string
  ): Promise<{ user: User } | { error: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to update user role' };
      }

      return { user: data };
    } catch (error) {
      console.error('Update user role error:', error);
      return { error: 'Network error while updating user role' };
    }
  }

  async deleteUser(userId: string, token: string): Promise<{ success: boolean } | { error: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to delete user' };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete user error:', error);
      return { error: 'Network error while deleting user' };
    }
  }

  async exportData(token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fueltrakr-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export data error:', error);
      throw new Error('Failed to export data');
    }
  }
}

export const adminService = new AdminService();