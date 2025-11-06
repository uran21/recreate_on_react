// src/components/menu/api.ts
import type { ProductListItem, ProductListResponse, ProductDetails, ProductDetailsResponse } from './types';

export async function fetchProducts(): Promise<ProductListItem[]> {
  const res = await fetch('/api/products', { headers: { accept: 'application/json' } });
  const json = (await res.json()) as ProductListResponse;
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
  return json.data ?? [];
}

export async function fetchProductById(id: number): Promise<ProductDetails> {
  const res = await fetch(`/api/products/${id}`, { headers: { accept: 'application/json' } });
  const json = (await res.json()) as ProductDetailsResponse;
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
  return json.data;
}
