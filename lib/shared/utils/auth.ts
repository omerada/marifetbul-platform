// Auth utilities
export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    // Mock implementation - in real app would decode JWT
    const userData = localStorage.getItem('auth_user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || null;
    }

    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
