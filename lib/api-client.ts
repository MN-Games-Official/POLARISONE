interface ApiClientOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
  if (match) return match[1];

  try {
    return localStorage.getItem('access_token');
  } catch {
    return null;
  }
}

async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit & ApiClientOptions = {}
): Promise<T> {
  const { headers: customHeaders, signal, ...rest } = options;
  const token = getAuthToken();

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (customHeaders) {
    const entries =
      customHeaders instanceof Headers
        ? Array.from(customHeaders.entries())
        : Array.isArray(customHeaders)
          ? customHeaders
          : Object.entries(customHeaders);
    for (const [key, value] of entries) {
      mergedHeaders[key] = value;
    }
  }

  if (token) {
    mergedHeaders['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl =
    typeof window !== 'undefined'
      ? ''
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...rest,
    headers: mergedHeaders,
    signal,
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(
      `API Error: ${response.status} ${response.statusText}`,
      response.status,
      errorData
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get<T = unknown>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    return apiClient<T>(endpoint, { method: 'GET', ...options });
  },

  post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiClientOptions
  ): Promise<T> {
    return apiClient<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiClientOptions
  ): Promise<T> {
    return apiClient<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  delete<T = unknown>(
    endpoint: string,
    options?: ApiClientOptions
  ): Promise<T> {
    return apiClient<T>(endpoint, { method: 'DELETE', ...options });
  },
};

export { ApiError };
