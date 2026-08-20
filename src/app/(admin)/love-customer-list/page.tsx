"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FileDown, Plus, Search } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { getAdminToken } from "@/lib/admin-api";

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
const demoLeads: Lead[] = [
  { id: 8, name: "~", phone: "", wechat: "", source: "", intention_level: 2, status: "NEW", matchmaker_id: null, organization_id: null, next_follow_at: null, remark: null, created_by: 54, converted_user_id: null, created_at: "2026-08-20 23:14:41" },
  { id: 7, name: "大洋", phone: "", wechat: "", source: "", intention_level: 2, status: "NEW", matchmaker_id: null, organization_id: null, next_follow_at: null, remark: null, created_by: 1, converted_user_id: null, created_at: "2026-07-23 18:25:18" },
  { id: 6, name: "琴琴", phone: "", wechat: "", source: "", intention_level: 2, status: "NEW", matchmaker_id: null, organization_id: null, next_follow_at: null, remark: null, created_by: 1, converted_user_id: null, created_at: "2026-06-04 17:09:29" },
  { id: 5, name: "毛毛", phone: "", wechat: "", source: "", intention_level: 2, status: "NEW", matchmaker_id: null, organization_id: null, next_follow_at: null, remark: null, created_by: 1, converted_user_id: null, created_at: "2026-05-27 20:34:05" },
];

