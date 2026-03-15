// ── API client with proper error surfacing ────────────────────────────────
// Reads token from aura_token (the key the store uses) not 'token'

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('aura_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    // Surface the real backend message rather than a generic string
    const message =
      (isJson && body?.message)   ? body.message   :
      (isJson && body?.error)     ? body.error      :
      typeof body === 'string'    ? body             :
      `Request failed with status ${res.status}`;
    const err = new Error(message) as any;
    err.status = res.status;
    err.body   = body;
    throw err;
  }

  return body;
}

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    return parseResponse(res);
  },

  post: async (endpoint: string, data: unknown) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body:    JSON.stringify(data),
    });
    return parseResponse(res);
  },

  put: async (endpoint: string, data: unknown) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body:    JSON.stringify(data),
    });
    return parseResponse(res);
  },

  delete: async (endpoint: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    return parseResponse(res);
  },

  upload: async (endpoint: string, formData: FormData) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method:  'POST',
      headers: getAuthHeaders(), // No Content-Type — browser sets multipart boundary
      body:    formData,
    });
    return parseResponse(res);
  },
};
