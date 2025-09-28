// Demo configuration for testing FuelTrakr
// This allows you to test the app before setting up Supabase

export const isDemoMode = true; // Set to false when you have Supabase configured

export const demoUsers = [
  {
    id: 'demo-admin',
    email: 'admin@napleton.com',
    name: 'Admin User',
    role: 'admin' as const
  },
  {
    id: 'demo-porter',
    email: 'porter@napleton.com', 
    name: 'John Porter',
    role: 'porter' as const
  }
];

// Demo credentials for testing
export const demoCredentials = {
  'admin@napleton.com': 'admin123',
  'porter@napleton.com': 'porter123'
};