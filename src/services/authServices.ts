// src/services/authServices.ts
import { AUTH_BASE_URL } from './apiClient';

/**
 * Authenticate a user and obtain a JWT token
 */
export async function login(uname: string, password: string): Promise<{ token: string; user: any }> {
  const res = await fetch(`${AUTH_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uname, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

/**
 * Register a new user account
 */
export async function register(uname: string, email: string, password: string): Promise<any> {
  const res = await fetch(`${AUTH_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uname, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

// Function to store token in sessionStorage
export const storeSessionData = (token: string) => {
  sessionStorage.setItem('token', token);
};

// Function to retrieve token from sessionStorage
export const getSessionData = (): string | null => {
  return sessionStorage.getItem('token');
};

// Function to clear session data from sessionStorage
export const clearSessionData = () => {
  sessionStorage.removeItem('token');
  // Also clear any user-related data
  sessionStorage.removeItem('current_username');
};
