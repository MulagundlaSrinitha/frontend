
import { storage } from './storage';

export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ?? '';

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
};

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(
  handler: (() => void) | null,
): void {
  unauthorizedHandler = handler;
}

async function request<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  if (!API_BASE) {
    throw new Error(
      'API URL is missing. Configure EXPO_PUBLIC_API_URL in your .env file.',
    );
  }

  const { params, body, headers: customHeaders, ...fetchOptions } = options;

  const url = new URL(`${API_BASE}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const token = await storage.getAuthToken();

  const headers = new Headers(customHeaders);
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      ...fetchOptions,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'Unable to connect to the server. Check your network and API URL.',
    );
  }

  if (response.status === 401) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    const message = errorData?.message;
    const errorMessage = Array.isArray(message)
      ? message.join(', ')
      : typeof message === 'string'
        ? message
        : errorData?.error || `Request failed: ${response.status}`;

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const result = await response.json();

  // Support the backend's standard { success, data, meta } response.
  if (
    result &&
    typeof result === 'object' &&
    'success' in result &&
    'data' in result
  ) {
    return result.data as T;
  }

  return result as T;
}

export const api = {
  get: <T>(
    path: string,
    params?: ApiOptions['params'],
  ): Promise<T> =>
    request<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body }),

  put: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'PATCH', body }),

  delete: <T>(path: string): Promise<T> =>
    request<T>(path, { method: 'DELETE' }),
};
