// app/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Make an authenticated API request
 * Automatically includes the Authorization header if token exists
 */
export async function apiCall(
  endpoint: string,
  options: FetchOptions = {}
) {
  const token = localStorage.getItem("authToken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  // Handle 403 Forbidden - user doesn't have permission
  if (response.status === 403) {
    window.location.href = "/unauthorized";
  }

  return response;
}

/**
 * Parse JSON response
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

/**
 * Convenience method for GET requests
 */
export async function apiGet<T>(endpoint: string) {
  const response = await apiCall(endpoint);
  return parseResponse<T>(response);
}

/**
 * Convenience method for POST requests
 */
export async function apiPost<T>(endpoint: string, data: unknown) {
  const response = await apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return parseResponse<T>(response);
}

/**
 * Convenience method for PUT requests
 */
export async function apiPut<T>(endpoint: string, data: unknown) {
  const response = await apiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return parseResponse<T>(response);
}

/**
 * Convenience method for DELETE requests
 */
export async function apiDelete<T>(endpoint: string) {
  const response = await apiCall(endpoint, {
    method: "DELETE",
  });
  return parseResponse<T>(response);
}
