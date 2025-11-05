const AUTH_BASE_URL = 'http://localhost:8000/api/v1/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  phone_number?: string;
  profile_picture?: string;
  role: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${AUTH_BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async register(email: string, password1: string, password2: string, name: string): Promise<{ detail: string }> {
    const response = await fetch(`${AUTH_BASE_URL}/registration/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password1, password2, name }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('access_token');
    await fetch(`${AUTH_BASE_URL}/logout/`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
    });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  async refreshToken(refresh: string): Promise<{ access: string; refresh: string }> {
    const response = await fetch(`${AUTH_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) throw new Error('Token refresh failed');
    return response.json();
  },

  async getUser(): Promise<User> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${AUTH_BASE_URL}/user/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get user');
    return response.json();
  },
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
