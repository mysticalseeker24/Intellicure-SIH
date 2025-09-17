import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'hospital' | 'patient';

interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  register: (userData: any, role: UserRole) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string, role: UserRole) => {
        try {
          // Simulate API call to json-server
          const endpoint = role === 'hospital' ? 'hospitals' : 'patients';
          const response = await fetch(`http://localhost:3001/${endpoint}`);
          const users = await response.json();
          
          const user = users.find((u: any) => u.email === email && u.password === password);
          
          if (user) {
            const userData: User = {
              id: user.id,
              email: user.email,
              role,
              name: role === 'hospital' ? user.name : `${user.firstName} ${user.lastName}`,
              token: `mock_token_${user.id}_${Date.now()}`
            };
            
            set({ user: userData, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      register: async (userData: any, role: UserRole) => {
        try {
          // Mock registration - in real app would POST to server
          const newUser: User = {
            id: `${role}_${Date.now()}`,
            email: userData.email,
            role,
            name: role === 'hospital' ? userData.name : `${userData.firstName} ${userData.lastName}`,
            token: `mock_token_${Date.now()}`
          };
          
          set({ user: newUser, isAuthenticated: true });
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      }
    }),
    {
      name: 'emr-auth-storage',
    }
  )
);