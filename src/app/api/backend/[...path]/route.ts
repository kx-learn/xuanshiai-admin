import { NextRequest, NextResponse } from "next/server";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }, method: Method) {
  const baseUrl = process.env.ADMIN_API_BASE_URL;
  if (!baseUrl) return NextResponse.json({ error: "未配置 ADMIN_API_BASE_URL" }, { status: 503 });
  const { path } = await context.params;
  const base = new URL(baseUrl);
  const basePath = base.pathname.replace(/\/+$/, "");
  const target = new URL(`${basePath}/api/v1/${path.join("/")}`, base);
  target.search = request.nextUrl.search;
  const headers = new Headers(request.headers);
  headers.delete("host"); headers.delete("content-length");
  const body = method === "GET" || method === "DELETE" ? undefined : await request.arrayBuffer();
  const response = await fetch(target, { method, headers, body, redirect: "manual", cache: "no-store" });
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
}
export const GET = (request: NextRequest, context: { params: Promise<{ path: string[] }> }) => proxy(request, context, "GET");
export const POST = (request: NextRequest, context: { params: Promise<{ path: string[] }> }) => proxy(request, context, "POST");
export const PUT = (request: NextRequest, context: { params: Promise<{ path: string[] }> }) => proxy(request, context, "PUT");
export const PATCH = (request: NextRequest, context: { params: Promise<{ path: string[] }> }) => proxy(request, context, "PATCH");
export const DELETE = (request: NextRequest, context: { params: Promise<{ path: string[] }> }) => proxy(request, context, "DELETE");
