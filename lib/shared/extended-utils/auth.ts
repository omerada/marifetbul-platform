// Authentication utility functions

export function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setTokenToStorage(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

export function removeTokenFromStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}

export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export function getUserFromToken(
  token: string
): { id: string; email: string; role: string } | null {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    id: decoded.sub as string,
    email: decoded.email as string,
    role: decoded.role as string,
  };
}

export function generateRandomPassword(length = 12): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  // Ensure at least one character from each category
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';

  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

export function hashPassword(password: string): Promise<string> {
  // In a real application, use bcrypt or similar
  // This is a simple example using Web Crypto API
  return crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(password))
    .then((hash) =>
      Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    );
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function isValidSessionId(sessionId: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}

export function getCurrentUserId(): string | null {
  const token = getTokenFromStorage();
  if (!token) return null;

  const user = getUserFromToken(token);
  return user?.id || null;
}

export function getAuthToken(): string | null {
  return getTokenFromStorage();
}
