"use client";

/**
 * 通用内容域 CRUD 页面组件。
 * 对接后端通用接口 /admin/content/{domain}（列表/新增/编辑/删除）。
 * 通过 fields 声明式描述新建/编辑表单，columns 声明表格列，UI 沿用 ListPage。
 */

import { useCallback, useMemo, useState } from "react";
import ListPage, { type ColumnDef, type SearchField, type TabConfig } from "./ListPage";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { showConfigToast, pickAndUploadImage } from "@/lib/platform-config";
import { contentEndpoint, createContent, updateContent, deleteContent } from "@/lib/content-api";

/** 打开文件选择框并上传，成功后回调图片 URL。 */
function uploadPick(onDone: (url: string) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = () => pickAndUploadImage(input.files?.[0], onDone, (msg) => showConfigToast(msg, "error"));
  input.click();
}

export type ContentFieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "image" | "select" | "switch";
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  span?: 1 | 2;
};

export interface ContentCrudProps {
  breadcrumb: { label: string; href?: string }[];
  pageTitle: string;
  domain: string;
  columns: ColumnDef[];
  fields: ContentFieldDef[];
  tabs?: TabConfig[];
  /** tab key -> status 过滤值（1 启用 2 停用），其余 tab 不传 status */
  tabStatusMap?: Record<string, number | undefined>;
  searchPlaceholder?: string;
  addLabel?: string;
  notice?: React.ReactNode;
  titleKey?: string;
  readOnly?: boolean;
}

type FormValues = Record<string, string | number | boolean | null>;

