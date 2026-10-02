import type { Product, ProductStatus, StoreSettings } from '../types/product';

const API = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

async function multipart<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.json();
}

export interface AdminProductPayload extends Omit<Product, 'id'> {
  id: string;
}

export const api = {
  products: () => request<Product[]>('/products'),
  adminProducts: () => request<Product[]>('/products/admin/all'),
  settings: () => request<StoreSettings>('/settings'),

  createProduct: (product: AdminProductPayload) => {
    const form = new FormData();
    form.append('payload', JSON.stringify(product));
    return multipart<Product>('/admin/products', form);
  },

  updateProduct: (id: string, product: AdminProductPayload, newImages: File[] = []) => {
    const form = new FormData();
    form.append('payload', JSON.stringify(product));
    for (const file of newImages) form.append('images', file);
    return multipart<Product>(`/admin/products/${encodeURIComponent(id)}`, form);
  },

  uploadImages: (form: FormData) =>
    fetch(`${API}/admin/upload`, { credentials: 'include', method: 'POST', body: form })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(body.error || `Upload failed (${response.status})`);
        }
        return response.json() as Promise<{ images: string[] }>;
      }),

  deleteProduct: (id: string) => request<void>(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  duplicateProduct: (id: string) =>
    request<Product>(`/admin/products/${encodeURIComponent(id)}/duplicate`, { method: 'POST' }),

  setProductStatus: (id: string, status: ProductStatus) =>
    request<Product>(`/admin/products/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  updateSettings: (settings: StoreSettings) => request<StoreSettings>('/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  me: () => request<{authenticated:boolean; email?:string}>('/auth/me'),
  login: (email: string, password: string) => request<{authenticated:boolean; email:string}>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>('/auth/password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) }),
  logout: () => request<void>('/auth/logout', { method: 'POST' })
};
