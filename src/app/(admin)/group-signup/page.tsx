"use client";

import { useEffect, useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "搭子社群", href: "/group-menu" },
  { label: "报名管理" },
];

type SignupContent = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  amount: number | null;
  status: number;
  sort: number;
  extra: Record<string, unknown>;
  created_at: string | null;
};

type SignupPage = { items: SignupContent[]; total: number; page: number; page_size: number };

const PAY_OPTIONS = ["不限", "免费", "已支付"] as const;
type PayKey = (typeof PAY_OPTIONS)[number];

export default function GroupSignupPage() {
  const [rows, setRows] = useState<SignupContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [group, setGroup] = useState("");
  const [pay, setPay] = useState<PayKey>("不限");
  const [keyword, setKeyword] = useState("");
  const [groups, setGroups] = useState<{ id: number; title: string }[]>([]);

  const load = async (page = pageIdx) => {
    try {
      const payMap: Record<PayKey, string> = { "不限": "", "免费": "free", "已支付": "paid" };
      const kw = [
        group && `group_id\\":${group}`,
        payMap[pay] && `pay\\":\\"${payMap[pay]}`,
        keyword && `nick\\":\\"${keyword}`,
      ].filter(Boolean).join(" ") || undefined;
      const resp = await adminApi<SignupPage>("admin/content/group_signup", {
        method: "GET",
        query: { page, page_size: 20, keyword: kw },
      });
      setRows(resp.items);
      setTotal(resp.total);
      setPageIdx(resp.page);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    }
  };

  useEffect(() => {
    void load(1);
    void adminApi<{ items: { id: number; title: string }[] }>("admin/content/community_group", {
      method: "GET",
      query: { page: 1, page_size: 200 },
    })
      .then((res) => setGroups((res.items ?? []).map((g) => ({ id: g.id, title: g.title }))))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该报名记录？")) return;
    try {
      await adminApi(`admin/content/group_signup/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">ℹ</span>
          <div className="ecl-notice-text">在这里可以查看到在您平台上报名入群的所有信息</div>
        </div>
      </div>

      <div className="finord-card">
        <div className="finord-filters gsm-filters">
          <select
            className="finord-select gsm-gap"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">所有社群</option>
            {groups.map((g) => (
              <option key={g.id} value={String(g.id)}>{g.title}</option>
            ))}
          </select>
          <select
            className="finord-select"
            value={pay}
            onChange={(e) => setPay(e.target.value as PayKey)}
          >
            {PAY_OPTIONS.map((p) => (
              <option key={p} value={p}>支付: {p}</option>
            ))}
          </select>
          <span className="finord-searchbox">
            <span className="finord-search-label">按昵称</span>
            <input
              className="finord-search-input gsm-search"
              placeholder="请输入"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void load(1);
              }}
            />
          </span>
          <button className="finord-btn finord-btn-primary gsm-search-btn" onClick={() => void load(1)}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table gsm-table">
            <thead>
              <tr>
                <th>报名时间</th>
                <th>昵称/手机</th>
                <th>资料完善</th>
                <th>实名认证</th>
                <th>加入社群</th>
                <th>第几次报名</th>
                <th>在线支付</th>
                <th>支付方式/单号</th>
                <th>推广红娘</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const extra = s.extra ?? {};
                return (
                  <tr key={s.id}>
                    <td className="gsm-time">{(s.created_at ?? "-").replace("T", " ").slice(0, 19)}</td>
                    <td>
                      <div className="gsm-nick">{typeof extra.nick === "string" ? extra.nick : (s.title || "-")}</div>
                      <div className="gsm-phone">{typeof extra.phone === "string" ? extra.phone : "-"}</div>
                    </td>
                    <td>{typeof extra.profile === "string" ? extra.profile : "-"}</td>
                    <td>{typeof extra.auth === "string" ? extra.auth : "-"}</td>
                    <td>{typeof extra.group_title === "string" ? extra.group_title : (s.subtitle ?? "-")}</td>
                    <td>
                      <div className="gsm-count">{typeof extra.signup_seq === "number" ? extra.signup_seq : 1}</div>
                      <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("历史记录敬请期待", "ok"); }}>报名历史</a>
                    </td>
                    <td>{s.amount && s.amount > 0 ? `¥${(s.amount).toFixed(2)}` : "免费"}</td>
                    <td>
                      <div>单号:{typeof extra.order_no === "string" ? extra.order_no : "-"}</div>
                      <div>方式:{typeof extra.pay_way === "string" ? extra.pay_way : "-"}</div>
                    </td>
                    <td>{typeof extra.promoter === "string" ? extra.promoter : "-"}</td>
                    <td>
                      <span className="gsm-ops">
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("查看用户资料", "ok"); }}>查看资料</a>
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void remove(s.id); }}>删除</a>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: 24, textAlign: "center", color: "#888" }}>
                    暂无报名记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="finord-pagination">
          <span className="finord-info">共 {total} 条</span>
          <div className="finord-pages">
            <button className="finord-page nav" onClick={() => load(Math.max(1, pageIdx - 1))} disabled={pageIdx <= 1}>‹</button>
            <span className="finord-page active">{pageIdx} / {totalPages}</span>
            <button className="finord-page nav" onClick={() => load(Math.min(totalPages, pageIdx + 1))} disabled={pageIdx >= totalPages}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
