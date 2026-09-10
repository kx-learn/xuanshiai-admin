"use client";

/**
 * 声明式配置页组件：读 admin_config_snapshot 配置域 + 整页表单 + 确定提交。
 * 覆盖文本/多行/数字/开关/图片/标签列表/对象列表（含上移下移）等配置形态。
 */

import { useEffect, useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { useConfigDomain, showConfigToast, pickAndUploadImage, asStr, asNumber, asBool, asStrList, type Dict } from "@/lib/platform-config";

export type ConfigFieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "switch" | "image" | "html" | "tags" | "objects";
  placeholder?: string;
  hint?: string;
  itemFields?: { key: string; label: string; type: "text" | "number" | "image" | "switch"; width?: number }[];
};

export type ConfigSectionDef = { title: string; fields: ConfigFieldDef[] };

export interface ConfigFormProps {
  breadcrumb: { label: string; href?: string }[];
  namespace: string;
  name: string;
  defaults: Dict;
  sections: ConfigSectionDef[];
  notice?: React.ReactNode;
}

function uploadPick(onDone: (url: string) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = () => pickAndUploadImage(input.files?.[0], onDone, (msg) => showConfigToast(msg, "error"));
  input.click();
}

export default function ConfigForm({ breadcrumb, namespace, name, defaults, sections, notice }: ConfigFormProps) {
  const { ready, loading, saving, snapshot, save } = useConfigDomain(namespace, defaults);
  const [values, setValues] = useState<Dict>({});

  useEffect(() => {
    if (snapshot?.config) setValues({ ...snapshot.config });
  }, [snapshot]);

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(snapshot?.config ?? {}), [values, snapshot]);

  if (!ready && loading) return <div><AdminBreadcrumb items={breadcrumb} /><div className="p-8 text-center text-[#999]">配置加载中…</div></div>;

  const get = (key: string) => values[key];
  const set = (key: string, v: unknown) => setValues((cur) => ({ ...cur, [key]: v }));

  const submit = async () => {
    const ok = await save(values, `更新${name}`);
    if (ok) showConfigToast("配置已保存并生效");
  };

  const renderField = (f: ConfigFieldDef) => {
    const v = get(f.key);
    switch (f.type) {
      case "textarea":
      case "html":
        return (
          <textarea
            value={asStr(v, "")}
            onChange={(e) => set(f.key, e.target.value)}
            rows={f.type === "html" ? 8 : 4}
            placeholder={f.placeholder}
            className="w-full rounded-md border border-[#d9d9d9] px-3 py-2 text-sm"
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={asNumber(v, 0)}
            onChange={(e) => set(f.key, Number(e.target.value || 0))}
            className="w-40 rounded-md border border-[#d9d9d9] px-3 py-2 text-sm"
          />
        );
      case "switch":
        return (
          <button
            type="button"
            onClick={() => set(f.key, !asBool(v, false))}
            className={`relative h-6 w-11 rounded-full transition-colors ${asBool(v, false) ? "bg-[#3658f7]" : "bg-[#d9d9d9]"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${asBool(v, false) ? "left-[22px]" : "left-0.5"}`} />
          </button>
        );
      case "image":
        return (
          <div className="flex items-center gap-3">
            {asStr(v, "") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asStr(v, "")} alt="preview" className="h-16 w-16 rounded object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-[#d9d9d9] text-[#bbb]">＋</div>
            )}
            <div className="flex flex-col gap-1">
              <button type="button" className="rounded border border-[#d9d9d9] px-3 py-1.5 text-sm hover:border-[#3658f7]" onClick={() => uploadPick((url) => set(f.key, url))}>上传图片</button>
              {asStr(v, "") && <button type="button" className="text-xs text-[#999] hover:text-[#f5222d]" onClick={() => set(f.key, null)}>移除图片</button>}
            </div>
          </div>
        );
      case "tags": {
        const list = asStrList(v, []);
        return (
          <div className="flex flex-wrap items-center gap-2">
            {list.map((tag, i) => (
              <span key={`${tag}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-[#f5f6fa] px-3 py-1 text-sm">
                {tag}
                <button type="button" className="text-[#999] hover:text-[#f5222d]" onClick={() => set(f.key, list.filter((_, idx) => idx !== i))}>×</button>
                {i > 0 && <button type="button" className="text-[#999] hover:text-[#3658f7]" onClick={() => { const arr = [...list]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; set(f.key, arr); }}>↑</button>}
              </span>
            ))}
            <button
              type="button"
              className="rounded-full border border-dashed border-[#d9d9d9] px-3 py-1 text-sm text-[#666] hover:border-[#3658f7]"
              onClick={() => {
                const tag = window.prompt("请输入名称");
                if (tag && tag.trim()) set(f.key, [...list, tag.trim()]);
              }}
            >＋ 添加</button>
          </div>
        );
      }
      case "objects": {
        const list = Array.isArray(v) ? (v as Dict[]) : [];
        const itemFields = f.itemFields ?? [{ key: "name", label: "名称", type: "text" as const }];
        return (
          <div className="flex flex-col gap-2">
            {list.map((item, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border border-[#f0f0f0] p-2">
                {itemFields.map((sf) => (
                  <span key={sf.key} className="flex items-center gap-1">
                    <span className="text-xs text-[#999]">{sf.label}</span>
                    {sf.type === "image" ? (
                      <button type="button" className="text-xs text-[#3658f7] hover:underline" onClick={() => uploadPick((url) => { const arr = [...list]; arr[i] = { ...arr[i], [sf.key]: url }; set(f.key, arr); })}>
                        {asStr(item[sf.key], "") ? "已传图" : "上传图"}
                      </button>
                    ) : sf.type === "switch" ? (
                      <button
                        type="button"
                        onClick={() => { const arr = [...list]; arr[i] = { ...arr[i], [sf.key]: !item[sf.key] }; set(f.key, arr); }}
                        className={`relative h-5 w-9 rounded-full transition-colors ${item[sf.key] ? "bg-[#3658f7]" : "bg-[#d9d9d9]"}`}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${item[sf.key] ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                    ) : (
                      <input
                        type={sf.type === "number" ? "number" : "text"}
                        value={asStr(item[sf.key], "")}
                        onChange={(e) => { const arr = [...list]; arr[i] = { ...arr[i], [sf.key]: sf.type === "number" ? Number(e.target.value || 0) : e.target.value }; set(f.key, arr); }}
                        className="rounded border border-[#d9d9d9] px-2 py-1 text-sm"
                        style={{ width: sf.width ?? 140 }}
                      />
                    )}
                  </span>
                ))}
                <span className="ml-auto flex gap-2 text-sm">
                  {i > 0 && <button type="button" className="text-[#666] hover:text-[#3658f7]" onClick={() => { const arr = [...list]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; set(f.key, arr); }}>上移</button>}
                  {i < list.length - 1 && <button type="button" className="text-[#666] hover:text-[#3658f7]" onClick={() => { const arr = [...list]; [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; set(f.key, arr); }}>下移</button>}
                  <button type="button" className="text-[#f5222d] hover:underline" onClick={() => set(f.key, list.filter((_, idx) => idx !== i))}>删除</button>
                </span>
              </div>
            ))}
            <button
              type="button"
              className="w-fit rounded border border-dashed border-[#d9d9d9] px-3 py-1.5 text-sm text-[#666] hover:border-[#3658f7]"
              onClick={() => set(f.key, [...list, Object.fromEntries(itemFields.map((sf) => [sf.key, sf.type === "switch" ? true : ""]))])}
            >＋ 添加</button>
          </div>
        );
      }
      default:
        return (
          <input
            type="text"
            value={asStr(v, "")}
            onChange={(e) => set(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full max-w-xl rounded-md border border-[#d9d9d9] px-3 py-2 text-sm"
          />
        );
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />
      {notice}
      {sections.map((section) => (
        <div key={section.title} className="finord-card ac-card mb-4">
          <h2 className="ac-title">{section.title}</h2>
          {section.fields.map((f) => (
            <div key={f.key} className="ac-row ac-row-top mb-3">
              <span className="ac-label">{f.label}</span>
              <div className="ac-content flex-1">
                {renderField(f)}
                {f.hint && <div className="ac-info">{f.hint}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}
      <div className="ac-submit-row pb-8">
        <button type="button" disabled={saving || !dirty} className="finord-btn finord-btn-primary ac-submit" onClick={submit}>
          {saving ? "保存中…" : "确定提交"}
        </button>
      </div>
    </div>
  );
}
