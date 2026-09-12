"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Upload, ArrowUp, ArrowDown } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminApi } from "@/lib/admin-api";
import { useConfigDomain, showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("运营工具", "销售匹配库");

type LibraryContent = {
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

type LibraryPage = { items: LibraryContent[]; total: number; page: number; page_size: number };

type SaleDraft = {
  id: number | null;
  title: string;
  share_desc: string;
  gender: string;
  acct_mode: string;
  acct_name: string;
  smart: boolean;
  matchmaker: string;
  pick_limit: number;
  arrival: string;
  tips: string;
};

const EMPTY_DRAFT: SaleDraft = {
  id: null,
  title: "",
  share_desc: "",
  gender: "男性",
  acct_mode: "按昵称",
  acct_name: "",
  smart: false,
  matchmaker: "",
  pick_limit: 10,
  arrival: "未到店",
  tips: "",
};

type NavItem = { id: number; label: string; on: boolean };

export default function SalesMatchPage() {
  const [rows, setRows] = useState<LibraryContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMatchmaker, setFilterMatchmaker] = useState("");
  const [keyword, setKeyword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [cfgOpen, setCfgOpen] = useState(false);
  const [draft, setDraft] = useState<SaleDraft>(EMPTY_DRAFT);

  const load = async (page = pageIdx) => {
    try {
      const resp = await adminApi<LibraryPage>("admin/content/sales_library", {
        method: "GET",
        query: {
          page,
          page_size: 20,
          keyword: [
            filterStatus && `arrival\\":\\"${filterStatus}`,
            filterMatchmaker && `matchmaker\\":\\"${filterMatchmaker}`,
            keyword && `acct_name\\":\\"${keyword}`,
          ].filter(Boolean).join(" ") || undefined,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setCreateOpen(true);
  };

  const openEdit = (item: LibraryContent) => {
    const extra = item.extra ?? {};
    setDraft({
      id: item.id,
      title: item.title,
      share_desc: typeof extra.share_desc === "string" ? extra.share_desc : (item.subtitle ?? ""),
      gender: typeof extra.gender === "string" ? extra.gender : "男性",
      acct_mode: typeof extra.acct_mode === "string" ? extra.acct_mode : "按昵称",
      acct_name: typeof extra.acct_name === "string" ? extra.acct_name : "",
      smart: extra.smart === true,
      matchmaker: typeof extra.matchmaker === "string" ? extra.matchmaker : "",
      pick_limit: typeof extra.pick_limit === "number" ? extra.pick_limit : 10,
      arrival: typeof extra.arrival === "string" ? extra.arrival : "未到店",
      tips: typeof extra.tips === "string" ? extra.tips : "",
    });
    setCreateOpen(true);
  };

  const submit = async () => {
    if (!draft.title.trim()) {
      showConfigToast("请填写页面标题", "error");
      return;
    }
    const payload = {
      title: draft.title.trim(),
      subtitle: draft.share_desc.trim() || null,
      status: 1,
      sort: 100,
      extra: {
        gender: draft.gender,
        acct_mode: draft.acct_mode,
        acct_name: draft.acct_name.trim(),
        smart: draft.smart,
        matchmaker: draft.matchmaker.trim(),
        pick_limit: draft.pick_limit,
        arrival: draft.arrival,
        tips: draft.tips,
      },
    };
    try {
      if (draft.id === null) {
        await adminApi("admin/content/sales_library", { method: "POST", body: payload });
      } else {
        await adminApi(`admin/content/sales_library/${draft.id}`, { method: "PATCH", body: payload });
      }
      showConfigToast("已保存", "ok");
      setCreateOpen(false);
      void load(1);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该销售匹配库？")) return;
    try {
      await adminApi(`admin/content/sales_library/${id}`, { method: "DELETE" });
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
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>销售匹配库（也叫"眼缘库"）是专业婚恋机构中对于到店客户使用的最常见、最有效的"销售方法"，不但能够给客户提供更加直观有效的服务价值传导、还大大简化销售过程的难度、提升开单转化率。</p>
            <p>使用步骤：销售红娘在客户到店之前，为客户创建一个专属的"销售匹配库"，根据之前对客户情况的沟通了解，从系统的会员资料库中挑选出5-10位有吸引力的人选作为"红娘推荐"。</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="slm-head">
          <div className="slm-title-wrap">
            <div className="slm-title">销售匹配库</div>
            <a className="slm-demo" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("客户签署流程演示敬请期待", "ok"); }}>客户签署流程演示</a>
          </div>
          <div className="slm-actions">
            <button className="finord-btn finord-btn-primary" onClick={openCreate}>创建销售匹配库</button>
            <button className="finord-btn finord-btn-primary" onClick={() => setCfgOpen(true)}>功能配置</button>
          </div>
        </div>

        <div className="finord-filters slm-filters">
          <div className="finord-searchbox">
            <span className="finord-search-label">状态:</span>
            <select
              className="finord-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">不限</option>
              <option value="已到店">已到店</option>
              <option value="未到店">未到店</option>
            </select>
          </div>
          <div className="finord-searchbox">
            <span className="finord-search-label">红娘:</span>
            <input
              className="finord-search-input"
              placeholder="红娘名"
              value={filterMatchmaker}
              onChange={(e) => setFilterMatchmaker(e.target.value)}
            />
          </div>
          <div className="finord-searchbox">
            <span className="finord-search-label">请输入</span>
            <input
              className="finord-search-input"
              placeholder="请输入关联会员的昵称/手机/姓名"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void load(1);
              }}
            />
          </div>
          <button className="finord-btn finord-btn-primary" onClick={() => void load(1)}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table slm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>标题</th>
                <th>关联账号</th>
                <th>创建时间</th>
                <th>创建人</th>
                <th>是否到店</th>
                <th>销售红娘</th>
                <th>销售库前端</th>
                <th>链接/二维码</th>
                <th>红娘推荐人选</th>
                <th>客户眼缘清单</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const extra = r.extra ?? {};
                return (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.title}</td>
                    <td>{typeof extra.acct_name === "string" ? extra.acct_name : "-"}</td>
                    <td>{(r.created_at ?? "-").replace("T", " ").slice(0, 19)}</td>
                    <td>{typeof extra.creator === "string" ? extra.creator : "-"}</td>
                    <td>{typeof extra.arrival === "string" ? extra.arrival : "未到店"}</td>
                    <td>{typeof extra.matchmaker === "string" ? extra.matchmaker : "-"}</td>
                    <td>{r.status === 1 ? "开启" : "关闭"}</td>
                    <td><a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("链接复制敬请期待", "ok"); }}>查看</a></td>
                    <td>{typeof extra.pick_count === "number" ? extra.pick_count : 0}</td>
                    <td>{typeof extra.fav_count === "number" ? extra.fav_count : 0}</td>
                    <td>
                      <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); openEdit(r); }}>编辑</a>
                      <span className="cs-op-sep">|</span>
                      <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void remove(r.id); }}>删除</a>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={12} className="ecl-empty">
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

        <div className="finord-pagination">
          <span className="finord-info">共 {total} 条</span>
          <div className="finord-pages">
            <button className="finord-page nav" onClick={() => load(Math.max(1, pageIdx - 1))} disabled={pageIdx <= 1}>‹</button>
            <span className="finord-page active">{pageIdx} / {totalPages}</span>
            <button className="finord-page nav" onClick={() => load(Math.min(totalPages, pageIdx + 1))} disabled={pageIdx >= totalPages}>›</button>
          </div>
        </div>
      </div>

      {createOpen && (
        <CreateMatchDrawer
          onClose={() => setCreateOpen(false)}
          draft={draft}
          setDraft={setDraft}
          onSubmit={submit}
        />
      )}
      {cfgOpen && <FuncConfigDrawer onClose={() => setCfgOpen(false)} />}
    </div>
  );
}

