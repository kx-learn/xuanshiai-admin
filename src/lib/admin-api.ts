export type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown; query?: Record<string, string | number | undefined> };
const ADMIN_TOKEN_KEY = "xuanshiai_admin_access_token";

export function getAdminToken() {
  return typeof window === "undefined" ? undefined : window.localStorage.getItem(ADMIN_TOKEN_KEY) ?? undefined;
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}
export async function adminApi<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const relativePath = `/api/backend/${path.replace(/^\/+/, "")}`;
  const url = typeof window === "undefined"
    ? new URL(relativePath, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    : new URL(
      `/api/v1/${path.replace(/^\/+/, "")}`,
      process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL || window.location.origin,
    );
  Object.entries(options.query ?? {}).forEach(([key, value]) => { if (value !== undefined && value !== "") url.searchParams.set(key, String(value)); });
  const headers = new Headers(options.headers);
  const token = getAdminToken();
  if (token && !headers.has("authorization")) headers.set("authorization", `Bearer ${token}`);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body !== undefined && !isFormData && !headers.has("content-type")) headers.set("content-type", "application/json");
  const body = options.body === undefined ? undefined : isFormData ? options.body : JSON.stringify(options.body);
  const { query: _query, ...requestOptions } = options;
  const response = await fetch(url, { ...requestOptions, headers, body: body as BodyInit | null | undefined });
  if (!response.ok) {
    if (response.status === 401) {
      clearAdminToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }
    throw new Error((await response.text()) || `请求失败 (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
