import { auth } from '../config/firebase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

export const fetchAPI = async (path: string, options: FetchOptions = {}) => {
  const url = `${API_BASE}${path}`;
  const fetchOptions = { ...options } as RequestInit;
  
  // Ensure credentials like cookies are included (can keep for legacy or remove)
  fetchOptions.credentials = 'include';
  
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {})
  };

  // Add Firebase Auth token
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.warn('Failed to get Firebase token', e);
    }
  }

  fetchOptions.headers = headers;
  
  if (options.body && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      errMsg = data.message || errMsg;
    } catch (e) {
      // Ignored
    }
    
    // Automatically log out if token is invalid or revoked
    if (response.status === 401) {
      if (auth.currentUser) {
        await auth.signOut();
        window.location.href = '/login?session_expired=true';
      }
    }
    
    throw new Error(errMsg);
  }

  // Handle empty responses
  if (response.status === 204) return null;
  
  return response.json();
};
