"use client";
import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "财务管理", href: "/finance-config" },
  { label: "电子合同", href: "/e-contract-config" },
  { label: "合同管理" },
];

type ContractRow = {
  id: number;
  member_name: string;
  contract_name: string;
  contract_type: string;
  initiated_at: string;
  status: string;
  status_label: string;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "待签署",
  signed: "已签署",
  expired: "已过期",
  revoked: "已撤销",
};

export default function EContractListPage() {
  const [rows, setRows] = useState<ContractRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchField, setSearchField] = useState("member");
  const [keyword, setKeyword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminEndpoints.listContent("econtract_record", {
        page: 1,
        page_size: 50,
        keyword,
      });
      const items = (data.items ?? []) as ContractRow[];
      setRows(items);
      setTotal(data.total ?? items.length);
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">预知</div>
            <p>本系统接入了腾讯电子签合同系统...</p>
            <p><b>合同发起：</b>在"会员CRM-线上VIP-会员CRM-线下VIP"中进行操作</p>
            <p><b>合同签署：</b>合同发起后，会员进入"会员中心-我的合同"中完成签署</p>
            <p><b>合同管理：</b>在本页面中您可以管理、查看、下载所有的电子合同</p>
          </div>
        </div>
      </div>

      <div className="ecl-stats">
        <div className="ecl-stat">
          <div className="ecl-stat-icon blue">文</div>
          <div className="ecl-stat-meta">
            <div className="ecl-stat-label">已发起合同</div>
            <div className="ecl-stat-value">{total}条</div>
          </div>
        </div>
        <div className="ecl-stat">
          <div className="ecl-stat-icon red">文</div>
          <div className="ecl-stat-meta">
            <div className="ecl-stat-label">可用合同余量</div>
            <div className="ecl-stat-value">150条</div>
          </div>
          <button className="ecl-recharge">在线充值</button>
        </div>
      </div>

      <div className="finord-card">
        <div className="crh-head">
          <div className="crh-title">合同管理</div>
        </div>

        <div className="finord-filters ecl-filters">
          <select
            className="finord-select"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value="member">按会员昵称</option>
            <option value="contract_id">按合同编号</option>
          </select>
          <input
            className="finord-search-input"
            placeholder="请输入"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load();
            }}
          />
          <button className="finord-btn finord-btn-primary" onClick={load}>
            搜索
          </button>
          <button className="finord-btn finord-btn-outline ecl-demo">📃 客户签署流程演示</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>会员</th>
                <th>合同名称</th>
                <th>合同类型</th>
                <th>发起时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="ecl-empty">
                    <div className="ecl-empty-inner">
                      <div className="ecl-empty-icon">▤</div>
                      <div className="ecl-empty-text">{loading ? "加载中..." : "暂无数据"}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.member_name}</td>
                    <td>{r.contract_name}</td>
                    <td>{r.contract_type}</td>
                    <td>{r.initiated_at}</td>
                    <td>
                      <span className={`ecl-status ecl-status-${r.status}`}>
                        {r.status_label ?? STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td>
                      <button className="ecc-link">查看</button>
                      <button className="ecc-link">下载</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
