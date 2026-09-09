"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";
import { asObject, asStr, pickAndUploadImage, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";
import { X } from "lucide-react";

const DEFAULTS = { items: [] as unknown[] } as const;

interface SealRow {
  id: number;
  name: string;
  image_url: string | null;
  type: string;
  enabled: boolean;
  create_time: string | null;
}

export default function EContractYinzhangPage() {
  const domain = useConfigDomain<Dict>("econtract_seals", DEFAULTS as Dict);
  const [rows, setRows] = useState<SealRow[]>([]);
  const [editing, setEditing] = useState<SealRow | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.items) ? config!.items : [];
    setRows(list.map((r, i) => {
      const o = asObject(r as Dict);
      return {
        id: Number(o.id ?? i + 1),
        name: asStr(o.name, ""),
        image_url: asStr(o.image_url, "") || null,
        type: asStr(o.type, "公章"),
        enabled: o.enabled !== false,
        create_time: asStr(o.create_time, "") || null,
      };
    }));
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const persist = async (next: SealRow[], summary: string) => {
    setRows(next);
    const ok = await domain.save({ items: next } as Partial<Dict>, summary);
    if (ok) showConfigToast("已保存");
    else if (domain.error) showConfigToast(domain.error, "error");
  };

  const stamp = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  };

  const remove = async (id: number) => {
    if (!window.confirm("确认删除该印章？")) return;
    await persist(rows.filter((r) => r.id !== id), "删除印章");
  };

  const save = async (row: SealRow) => {
    if (!row.name.trim()) { showConfigToast("请填写印章名称", "error"); return; }
    const exists = rows.some((r) => r.id === row.id);
    const next = exists
      ? rows.map((r) => (r.id === row.id ? row : r))
      : [...rows, { ...row, id: Date.now(), create_time: stamp() }];
    setEditing(null);
    await persist(next, exists ? `修改印章「${row.name}」` : `新增印章「${row.name}」`);
  };

  const columns: ColumnDef[] = [
    { title: "编号", key: "id", width: 70 },
    { title: "印章名称", key: "sealName" },
    {
      title: "印章图片",
      key: "sealImage",
      render: (row: Record<string, unknown>) => {
        const raw = rows.find((r) => r.id === Number(row.id));
        return raw?.image_url
          ? <img src={raw.image_url} alt="印章" style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 4, border: "1px solid #eee" }} />
          : <span className="text-[#999] text-sm">未上传</span>;
      },
    },
    { title: "印章类型", key: "sealType" },
    { title: "创建时间", key: "createTime" },
    {
      title: "状态",
      key: "status",
      width: 80,
      render: (row: Record<string, unknown>) => {
        const status = String(row.status ?? "");
        return (
          <span className={status === "启用" ? "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "inline-block px-2 py-0.5 text-xs rounded bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]"}>
            {status}
          </span>
        );
      },
    },
    {
      title: "操作",
      key: "action",
      width: 140,
      render: (row: Record<string, unknown>) => (
        <span className="flex items-center gap-2">
          <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0" onClick={() => setEditing(rows.find((r) => r.id === Number(row.id)) ?? null)}>编辑</button>
          <button type="button" className="text-[#ff4d4f] hover:text-[#ff7875] text-sm cursor-pointer bg-transparent border-none p-0" onClick={() => remove(Number(row.id))}>删除</button>
        </span>
      ),
    },
  ];

  const dataSource = rows.map((r) => ({
    id: r.id,
    sealName: r.name,
    sealType: r.type,
    createTime: r.create_time ?? "-",
    status: r.enabled ? "启用" : "停用",
  }));

  return (
    <>
      <ListPage
        breadcrumb={getBreadcrumb("财务管理", "印章管理")}
        pageTitle="印章管理"
        columns={columns}
        dataSource={dataSource as unknown as Record<string, unknown>[]}
        rowKey="id"
        loading={domain.loading}
        pagination={{ current: 1, pageSize: 10, total: rows.length }}
        actions={[
          { label: "添加印章", variant: "primary", onClick: () => setEditing({ id: 0, name: "", image_url: null, type: "公章", enabled: true, create_time: null }) },
        ]}
        onSearch={() => {}}
        onReset={() => {}}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          pickAndUploadImage(file, (url) => setEditing((cur) => (cur ? { ...cur, image_url: url } : cur)), (msg) => showConfigToast(msg, "error"));
        }}
      />
      {editing && (
        <SealModal row={editing} onPickImage={() => fileRef.current?.click()} onClose={() => setEditing(null)} onSave={save} />
      )}
    </>
  );
}

function SealModal({ row, onPickImage, onClose, onSave }: { row: SealRow; onPickImage: () => void; onClose: () => void; onSave: (row: SealRow) => void }) {
  const [name, setName] = useState(row.name);
  const [type, setType] = useState(row.type);
  const [enabled, setEnabled] = useState(row.enabled);
  return (
    <div className="ec-modal-mask" onClick={onClose}>
      <div className="ec-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="ec-modal-header">
          <span className="ec-modal-title">{row.id ? "编辑印章" : "添加印章"}</span>
          <button type="button" className="ec-modal-close" aria-label="关闭" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="ec-modal-body">
          <div className="ec-row">
            <span className="ec-key">印章名称</span>
            <input className="ec-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入印章名称" />
          </div>
          <div className="ec-row">
            <span className="ec-key">印章类型</span>
            <select className="ec-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="公章">公章</option>
              <option value="合同章">合同章</option>
              <option value="财务章">财务章</option>
              <option value="法人章">法人章</option>
            </select>
          </div>
          <div className="ec-row">
            <span className="ec-key">印章图片</span>
            <div className="flex items-center gap-3">
              {row.image_url
                ? <img src={row.image_url} alt="印章" style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 4, border: "1px solid #eee" }} />
                : <span className="text-[#999] text-sm">未上传</span>}
              <button type="button" className="ec-btn" onClick={onPickImage}>上传图片</button>
            </div>
          </div>
          <div className="ec-row">
            <span className="ec-key">状态</span>
            <button type="button" className={`tm-switch${enabled ? " on" : ""}`} onClick={() => setEnabled((v) => !v)}>
              <span className="tm-switch-text">{enabled ? "开" : "关"}</span>
              <span className="tm-switch-knob" />
            </button>
          </div>
        </div>
        <div className="ec-modal-footer">
          <button type="button" className="ec-cancel" onClick={onClose}>取消</button>
          <button type="button" className="ec-ok" onClick={() => onSave({ ...row, name, type, enabled })}>确定</button>
        </div>
      </div>
    </div>
  );
}
