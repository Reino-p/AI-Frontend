export const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type ApiOptions = {
  expectJson?: boolean; // set false for 204/empty bodies
};

export async function api<T = any>(
  path: string,
  init: RequestInit = {},
  opts: ApiOptions = {}
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `HTTP ${res.status}`);
  }

  // If caller says "no JSON expected" or it's a 204, just return void
  if (opts.expectJson === false || res.status === 204) {
    // @ts-expect-error allow void
    return undefined;
  }

  // Tolerate empty body even on 200
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}