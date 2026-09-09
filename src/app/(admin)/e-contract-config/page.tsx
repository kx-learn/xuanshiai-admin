"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";
import { asObject, asStr, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

const DEFAULTS = { items: [] as unknown[] } as const;

interface ConfigRow {
  id: number;
  key: string;
  name: string;
  value: string;
  description: string;
  update_time: string | null;
}

export default function EContractConfigPage() {
  const domain = useConfigDomain<Dict>("econtract_config", DEFAULTS as Dict);
  const [rows, setRows] = useState<ConfigRow[]>([]);
  const [keyword, setKeyword] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.items) ? config!.items : [];
    setRows(list.map((r, i) => {
      const o = asObject(r as Dict);
      return {
        id: Number(o.id ?? i + 1),
        key: asStr(o.key, ""),
        name: asStr(o.name, ""),
        value: asStr(o.value, ""),
        description: asStr(o.description, ""),
        update_time: asStr(o.update_time, "") || null,
      };
    }));
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const saveEdit = async (row: ConfigRow, value: string) => {
    setEditingId(null);
    if (value === row.value) return;
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const next = rows.map((r) => (r.id === row.id ? { ...r, value, update_time: stamp } : r));
    setRows(next);
    const ok = await domain.save({ items: next } as Partial<Dict>, `合同配置「${row.name}」改为 ${value}`);
    if (ok) showConfigToast("已保存");
    else if (domain.error) showConfigToast(domain.error, "error");
  };

  const shown = useMemo(
    () => rows.filter((r) => !keyword || r.name.includes(keyword) || r.key.includes(keyword)),
    [rows, keyword],
  );

  const columns: ColumnDef[] = [
    { title: "编号", key: "id", width: 70 },
    { title: "配置名称", key: "configName" },
    {
      title: "配置值",
      key: "configValue",
      render: (row: Record<string, unknown>) => {
        const raw = shown.find((r) => r.id === Number(row.id));
        if (!raw) return String(row.configValue ?? "");
        if (editingId !== raw.id) return String(raw.value);
        return (
          <input
            autoFocus
            defaultValue={raw.value}
            style={{ width: "100%", minWidth: 120, padding: "4px 8px", border: "1px solid #d9d9d9", borderRadius: 4 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit(raw, (e.target as HTMLInputElement).value);
              if (e.key === "Escape") setEditingId(null);
            }}
            onBlur={(e) => saveEdit(raw, e.target.value)}
          />
        );
      },
    },
    { title: "说明", key: "description" },
    { title: "更新时间", key: "updateTime" },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (row: Record<string, unknown>) => (
        <span className="flex items-center gap-2">
          <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0" onClick={() => setEditingId(Number(row.id))}>编辑</button>
        </span>
      ),
    },
  ];

  const dataSource = shown.map((r) => ({
    id: r.id,
    configName: r.name,
    configValue: r.value,
    description: r.description,
    updateTime: r.update_time ? r.update_time.replace("T", " ").slice(0, 19) : "-",
  }));

  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "合同配置")}
      pageTitle="合同配置"
      columns={columns}
      dataSource={dataSource as unknown as Record<string, unknown>[]}
      rowKey="id"
      loading={domain.loading}
      pagination={{ current: 1, pageSize: 10, total: shown.length }}
      searchFields={[
        { label: "配置名称", key: "keyword", type: "input", placeholder: "请输入配置名称" },
      ]}
      onSearch={() => { /* 行内关键字由 keywordValue 受控 */ }}
      onReset={() => { setKeyword(""); }}
      keywordValue={keyword}
      onKeywordChange={setKeyword}
    />
  );
}
