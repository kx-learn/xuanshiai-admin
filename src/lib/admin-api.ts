export type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown; query?: Record<string, string | number | boolean | undefined> };
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

/** Backend stores uploaded media as paths; resolve them against the configured API host. */
export function resolveMediaUrl(value?: string | null) {
  if (!value) return undefined;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  const base = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return new URL(value.startsWith("/") ? value : `/${value}`, base).toString();
}

/** 常见字段的中文名，用于把校验错误翻译成人话。 */
const FIELD_LABELS: Record<string, string> = {
  page: "页码",
  page_size: "每页条数",
  password: "密码",
  old_password: "原密码",
  new_password: "新密码",
  username: "账号",
  account: "账号",
  phone: "手机号",
  sms_code: "验证码",
  real_name: "姓名",
  name: "名称",
  title: "标题",
  reason: "原因",
  remark: "备注",
  avatar: "头像",
  id_card: "身份证号",
  birthday: "生日",
  available_count: "牵线次数",
  start_date: "开始日期",
  end_date: "结束日期",
  start_time: "开始时间",
  end_time: "结束时间",
  keyword: "关键词",
  file: "文件",
  image: "图片",
  content: "内容",
};

/** 单条校验错误 → 中文描述。FastAPI 的 type/ctx 见 https://docs.pydantic.dev/errors/validation_errors */
function describeValidationError(item: Record<string, unknown>): string {
  const loc = Array.isArray(item.loc) ? (item.loc as unknown[]) : [];
  const fieldKey = String(loc[loc.length - 1] ?? "");
  const known = FIELD_LABELS[fieldKey];
  const label = known ?? fieldKey;
  const type = String(item.type ?? "");
  const ctx = (item.ctx ?? {}) as Record<string, unknown>;
  switch (type) {
    case "less_than_equal":
      return `${label}不能超过 ${ctx.le}`;
    case "greater_than_equal":
      return `${label}不能小于 ${ctx.ge}`;
    case "less_than":
      return `${label}必须小于 ${ctx.lt}`;
    case "greater_than":
      return `${label}必须大于 ${ctx.gt}`;
    case "missing":
      return `请填写${label}`;
    case "string_too_short":
      return `${label}至少需要 ${ctx.min_length} 个字符`;
    case "string_too_long":
      return `${label}不能超过 ${ctx.max_length} 个字符`;
    case "int_parsing":
    case "int_from_float":
    case "float_parsing":
      return `${label}必须是数字`;
    case "string_pattern_mismatch":
      return `${label}格式不正确`;
    case "enum":
      return `请选择有效的${label}`;
    case "json_invalid":
      return "提交的数据格式有误，请刷新后重试";
    default: {
      const msg = typeof item.msg === "string" ? item.msg : "";
      // 后端自己写的校验文案可能带 pydantic 英文前缀（"Value error, ..."），剥掉再展示
      const cleaned = msg.replace(/^[A-Za-z][\w\s]*error[,\s]*|^Assertion failed[,\s]*/i, "").trim();
      if (cleaned && /[\u4e00-\u9fa5]/.test(cleaned)) {
        return label && label !== "value" && !cleaned.includes(label) ? `${label}：${cleaned}` : cleaned;
      }
      return label && label !== "value" ? `${label}填写有误` : "提交的内容有误，请检查后重试";
    }
  }
}

/** 把后端返回的原始报错文本翻译成用户能看懂的提示。 */
export function toFriendlyError(status: number, raw: string): string {
  const fallback = `请求失败（${status}），请稍后重试`;
  if (!raw) return fallback;
  let data: unknown = null;
  try {
    data = JSON.parse(raw);
  } catch {
    // 非 JSON：代理/网关错误通常是 HTML 或纯文本
    if (/<html|<!doctype/i.test(raw)) return "服务暂时不可用，请稍后重试";
    if (/[\u4e00-\u9fa5]/.test(raw) && raw.length <= 120) return raw;
    return fallback;
  }
  if (data && typeof data === "object" && "detail" in (data as Record<string, unknown>)) {
    const detail = (data as Record<string, unknown>).detail;
    // FastAPI 422 校验错误：detail 是数组
    if (Array.isArray(detail)) {
      const msgs = (detail as Record<string, unknown>[]).map(describeValidationError).filter(Boolean);
      if (!msgs.length) return "提交的内容有误，请检查后重试";
      return msgs.length === 1 ? msgs[0] : `${msgs[0]}（共 ${msgs.length} 处需修正）`;
    }
    if (typeof detail === "string" && detail.trim()) {
      // 后端自己抛的 HTTPException，一般已是中文；英文/技术性文案则兜底
      return /[\u4e00-\u9fa5]/.test(detail) ? detail : fallback;
    }
  }
  if (typeof data === "string" && /[\u4e00-\u9fa5]/.test(data)) return data;
  return fallback;
}

/** 后台文件下载：带鉴权请求后落地为 Blob，用于模板等二进制资源。 */
export async function downloadAdminFile(
  path: string,
  filename: string,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<void> {
  const relativePath = `/api/backend/${path.replace(/^\/+/, "")}`;
  const search = query
    ? Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== "")
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join("&")
    : "";
  const base = typeof window === "undefined"
    ? new URL(relativePath, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    : new URL(relativePath, window.location.origin);
  const url = `${base.toString()}${search ? `?${search}` : ""}`;
  const headers = new Headers();
  const token = getAdminToken();
  if (token) headers.set("authorization", `Bearer ${token}`);
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(toFriendlyError(response.status, await response.text().catch(() => "")));
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export async function adminApi<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const relativePath = `/api/backend/${path.replace(/^\/+/, "")}`;
  const url = typeof window === "undefined"
    ? new URL(relativePath, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    : new URL(relativePath, window.location.origin);
  Object.entries(options.query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    // 后端全局限制 page_size ≤ 100，超了直接钳制，避免 422 报错
    if (key === "page_size" && Number(value) > 100) {
      url.searchParams.set(key, "100");
      return;
    }
    url.searchParams.set(key, String(value));
  });
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
    throw new Error(toFriendlyError(response.status, await response.text().catch(() => "")));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
