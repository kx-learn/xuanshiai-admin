"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2, Image as ImageIcon, Smile, Quote, Code, Heading1, Heading2, RotateCcw, RotateCw, Trash2, Maximize2, Plus, Minus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "超级获客", href: "/customer-landing" },
  { label: "落地页" },
];

type LandingContent = {
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

type LandingPage = { items: LandingContent[]; total: number; page: number; page_size: number };

const FORM_TYPE_OPTIONS = ["内置表单", "自由表单"] as const;
const PAGE_TYPE_OPTIONS = ["单页", "引导页"] as const;
const FIELD_OPTIONS = ["昵称", "性别", "头像", "出生", "职业", "婚况", "学历", "身高", "体重", "收入", "现居", "籍贯", "民族", "手机", "微信"];
const REQUIRED_FIELDS = new Set(["昵称", "性别", "手机"]);
const DATA_POS_OPTIONS = ["保存到客源线索", "保存到会员资料（并自动注册用户账号）"];
const PHONE_OPTIONS = ["无需验证（手机号直接填写无需验证）", "需验证（手机号码需要进行验证码验真息才可以提交）"];
const ASSIGN_OPTIONS = ["待分派", "分派给指定红娘"];

const CLL_TOOLBAR: { icon: React.ReactNode; title: string }[] = [
  { icon: <Heading1 size={14} />, title: "标题" },
  { icon: <Type size={14} />, title: "正文" },
  { icon: <Bold size={14} />, title: "加粗" },
  { icon: <Italic size={14} />, title: "斜体" },
  { icon: <Underline size={14} />, title: "下划线" },
  { icon: <Strikethrough size={14} />, title: "删除线" },
  { icon: <AlignLeft size={14} />, title: "左对齐" },
  { icon: <AlignCenter size={14} />, title: "居中" },
  { icon: <AlignRight size={14} />, title: "右对齐" },
  { icon: <List size={14} />, title: "无序列表" },
  { icon: <ListOrdered size={14} />, title: "有序列表" },
  { icon: <Quote size={14} />, title: "引用" },
  { icon: <Link2 size={14} />, title: "链接" },
  { icon: <ImageIcon size={14} />, title: "图片" },
  { icon: <Smile size={14} />, title: "表情" },
  { icon: <Code size={14} />, title: "代码" },
  { icon: <Plus size={14} />, title: "更多" },
  { icon: <RotateCcw size={14} />, title: "撤销" },
  { icon: <RotateCw size={14} />, title: "重做" },
  { icon: <Minus size={14} />, title: "分割线" },
  { icon: <Maximize2 size={14} />, title: "全屏" },
  { icon: <Trash2 size={14} />, title: "清空" },
];

type FormType = (typeof FORM_TYPE_OPTIONS)[number];
type PageType = (typeof PAGE_TYPE_OPTIONS)[number];

type LandingDraft = {
  id: number | null;
  title: string;
  form_type: FormType;
  page_type: PageType;
  fields: string[];
  form_header: string;
  header_image: string;
  header_html: string;
  share_icon: string;
  share_desc: string;
  data_pos: string;
  phone_ver: string;
  assign_mode: string;
  promoter: string;
  redirect_url: string;
  button_text: string;
  button_color: string;
  sort: number;
};

const EMPTY_DRAFT: LandingDraft = {
  id: null,
  title: "",
  form_type: "内置表单",
  page_type: "单页",
  fields: ["昵称", "性别"],
  form_header: "",
  header_image: "",
  header_html: "",
  share_icon: "",
  share_desc: "",
  data_pos: "保存到客源线索",
  phone_ver: "需验证（手机号码需要进行验证码验真息才可以提交）",
  assign_mode: "待分派",
  promoter: "",
  redirect_url: "",
  button_text: "立即加入",
  button_color: "#6b5dd3",
  sort: 100,
};

export default function CustomerLandingPage() {
  const [rows, setRows] = useState<LandingContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<LandingDraft>(EMPTY_DRAFT);

  const load = async (page = pageIdx) => {
    try {
      const resp = await adminApi<LandingPage>("admin/content/landing_page", {
        method: "GET",
        query: { page, page_size: 20, keyword: keyword || undefined },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleField = (f: string) => {
    if (REQUIRED_FIELDS.has(f)) return;
    setDraft((cur) => ({
      ...cur,
      fields: cur.fields.includes(f) ? cur.fields.filter((x) => x !== f) : [...cur.fields, f],
    }));
  };

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setAddOpen(true);
  };

  const openEdit = (item: LandingContent) => {
    const extra = item.extra ?? {};
    setDraft({
      id: item.id,
      title: item.title,
      form_type: typeof extra.form_type === "string" ? (extra.form_type as FormType) : "内置表单",
      page_type: typeof extra.page_type === "string" ? (extra.page_type as PageType) : "单页",
      fields: Array.isArray(extra.fields) ? (extra.fields as string[]) : ["昵称", "性别"],
      form_header: typeof extra.form_header === "string" ? extra.form_header : "",
      header_image: item.image_url ?? "",
      header_html: typeof extra.header_html === "string" ? extra.header_html : "",
      share_icon: typeof extra.share_icon === "string" ? extra.share_icon : "",
      share_desc: typeof extra.share_desc === "string" ? extra.share_desc : (item.subtitle ?? ""),
      data_pos: typeof extra.data_pos === "string" ? extra.data_pos : "保存到客源线索",
      phone_ver: typeof extra.phone_ver === "string" ? extra.phone_ver : "需验证（手机号码需要进行验证码验真息才可以提交）",
      assign_mode: typeof extra.assign_mode === "string" ? extra.assign_mode : "待分派",
      promoter: typeof extra.promoter === "string" ? extra.promoter : "",
      redirect_url: typeof extra.redirect_url === "string" ? extra.redirect_url : "",
      button_text: typeof extra.button_text === "string" ? extra.button_text : "立即加入",
      button_color: typeof extra.button_color === "string" ? extra.button_color : "#6b5dd3",
      sort: item.sort ?? 100,
    });
    setAddOpen(true);
  };

  const submit = async () => {
    if (!draft.title.trim()) {
      showConfigToast("请填写标题", "error");
      return;
    }
    const payload = {
      title: draft.title.trim(),
      subtitle: draft.share_desc.trim() || null,
      image_url: draft.header_image || null,
      status: 1,
      sort: draft.sort,
      extra: {
        form_type: draft.form_type,
        page_type: draft.page_type,
        fields: draft.fields,
        form_header: draft.form_header.trim(),
        header_html: draft.header_html,
        share_icon: draft.share_icon,
        data_pos: draft.data_pos,
        phone_ver: draft.phone_ver,
        assign_mode: draft.assign_mode,
        promoter: draft.promoter.trim(),
        redirect_url: draft.redirect_url.trim(),
        button_text: draft.button_text.trim(),
        button_color: draft.button_color,
      },
    };
    try {
      if (draft.id === null) {
        await adminApi("admin/content/landing_page", { method: "POST", body: payload });
      } else {
        await adminApi(`admin/content/landing_page/${draft.id}`, { method: "PATCH", body: payload });
      }
      showConfigToast("已保存", "ok");
      setAddOpen(false);
      void load(1);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该落地页？")) return;
    try {
      await adminApi(`admin/content/landing_page/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const duplicate = async (item: LandingContent) => {
    try {
      await adminApi("admin/content/landing_page", {
        method: "POST",
        body: {
          title: `${item.title} - 副本`,
          subtitle: item.subtitle,
          image_url: item.image_url,
          amount: item.amount,
          status: 1,
          sort: Math.max(0, (item.sort ?? 100) - 1),
          extra: item.extra ?? {},
        },
      });
      showConfigToast("已复制", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "复制失败", "error");
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>获客落地页能够灵活用于各个运营场景中用于快捷完成"用户资料填写"之用途，也可以用于在第三方平台投放使用，并能统计浏览量和获客数据。</p>
            <p>通过获客落地页获取的资料可显示在"客源线索-线索管理"或"会员CRM-资料管理"中，并会在来源中标注来自"落地页"。用户通过落地页登记资料免费审核通过。</p>
            <p>内置表单模式下，只要手机号已经存在库中，均无法再次提交。<a className="cl-inline-link" href="#">效果预览</a></p>
            <p>自由表单模式下，同一个表单项目，同一手机号只允许提交一次，不判断是否是平台会员，可在多个项目之间重复提交。</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="cl-head">
          <div className="cl-title">获客落地页</div>
          <button className="finord-btn finord-btn-primary" onClick={openCreate}>＋ 创建落地页</button>
        </div>

        <div className="finord-filters cl-filters">
          <input
            className="finord-search-input cl-search"
            placeholder="请输入关键字"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load(1);
            }}
          />
          <button className="finord-btn finord-btn-primary" onClick={() => void load(1)}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table cl-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>落地页标题</th>
                <th>形式</th>
                <th>数据位置</th>
                <th>创建时间</th>
                <th>浏览量</th>
                <th>获取客源</th>
                <th>推广红娘</th>
                <th>链接/二维码</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const extra = row.extra ?? {};
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.title}</td>
                    <td>{typeof extra.form_type === "string" ? extra.form_type : "-"}</td>
                    <td><span className="cl-badge">{typeof extra.data_pos === "string" ? extra.data_pos : "-"}</span></td>
                    <td>{(row.created_at ?? "-").replace("T", " ").slice(0, 19)}</td>
                    <td>{typeof extra.views === "number" ? extra.views : 0}</td>
                    <td>{typeof extra.leads === "string" ? extra.leads : "总数：0 男：0 女：0"}</td>
                    <td>{typeof extra.promoter === "string" ? extra.promoter : "-"}</td>
                    <td><a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("请前往预览页复制链接", "ok"); }}>查看</a></td>
                    <td>
                      <div className="cl-ops">
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("请前往预览", "ok"); }}>预览</a>
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void duplicate(row); }}>复制</a>
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); openEdit(row); }}>编辑</a>
                        <a className="finord-link cl-op-del" href="#" onClick={(e) => { e.preventDefault(); void remove(row.id); }}>删除</a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: 24, textAlign: "center", color: "#888" }}>
                    暂无落地页，点击「创建落地页」开始创建
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="finord-pagination">
          <span className="finord-info">共 {total} 条</span>
          <div className="cl-pages">
            <button className="finord-page nav" onClick={() => load(Math.max(1, pageIdx - 1))} disabled={pageIdx <= 1}>‹</button>
            <span className="finord-page active">{pageIdx} / {totalPages}</span>
            <button className="finord-page nav" onClick={() => load(Math.min(totalPages, pageIdx + 1))} disabled={pageIdx >= totalPages}>›</button>
          </div>
          <div className="finord-page-size">20 条/页 <span className="finord-page-size-arrow">▾</span></div>
        </div>
      </div>

      {addOpen && (
        <AddLandingDrawer
          onClose={() => setAddOpen(false)}
          draft={draft}
          setDraft={setDraft}
          toggleField={toggleField}
          onSubmit={submit}
        />
      )}
    </div>
  );
}

function AddLandingDrawer(props: {
  onClose: () => void;
  draft: LandingDraft;
  setDraft: React.Dispatch<React.SetStateAction<LandingDraft>>;
  toggleField: (f: string) => void;
  onSubmit: () => void;
}) {
  const { draft, setDraft, toggleField, onSubmit } = props;
  return (
    <>
      <div className="tlc-mask" onClick={props.onClose} />
      <div className="tlc-panel cll-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={props.onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">{draft.id === null ? "创建" : "编辑"}落地页</span>
          </div>
          <div className="cll-head-actions">
            <button className="finord-btn cll-cancel" onClick={props.onClose}>取消</button>
            <button className="finord-btn finord-btn-primary" onClick={onSubmit}>确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="cll-row">
            <span className="cll-label">＊标题</span>
            <input
              className="cll-input cll-input-wide"
              placeholder="最多30汉字"
              value={draft.title}
              onChange={(e) => setDraft((cur) => ({ ...cur, title: e.target.value }))}
              maxLength={30}
            />
          </div>

          <div className="cll-row">
            <span className="cll-label">表单形式</span>
            <div className="cll-options cll-options-row">
              {FORM_TYPE_OPTIONS.map((o) => (
                <label key={o} className={`cll-radio ${draft.form_type === o ? "active" : ""}`}>
                  <input type="radio" name="formType" value={o} checked={draft.form_type === o} onChange={() => setDraft((cur) => ({ ...cur, form_type: o }))} />
                  <span>{o}</span>
                </label>
              ))}
              {draft.form_type === "自由表单" && <a className="cll-link">效果预览</a>}
            </div>
          </div>

          <div className="cll-row">
            <span className="cll-label">页面形式</span>
            <div className="cll-options cll-options-row">
              {PAGE_TYPE_OPTIONS.map((o) => (
                <label key={o} className={`cll-radio ${draft.page_type === o ? "active" : ""}`}>
                  <input type="radio" name="pageType" value={o} checked={draft.page_type === o} onChange={() => setDraft((cur) => ({ ...cur, page_type: o }))} />
                  <span>{o}</span>
                </label>
              ))}
              <a className="cll-link">预览</a>
            </div>
          </div>

          <div className="cll-row cll-row-top">
            <span className="cll-label">字段</span>
            <div className="cll-fields">
              {FIELD_OPTIONS.map((f) => (
                <label key={f} className="cll-check">
                  <input
                    type="checkbox"
                    checked={REQUIRED_FIELDS.has(f) || draft.fields.includes(f)}
                    onChange={() => toggleField(f)}
                    disabled={REQUIRED_FIELDS.has(f)}
                  />
                  <span>{f}{REQUIRED_FIELDS.has(f) && <em className="cll-req">(必填)</em>}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="cll-row">
            <span className="cll-label">＊表单抬头</span>
            <input
              className="cll-input cll-input-wide"
              placeholder="最多30汉字"
              value={draft.form_header}
              onChange={(e) => setDraft((cur) => ({ ...cur, form_header: e.target.value }))}
              maxLength={30}
            />
          </div>

          <div className="cll-row cll-row-top">
            <span className="cll-label">头部图片</span>
            <div className="cll-content">
              <div className="cll-pick">
                <input
                  id="cll-header-image"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    try {
                      const { uploadAdminImage } = await import("@/lib/platform-config");
                      const url = await uploadAdminImage(f);
                      setDraft((cur) => ({ ...cur, header_image: url }));
                    } catch (err) {
                      showConfigToast(err instanceof Error ? err.message : "上传失败", "error");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("cll-header-image")?.click()}
                  className="cll-pick-btn"
                >
                  <Plus size={18} />
                  <span>{draft.header_image ? "替换图片" : "上传图片"}</span>
                </button>
                {draft.header_image && <img src={draft.header_image} alt="header" className="cll-pick-preview" />}
              </div>
              <div className="cll-info">推荐尺寸750*400，若不上传则默认为模板中的图片</div>
            </div>
          </div>

          <div className="cll-row cll-row-top">
            <span className="cll-label">头部自定义</span>
            <div className="cll-content">
              <div className="cll-editor">
                <div className="cll-editor-toolbar">
                  {CLL_TOOLBAR.map((it, idx) => (
                    <button key={idx} type="button" className="cll-editor-tool" title={it.title}>{it.icon}</button>
                  ))}
                </div>
                <textarea
                  className="cll-editor-body"
                  rows={6}
                  value={draft.header_html}
                  onChange={(e) => setDraft((cur) => ({ ...cur, header_html: e.target.value }))}
                  placeholder="请输入正文"
                />
              </div>
            </div>
          </div>

          <div className="cll-row cll-row-top">
            <span className="cll-label">分享图标</span>
            <div className="cll-content">
              <div className="cll-pick">
                <input
                  id="cll-share-icon"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    try {
                      const { uploadAdminImage } = await import("@/lib/platform-config");
                      const url = await uploadAdminImage(f);
                      setDraft((cur) => ({ ...cur, share_icon: url }));
                    } catch (err) {
                      showConfigToast(err instanceof Error ? err.message : "上传失败", "error");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("cll-share-icon")?.click()}
                  className="cll-pick-btn"
                >
                  <Plus size={18} />
                  <span>{draft.share_icon ? "替换图片" : "上传图片"}</span>
                </button>
                {draft.share_icon && <img src={draft.share_icon} alt="share" className="cll-pick-preview" />}
              </div>
              <div className="cll-info">推荐尺寸300*300，在线裁剪</div>
            </div>
          </div>

          <div className="cll-row">
            <span className="cll-label">分享描述</span>
            <input
              className="cll-input cll-input-wide"
              placeholder="请输入描述"
              value={draft.share_desc}
              onChange={(e) => setDraft((cur) => ({ ...cur, share_desc: e.target.value }))}
            />
          </div>

          <div className="cll-row cll-row-top">
            <span className="cll-label">数据位置</span>
            <div className="cll-content">
              <div className="cll-options cll-options-row">
                {DATA_POS_OPTIONS.map((o) => (
                  <label key={o} className={`cll-radio ${draft.data_pos === o ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="dataPos"
                      value={o}
                      checked={draft.data_pos === o}
                      onChange={() => setDraft((cur) => ({ ...cur, data_pos: o }))}
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="cll-info">此处设置后不可修改</div>
            </div>
          </div>

          <div className="cll-row">
            <span className="cll-label">手机号码</span>
            <div className="cll-options cll-options-row">
              {PHONE_OPTIONS.map((o) => (
                <label key={o} className={`cll-radio ${draft.phone_ver === o ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="phoneVer"
                    value={o}
                    checked={draft.phone_ver === o}
                    onChange={() => setDraft((cur) => ({ ...cur, phone_ver: o }))}
                  />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="cll-row cll-row-top">
            <span className="cll-label">默认分派</span>
            <div className="cll-content">
              <div className="cll-options cll-options-row">
                {ASSIGN_OPTIONS.map((o) => (
                  <label key={o} className={`cll-radio ${draft.assign_mode === o ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="assignMode"
                      value={o}
                      checked={draft.assign_mode === o}
                      onChange={() => setDraft((cur) => ({ ...cur, assign_mode: o }))}
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="cll-info">可以选择多个红娘，系统会自动将本落地页获取来的客源随机循环分派给这些指定的红娘</div>
            </div>
          </div>

          <div className="cll-row cll-row-top">
            <span className="cll-label">推广红娘</span>
            <div className="cll-content">
              <input
                className="cll-input"
                placeholder="请输入用户账号"
                style={{ width: 240 }}
                value={draft.promoter}
                onChange={(e) => setDraft((cur) => ({ ...cur, promoter: e.target.value }))}
              />
              <div className="cll-info">设置推广红娘后，通过该落地页获取的客源均将特定到该推广红娘名下</div>
            </div>
          </div>

          <div className="cll-row cll-row-top">
            <span className="cll-label">页面跳转</span>
            <div className="cll-content">
              <input
                className="cll-input cll-input-wide"
                placeholder="请输入https://"
                value={draft.redirect_url}
                onChange={(e) => setDraft((cur) => ({ ...cur, redirect_url: e.target.value }))}
              />
              <div className="cll-info">页面跳转是指客户在落地页成功提交资料后进入的页面，留空则跳转至平台首页</div>
            </div>
          </div>

          <div className="cll-row">
            <span className="cll-label">按钮文案</span>
            <input
              className="cll-input cll-input-wide"
              value={draft.button_text}
              onChange={(e) => setDraft((cur) => ({ ...cur, button_text: e.target.value }))}
            />
          </div>

          <div className="cll-row">
            <span className="cll-label">提交按钮背景色</span>
            <div className="cll-color-row">
              <input
                type="color"
                value={draft.button_color}
                onChange={(e) => setDraft((cur) => ({ ...cur, button_color: e.target.value }))}
                className="cll-color-swatch"
              />
              <a
                className="cll-link"
                onClick={(e) => { e.preventDefault(); setDraft((cur) => ({ ...cur, button_color: "#6b5dd3" })); }}
              >
                恢复默认
              </a>
            </div>
          </div>

          <div className="cll-row">
            <span className="cll-label">显示排序</span>
            <input
              type="number"
              className="cll-input cll-input-num"
              value={draft.sort}
              onChange={(e) => setDraft((cur) => ({ ...cur, sort: Number(e.target.value) || 0 }))}
            />
          </div>
        </div>
      </div>
    </>
  );
}