export default function ContentCrud({
  breadcrumb, pageTitle, domain, columns, fields, tabs, tabStatusMap = {},
  searchPlaceholder = "请输入关键词", addLabel = "新增", notice, titleKey = "title", readOnly = false,
}: ContentCrudProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.key ?? "");

  // tab 对应的状态过滤值直接拼到 endpoint，切换 tab 时 endpoint 变化触发 ListPage 重新请求
  const endpoint = useMemo(() => {
    const st = tabStatusMap[activeTab];
    const base = contentEndpoint(domain);
    return st ? `${base}?status=${st}` : base;
  }, [domain, activeTab, tabStatusMap]);

  const searchFields: SearchField[] = useMemo(() => (
    [{ label: "关键词", key: "keyword", type: "input", placeholder: searchPlaceholder, width: 220 }]
  ), [searchPlaceholder]);

  const openCreate = useCallback(() => {
    const init: FormValues = {};
    fields.forEach((f) => {
      init[f.key] = f.type === "switch" ? true : f.type === "number" ? 0 : f.type === "select" ? (f.options?.[0]?.value ?? "") : "";
    });
    setValues(init);
    setEditing(null);
    setModalOpen(true);
  }, [fields]);

  const openEdit = useCallback((row: Record<string, unknown>) => {
    const init: FormValues = {};
    fields.forEach((f) => {
      const raw = row[f.key];
      init[f.key] = f.type === "switch" ? Boolean(raw) : raw === null || raw === undefined ? "" : (raw as string | number);
    });
    setValues(init);
    setEditing(row);
    setModalOpen(true);
  }, [fields]);

  const setValue = (key: string, value: string | number | boolean | null) =>
    setValues((cur) => ({ ...cur, [key]: value }));

  const submit = async () => {
    for (const f of fields) {
      if (f.required && (values[f.key] === "" || values[f.key] === null || values[f.key] === undefined)) {
        showConfigToast(`请填写${f.label}`, "error");
        return;
      }
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      fields.forEach((f) => {
        const v = values[f.key];
        if (f.key === titleKey) body.title = String(v ?? "");
        else if (f.type === "image") body.image_url = v ? String(v) : "";
        else if (f.type === "switch") body[f.key] = Boolean(v);
        else if (f.type === "number") body[f.key] = Number(v ?? 0);
        else body[f.key] = v;
      });
      if (editing) {
        await updateContent(domain, Number(editing.id), body);
        showConfigToast("修改已保存");
      } else {
        await createContent(domain, body);
        showConfigToast("创建成功");
      }
      setModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Record<string, unknown>) => {
    if (!window.confirm("确定删除该条记录吗？删除后不可恢复。")) return;
    try {
      await deleteContent(domain, Number(row.id));
      showConfigToast("已删除");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const tableColumns: ColumnDef[] = [
    ...columns,
    ...(readOnly ? [] : [{
      title: "操作",
      key: "__ops",
      width: 140,
      render: (row: Record<string, unknown>) => (
        <div className="flex gap-3">
          <button type="button" className="text-[#3658f7] hover:underline" onClick={() => openEdit(row)}>编辑</button>
          <button type="button" className="text-[#f5222d] hover:underline" onClick={() => remove(row)}>删除</button>
        </div>
      ),
    }]),
  ];

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />
      {notice}
      <ListPage
        breadcrumb={breadcrumb}
        pageTitle={pageTitle}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key)}
        searchFields={searchFields}
        onSearch={() => {/* appliedSearch 变化已自动触发重新请求 */}}
        onReset={() => {/* appliedSearch 清空已自动触发重新请求 */}}
        actions={readOnly ? [] : [{ label: `+ ${addLabel}`, variant: "primary", onClick: openCreate }]}
        columns={tableColumns}
        dataSource={[]}
        endpoint={endpoint}
        refreshKey={`${refreshKey}:${activeTab}:${tabStatusMap[activeTab] ?? ""}`}
        loading={false}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModalOpen(false)}>
          <div className="max-h-[85vh] w-[560px] overflow-auto rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium">{editing ? "编辑" : addLabel}</h3>
              <button type="button" className="text-[#999] hover:text-[#333]" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key} className={f.span === 2 || f.type === "textarea" ? "col-span-2" : "col-span-1"}>
                  <label className="mb-1 block text-sm text-[#666]">{f.label}{f.required && <span className="ml-0.5 text-[#f5222d]">*</span>}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      value={String(values[f.key] ?? "")}
                      onChange={(e) => setValue(f.key, e.target.value)}
                      placeholder={f.placeholder || `请输入${f.label}`}
                      rows={4}
                      className="w-full rounded-md border border-[#d9d9d9] px-3 py-2 text-sm"
                    />
                  ) : f.type === "image" ? (
                    <div className="flex items-center gap-3">
                      {values[f.key] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={String(values[f.key])} alt="preview" className="h-16 w-16 rounded object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-[#d9d9d9] text-[#bbb]">＋</div>
                      )}
                      <button
                        type="button"
                        className="rounded border border-[#d9d9d9] px-3 py-1.5 text-sm hover:border-[#3658f7]"
                        onClick={() => uploadPick((url) => setValue(f.key, url))}
                      >上传图片</button>
                    </div>
                  ) : f.type === "switch" ? (
                    <button
                      type="button"
                      onClick={() => setValue(f.key, !values[f.key])}
                      className={`relative h-6 w-11 rounded-full transition-colors ${values[f.key] ? "bg-[#3658f7]" : "bg-[#d9d9d9]"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${values[f.key] ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  ) : f.type === "select" ? (
                    <select
                      value={String(values[f.key] ?? "")}
                      onChange={(e) => setValue(f.key, e.target.value)}
                      className="w-full rounded-md border border-[#d9d9d9] px-3 py-2 text-sm"
                    >
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      value={String(values[f.key] ?? "")}
                      onChange={(e) => setValue(f.key, f.type === "number" ? Number(e.target.value || 0) : e.target.value)}
                      placeholder={f.placeholder || `请输入${f.label}`}
                      className="w-full rounded-md border border-[#d9d9d9] px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-md border border-[#d9d9d9] px-4 py-2 text-sm" onClick={() => setModalOpen(false)}>取消</button>
              <button type="button" disabled={saving} className="rounded-md bg-[#3658f7] px-4 py-2 text-sm text-white disabled:opacity-60" onClick={submit}>
                {saving ? "保存中…" : "确定提交"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
