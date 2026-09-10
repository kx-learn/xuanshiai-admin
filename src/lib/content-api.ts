"use client";

/** 通用内容域 API 助手：对接后端 /admin/content/{domain} 通用 CRUD。 */
import { adminApi } from "./admin-api";

export interface ContentItem {
  id: number;
  domain: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  amount: number | null;
  status: number;
  sort: number;
  extra: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
}

export interface ContentPage {
  total: number;
  page: number;
  page_size: number;
  items: ContentItem[];
}

/** ListPage endpoint 直连格式（分页参数 page/page_size、关键字参数 keyword）。 */
export const contentEndpoint = (domain: string) => `/api/backend/admin/content/${domain}`;

export function listContent(
  domain: string,
  params: { page?: number; page_size?: number; keyword?: string; status?: number } = {},
) {
  return adminApi<ContentPage>(`admin/content/${domain}`, { query: params as Record<string, number | string | undefined> });
}

export function createContent(domain: string, body: Record<string, unknown>) {
  return adminApi<ContentItem>(`admin/content/${domain}`, { method: "POST", body });
}

export function updateContent(domain: string, id: number, body: Record<string, unknown>) {
  return adminApi<ContentItem>(`admin/content/${domain}/${id}`, { method: "PATCH", body });
}

export function deleteContent(domain: string, id: number) {
  return adminApi<void>(`admin/content/${domain}/${id}`, { method: "DELETE" });
}

/** 把服务端 ContentItem 拍平成表格行（extra 字段平铺到行上）。 */
export function flattenItem(item: ContentItem): Record<string, unknown> {
  return {
    ...item.extra,
    id: item.id,
    title: item.title,
    subtitle: item.subtitle ?? "",
    image_url: item.image_url ?? "",
    amount: item.amount ?? undefined,
    status: item.status,
    sort: item.sort,
    created_at: item.created_at ?? "",
  };
}