function CreateMatchDrawer({
  onClose,
  draft,
  setDraft,
  onSubmit,
}: {
  onClose: () => void;
  draft: SaleDraft;
  setDraft: React.Dispatch<React.SetStateAction<SaleDraft>>;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel sm-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">{draft.id === null ? "创建" : "编辑"}销售匹配库</span>
          </div>
          <div className="sm-head-actions">
            <button className="finord-btn sm-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary" onClick={onSubmit}>确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="sm-row">
            <span className="sm-label">＊页面标题</span>
            <div className="sm-content">
              <input
                className="sm-input sm-input-wide"
                placeholder="最多20文字"
                value={draft.title}
                onChange={(e) => setDraft((cur) => ({ ...cur, title: e.target.value }))}
                maxLength={20}
              />
            </div>
          </div>

          <div className="sm-row">
            <span className="sm-label">分享描述</span>
            <div className="sm-content">
              <input
                className="sm-input sm-input-wide"
                placeholder="请输入分享描述"
                value={draft.share_desc}
                onChange={(e) => setDraft((cur) => ({ ...cur, share_desc: e.target.value }))}
              />
            </div>
          </div>

          <div className="sm-row">
            <span className="sm-label">客户性别</span>
            <div className="sm-options">
              {["男性", "女性"].map((o) => (
                <label key={o} className={`sm-radio ${draft.gender === o ? "active" : ""}`}>
                  <input type="radio" name="gender" value={o} checked={draft.gender === o} onChange={() => setDraft((cur) => ({ ...cur, gender: o }))} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sm-row">
            <span className="sm-label">关联账号</span>
            <div className="sm-content">
              <div className="sm-acct-row">
                <input
                  className="sm-input"
                  placeholder="请输入账号昵称"
                  value={draft.acct_name}
                  onChange={(e) => setDraft((cur) => ({ ...cur, acct_name: e.target.value }))}
                />
                <div className="sm-options sm-options-inline">
                  {["按昵称", "按手机"].map((o) => (
                    <label key={o} className={`sm-radio ${draft.acct_mode === o ? "active" : ""}`}>
                      <input type="radio" name="acctMode" value={o} checked={draft.acct_mode === o} onChange={() => setDraft((cur) => ({ ...cur, acct_mode: o }))} />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="sm-info">① 报本客户在平台中已注册的账号昵称，关联后系统默认根据其详细条件要素（年龄、身高、学历、收入）进行智能匹配。</div>
              <div className="sm-info">绑定用户账号之后，眼缘库仅限该用户和所属红娘可以操作，未绑定的情况下任何人进入该页面均可操作</div>
            </div>
          </div>

          <div className="sm-row">
            <span className="sm-label">智能匹配</span>
            <div className="sm-content">
              <div className="sm-switch-row">
                <button type="button" className={`mp-switch ${draft.smart ? "on" : ""}`} onClick={() => setDraft((cur) => ({ ...cur, smart: !cur.smart }))}>
                  <span className="mp-switch-knob"></span>
                </button>
                <span className="sm-switch-text">{draft.smart ? "开启" : "关闭"}</span>
              </div>
              <div className="sm-info">开启本功能后，眼缘库中的智能匹配将按照下面的条件筛选显示(不包含脱单会员)</div>
            </div>
          </div>

          <div className="sm-row">
            <span className="sm-label">＊销售红娘</span>
            <div className="sm-content">
              <input
                className="sm-input sm-input-wide"
                placeholder="请输入销售红娘"
                value={draft.matchmaker}
                onChange={(e) => setDraft((cur) => ({ ...cur, matchmaker: e.target.value }))}
              />
            </div>
          </div>

          <div className="sm-row">
            <span className="sm-label">＊选人上限</span>
            <div className="sm-content">
              <input
                type="number"
                className="sm-input sm-input-num"
                value={draft.pick_limit}
                onChange={(e) => setDraft((cur) => ({ ...cur, pick_limit: Number(e.target.value) || 0 }))}
              />
              <div className="sm-info">该客户最多可选择的眼缘人选的数量限制</div>
            </div>
          </div>

          <div className="sm-row">
            <span className="sm-label">状态</span>
            <div className="sm-options">
              {["已到店", "未到店"].map((o) => (
                <label key={o} className={`sm-radio ${draft.arrival === o ? "active" : ""}`}>
                  <input type="radio" name="status" value={o} checked={draft.arrival === o} onChange={() => setDraft((cur) => ({ ...cur, arrival: o }))} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sm-row">
            <span className="sm-label">温馨提示</span>
            <div className="sm-content">
              <textarea
                className="sm-textarea"
                placeholder="请输入温馨提示"
                rows={4}
                value={draft.tips}
                onChange={(e) => setDraft((cur) => ({ ...cur, tips: e.target.value }))}
              />
              <div className="sm-info">这是前端进入到该匹配库时页面中弹出的内容</div>
            </div>
          </div>

          <div className="sm-submit-row">
            <button className="finord-btn finord-btn-primary sm-submit" onClick={onSubmit}>确定提交</button>
          </div>
        </div>
      </div>
    </>
  );
}

type SalesConfig = {
  show_banner: boolean;
  banner_url: string;
  nav_items: NavItem[];
  show_auth: boolean;
  show_intro: boolean;
  show_mate_req: boolean;
  show_material: boolean;
  show_person_intro: boolean;
};

const DEFAULT_CONFIG: SalesConfig = {
  show_banner: true,
  banner_url: "",
  nav_items: [
    { id: 1, label: "嘉宾海选", on: true },
    { id: 2, label: "红娘推荐", on: true },
    { id: 3, label: "智能匹配", on: true },
    { id: 4, label: "眼缘人选", on: true },
  ],
  show_auth: true,
  show_intro: true,
  show_mate_req: true,
  show_material: true,
  show_person_intro: true,
};

function FuncConfigDrawer({ onClose }: { onClose: () => void }) {
  const { snapshot, save, loading } = useConfigDomain<SalesConfig>("tools_sales_match", DEFAULT_CONFIG);
  const cfg = (snapshot?.config ?? DEFAULT_CONFIG) as SalesConfig;
  const [showBanner, setShowBanner] = useState(cfg.show_banner);
  const [bannerUrl, setBannerUrl] = useState(cfg.banner_url);
  const [navItems, setNavItems] = useState<NavItem[]>(cfg.nav_items);
  const [auth, setAuth] = useState(cfg.show_auth);
  const [intro, setIntro] = useState(cfg.show_intro);
  const [mateReq, setMateReq] = useState(cfg.show_mate_req);
  const [material, setMaterial] = useState(cfg.show_material);
  const [personIntro, setPersonIntro] = useState(cfg.show_person_intro);

  const move = (idx: number, dir: -1 | 1) => {
    setNavItems((arr) => {
      const next = [...arr];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return arr;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const onSubmit = async () => {
    try {
      await save({
        show_banner: showBanner,
        banner_url: bannerUrl,
        nav_items: navItems,
        show_auth: auth,
        show_intro: intro,
        show_mate_req: mateReq,
        show_material: material,
        show_person_intro: personIntro,
      }, "保存销售匹配库功能配置");
      showConfigToast("已保存", "ok");
      onClose();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel sm-panel sm-cfg-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">功能配置</span>
          </div>
          <div className="sm-head-actions">
            <button className="finord-btn sm-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary" onClick={onSubmit} disabled={loading}>确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="sm-cfg-block">
            <div className="sm-cfg-block-title">头部宣传图:</div>
            <div className="sm-cfg-radio-row">
              <label className="sm-radio">
                <input type="radio" name="banner" checked={showBanner} onChange={() => setShowBanner(true)} />
                <span>展示</span>
              </label>
              <label className="sm-radio">
                <input type="radio" name="banner" checked={!showBanner} onChange={() => setShowBanner(false)} />
                <span>隐藏</span>
              </label>
              <span className="sm-cfg-banner-size">710像素X120像素</span>
            </div>
            <div className="sm-cfg-banner">
              {bannerUrl ? <img src={bannerUrl} alt="banner" /> : <div className="sm-cfg-banner-text">我 你 她 他 的 采</div>}
            </div>
            <div className="sm-cfg-banner-btn">
              <input
                id="sm-cfg-banner"
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
                    setBannerUrl(url);
                  } catch (err) {
                    showConfigToast(err instanceof Error ? err.message : "上传失败", "error");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById("sm-cfg-banner")?.click()}
              >
                <Upload size={14} /> 上传图片
              </button>
            </div>
          </div>

          <div className="sm-cfg-block">
            <div className="sm-cfg-block-title">导航与功能控制:</div>
            <div className="sm-cfg-nav">
              {navItems.map((n, idx) => (
                <div className="sm-cfg-nav-row" key={n.id}>
                  <span className="sm-cfg-nav-name">{n.label}</span>
                  <span className="sm-cfg-nav-tag">{n.label}</span>
                  <button
                    type="button"
                    className={`mp-switch ${n.on ? "on" : ""}`}
                    onClick={() => setNavItems((arr) => arr.map((x) => x.id === n.id ? { ...x, on: !x.on } : x))}
                  >
                    {n.on && <span className="mp-switch-label">显示</span>}
                    <span className="mp-switch-knob"></span>
                  </button>
                  <button type="button" className="sm-cfg-move" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp size={12} /> 上移</button>
                  <button type="button" className="sm-cfg-move" onClick={() => move(idx, 1)} disabled={idx === navItems.length - 1}><ArrowDown size={12} /> 下移</button>
                </div>
              ))}
            </div>
          </div>

          <div className="sm-cfg-block">
            <div className="sm-cfg-block-title">会员资料页展示内容控制:</div>
            <div className="sm-cfg-mat">
              <div className="sm-cfg-mat-row">
                <span className="sm-cfg-mat-name">认证情况</span>
                <button type="button" className={`mp-switch ${auth ? "on" : ""}`} onClick={() => setAuth(!auth)}>
                  {auth && <span className="mp-switch-label">显示</span>}
                  <span className="mp-switch-knob"></span>
                </button>
              </div>
              <div className="sm-cfg-mat-row">
                <span className="sm-cfg-mat-name">红娘介绍</span>
                <button type="button" className={`mp-switch ${intro ? "on" : ""}`} onClick={() => setIntro(!intro)}>
                  {intro && <span className="mp-switch-label">显示</span>}
                  <span className="mp-switch-knob"></span>
                </button>
                <span className="sm-cfg-mat-name sm-cfg-mat-name-right">择偶要求</span>
                <button type="button" className={`mp-switch ${mateReq ? "on" : ""}`} onClick={() => setMateReq(!mateReq)}>
                  {mateReq && <span className="mp-switch-label">显示</span>}
                  <span className="mp-switch-knob"></span>
                </button>
              </div>
              <div className="sm-cfg-mat-row">
                <span className="sm-cfg-mat-name">个人资料</span>
                <button type="button" className={`mp-switch ${material ? "on" : ""}`} onClick={() => setMaterial(!material)}>
                  {material && <span className="mp-switch-label">显示</span>}
                  <span className="mp-switch-knob"></span>
                </button>
                <span className="sm-cfg-mat-name sm-cfg-mat-name-right">个人介绍</span>
                <button type="button" className={`mp-switch ${personIntro ? "on" : ""}`} onClick={() => setPersonIntro(!personIntro)}>
                  {personIntro && <span className="mp-switch-label">显示</span>}
                  <span className="mp-switch-knob"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
