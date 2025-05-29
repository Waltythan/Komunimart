// src/services/apiClient.ts
import { getSessionData, clearSessionData } from './authServices';

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
    console.warn('Authentication required for API call to:', path);
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

  // Construct the full URL
  const fullUrl = `${API_BASE_URL}${path}`;
  console.log(`Making API request to: ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, {
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

    // Handle authentication errors
    if (response.status === 401) {
      console.error('Authentication error: Token might be expired or invalid');
      
      // Clear the invalid token
      clearSessionData();
      
      // Redirect to login page if in browser context
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      
      throw new Error('Your session has expired. Please login again.');
    }

    if (!response.ok) {
      const errorMessage = responseBody?.message || responseBody?.error || response.statusText;
      console.error(`API error (${response.status}):`, errorMessage);
      throw new Error(errorMessage);
    }

    return responseBody as T;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

export default apiFetch;
