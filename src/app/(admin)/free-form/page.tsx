"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast, useConfigDomain } from "@/lib/platform-config";
import { XIANGQIN_STATUS, XIANGQIN_STATUS_VALUE } from "@/lib/filter-options";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "超级获客", href: "/customer-landing" },
  { label: "自由表单" },
];

type FormContent = {
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

type FormPage = { items: FormContent[]; total: number; page: number; page_size: number };

type FieldRow = { name: string; builtIn: boolean; required: boolean; guide: string; type: string };

const FIELD_ROWS: FieldRow[] = [
  { name: "称呼", builtIn: true, required: true, guide: "称呼", type: "单行填写文本" },
  { name: "头像", builtIn: true, required: false, guide: "头像", type: "单行填写文本" },
  { name: "职业", builtIn: true, required: true, guide: "请选择", type: "下拉单项选择" },
  { name: "学历", builtIn: true, required: true, guide: "请选择", type: "下拉单项选择" },
  { name: "体重", builtIn: true, required: true, guide: "请选择", type: "单行数字填写" },
  { name: "现居", builtIn: true, required: true, guide: "请选择", type: "单行填写文本" },
  { name: "微信", builtIn: true, required: true, guide: "微信", type: "单行填写文本" },
  { name: "性别", builtIn: true, required: true, guide: "性别", type: "下拉单项选择" },
  { name: "出生", builtIn: true, required: true, guide: "请选择", type: "单行填写文本" },
  { name: "婚况", builtIn: true, required: true, guide: "请选择", type: "下拉单项选择" },
  { name: "身高", builtIn: true, required: true, guide: "请选择", type: "单行填写文本" },
  { name: "收入", builtIn: true, required: true, guide: "请选择", type: "下拉单项选择" },
  { name: "籍贯", builtIn: true, required: true, guide: "请选择", type: "单行填写文本" },
  { name: "手机", builtIn: true, required: true, guide: "手机", type: "单行填写文本" },
];

const FIELD_TYPES = ["单行填写文本", "单行数字填写", "下拉单项选择", "多行填写文本"];

/** 字段定义存放在已存在的 configs/tools_customer_leads 域的 free_form_* 键里 */
type FieldOverride = { guide?: string; type?: string; required?: boolean };

const CONFIG_NAMESPACE = "tools_customer_leads";

const CONFIG_DEFAULTS: Record<string, unknown> = { free_form_fields: [], free_form_overrides: {} };

const EMPTY_FIELD: FieldRow = { name: "", builtIn: false, required: false, guide: "", type: "单行填写文本" };

function csvCell(value: string) {
  const text = /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  return text;
}

export default function FreeFormPage() {
  const [rows, setRows] = useState<FormContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [gender, setGender] = useState("");
  const [landingId, setLandingId] = useState("");
  const [landings, setLandings] = useState<{ id: number; title: string }[]>([]);
  const [xiangqinStatus, setXiangqinStatus] = useState("");
  const [fieldOpen, setFieldOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const load = async (page = pageIdx) => {
    try {
      const kws = [
        keyword && `name\\":\\"${keyword}`,
        gender && `gender\\":\\"${gender}`,
        landingId && `landing_id\\":${landingId}`,
      ].filter(Boolean).join(" ") || undefined;
      const resp = await adminApi<FormPage>("admin/content/free_form", {
        method: "GET",
        query: {
          page,
          page_size: 20,
          keyword: kws,
          // 取自 extra.xiangqin_status，接口收 1-5 的字符串
          xiangqin_status: xiangqinStatus ? String(XIANGQIN_STATUS_VALUE[xiangqinStatus]) : undefined,
        },
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
    void adminApi<{ items: { id: number; title: string }[] }>("admin/content/landing_page", {
      method: "GET",
      query: { page: 1, page_size: 100 },
    })
      .then((res) => setLandings((res.items ?? []).map((l) => ({ id: l.id, title: l.title }))))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该表单记录？")) return;
    try {
      await adminApi(`admin/content/free_form/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  /** 用当前列表数据导出 CSV（带 BOM，Excel 可直接打开） */
  const exportCsv = () => {
    if (rows.length === 0) {
      showConfigToast("当前没有可导出的数据", "error");
      return;
    }
    const header = ["ID", "称呼", "性别", "手机号", "更多信息", "落地页", "提交时间"];
    const lines = rows.map((r) => {
      const extra = r.extra ?? {};
      const genderText = typeof extra.gender === "string"
        ? (extra.gender === "male" ? "男" : extra.gender === "female" ? "女" : extra.gender)
        : "-";
      return [
        String(r.id),
        typeof extra.name === "string" ? extra.name : r.title,
        genderText,
        typeof extra.phone === "string" ? extra.phone : "-",
        typeof extra.more === "string" ? extra.more : "-",
        typeof extra.landing_title === "string" ? extra.landing_title : (r.subtitle ?? "-"),
        (r.created_at ?? "-").replace("T", " ").slice(0, 19),
      ].map((cell) => csvCell(String(cell)));
    });
    const csv = `﻿${[header.map(csvCell).join(","), ...lines.map((line) => line.join(","))].join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `自由表单-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showConfigToast(`已导出 ${rows.length} 条记录`, "ok");
  };

  const allSelected = rows.length > 0 && selected.length === rows.length;

  const fieldRows = useMemo(() => FIELD_ROWS, []);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>这里您可以查看到所有通过"自由表单"填写登记的客户信息资料，并可以将他们批量导出到表格、入库到系统的客源线索、或会员CRM中。</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="ff-head">
          <div className="ff-title">自由表单</div>
          <div className="ff-actions">
            <button className="finord-btn finord-btn-primary" onClick={exportCsv}>⬆ 导出EXCEL</button>
            <button className="finord-btn finord-btn-primary" onClick={() => setFieldOpen(true)}>▦ 字段管理</button>
          </div>
        </div>

        <div className="finord-filters ff-filters">
          <select className="finord-select" value={xiangqinStatus} onChange={(e) => { setXiangqinStatus(e.target.value); void load(1); }}>
            <option value="">相亲状态：不限</option>
            {XIANGQIN_STATUS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <div className="finord-searchbox">
            <input
              className="finord-search-input ff-search"
              placeholder="请输入称呼/手机号搜索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void load(1);
              }}
            />
            <button className="finord-btn finord-btn-primary" onClick={() => void load(1)}>搜索</button>
          </div>
          <div className="finord-searchbox">
            <span className="finord-search-label">性别：</span>
            <select
              className="finord-select"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">性别：不限</option>
              <option value="male">性别：男</option>
              <option value="female">性别：女</option>
            </select>
          </div>
          <div className="finord-searchbox">
            <span className="finord-search-label">客户来源：</span>
            <select className="finord-select" defaultValue="">
              <option value="">客户来源：不限</option>
              {["抖音", "微信群", "本地群", "身边朋友", "同行群", "朋友圈", "朋友介绍", "QQ", "其他渠道", "落地页"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="ff-landing-wrap">
            <select
              className="finord-select ff-landing"
              value={landingId}
              onChange={(e) => setLandingId(e.target.value)}
            >
              <option value="">请选择落地页</option>
              {landings.map((l) => (
                <option key={l.id} value={String(l.id)}>{l.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table ff-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))} /></th><th>ID</th>
                <th>称呼</th>
                <th>性别</th>
                <th>手机号</th>
                <th>更多信息</th>
                <th>落地页</th>
                <th>提交时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const extra = r.extra ?? {};
                return (
                  <tr key={r.id}>
                    <td><input type="checkbox" aria-label={`选择表单记录 ${r.id}`} checked={selected.includes(r.id)} onChange={() => setSelected((current) => current.includes(r.id) ? current.filter((id) => id !== r.id) : [...current, r.id])} /></td>
                    <td>{r.id}</td>
                    <td>{typeof extra.name === "string" ? extra.name : r.title}</td>
                    <td>{typeof extra.gender === "string" ? (extra.gender === "male" ? "男" : extra.gender === "female" ? "女" : extra.gender) : "-"}</td>
                    <td>{typeof extra.phone === "string" ? extra.phone : "-"}</td>
                    <td>{typeof extra.more === "string" ? extra.more : "-"}</td>
                    <td>{typeof extra.landing_title === "string" ? extra.landing_title : (r.subtitle ?? "-")}</td>
                    <td>{(r.created_at ?? "-").replace("T", " ").slice(0, 19)}</td>
                    <td>
                      <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("查看详情", "ok"); }}>查看</a>
                      <span className="cs-op-sep">|</span>
                      <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void remove(r.id); }}>删除</a>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="ecl-empty">
                    <div className="ecl-empty-inner">
                      <div className="ecl-empty-icon">▤</div>
                      <div className="ecl-empty-text">暂无数据</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination page={pageIdx} pageSize={20} total={total} onPageChange={(next) => void load(next)} />
      </div>

      {fieldOpen && <FieldManagerDrawer fieldRows={fieldRows} onClose={() => setFieldOpen(false)} />}
    </div>
  );
}

function FieldManagerDrawer({ fieldRows, onClose }: { fieldRows: FieldRow[]; onClose: () => void }) {
  const { snapshot, save, ready } = useConfigDomain<Record<string, unknown>>(CONFIG_NAMESPACE, CONFIG_DEFAULTS);
  const [customFields, setCustomFields] = useState<FieldRow[]>([]);
  const [overrides, setOverrides] = useState<Record<string, FieldOverride>>({});
  const [draft, setDraft] = useState<FieldRow & { original: string | null }>({ ...EMPTY_FIELD, original: null });
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!snapshot) return;
    const cfg = snapshot.config;
    setCustomFields(Array.isArray(cfg.free_form_fields) ? (cfg.free_form_fields as FieldRow[]) : []);
    const rawOverrides = cfg.free_form_overrides;
    setOverrides(rawOverrides && typeof rawOverrides === "object" && !Array.isArray(rawOverrides)
      ? (rawOverrides as Record<string, FieldOverride>)
      : {});
  }, [snapshot]);

  const rows: FieldRow[] = [
    ...fieldRows.map((row) => ({ ...row, ...(overrides[row.name] ?? {}) })),
    ...customFields,
  ];

  const persist = async (nextCustom: FieldRow[], nextOverrides: Record<string, FieldOverride>, summary: string) => {
    setSaving(true);
    const ok = await save({ free_form_fields: nextCustom, free_form_overrides: nextOverrides }, summary);
    setSaving(false);
    if (!ok) showConfigToast("字段配置无变化", "error");
    return ok;
  };

  const openNew = () => {
    setDraft({ ...EMPTY_FIELD, original: null });
    setEditOpen(true);
  };

  const openEdit = (row: FieldRow) => {
    setDraft({ ...row, original: row.name });
    setEditOpen(true);
  };

  const submitField = async () => {
    const name = draft.name.trim();
    const guide = draft.guide.trim();
    if (!name) {
      showConfigToast("请输入字段名称", "error");
      return;
    }
    if (!guide) {
      showConfigToast("请输入引导文案", "error");
      return;
    }
    const isBuiltIn = draft.original !== null && fieldRows.some((row) => row.name === draft.original);
    if (isBuiltIn) {
      const nextOverrides = { ...overrides, [draft.original as string]: { guide, type: draft.type, required: draft.required } };
      setOverrides(nextOverrides);
      await persist(customFields, nextOverrides, `编辑内置字段 ${draft.original}`);
    } else if (draft.original !== null) {
      const nextFields = customFields.map((row) => row.name === draft.original
        ? { ...row, name, guide, type: draft.type, required: draft.required }
        : row);
      setCustomFields(nextFields);
      await persist(nextFields, overrides, `编辑自定义字段 ${name}`);
    } else {
      if (rows.some((row) => row.name === name)) {
        showConfigToast("字段名称已存在", "error");
        return;
      }
      const nextFields = [...customFields, { name, builtIn: false, guide, type: draft.type, required: draft.required }];
      setCustomFields(nextFields);
      await persist(nextFields, overrides, `新建字段 ${name}`);
    }
    setEditOpen(false);
  };

  const removeCustom = async (name: string) => {
    if (!window.confirm(`确定删除字段「${name}」？`)) return;
    const nextFields = customFields.filter((row) => row.name !== name);
    setCustomFields(nextFields);
    await persist(nextFields, overrides, `删除字段 ${name}`);
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel ffm-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">字段管理</span>
          </div>
          <div className="ffm-head-actions">
            <button className="finord-btn finord-btn-primary" onClick={openNew} disabled={!ready || saving}>＋ 新建字段</button>
          </div>
        </div>
        <div className="tlc-panel-body ffm-body">
          <div className="ffm-notice">① 称呼、性别、手机号码为系统中客户资料的同名字段一致，入库时会将同步的数据新建字段一旦在被落地页中添加使用，则不支持删除</div>
          <div className="ffm-table-wrap">
            <table className="ffm-table">
              <thead>
                <tr>
                  <th>字段名称</th>
                  <th>引导文案</th>
                  <th>字段类型</th>
                  <th>必填</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name}>
                    <td className="ffm-name">
                      {r.name} {r.builtIn ? <span className="ffm-builtin">（内置）</span> : <span className="ffm-builtin">（自定义）</span>}
                      {r.required && <span className="ffm-req"> (必填)</span>}
                    </td>
                    <td>{r.guide}</td>
                    <td>{r.type}</td>
                    <td className={r.required ? "ffm-yes" : "ffm-no"}>{r.required ? "是" : "否"}</td>
                    <td>
                      <button className="finord-link" type="button" onClick={() => openEdit(r)}>编辑</button>
                      {!r.builtIn && (
                        <>
                          <span className="cs-op-sep">|</span>
                          <button className="finord-link" type="button" onClick={() => void removeCustom(r.name)}>删除</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editOpen && (
        <>
          <div className="tlc-mask" style={{ zIndex: 1300 }} onClick={() => setEditOpen(false)} />
          <div
            role="dialog"
            aria-label={draft.original === null ? "新建字段" : "编辑字段"}
            style={{
              position: "fixed", top: "18%", left: "50%", transform: "translateX(-50%)", zIndex: 1301,
              width: 460, maxWidth: "92vw", background: "#fff", borderRadius: 8,
              boxShadow: "0 10px 34px rgba(0,0,0,.18)", padding: "20px 22px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#333" }}>{draft.original === null ? "新建字段" : "编辑字段"}</span>
              <button type="button" className="tlc-x" onClick={() => setEditOpen(false)} aria-label="关闭"><X size={16} /></button>
            </div>
            <div className="gp-row">
              <div className="gp-row-top"><span className="gp-label">＊字段名称</span></div>
              <div className="gp-content">
                <input
                  className="gp-input"
                  autoFocus
                  value={draft.name}
                  disabled={draft.original !== null}
                  onChange={(e) => setDraft((cur) => ({ ...cur, name: e.target.value }))}
                  placeholder="例如：兴趣爱好"
                />
              </div>
            </div>
            <div className="gp-row">
              <div className="gp-row-top"><span className="gp-label">＊引导文案</span></div>
              <div className="gp-content">
                <input
                  className="gp-input"
                  value={draft.guide}
                  onChange={(e) => setDraft((cur) => ({ ...cur, guide: e.target.value }))}
                  placeholder="例如：请填写"
                />
              </div>
            </div>
            <div className="gp-row">
              <div className="gp-row-top"><span className="gp-label">字段类型</span></div>
              <div className="gp-content">
                <select
                  className="gp-select gp-select-wide"
                  value={draft.type}
                  onChange={(e) => setDraft((cur) => ({ ...cur, type: e.target.value }))}
                >
                  {FIELD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
            <div className="gp-row">
              <div className="gp-row-top"><span className="gp-label">必填</span></div>
              <div className="gp-content">
                <label className="sm-radio">
                  <input
                    type="checkbox"
                    checked={draft.required}
                    onChange={(e) => setDraft((cur) => ({ ...cur, required: e.target.checked }))}
                  />
                  <span>必填项</span>
                </label>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <button type="button" className="finord-btn finord-btn-outline" onClick={() => setEditOpen(false)}>取消</button>
              <button type="button" className="finord-btn finord-btn-primary" onClick={() => void submitField()} disabled={saving}>确定</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
