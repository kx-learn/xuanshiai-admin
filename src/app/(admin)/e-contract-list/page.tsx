"use client";
import { useCallback, useEffect, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";
import { asObject, asStr, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

const DEFAULTS = { items: [] as unknown[] } as const;

interface ContractRow {
  id: number;
  contract_no: string;
  signer: string;
  type: string;
  sign_time: string | null;
  expire_time: string | null;
  status: string;
  file_url: string | null;
}

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "合同编号", key: "contractNo" },
  { title: "签署人", key: "signer" },
  { title: "合同类型", key: "contractType" },
  { title: "签署时间", key: "signTime" },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const colorMap: Record<string, string> = {
        "已签署": "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]",
        "待签署": "inline-block px-2 py-0.5 text-xs rounded bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]",
        "已过期": "inline-block px-2 py-0.5 text-xs rounded bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]",
        "已取消": "inline-block px-2 py-0.5 text-xs rounded bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]",
      };
      return <span className={colorMap[status] || ""}>{status}</span>;
    },
  },
  {
    title: "操作",
    key: "action",
    width: 140,
    render: () => (
      <span className="flex items-center gap-2">
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">查看</button>
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">下载</button>
      </span>
    ),
  },
];

export default function EContractListPage() {
  const domain = useConfigDomain<Dict>("econtract_records", DEFAULTS as Dict);
  const [rows, setRows] = useState<ContractRow[]>([]);

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.items) ? config!.items : [];
    setRows(list.map((r, i) => {
      const o = asObject(r as Dict);
      return {
        id: Number(o.id ?? i + 1),
        contract_no: asStr(o.contract_no, ""),
        signer: asStr(o.signer, ""),
        type: asStr(o.type, ""),
        sign_time: asStr(o.sign_time, "") || null,
        expire_time: asStr(o.expire_time, "") || null,
        status: asStr(o.status, "待签署"),
        file_url: asStr(o.file_url, "") || null,
      };
    }));
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const onAction = (kind: "查看" | "下载", row: ContractRow) => {
    if (row.file_url) {
      window.open(row.file_url, "_blank");
      return;
    }
    showConfigToast(`合同${kind}需接入电子签服务商后可用（当前为占位数据源）`, "error");
  };

  const dataSource = rows.map((r) => ({
    id: r.id,
    contractNo: r.contract_no,
    signer: r.signer,
    contractType: r.type,
    signTime: r.sign_time ? r.sign_time.replace("T", " ").slice(0, 19) : "-",
    expireTime: r.expire_time,
    status: r.status,
    file_url: r.file_url,
    __row: r,
  }));

  const columnsWithAction: ColumnDef[] = columns.map((c) =>
    c.key === "action"
      ? {
          ...c,
          render: (row: Record<string, unknown>) => (
            <span className="flex items-center gap-2">
              <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0" onClick={() => onAction("查看", row.__row as unknown as ContractRow)}>查看</button>
              <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0" onClick={() => onAction("下载", row.__row as unknown as ContractRow)}>下载</button>
            </span>
          ),
        }
      : c,
  );

  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "合同管理")}
      pageTitle="合同管理"
      columns={columnsWithAction}
      dataSource={dataSource as unknown as Record<string, unknown>[]}
      rowKey="id"
      loading={domain.loading}
      pagination={{ current: 1, pageSize: 10, total: rows.length }}
      searchFields={[
        { label: "合同编号", type: "input", placeholder: "请输入合同编号" },
        { label: "会员姓名", type: "input", placeholder: "请输入会员姓名" },
        { label: "状态", type: "select", options: [
          { label: "全部", value: "" },
          { label: "待签署", value: "pending" },
          { label: "已签署", value: "signed" },
          { label: "已过期", value: "expired" },
          { label: "已取消", value: "cancelled" },
        ]},
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
