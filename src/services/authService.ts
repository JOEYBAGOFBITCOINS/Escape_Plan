import { supabase } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { isDemoMode, demoUsers, demoCredentials } from '../utils/supabase/demo-config'

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'porter';
}

class AuthService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-218dc5b7`;

  async signUp(email: string, password: string, name: string): Promise<{ user: User } | { error: string }> {
    // Demo mode - simulate signup
    if (isDemoMode || projectId === 'your-project-id-here') {
      // Validate Napleton email
      if (!email.endsWith('@napleton.com')) {
        return { error: 'Only Napleton email addresses are allowed' };
      }

      // In demo mode, just return success
      const newUser: User = {
        id: `demo-${Date.now()}`,
        email,
        name,
        role: 'porter'
      };

      return { user: newUser };
    }

    try {
      const response = await fetch(`${this.baseUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to create account' };
      }

      return { user: data.user };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: 'Network error during signup' };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User; token: string } | { error: string }> {
    // Demo mode - simulate login
    if (isDemoMode || projectId === 'your-project-id-here') {
      const user = demoUsers.find(u => u.email === email);
      const validPassword = demoCredentials[email as keyof typeof demoCredentials];

      if (!user || password !== validPassword) {
        return { error: 'Invalid email or password' };
      }

      const sessionData = {
        user,
        token: 'demo-token-' + user.id
      };

      // Save to localStorage for demo persistence
      localStorage.setItem('fueltrakr-demo-session', JSON.stringify(sessionData));

      return sessionData;
    }

    try {
      console.log('🔑 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Supabase auth error:', error.message);
        
        // If user doesn't exist, provide helpful message
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'User account not found. Please contact admin to create your account.' };
        }
        
        return { error: error.message };
      }

      if (!data.session) {
        console.error('❌ No session created after sign in');
        return { error: 'No session created' };
      }

      console.log('✅ Supabase auth successful, fetching profile...');

      // Get user profile from backend
      const profileResponse = await fetch(`${this.baseUrl}/profile`, {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`
        }
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('❌ Profile fetch failed:', profileResponse.status, errorText);
        
        if (profileResponse.status === 404) {
          return { error: 'User profile not found. Please contact admin.' };
        }
        
        return { error: 'Failed to fetch user profile' };
      }

      const profile = await profileResponse.json();
      console.log('✅ Profile fetched successfully:', profile.email);

      return {
        user: profile,
        token: data.session.access_token
      };
    } catch (error) {
      console.error('❌ Sign in network error:', error);
      return { error: 'Network error during sign in' };
    }
  }

  async getSession(): Promise<{ user: User; token: string } | null> {
    // Demo mode - check localStorage for demo session
    if (isDemoMode || projectId === 'your-project-id-here') {
      const savedSession = localStorage.getItem('fueltrakr-demo-session');
      if (savedSession) {
        try {
          return JSON.parse(savedSession);
        } catch {
          localStorage.removeItem('fueltrakr-demo-session');
        }
      }
      return null;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return null;
      }

      // Get user profile from backend
      const profileResponse = await fetch(`${this.baseUrl}/profile`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!profileResponse.ok) {
        return null;
      }

      const profile = await profileResponse.json();

      return {
        user: profile,
        token: session.access_token
      };
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    // Demo mode - clear localStorage
    if (isDemoMode || projectId === 'your-project-id-here') {
      localStorage.removeItem('fueltrakr-demo-session');
      return;
    }

    await supabase.auth.signOut();
  }

  async refreshToken(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        return null;
      }

      return data.session.access_token;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();