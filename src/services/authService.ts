import { api } from './apiService';

export interface AuthUser {
  _id: string;
  email: string;
  displayName: string;
  role: string;
  department?: string;
  designation?: string;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  role?: string;
  department?: string;
  designation?: string;
  specialization?: string;
  yearJoined?: string;
}

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<{ user: AuthUser | null; error?: string }> => {
  try {
    const response = await api.post<{ user: AuthUser; token: string }>('/auth/login', credentials);
    
    if (response.error) {
      return { user: null, error: response.error };
    }
    
    // Store token in localStorage or cookie
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return { user: response.data?.user || null };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, error: 'Authentication failed' };
  }
};

// Register user
export const registerUser = async (userData: RegisterData): Promise<{ user: AuthUser | null; error?: string }> => {
  try {
    const response = await api.post<{ user: AuthUser; token: string }>('/auth/register', userData);
    
    if (response.error) {
      return { user: null, error: response.error };
    }
    
    // Store token in localStorage or cookie
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return { user: response.data?.user || null };
  } catch (error) {
    console.error('Registration error:', error);
    return { user: null, error: 'Registration failed' };
  }
};

// Logout user
export const logoutUser = async (): Promise<boolean> => {
  try {
    // Call logout endpoint if needed
    await api.post('/auth/logout', {});
    
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove token even if API call fails
    localStorage.removeItem('authToken');
    return true;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return null;
    }
    
    const response = await api.get<AuthUser>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.error) {
      return null;
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};

// Get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};
