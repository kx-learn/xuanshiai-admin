"use client";
import { useCallback, useEffect, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";
import { asObject, asStr, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";
import { X } from "lucide-react";

const DEFAULTS = { items: [] as unknown[] } as const;

interface TplRow {
  id: number;
  name: string;
  type: string;
  content: string;
  enabled: boolean;
  create_time: string | null;
}

export default function EContractTemplatePage() {
  const domain = useConfigDomain<Dict>("econtract_templates", DEFAULTS as Dict);
  const [rows, setRows] = useState<TplRow[]>([]);
  const [editing, setEditing] = useState<TplRow | null>(null);

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.items) ? config!.items : [];
    setRows(list.map((r, i) => {
      const o = asObject(r as Dict);
      return {
        id: Number(o.id ?? i + 1),
        name: asStr(o.name, ""),
        type: asStr(o.type, "红娘服务协议"),
        content: asStr(o.content, ""),
        enabled: o.enabled !== false,
        create_time: asStr(o.create_time, "") || null,
      };
    }));
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const persist = async (next: TplRow[], summary: string) => {
    setRows(next);
    const ok = await domain.save({ items: next } as Partial<Dict>, summary);
    if (ok) showConfigToast("已保存");
    else if (domain.error) showConfigToast(domain.error, "error");
  };

  const add = () => setEditing({ id: 0, name: "", type: "红娘服务协议", content: "", enabled: true, create_time: null });

  const columns: ColumnDef[] = [
    { title: "编号", key: "id", width: 70 },
    { title: "模板名称", key: "templateName" },
    { title: "模板类型", key: "templateType" },
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

  const stamp = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  };

  const remove = async (id: number) => {
    if (!window.confirm("确认删除该模板？")) return;
    await persist(rows.filter((r) => r.id !== id), "删除合同模板");
  };

  const save = async (row: TplRow) => {
    if (!row.name.trim()) { showConfigToast("请填写模板名称", "error"); return; }
    const exists = rows.some((r) => r.id === row.id);
    const next = exists
      ? rows.map((r) => (r.id === row.id ? row : r))
      : [...rows, { ...row, id: Date.now(), create_time: stamp() }];
    setEditing(null);
    await persist(next, exists ? `修改合同模板「${row.name}」` : `新增合同模板「${row.name}」`);
  };

  const dataSource = rows.map((r) => ({
    id: r.id,
    templateName: r.name,
    templateType: r.type,
    createTime: r.create_time ?? "-",
    status: r.enabled ? "启用" : "停用",
  }));

  return (
    <>
      <ListPage
        breadcrumb={getBreadcrumb("财务管理", "合同模板")}
        pageTitle="合同模板"
        columns={columns}
        dataSource={dataSource as unknown as Record<string, unknown>[]}
        rowKey="id"
        loading={domain.loading}
        pagination={{ current: 1, pageSize: 10, total: rows.length }}
        actions={[
          { label: "新增模板", variant: "primary", onClick: add },
        ]}
        onSearch={() => {}}
        onReset={() => {}}
      />
      {editing && (
        <TplModal
          row={editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </>
  );
}

function TplModal({ row, onClose, onSave }: { row: TplRow; onClose: () => void; onSave: (row: TplRow) => void }) {
  const [name, setName] = useState(row.name);
  const [type, setType] = useState(row.type);
  const [content, setContent] = useState(row.content);
  return (
    <div className="ec-modal-mask" onClick={onClose}>
      <div className="ec-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="ec-modal-header">
          <span className="ec-modal-title">{row.id ? "编辑模板" : "新增模板"}</span>
          <button type="button" className="ec-modal-close" aria-label="关闭" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="ec-modal-body">
          <div className="ec-row">
            <span className="ec-key">模板名称</span>
            <input className="ec-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入模板名称" />
          </div>
          <div className="ec-row">
            <span className="ec-key">模板类型</span>
            <select className="ec-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="红娘服务协议">红娘服务协议</option>
              <option value="会员服务协议">会员服务协议</option>
              <option value="线下约见协议">线下约见协议</option>
              <option value="保密协议">保密协议</option>
            </select>
          </div>
          <div className="ec-row">
            <span className="ec-key">模板内容</span>
            <textarea className="ec-input" rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="请输入合同模板正文" />
          </div>
        </div>
        <div className="ec-modal-footer">
          <button type="button" className="ec-cancel" onClick={onClose}>取消</button>
          <button type="button" className="ec-ok" onClick={() => onSave({ ...row, name, type, content })}>确定</button>
        </div>
      </div>
    </div>
  );
}
