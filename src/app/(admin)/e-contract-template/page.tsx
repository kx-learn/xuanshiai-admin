"use client";
import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "财务管理", href: "/finance-config" },
  { label: "电子合同", href: "/e-contract-config" },
  { label: "模板管理" },
];

type TemplateRow = {
  id: number;
  template_id: string;
  name: string;
  version: string;
  contract_type: string;
  creator: string;
  created_at: string;
};
type TemplateForm = { name: string; template_id: string; version: string; contract_type: string; creator: string };
const EMPTY_FORM: TemplateForm = { name: "", template_id: "", version: "1.0", contract_type: "线上会员合同", creator: "" };

export default function EContractTemplatePage() {
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [form, setForm] = useState<TemplateForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<TemplateRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminEndpoints.listContent("econtract_template", { page, page_size: pageSize });
      setRows((data.items ?? []) as TemplateRow[]);
      setTotal(data.total ?? 0);
      setSelected([]);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (row: TemplateRow) => {
    setEditing(row);
    setForm({ name: row.name, template_id: row.template_id, version: row.version, contract_type: row.contract_type, creator: row.creator });
    setModalOpen(true);
  };
  const saveTemplate = async () => {
    if (!form.name.trim() || !form.template_id.trim()) {
      showConfigToast("请填写模板名称和模板ID", "error");
      return;
    }
    setSaving(true);
    try {
      const body = { title: form.name.trim(), extra: { template_id: form.template_id.trim(), version: form.version.trim(), contract_type: form.contract_type, creator: form.creator.trim() } };
      if (editing) await adminEndpoints.updateContent("econtract_template", editing.id, body);
      else await adminEndpoints.createContent("econtract_template", body);
      showConfigToast(editing ? "模板已更新" : "模板已创建", "ok");
      setModalOpen(false);
      await load();
    } catch (cause) {
      showConfigToast(cause instanceof Error ? cause.message : "模板保存失败", "error");
    } finally { setSaving(false); }
  };
  const removeTemplate = async (row: TemplateRow) => {
    if (!window.confirm(`确认删除模板“${row.name}”吗？`)) return;
    try {
      await adminEndpoints.deleteContent("econtract_template", row.id);
      showConfigToast("模板已删除", "ok");
      await load();
    } catch (cause) { showConfigToast(cause instanceof Error ? cause.message : "模板删除失败", "error"); }
  };

  return (
    <div>
      {bannerVisible && <div className="etc-alert">
        <button type="button" className="etc-alert-x" aria-label="关闭提示" onClick={() => setBannerVisible(false)}>✕</button>
        <span className="etc-alert-text">电子签功能已关闭,请先打开电子签配置</span>
      </div>}

      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>在这里您可以添加和管理您的电子合同模板。</p>
            <p>1、合同模板类型分为线上会员合同和线下会员合同。</p>
            <p>2、在签署合同时，不支持人工对合同内容进行编辑或填写。系统会通过合同控件自动填写平台内的相应数据。</p>
            <p>3、系统已提供了合同控件，详情可参考添加合同模板页面的"合同控件使用说明"。如果您合同模板中的填写项不在说明内，建议您直接写明在模板中或删除此项。</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="crh-head">
          <div className="crh-title">模板管理</div>
          <div className="etc-actions">
            <button className="finord-btn finord-btn-primary" onClick={openCreate}>＋ 添加合同模板</button>
            <button className="finord-btn finord-btn-primary" onClick={load} disabled={loading}>
              {loading ? "刷新中..." : "↻ 刷新列表"}
            </button>
          </div>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))} /></th>
                <th>版本号</th>
                <th>模板名称</th>
                <th>模板ID</th>
                <th>创建人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="ecl-empty">
                    <div className="ecl-empty-inner">
                      <div className="ecl-empty-icon">▤</div>
                      <div className="ecl-empty-text">{loading ? "加载中..." : "暂无数据"}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td><input type="checkbox" aria-label={`选择合同模板 ${r.id}`} checked={selected.includes(r.id)} onChange={() => setSelected((current) => current.includes(r.id) ? current.filter((id) => id !== r.id) : [...current, r.id])} /></td>
                    <td>{r.version}</td>
                    <td>{r.name}</td>
                    <td>{r.template_id}</td>
                    <td>{r.creator}</td>
                    <td>
                      <button className="ecc-link" onClick={() => openEdit(r)}>编辑</button>
                      <button className="ecc-link ecl-del" onClick={() => void removeTemplate(r)}>删除</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      </div>
      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
        <div className="w-full max-w-lg rounded bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{editing ? "编辑合同模板" : "添加合同模板"}</h2><button type="button" onClick={() => setModalOpen(false)} aria-label="关闭">✕</button></div>
          <div className="grid gap-3">
            {([["name", "模板名称"], ["template_id", "模板ID"], ["version", "版本号"], ["creator", "创建人"]] as const).map(([key, label]) => <label key={key} className="grid gap-1 text-sm"><span>{label}</span><input className="rounded border px-3 py-2" value={form[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} /></label>)}
            <label className="grid gap-1 text-sm"><span>合同类型</span><select className="rounded border px-3 py-2" value={form.contract_type} onChange={(e) => setForm((current) => ({ ...current, contract_type: e.target.value }))}><option>线上会员合同</option><option>线下会员合同</option></select></label>
          </div>
          <div className="mt-5 flex justify-end gap-2"><button type="button" className="finord-btn finord-btn-outline" onClick={() => setModalOpen(false)}>取消</button><button type="button" className="finord-btn finord-btn-primary" disabled={saving} onClick={() => void saveTemplate()}>{saving ? "保存中..." : "确定提交"}</button></div>
        </div>
      </div>}
    </div>
  );
}
