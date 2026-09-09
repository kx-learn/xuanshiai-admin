"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, FileDown, Plus, Search } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import AdminPagination from "@/components/AdminPagination";
import DateRangePicker from "@/components/DateRangePicker";

type Lead = {
  id: number;
  name: string;
  phone: string | null;
  wechat: string | null;
  source: string;
  intention_level: 1 | 2 | 3;
  status: string;
  matchmaker_id: number | null;
  organization_id: number | null;
  next_follow_at: string | null;
  remark: string | null;
  created_by: number;
  converted_user_id: number | null;
  created_at: string;
};
type Page = {
  items: Lead[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
};
const empty: Page = {
  items: [],
  page: 1,
  page_size: 20,
  total: 0,
  has_more: false,
};
const statuses: Record<string, string> = {
  NEW: "待联系",
  CONTACTED: "已联系",
  INTENDED: "有意向",
  CONVERTED: "已入库",
  LOST: "已弃海",
  CLOSED: "已关闭",
};
const intent = (n: number) => ["", "低", "中", "高"][n] || "-";
const daysSince = (date: string) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
const isToday = (date: string) => {
  const d = new Date(date);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};

export default function Page() {
  const [data, setData] = useState<Page>(empty),
    [loading, setLoading] = useState(true),
    [keyword, setKeyword] = useState(""),
    [status, setStatus] = useState(""),
    [source, setSource] = useState(""),
    [message, setMessage] = useState("");
  const [total, setTotal] = useState(0);
  const [abandonCount, setAbandonCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"professional" | "simple">("professional");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [modal, setModal] = useState<
      "create" | "edit" | "follow" | "assign" | null
    >(null),
    [current, setCurrent] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    wechat: "",
    source: "",
    intention_level: "1",
    remark: "",
    status: "NEW",
    matchmaker_id: "",
    organization_id: "",
    method: "PHONE",
    content: "",
    next_follow_at: "",
  });

  const filterByDate = (items: Lead[]) => {
    if (!startDate && !endDate) return items;
    const fromTs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : -Infinity;
    const toTs = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Infinity;
    return items.filter((lead) => {
      const t = lead.created_at ? new Date(lead.created_at).getTime() : NaN;
      return Number.isFinite(t) && t >= fromTs && t <= toTs;
    });
  };
  const visibleLeads = filterByDate(data.items);
  const load = useCallback(
    async (page = 1, size = 20) => {
      setLoading(true);
      try {
        const [pageData, stats, abandoned] = await Promise.all([
          adminEndpoints.customerLeads({
            page,
            page_size: size,
            search: keyword || undefined,
            status: status || undefined,
            source: source || undefined,
          }),
          adminEndpoints.customerLeadStatistics(),
          adminEndpoints.abandonedCustomerLeads().catch(() => []),
        ]);
        setData(pageData as Page);
        setPageSize(size);
        setTotal((stats as { total: number }).total);
        setAbandonCount((abandoned as unknown[]).length);
        setMessage("");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    },
    [keyword, status, source],
  );
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>(".customer-lead-page table tbody tr"));
    if (viewMode === "simple") rows.forEach((row) => row.querySelector(".lead-selection-cell")?.remove());
    if (viewMode === "professional") rows.forEach((row) => { const cell = row.cells[0]; if (cell && !cell.querySelector("input[type=checkbox]")) { const box = document.createElement("input"); box.type = "checkbox"; cell.prepend(box); } if (cell && cell.querySelector("input[type=checkbox]") && !row.querySelector(".lead-selection-cell")) { const box = cell.querySelector("input[type=checkbox]")!; const selectionCell = document.createElement("td"); selectionCell.className = "lead-selection-cell"; selectionCell.appendChild(box); row.insertBefore(selectionCell, cell); } });
    const boxes = Array.from(document.querySelectorAll<HTMLInputElement>(".customer-lead-page table tbody input[type=checkbox]"));
    boxes.forEach((box, index) => { const item = data.items[index]; if (item) box.checked = selectedLeadIds.includes(item.id); });
    const handlers = boxes.map((box, index) => { const handler = () => { const item = data.items[index]; if (!item) return; setSelectedLeadIds((current) => box.checked ? [...new Set([...current, item.id])] : current.filter((id) => id !== item.id)); }; box.addEventListener("change", handler); return [box, handler] as const; });
    return () => handlers.forEach(([box, handler]) => box.removeEventListener("change", handler));
  }, [selectedLeadIds, data.items, viewMode]);
  const open = (kind: NonNullable<typeof modal>, lead?: Lead) => {
    setCurrent(lead || null);
    setForm(
      lead
        ? {
            name: lead.name,
            phone: lead.phone || "",
            wechat: lead.wechat || "",
            source: lead.source,
            intention_level: String(lead.intention_level),
            remark: lead.remark || "",
            status: lead.status,
            matchmaker_id: lead.matchmaker_id ? String(lead.matchmaker_id) : "",
            organization_id: lead.organization_id
              ? String(lead.organization_id)
              : "",
            method: "PHONE",
            content: "",
            next_follow_at: lead.next_follow_at?.slice(0, 16) || "",
          }
        : {
            name: "",
            phone: "",
            wechat: "",
            source: "",
            intention_level: "1",
            remark: "",
            status: "NEW",
            matchmaker_id: "",
            organization_id: "",
            method: "PHONE",
            content: "",
            next_follow_at: "",
          },
    );
    setModal(kind);
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (modal === "create")
        await adminEndpoints.createCustomerLead({
          name: form.name,
          phone: form.phone || null,
          wechat: form.wechat || null,
          source: form.source,
          intention_level: +form.intention_level,
          remark: form.remark || null,
        });
      if (modal === "edit" && current)
        await adminEndpoints.updateCustomerLead(current.id, {
          name: form.name,
          phone: form.phone || null,
          wechat: form.wechat || null,
          intention_level: +form.intention_level,
          status: form.status,
          remark: form.remark || null,
          next_follow_at: form.next_follow_at || null,
        });
      if (modal === "assign" && current)
        await adminEndpoints.assignCustomerLead(current.id, {
          matchmaker_id: form.matchmaker_id ? +form.matchmaker_id : null,
          organization_id: form.organization_id ? +form.organization_id : null,
        });
      if (modal === "follow" && current)
        await adminEndpoints.createCustomerLeadFollowUp(current.id, {
          method: form.method,
          content: form.content,
          intention_level: +form.intention_level,
          next_follow_at: form.next_follow_at || null,
        });
      setModal(null);
      await load(data.page);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };
  const exportCsv = () => {
    const csv = [
      "客源ID,称呼,手机,微信,来源,意向,状态",
      ...data.items.map((x) =>
        [
          x.id,
          x.name,
          x.phone || "",
          x.wechat || "",
          x.source,
          intent(x.intention_level),
          statuses[x.status] || x.status,
        ]
          .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
          .join(","),
      ),
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv" }),
    );
    link.download = "客源线索.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return (
    <div className="customer-lead-page">
      <AdminBreadcrumb items={getBreadcrumb("客源线索", "线索管理")} />
      <section className="customer-notice mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]">
        <h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2>
        <span>
          客源线索（简称“线索库”）是指您广泛通过各种渠道获取到的单身潜在客户简单信息以快速便捷的形式收集汇总到“线索管理”中，分派给红娘进行销售跟进，并丰富完善更多信息。
        </span>
        <br />
        <span>
          根据业务进展情况可将客源线索一键入库转入到会员资料库（会员CRM）中，系统会自动生成账号；新账号需完成安全的首次密码设置后登录。
        </span>
        <br />
        <span>
          已入库到“会员CRM”的客户线索在本页面中仅做记录查询，请在会员资料中管理，本页不再提供编辑和任何操作；删除客源记录不影响会员资料中的数据。
        </span>
      </section>
      <section className="bg-white px-5 pt-4">
        <div className="lead-tabs flex items-center justify-between border-b">
          <div>
            <b className="text-[#3658f7]">
              线索管理
            </b>
            <Link href="/love-customer-abandon">弃海客源({abandonCount})</Link>
            <Link href="/love-customer-abandon-log">弃海记录</Link>
          </div>
          <div className="flex gap-2 pb-3">
            <button
              onClick={() => open("create")}
              className="flex items-center gap-1 rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white"
            >
              <Plus size={15} />
              添加客源
            </button>
            <button className="flex items-center gap-1 rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white">▣ 智能录入</button>
            <Link href="/love-customer-statistics" className="flex items-center gap-1 whitespace-nowrap rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white"><BarChart3 size={15} />数据报表</Link>
            <button onClick={exportCsv} className="flex items-center gap-1 rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white"><FileDown size={15} />导出EXCEL</button>
          </div>
        </div>
        <div className="lead-filter-grid grid gap-3 pt-4 md:grid-cols-4 xl:grid-cols-8">
          {[ 
            "审核状态：不限",
            "分派跟进：不限",
            "客源状态：不限",
            "录入红娘：不限",
            "推广红娘",
            "录入管理员：不限",
          ].map((label) => (
            <select
              key={label}
              defaultValue=""
              className="h-10 rounded border border-[#ddd] bg-white px-3 text-left text-sm text-[#9aa1ad]"
            >
              <option value="">{label}</option><option>不限</option><option>已设置</option><option>未设置</option>
            </select>
          ))}
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded border border-[#ddd] bg-white px-3 text-sm text-[#9aa1ad]"><option value="">客源状态：不限</option>{Object.entries(statuses).map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select>
          <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="客户来源" className="h-10 rounded border border-[#ddd] px-3 text-sm placeholder:text-[#9aa1ad]" />
        </div>
        <button className="lead-more-filters" onClick={() => setShowMoreFilters((value) => !value)}>{showMoreFilters ? "收起选项" : "更多选项"}<span className="lead-chevron" /></button>
        {showMoreFilters && <div className="lead-extra-filters">
          {["客户性别：不限", "年龄：不限", "身高：不限", "职业：不限", "学历：不限", "家乡：不限", "现居：不限", "婚况：不限", "入库情况：不限"].map((label) => <select key={label} defaultValue="" className="lead-filter-select"><option value="">{label}</option><option>不限</option><option>已填写</option></select>)}
          <input placeholder="标签：不限（多选）" />
          <div className="lead-date-ranges">
            <DateRangePicker label="录" startValue={startDate} endValue={endDate} onStartChange={setStartDate} onEndChange={setEndDate} className="w-full max-w-[300px]" />
            <DateRangePicker label="派" startValue={assignStartDate} endValue={assignEndDate} onStartChange={setAssignStartDate} onEndChange={setAssignEndDate} className="w-full max-w-[300px]" />
          </div>
          <label><input type="checkbox" /> 隐藏今日已跟进</label><label><input type="checkbox" /> 隐藏今日已通话</label><label><input type="checkbox" /> 有电话</label><label><input type="checkbox" /> 有微信</label>
        </div>}
        <div className="lead-search-row flex flex-wrap items-end gap-3 py-4">
          <div className="flex items-end"><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="请输入称呼/微信号/手机号/ID" className="h-10 w-[430px] rounded border border-[#ddd] px-3 text-sm placeholder:text-[#b4bac5]" /></div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => void load()}
              className="flex h-10 items-center gap-1 rounded bg-[#3658f7] px-5 text-sm text-white"
            >
              <Search size={14} />
              搜索
            </button>
            <button
              onClick={() => {
                setKeyword("");
                setStatus("");
                setSource("");
              }}
              className="h-10 rounded border px-4 text-sm"
            >
              重置
            </button>
          </div>
          <span className="pb-2 text-sm">排序：录入时间</span>
          <div className="lead-mode-switch">{viewMode === "simple" && <button className="lead-settings" aria-label="简洁模式设置">⚙</button>}<button className={viewMode === "simple" ? "active" : ""} onClick={() => setViewMode("simple")}>简洁</button><button className={viewMode === "professional" ? "active" : ""} onClick={() => setViewMode("professional")}>专业</button></div>
        </div>
        <div className="lead-metrics-grid grid grid-cols-2 gap-3 md:grid-cols-6">
          {[
            ["全部", visibleLeads.length],
            ["未分派", visibleLeads.filter((x) => !x.matchmaker_id).length],
            ["今日跟进", visibleLeads.filter((x) => x.next_follow_at && isToday(x.next_follow_at)).length],
            ["从未跟进", visibleLeads.filter((x) => !x.next_follow_at).length],
            ["超3天未跟进", visibleLeads.filter((x) => !x.next_follow_at && daysSince(x.created_at) > 3).length],
            ["今日需跟进", visibleLeads.filter((x) => x.next_follow_at && isToday(x.next_follow_at)).length],
          ].map(([n, c]) => (
            <div key={String(n)} className={`lead-metric-card ${n === "全部" ? "selected" : ""}`}>
              <div className="text-xs text-[#888]">{n}</div>
              <div className="mt-1 text-xl">{String(c)}</div>
            </div>
          ))}
        </div>
      </section>
      <div className="overflow-x-auto bg-white">
        <table className="w-full min-w-[1580px] text-sm">
          <thead className="bg-[#fafafa] text-[#666]">
            <tr>
              {(viewMode === "simple" ? ["", "标记", "客源ID", "称呼", "姓名", "性别", "出生", "婚况", "学历", "身高", "职业", "来源", "录入", "跟进", "状态", "审核", "意向", "标签", "入库状态", "描述", "操作"] : ["", "客源ID", "资料", "客户意向", "来源", "审核", "录入人", "状态", "分派跟进", "跟进", "通话", "入库状态", "操作"]).map((x, index) => (
                <th
                  key={x}
                  className="border-b px-3 py-3 text-left font-normal"
                >
                  {index === 0 ? <input type="checkbox" aria-label="全选线索" checked={visibleLeads.length > 0 && selectedLeadIds.length === visibleLeads.length} onChange={(event) => setSelectedLeadIds(event.target.checked ? visibleLeads.map((item) => item.id) : [])} /> : x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={viewMode === "simple" ? "lead-simple-body" : "lead-professional-body"}>
            {loading ? (
              <tr>
                <td colSpan={12} className="p-10 text-center text-[#999]">
                  加载中...
                </td>
              </tr>
            ) : visibleLeads.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-10 text-center text-[#999]">
                  暂无客源线索
                </td>
              </tr>
            ) : (
              visibleLeads.map((x) => (
                <tr
                  key={x.id}
                  className="border-b align-top hover:bg-[#fafcff]"
                >
                  {viewMode === "simple" ? <><td className="px-3 py-3"><input type="checkbox" /></td><td className="px-3 py-3">-</td><td className="px-3 py-3 text-[#3658f7]">{x.id}</td><td className="px-3 py-3">{x.name || "-"}</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">{x.source || "-"}</td><td className="px-3 py-3 text-xs">账号 #{x.created_by}<br />{new Date(x.created_at).toLocaleString("zh-CN")}</td><td className="px-3 py-3"><select className="lead-cell-select" defaultValue={x.matchmaker_id ? "已分派" : "待分派"}><option>待分派</option><option>已分派</option></select></td><td className="px-3 py-3"><select className="lead-cell-select" defaultValue={x.phone || x.wechat ? "已填写" : "未设置"}><option>未设置</option><option>已填写</option></select></td><td className="px-3 py-3"><select className="lead-cell-select" defaultValue="有效"><option>有效</option><option>无效</option></select></td><td className="px-3 py-3"><select className="lead-cell-select" defaultValue={String(x.intention_level)}><option value="1">低意向</option><option value="2">中意向</option><option value="3">高意向</option></select></td><td className="px-3 py-3"><span className="simple-tag">-</span></td><td className="px-3 py-3"><span className={x.converted_user_id ? "simple-converted" : "simple-not-converted"}>{x.converted_user_id ? "已入库" : "未入库"}</span>{x.converted_user_id && <small className="block">#{x.converted_user_id}</small>}</td><td className="px-3 py-3">{x.remark || "-"}</td><td className="px-3 py-3 whitespace-nowrap text-[#3658f7]"><button>入库</button><button>详情</button><button onClick={() => open("follow", x)}>跟进</button><button>溯源</button></td></> : <><td className="px-3 py-3 text-[#3658f7]">{x.id}</td>
                  <td className="px-3 py-3">
                    <div className="lead-profile"><div className="lead-avatar">#{x.id}</div><div><b>{x.name || "-"}</b>{x.phone && <span className="lead-tag">有电话</span>}{x.wechat && <span className="lead-tag">有微信</span>}</div></div>
                    <div className="lead-actions"><button>基本资料</button><button>择偶要求</button><button onClick={() => open("follow", x)}>跟进信息</button><button className="lead-more-button">更多</button></div>
                  </td>
                  <td className="px-3 py-3"><select className="lead-cell-select" defaultValue={String(x.intention_level)}><option value="1">低意向</option><option value="2">中意向</option><option value="3">高意向</option></select></td>
                  <td className="px-3 py-3">{x.source || "-"}</td>
                  <td className="px-3 py-3"><select className="lead-cell-select valid" defaultValue="有效"><option>有效</option><option>无效</option></select></td>
                  <td className="px-3 py-3 text-xs">
                    账号 #{x.created_by}
                    <br />
                    <span className="text-[#777]">#{x.created_by}</span>
                    <br />
                    <span className="text-[#999]">
                      {new Date(x.created_at).toLocaleString("zh-CN")}
                    </span>
                  </td>
                  <td className="px-3 py-3"><select className="lead-cell-select" defaultValue={statuses[x.status] || x.status}><option>未设置</option><option>待联系</option><option>已联系</option><option>有意向</option></select></td>
                  <td className="px-3 py-3"><select className="lead-cell-select" defaultValue={x.matchmaker_id ? `红娘 #${x.matchmaker_id}` : "待分派"}><option>待分派</option><option>已分派</option></select></td>
                  <td className="px-3 py-3 text-xs text-[#777]">
                    <div>从未跟进</div>
                    <div className="text-[#ff7a21]">{daysSince(x.created_at)}天<span className="text-[#777]">未跟进</span></div>
                    <button onClick={() => open("follow", x)} className="mt-1 text-[#3658f7]">放入弃海</button>
                  </td>
                  <td className="px-3 py-3 text-[#999]">从未通话</td>
                  <td className="px-3 py-3">
                    {x.converted_user_id ? (
                      <span className="text-[#37a35b]">
                        已入库
                        <br />#{x.converted_user_id}
                      </span>
                    ) : (
                      <span>未入库</span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-[#3658f7]"><button onClick={() => (x.converted_user_id ? undefined : open("edit", x))}>{x.converted_user_id ? "查看会员" : "一键入库"}</button></td></>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedLeadIds.length > 0 && <div className="lead-bulk-toolbar"><span>已选择 <b>{selectedLeadIds.length}</b> 项</span><select><option>更换分派跟进</option></select><select><option>更换推广红娘</option></select><button>有效</button><button>待核</button><button>无效</button><button>打标签</button><button>批量删除</button><button>批量弃海</button><button>批量入库</button></div>}
      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      <AdminPagination
        page={data.page}
        pageSize={data.page_size}
        total={data.total}
        onPageChange={(p) => void load(p, data.page_size)}
        onPageSizeChange={(size) => void load(1, size)}
      />
      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-[520px] rounded bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex justify-between">
              <b>
                {modal === "create"
                  ? "添加客源"
                  : modal === "edit"
                    ? "编辑客源"
                    : modal === "assign"
                      ? "分派跟进"
                      : "新增跟进"}
              </b>
              <button type="button" onClick={() => setModal(null)}>
                关闭
              </button>
            </div>
            {modal === "assign" ? (
              <>
                <Field
                  label="服务红娘 ID"
                  value={form.matchmaker_id}
                  set={(v) => setForm({ ...form, matchmaker_id: v })}
                />
                <Field
                  label="门店 ID"
                  value={form.organization_id}
                  set={(v) => setForm({ ...form, organization_id: v })}
                />
              </>
            ) : modal === "follow" ? (
              <>
                <Select
                  label="跟进方式"
                  value={form.method}
                  set={(v) => setForm({ ...form, method: v })}
                  options={[
                    ["PHONE", "电话"],
                    ["WECHAT", "微信"],
                    ["VISIT", "到访"],
                    ["OTHER", "其他"],
                  ]}
                />
                <textarea
                  required
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  placeholder="跟进内容"
                  className="mt-3 h-24 w-full rounded border p-2 text-sm"
                />
              </>
            ) : (
              <>
                <Field
                  label="称呼"
                  value={form.name}
                  set={(v) => setForm({ ...form, name: v })}
                  required
                />
                <Field
                  label="手机"
                  value={form.phone}
                  set={(v) => setForm({ ...form, phone: v })}
                />
                <Field
                  label="微信"
                  value={form.wechat}
                  set={(v) => setForm({ ...form, wechat: v })}
                />
                {modal === "create" && (
                  <Field
                    label="客户来源"
                    value={form.source}
                    set={(v) => setForm({ ...form, source: v })}
                    required
                  />
                )}
                <Select
                  label="客户意向"
                  value={form.intention_level}
                  set={(v) => setForm({ ...form, intention_level: v })}
                  options={[
                    ["1", "低"],
                    ["2", "中"],
                    ["3", "高"],
                  ]}
                />
                {modal === "edit" && (
                  <Select
                    label="客源状态"
                    value={form.status}
                    set={(v) => setForm({ ...form, status: v })}
                    options={Object.entries(statuses)}
                  />
                )}
                <textarea
                  value={form.remark}
                  onChange={(e) => setForm({ ...form, remark: e.target.value })}
                  placeholder="备注"
                  className="mt-3 h-20 w-full rounded border p-2 text-sm"
                />
              </>
            )}
            <label className="mt-3 block text-sm">
              下次跟进{" "}
              <input
                type="datetime-local"
                value={form.next_follow_at}
                onChange={(e) =>
                  setForm({ ...form, next_follow_at: e.target.value })
                }
                className="rounded border p-1"
              />
            </label>
            <div className="mt-5 text-right">
              <button
                disabled={saving}
                className="rounded bg-[#3658f7] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
function Field({
  label,
  value,
  set,
  required,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="mt-3 block text-sm">
      {label}
      <input
        required={required}
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1 block h-8 w-full rounded border px-2"
      />
    </label>
  );
}
function Select({
  label,
  value,
  set,
  options,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  options: string[][];
}) {
  return (
    <label className="block text-sm">
      {label}
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1 block h-8 w-full rounded border bg-white px-2"
      >
        {options.map(([v, n]) => (
          <option value={v} key={v}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
