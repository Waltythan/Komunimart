// src/services/apiClient.ts
import { getSessionData } from './authServices';

// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Base URL for auth routes (no /api prefix)
export const AUTH_BASE_URL = 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  // Custom options
  allowUnauthenticated?: boolean; // If true, doesn't require auth token
}

/**
 * Centralized API fetch function with authentication and error handling
 * @param path - API endpoint path (without base URL)
 * @param options - Fetch options
 * @returns Promise with response data
 */
async function apiFetch<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = getSessionData();
  
  // Check for authentication
  if (!token && !options.allowUnauthenticated) {
    throw new Error('Authentication required');
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // If request body is FormData, let browser set Content-Type (multipart/form-data)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let responseBody;
  try {
    responseBody = await response.json();
  } catch {
    // No JSON body or parsing error
    responseBody = null;
  }

  if (!response.ok) {
    const errorMessage = responseBody?.message || responseBody?.error || response.statusText;
    throw new Error(errorMessage);
  }

  return responseBody as T;
}

export default apiFetch;
