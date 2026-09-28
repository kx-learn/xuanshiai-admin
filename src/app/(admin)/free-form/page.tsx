"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

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

const FIELD_ROWS = [
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

export default function FreeFormPage() {
  const [rows, setRows] = useState<FormContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [gender, setGender] = useState("");
  const [landingId, setLandingId] = useState("");
  const [landings, setLandings] = useState<{ id: number; title: string }[]>([]);
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
        query: { page, page_size: 20, keyword: kws },
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
      query: { page: 1, page_size: 200 },
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

  const allSelected = rows.length > 0 && selected.length === rows.length;

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
            <button className="finord-btn finord-btn-primary" onClick={() => showConfigToast("请配置 xlsx 导出", "ok")}>⬆ 导出EXCEL</button>
            <button className="finord-btn finord-btn-primary" onClick={() => setFieldOpen(true)}>▦ 字段管理</button>
          </div>
        </div>

        <div className="finord-filters ff-filters">
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
            <span className="finord-search-label">性别:</span>
            <select
              className="finord-select"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">不限</option>
              <option value="male">男</option>
              <option value="female">女</option>
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

      {fieldOpen && <FieldManagerDrawer onClose={() => setFieldOpen(false)} />}
    </div>
  );
}

function FieldManagerDrawer({ onClose }: { onClose: () => void }) {
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
            <button className="finord-btn finord-btn-primary" onClick={() => showConfigToast("当前后端未提供新建字段接口", "error")}>＋ 新建字段</button>
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
                {FIELD_ROWS.map((r) => (
                  <tr key={r.name}>
                    <td className="ffm-name">
                      {r.name} <span className="ffm-builtin">（内置）</span>
                      {r.required && <span className="ffm-req"> (必填)</span>}
                    </td>
                    <td>{r.guide}</td>
                    <td>{r.type}</td>
                    <td className={r.required ? "ffm-yes" : "ffm-no"}>{r.required ? "是" : "否"}</td>
                    <td><button className="finord-link" type="button" onClick={() => showConfigToast("当前后端未提供字段编辑接口", "error")}>编辑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