export default function Page() {
  const [data, setData] = useState<Page>(empty),
    [loading, setLoading] = useState(true),
    [keyword, setKeyword] = useState(""),
    [status, setStatus] = useState(""),
    [source, setSource] = useState(""),
    [message, setMessage] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
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
  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        if (getAdminToken() === "local-demo-token") {
          setData({ items: demoLeads, page, page_size: 20, total: 8, has_more: false });
          setMessage("");
          return;
        }
        setData(
          (await adminEndpoints.customerLeads({
            page,
            page_size: 20,
            search: keyword || undefined,
            status: status || undefined,
            source: source || undefined,
          })) as Page,
        );
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
      <section className="mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]">
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
        <div className="flex items-center justify-between border-b">
          <div className="flex gap-7 text-sm">
            <b className="border-b-2 border-[#3658f7] pb-3 text-[#3658f7]">
              线索管理
            </b>
            <button className="pb-3 text-[#666]">弃海客源</button>
            <button className="pb-3 text-[#666]">弃海记录</button>
          </div>
          <div className="flex gap-2 pb-3">
            <button
              onClick={() => open("create")}
              className="flex items-center gap-1 rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white"
            >
              <Plus size={15} />
              添加客源
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1 rounded border px-3 py-1.5 text-sm"
            >
              <FileDown size={15} />
              导出 Excel
            </button>
            <button className="flex items-center gap-1 rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white">▣ 智能录入</button>
            <button className="flex items-center gap-1 rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white">⌁ 数据报表</button>
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
          <Select label="客源状态" value={status} set={setStatus} options={[["", "全部"], ...Object.entries(statuses)]} />
          <Field label="客户来源" value={source} set={setSource} />
        </div>
        <button className="lead-more-filters" onClick={() => setShowMoreFilters((value) => !value)}>{showMoreFilters ? "收起选项" : "更多选项"}<span className="lead-chevron" /></button>
        {showMoreFilters && <div className="lead-extra-filters">
          {["客户性别：不限", "年龄：不限", "身高：不限", "职业：不限", "学历：不限", "家乡：不限", "现居：不限", "婚况：不限", "入库情况：不限"].map((label) => <select key={label} defaultValue="" className="lead-filter-select"><option value="">{label}</option><option>不限</option><option>已填写</option></select>)}
          <input placeholder="标签：不限（多选）" />
          <input placeholder="开始日期       →  结束日期" />
          <input placeholder="开始日期       →  结束日期" />
          <label><input type="checkbox" /> 隐藏今日已跟进</label><label><input type="checkbox" /> 隐藏今日已通话</label><label><input type="checkbox" /> 有电话</label><label><input type="checkbox" /> 有微信</label>
        </div>}
        <div className="lead-search-row flex flex-wrap items-end gap-3 py-4">
          <Field label="称呼/微信/手机/ID" value={keyword} set={setKeyword} />
          <div className="flex items-end gap-2">
            <button
              onClick={() => void load()}
              className="flex h-8 items-center gap-1 rounded bg-[#3658f7] px-4 text-sm text-white"
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
              className="h-8 rounded border px-3 text-sm"
            >
              重置
            </button>
          </div>
          <span className="pb-2 text-sm">排序：录入时间</span>
          <span className="pb-2 text-sm text-[#3658f7]">简洁 | 专业</span>
        </div>
        <div className="grid grid-cols-2 gap-px border-y bg-[#eef0f5] md:grid-cols-6">
          {[
            ["全部", data.total],
            ["未分派", data.items.filter((x) => !x.matchmaker_id).length],
            ["待联系", data.items.filter((x) => x.status === "NEW").length],
            [
              "有意向",
              data.items.filter((x) => x.status === "INTENDED").length,
            ],
            [
              "今日需跟进",
              data.items.filter(
                (x) =>
                  x.next_follow_at &&
                  new Date(x.next_follow_at).toDateString() ===
                    new Date().toDateString(),
              ).length,
            ],
            [
              "已入库",
              data.items.filter((x) => x.status === "CONVERTED").length,
            ],
          ].map(([n, c]) => (
            <div key={String(n)} className="bg-white px-4 py-3">
              <div className="text-xs text-[#888]">{n}</div>
              <div className="mt-1 text-xl">{String(c)}</div>
            </div>
          ))}
        </div>
        <div className="py-3 text-sm text-[#777]">
          共 {data.total} 条，按录入时间倒序 | 专业模式
        </div>
      </section>
      <div className="overflow-x-auto bg-white">
        <table className="w-full min-w-[1580px] text-sm">
          <thead className="bg-[#fafafa] text-[#666]">
            <tr>
              {[
                "客源ID",
                "资料",
                "客户意向",
                "来源",
                "审核",
                "录入人",
                "状态",
                "分派跟进",
                "跟进",
                "通话",
                "入库状态",
                "操作",
              ].map((x) => (
                <th
                  key={x}
                  className="border-b px-3 py-3 text-left font-normal"
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} className="p-10 text-center text-[#999]">
                  加载中...
                </td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-10 text-center text-[#999]">
                  暂无客源线索
                </td>
              </tr>
            ) : (
              data.items.map((x) => (
                <tr
                  key={x.id}
                  className="border-b align-top hover:bg-[#fafcff]"
                >
                  <td className="px-3 py-3 text-[#3658f7]">{x.id}</td>
                  <td className="px-3 py-3">
                    <div className="lead-profile"><div className="lead-avatar">男 31岁</div><div><b>{x.name}</b><span className="lead-tag">有电话</span></div></div>
                    <div className="lead-actions"><button>基本资料</button><button>择偶要求</button><button onClick={() => open("follow", x)}>跟进信息</button><button className="lead-more-button">更多</button></div>
                  </td>
                  <td className="px-3 py-3"><select className="lead-cell-select" defaultValue={String(x.intention_level)}><option value="1">低意向</option><option value="2">中意向</option><option value="3">高意向</option></select></td>
                  <td className="px-3 py-3">{x.source || "-"}</td>
                  <td className="px-3 py-3"><select className="lead-cell-select valid" defaultValue="有效"><option>有效</option><option>无效</option></select></td>
                  <td className="px-3 py-3 text-xs">
                    管理员
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
                  <td className="px-3 py-3 whitespace-nowrap text-[#3658f7]"><button onClick={() => (x.converted_user_id ? undefined : open("edit", x))}>{x.converted_user_id ? "查看会员" : "一键入库"}</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      <div className="flex justify-end gap-3 bg-white p-4 text-sm">
        <button
          disabled={data.page <= 1}
          onClick={() => void load(data.page - 1)}
          className="rounded border px-3 py-1"
        >
          上一页
        </button>
        <span className="py-1">第 {data.page} 页</span>
        <button
          disabled={!data.has_more}
          onClick={() => void load(data.page + 1)}
          className="rounded border px-3 py-1"
        >
          下一页
        </button>
      </div>
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
