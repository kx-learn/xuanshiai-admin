"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type MerchantItem, type MerchantCategoryItem } from "@/lib/admin-endpoints";
import { pickAndUploadImage, showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("商家联盟", "商家管理");

const columns = ["ID", "商家名称", "分类", "管理账号", "创建时间", "商品统计", "销售额统计", "核销员工", "展示", "链接/二维码", "操作"];

const fmt = (v: string | null | undefined) => (v ? v.replace("T", " ").slice(0, 16) : "-");

interface Form {
  id: number | null;
  name: string;
  cover: string | null;
  gallery: string[];
  adminUserId: number | null;
  categoryId: string;
  tags: string[];
  province: string;
  city: string;
  address: string;
  contactPhone: string;
  businessHours: string;
  intro: string;
  sort: number;
}

const EMPTY_FORM: Form = {
  id: null, name: "", cover: null, gallery: [], adminUserId: null, categoryId: "", tags: [],
  province: "", city: "", address: "", contactPhone: "", businessHours: "", intro: "", sort: 0,
};

export default function MerchantManagementPage() {
  const [rows, setRows] = useState<MerchantItem[]>([]);
  const [categories, setCategories] = useState<MerchantCategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    adminEndpoints.merchantCategoryList().then(setCategories).catch(() => undefined);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminEndpoints.merchantList({
        page, page_size: pageSize,
        category_id: categoryId ? Number(categoryId) : undefined,
        keyword: keyword || undefined,
      });
      setRows(res.items);
      setTotal(res.total);
      setSelected([]);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [categoryId, keyword, page, pageSize]);

  useEffect(() => { void load(); }, [load]);

  const openAdd = () => { setForm(EMPTY_FORM); setAddOpen(true); };
  const openEdit = (r: MerchantItem) => {
    setForm({
      id: r.id, name: r.name, cover: r.cover, gallery: r.gallery || [], adminUserId: r.admin_user_id,
      categoryId: r.category_id ? String(r.category_id) : "", tags: r.tags || [], province: r.province || "",
      city: r.city || "", address: r.address || "", contactPhone: r.contact_phone || "",
      businessHours: r.business_hours || "", intro: r.intro || "", sort: r.sort ?? 0,
    });
    setAddOpen(true);
  };

  const toggleVisible = async (r: MerchantItem) => {
    const next = !r.visible;
    setRows((l) => l.map((x) => (x.id === r.id ? { ...x, visible: next } : x)));
    try {
      await adminEndpoints.setMerchantVisible(r.id, next);
    } catch (e) {
      setRows((l) => l.map((x) => (x.id === r.id ? { ...x, visible: r.visible } : x)));
      showConfigToast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  const deleteRow = async (r: MerchantItem) => {
    if (!window.confirm(`确定删除商家「${r.name}」？`)) return;
    try {
      await adminEndpoints.deleteMerchant(r.id);
      showConfigToast("删除成功", "ok");
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (!form.name.trim()) { showConfigToast("请填写商家名称", "error"); return; }
    const payload = {
      name: form.name,
      cover: form.cover,
      gallery: form.gallery,
      category_id: form.categoryId ? Number(form.categoryId) : null,
      tags: form.tags,
      province: form.province || null,
      city: form.city || null,
      address: form.address || null,
      contact_phone: form.contactPhone || null,
      business_hours: form.businessHours || null,
      intro: form.intro || null,
      admin_user_id: form.adminUserId,
      sort: form.sort,
    };
    try {
      if (form.id) {
        await adminEndpoints.updateMerchant(form.id, payload);
      } else {
        await adminEndpoints.createMerchant(payload);
      }
      showConfigToast("提交成功", "ok");
      setAddOpen(false);
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "提交失败", "error");
    }
  };

  const addTag = () => {
    const t = window.prompt("请输入标签");
    if (t) set("tags", [...form.tags, t]);
  };
  const allSelected = rows.length > 0 && selected.length === rows.length;

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>您在这里可以添加、管理全部的合作商家，掌握商品、订单、销售数据情况</p>
          </div>
        </div>
      </div>

      <div className="finord-card mm-card">
        <div className="mm-head">
          <h2 className="mm-title">商家管理</h2>
          <button className="finord-btn finord-btn-primary" onClick={openAdd}>＋ 添加商家</button>
        </div>

        <div className="mm-filters">
          <select className="mm-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">所有分类</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="mm-input" placeholder="输入昵称关键词" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <button className="finord-btn finord-btn-primary mm-search-btn" onClick={() => load()}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table mm-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))} /></th>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><input type="checkbox" aria-label={`选择商家 ${r.id}`} checked={selected.includes(r.id)} onChange={() => setSelected((current) => current.includes(r.id) ? current.filter((id) => id !== r.id) : [...current, r.id])} /></td>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.category_name || "-"}</td>
                  <td>{r.admin_user_nickname || "-"}</td>
                  <td>{fmt(r.created_at)}</td>
                  <td>在售 {r.product_online} / 共 {r.product_total}</td>
                  <td>¥{r.sales_amount}</td>
                  <td>{r.verify_staff || "-"}</td>
                  <td>
                    <button type="button" className={`mp-switch ${r.visible ? "on" : ""}`} onClick={() => toggleVisible(r)}>
                      <span className="mp-switch-knob"></span>
                    </button>
                  </td>
                  <td><a className="finord-link" onClick={() => r.link_url && window.open(r.link_url, "_blank")}>查看</a></td>
                  <td>
                    <div className="mm-ops">
                      <a className="finord-link" onClick={() => openEdit(r)}>编辑</a>
                      <a className="finord-link" onClick={() => deleteRow(r)}>删除</a>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="mm-empty">
                    <div className="mm-empty-inner">
                      <div className="mm-empty-icon">📦</div>
                      <div className="mm-empty-text">暂无数据</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      </div>

      {addOpen && (
        <AddMerchantDrawer form={form} set={set} categories={categories} addTag={addTag} submit={submit} onClose={() => setAddOpen(false)} />
      )}
    </div>
  );
}

