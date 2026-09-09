"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi, resolveMediaUrl } from "@/lib/admin-api";

/* ------------------------------------------------------------------ */
/* 类型                                                                */
/* ------------------------------------------------------------------ */

export type JsonValue = unknown;

export interface ConfigSnapshot<T extends Dict = Dict> {
  namespace: string;
  name: string;
  description: string;
  version: number;
  config: T;
  sensitive_keys: string[];
  updated_by: number | null;
  updated_at: string | null;
}

export type Dict = Record<string, JsonValue>;

/* ------------------------------------------------------------------ */
/* 基础请求                                                            */
/* ------------------------------------------------------------------ */

export function readPlatformConfig<T extends Dict = Dict>(namespace: string) {
  return adminApi<ConfigSnapshot<T>>(`admin/configs/${namespace}`);
}

export function savePlatformConfig<T extends Dict = Dict>(
  namespace: string,
  version: number,
  config: T,
  changeSummary: string,
) {
  return adminApi<ConfigSnapshot<T>>(`admin/configs/${namespace}`, {
    method: "PATCH",
    body: { version, config, change_summary: changeSummary },
  });
}

/** 上传图片到后台（复用 /admin/common/upload），返回可直接展示的 URL */
export async function uploadAdminImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const result = await adminApi<{ url: string; content_type?: string; size?: number }>(
    "admin/common/upload",
    { method: "POST", body: form },
  );
  if (!result?.url) throw new Error("上传失败：未返回图片地址");
  return resolveMediaUrl(result.url) ?? result.url;
}

/** 点击文件选择后统一执行上传并回调 URL */
export function pickAndUploadImage(
  file: File | undefined | null,
  onDone: (url: string) => void,
  onError?: (message: string) => void,
) {
  if (!file) return;
  uploadAdminImage(file)
    .then((url) => onDone(url))
    .catch((error) => onError?.(error instanceof Error ? error.message : "图片上传失败"));
}

/* ------------------------------------------------------------------ */
/* 深合并：defaults < server < patch                                   */
/* ------------------------------------------------------------------ */

function isPlainObject(value: unknown): value is Dict {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function deepMerge<T>(base: T, ...sources: (Partial<T> | Dict | null | undefined)[]): T {
  let output: unknown = base;
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    if (Array.isArray(source) || Array.isArray(output)) {
      // 数组整体替换（不做元素级合并，避免脏数据残留）
      output = source;
      continue;
    }
    if (!isPlainObject(output)) {
      output = source;
      continue;
    }
    const result: Dict = { ...(output as Dict) };
    for (const [key, value] of Object.entries(source as Dict)) {
      if (value === undefined) continue;
      if (isPlainObject(value) && isPlainObject(result[key])) {
        result[key] = deepMerge(result[key] as Dict, value);
      } else {
        result[key] = value;
      }
    }
    output = result;
  }
  return output as T;
}

/** 用服务端值覆盖默认值：config 为 null/undefined 时返回 defaults 副本 */
export function mergeWithDefaults<T extends Dict>(defaults: T, config: T | Dict | null | undefined): T {
  return deepMerge(defaults, config ?? {});
}

/* ------------------------------------------------------------------ */
/* 取值小工具                                                          */
/* ------------------------------------------------------------------ */

/** 任意值 -> string，空值回退默认 */
export function asStr(value: unknown, fallback: string): string {
  if (typeof value === "string") return value === "" ? fallback : value;
  if (typeof value === "number") return String(value);
  return fallback;
}

/** 任意值 -> string | null（null/空串/非字符串非数字 -> null） */
export function asStrOrNull(value: unknown): string | null {
  if (typeof value === "string") return value === "" ? null : value;
  if (typeof value === "number") return String(value);
  return null;
}

/** 任意值 -> boolean */
export function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** 任意值 -> string[] */
export function asStrList(value: unknown, fallback: string[] = []): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : fallback;
}

/** 任意值 -> number，非法回退默认 */
export function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

/** 从对象取子对象，空则返回默认 */
export function asObject(value: unknown, fallback: Dict = {}): Dict {
  return isPlainObject(value) ? value : fallback;
}

/* ------------------------------------------------------------------ */
/* 配置域 Hook                                                         */
/* ------------------------------------------------------------------ */

export interface UseConfigDomain<T extends Dict> {
  ready: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  snapshot: ConfigSnapshot<T> | null;
  version: number;
  reload: () => Promise<void>;
  /** 将「当前编辑结果」与默认值/服务端值合并后提交；内容无变化时不提交 */
  save: (patch: Partial<T>, summary: string) => Promise<boolean>;
}

export function useConfigDomain<T extends Dict>(namespace: string, defaults: T): UseConfigDomain<T> {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<ConfigSnapshot<T> | null>(null);
  // 始终指向最新快照/版本，避免自动保存定时器与手动提交之间读到过期版本
  const snapshotRef = useRef<ConfigSnapshot<T> | null>(null);
  const inFlightRef = useRef(false);

  const applySnapshot = useCallback((data: ConfigSnapshot<T>) => {
    snapshotRef.current = data;
    setSnapshot(data);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readPlatformConfig<T>(namespace);
      applySnapshot(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "配置加载失败");
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, [namespace, applySnapshot]);

  const save = useCallback(
    async (patch: Partial<T>, summary: string) => {
      const base = snapshotRef.current;
      if (!base && !ready) await reload();
      const current = snapshotRef.current;
      const version = current?.version ?? 1;
      const merged = deepMerge(defaults, (current?.config ?? {}) as Dict, patch as Dict) as T;
      const unchanged = current !== null && JSON.stringify(current.config) === JSON.stringify(merged);
      if (unchanged) return false;
      if (inFlightRef.current) return false;
      inFlightRef.current = true;
      setSaving(true);
      setError(null);
      try {
        const data = await savePlatformConfig<T>(namespace, version, merged, summary);
        applySnapshot(data);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "配置保存失败");
        return false;
      } finally {
        inFlightRef.current = false;
        setSaving(false);
      }
    },
    [namespace, ready, reload, defaults, applySnapshot],
  );

  return { ready, loading, saving, error, snapshot, version: snapshot?.version ?? 1, reload, save };
}

/* ------------------------------------------------------------------ */
/* 全局轻提示（不影响页面 UI，仅用于保存结果反馈）                     */
/* ------------------------------------------------------------------ */

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function showConfigToast(message: string, kind: "ok" | "error" = "ok") {
  if (typeof document === "undefined") return;
  let node = document.getElementById("pcfg-toast-host") as HTMLDivElement | null;
  if (!node) {
    node = document.createElement("div");
    node.id = "pcfg-toast-host";
    document.body.appendChild(node);
  }
  const item = document.createElement("div");
  item.className = `pcfg-toast${kind === "error" ? " error" : ""}`;
  item.textContent = message;
  node.appendChild(item);
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    node?.querySelectorAll(".pcfg-toast").forEach((el) => el.remove());
  }, 3000);
}

/** 对任意页面内容做“改动即保存”的通用防抖控制器 */
export function useDebouncedFlush<T extends Dict>(deps: unknown[], flush: () => Promise<boolean>, delay = 800) {
  const flushed = useRef<() => Promise<boolean>>(flush);
  flushed.current = flush;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mounted.current) return;
      void flushed.current();
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