function AddMerchantDrawer({ form, set, categories, addTag, submit, onClose }: {
  form: Form;
  set: <K extends keyof Form>(key: K, value: Form[K]) => void;
  categories: MerchantCategoryItem[];
  addTag: () => void;
  submit: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel mm-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加/编辑商家</span>
          </div>
          <div className="mm-head-actions">
            <button className="finord-btn mm-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary" onClick={submit}>确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 商家名称 */}
          <div className="mm-row">
            <span className="mm-label">＊商家名称</span>
            <input className="mm-input-wide" placeholder="请输入商家名称" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          {/* 商家封面 */}
          <div className="mm-row">
            <span className="mm-label">＊商家封面</span>
            <label className="mm-pick">
              {form.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.cover} alt="商家封面" style={{ maxWidth: "100%", maxHeight: "100%" }} />
              ) : (<><Plus size={18} /><span>+300*300</span></>)}
              <input type="file" accept="image/*" hidden onChange={(e) => pickAndUploadImage(e.target.files?.[0], (url) => set("cover", url), (m) => showConfigToast(m, "error"))} />
            </label>
          </div>

          {/* 商家相册 */}
          <div className="mm-row">
            <span className="mm-label">商家相册</span>
            <label className="mm-pick-btn"><ImageIcon size={14} /> 图片上传/管理（支持移动排序、删除）{form.gallery.length > 0 ? `（${form.gallery.length}）` : ""}
              <input type="file" accept="image/*" hidden multiple onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                for (const f of files) {
                  await pickAndUploadImage(f, (url) => set("gallery", [...form.gallery, url]), (m) => showConfigToast(m, "error"));
                }
              }} />
            </label>
          </div>

          {/* 管理账号 */}
          <div className="mm-row">
            <span className="mm-label">＊管理账号</span>
            <div className="mm-content">
              <input className="mm-input-wide" placeholder="输入昵称关键词 / 会员ID" value={form.adminUserId ?? ""} onChange={(e) => set("adminUserId", e.target.value ? Number(e.target.value) : null)} />
              <div className="mm-info">① 必须拥有推广红娘身份，一个推广红娘只能绑定一个商家管理账号</div>
            </div>
          </div>

          {/* 商家分类 */}
          <div className="mm-row">
            <span className="mm-label">＊商家分类</span>
            <select className="mm-select-wide" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">请选择商家分类</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* 特色标签 */}
          <div className="mm-row">
            <span className="mm-label">特色标签</span>
            <div className="mm-content">
              <div className="mm-tags">
                {form.tags.map((t, i) => (
                  <span className="mm-tag" key={`${t}-${i}`}>{t}
                    <span className="mm-tag-x" onClick={() => set("tags", form.tags.filter((_, j) => j !== i))}>×</span>
                  </span>
                ))}
                <button className="mm-add-tag" onClick={addTag}><Plus size={12} /> 添加标签</button>
              </div>
            </div>
          </div>

          {/* 商家地址 */}
          <div className="mm-row">
            <span className="mm-label">＊商家地址</span>
            <div className="mm-content">
              <div className="mm-addr-row">
                <input className="mm-select mm-select-addr" placeholder="省" value={form.province} onChange={(e) => set("province", e.target.value)} style={{ paddingLeft: 8 }} />
                <input className="mm-select mm-select-addr" placeholder="市" value={form.city} onChange={(e) => set("city", e.target.value)} style={{ paddingLeft: 8 }} />
                <input className="mm-input-wide" placeholder="请输入详细地址" value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
            </div>
          </div>

          {/* 联系电话 */}
          <div className="mm-row">
            <span className="mm-label">＊联系电话</span>
            <input className="mm-input-wide" placeholder="请输入联系电话" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
          </div>

          {/* 营业时间 */}
          <div className="mm-row">
            <span className="mm-label">＊营业时间</span>
            <input className="mm-input-wide" placeholder="请输入营业时间" value={form.businessHours} onChange={(e) => set("businessHours", e.target.value)} />
          </div>

          {/* 商家介绍 */}
          <div className="mm-row mm-row-top">
            <span className="mm-label">商家介绍</span>
            <div className="mm-content">
              <div className="mm-editor">
                <div className="mm-editor-toolbar"><span className="mm-editor-tool-hint">支持纯文本编辑</span></div>
                <div className="mm-editor-body" contentEditable suppressContentEditableWarning onBlur={(e) => set("intro", e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: form.intro }} />
              </div>
              <div className="mm-info">本内容显示在支付完成入群费后弹出的页面</div>
            </div>
          </div>

          {/* 显示排序 */}
          <div className="mm-row mm-row-top">
            <span className="mm-label">显示排序</span>
            <div className="mm-content">
              <input className="mm-input-num" type="number" value={form.sort} onChange={(e) => set("sort", Number(e.target.value))} />
              <div className="mm-info">数字越大显示越靠前</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
