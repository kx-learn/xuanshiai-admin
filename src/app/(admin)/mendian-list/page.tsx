"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { StoreAdminItem } from "@/lib/admin-endpoints";
import { resolveMediaUrl } from "@/lib/admin-api";
import {
  asObject,
  pickAndUploadImage,
  showConfigToast,
  useConfigDomain,
  type Dict,
} from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("分店管理", "门店管理");

const columns = ["门店名称", "显示名称", "地区", "门店地址", "门店LOGO", "门店分成", "会员数", "红娘数", "状态", "操作"];

const STATUS_LABEL: Record<number, string> = { 1: "正常", 2: "已关闭", 3: "已停用" };
const STATUS_OPTIONS = [
  { value: 1, label: "正常" },
  { value: 2, label: "已关闭" },
  { value: 3, label: "已停用" },
] as const;

/** 分成模式：fixed=自定义固定金额，ratio=按照比例自动计算 */
type CommissionMode = "fixed" | "ratio";
const COMMISSION_MODE_LABEL: Record<CommissionMode, string> = {
  fixed: "自定义固定金额",
  ratio: "按照比例自动计算",
};

/**
 * 门店「独立LOGO / 地址 / 分成 / 简介」后端 StoreAdminCreate|Update 暂无字段，
 * 暂存在配置域 store_extra（按门店 id 归档）。后端补齐字段后改为直传即可。
 * 详见 docs/原站对比-功能缺口与后端清单.md 第四节「补充：字段级缺口」。
 */
type StoreExtra = {
  logo: string;
  address: string;
  commission_mode: CommissionMode;
  commission_value: string;
  intro: string;
};
const EXTRA_EMPTY: StoreExtra = {
  logo: "",
  address: "",
  commission_mode: "ratio",
  commission_value: "",
  intro: "",
};

function readExtra(source: Dict | null | undefined, id: number): StoreExtra {
  const all = asObject(source?.extras);
  return { ...EXTRA_EMPTY, ...asObject(all[String(id)]) } as StoreExtra;
}

export default function MendianListPage() {
  const domain = useConfigDomain<Dict>("store_extra", { extras: {} });

  const [rows, setRows] = useState<StoreAdminItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [editor, setEditor] = useState<{ open: boolean; row: StoreAdminItem | null }>({ open: false, row: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminEndpoints.storeList({
        page,
        page_size: pageSize,
        search: submittedKeyword || undefined,
      });
      setRows(result.items);
      setTotal(result.total);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, submittedKeyword]);

  useEffect(() => {
    void load();
  }, [load]);

  const removeRow = async (row: StoreAdminItem) => {
    if (typeof window !== "undefined" && !window.confirm(`确认删除门店「${row.display_name || row.name}」？`)) return;
    try {
      await adminEndpoints.deleteStore(row.id);
      showConfigToast("已删除");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>多门店（分店）系统，为拥有多家线下门店的婚恋公司，有招商加盟业务的品牌婚介公司提供了一整套的平台解决方案，可以实现在一套系统中由平台统一集权管理，对外共享一个线上平台统一进行会员展示、拓展客源和单线，又能让每个门店（或加盟商）拥有独立的管理平台。</p>
            <p><b>平台与分店间的分成与结算：</b>平台可以为每个分店设置独立的分成标准/分店名下会员在线上平台中支付的费用是统一进入跨到平台总账的微信商户账号中，平台根据与分店间达成的分成标准进行分成；分店的分成金额 实时计入到分店店长账号中的余额中，待分店随时在平台中进行提现支付使用</p>
            <p><b>分店红娘的分成与结账：</b>分店独立给自己门店下的红娘设置独立分成与结账，分店自行给自己的红娘结算，系统为分店生成相应的统计和报表数据，分店根据报表人工核算给红娘结账</p>
            <p><b>分店店长权限：</b>即分店的管理者，同时兼具动态普通红娘的身份，在门店管理平台中可以查看、操作、编辑在该门店下的全部客源信息、会员资料、联系方式、牵线记录等，并可以自行添加、管理分店下的红娘、提交关闭分店</p>
            <p><b>分店管理红娘：</b>在红娘平台中可以查看、操作、编辑在本分店中隶属于自己的全部客源信息、会员资料、联系方式、牵线记录等</p>
            <p><b>提示：</b>创建门店后在"红娘管理平台"中添加门店的"店长红娘"，未创建此账号之前无登录入口，入乡口只可能拥有一个店的红娘身份。店长登录"红娘管理平台"后可以自由添加管理店内的普通红娘</p>
            <p><b>提示：</b>门店状态为"关闭"时，门店管理系统将被禁止登录，其它名「红娘（各店长）登录管理平台时会提示门店关闭中，无法登录</p>
          </div>
        </div>
      </div>

      {/* 门店列表 */}
      <div className="finord-card bc-card">
        <div className="bc-list-head">
          <div className="finord-filters">
            <input
              className="finord-search-input"
              placeholder="请输入门店名称"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); setSubmittedKeyword(keyword); } }}
            />
            <button
              type="button"
              className="finord-btn finord-btn-primary"
              onClick={() => { setPage(1); setSubmittedKeyword(keyword); }}
            >
              搜索
            </button>
          </div>
          <button
            className="finord-btn bc-add-btn"
            style={{ background: "#3658f7", borderColor: "#3658f7", color: "#fff", cursor: "pointer" }}
            onClick={() => setEditor({ open: true, row: null })}
          >
            + 添加门店
          </button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table bc-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>
                  <input type="checkbox" aria-label="全选本页" />
                </th>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const extra = readExtra(domain.snapshot?.config, row.id);
                return (
                  <tr key={row.id}>
                    <td><input type="checkbox" aria-label={`选择门店 ${row.name}`} /></td>
                    <td>{row.name}</td>
                    <td>{row.display_name || "-"}</td>
                    <td>{row.region_code || "-"}</td>
                    <td>{extra.address || "-"}</td>
                    <td>
                      {extra.logo ? (
                        <img src={resolveMediaUrl(extra.logo) ?? extra.logo} alt={row.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                      ) : "-"}
                    </td>
                    <td>
                      {extra.commission_value
                        ? `${COMMISSION_MODE_LABEL[extra.commission_mode]} ${extra.commission_value}${extra.commission_mode === "ratio" ? "%" : "元"}`
                        : "-"}
                    </td>
                    <td>{row.member_count ?? 0}</td>
                    <td>{row.matchmaker_count ?? 0}</td>
                    <td>{STATUS_LABEL[row.status] ?? "-"}</td>
                    <td>
                      <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => setEditor({ open: true, row })}>编辑</button>
                      <span style={{ margin: "0 8px", color: "#dfe3ea" }}>|</span>
                      <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => void removeRow(row)}>删除</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="bc-empty" style={{ display: "block" }}>
              <div className="bc-empty-inner">
                <div className="bc-empty-icon">🏪</div>
                <div className="bc-empty-text">{loading ? "加载中…" : "暂无数据"}</div>
              </div>
            </div>
          )}
        </div>
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
        {message && <p style={{ color: "#ff4d4f", fontSize: 13, marginTop: 8 }}>{message}</p>}
      </div>

      {editor.open && (
        <StoreEditorDrawer
          row={editor.row}
          extras={editor.row ? readExtra(domain.snapshot?.config, editor.row.id) : EXTRA_EMPTY}
          onClose={() => setEditor({ open: false, row: null })}
          onSaved={async (savedId, extra) => {
            const all = asObject(domain.snapshot?.config?.extras);
            await domain.save({ extras: { ...all, [String(savedId)]: extra } }, "门店扩展信息");
            setEditor({ open: false, row: null });
            void load();
          }}
        />
      )}
    </div>
  );
}

/* ── 添加 / 编辑门店抽屉 ───────────────────────────────────── */

function StoreEditorDrawer({
  row,
  extras,
  onClose,
  onSaved,
}: {
  row: StoreAdminItem | null;
  extras: StoreExtra;
  onClose: () => void;
  onSaved: (id: number, extra: StoreExtra) => void | Promise<void>;
}) {
  const editing = row !== null;
  const [code, setCode] = useState(row?.code ?? "");
  const [name, setName] = useState(row?.name ?? "");
  const [displayName, setDisplayName] = useState(row?.display_name ?? "");
  const [regionCode, setRegionCode] = useState(row?.region_code ?? "");
  const [linkUrl, setLinkUrl] = useState(row?.link_url ?? "");
  const [sortOrder, setSortOrder] = useState(String(row?.sort_order ?? 0));
  const [qrCode, setQrCode] = useState<string | null>(row?.qr_code ?? null);
  const [autoRedirect, setAutoRedirect] = useState(row?.auto_redirect ?? false);
  const [status, setStatus] = useState<number>(row?.status ?? 1);

  // 后端暂缺字段（配置域暂存）
  const [logo, setLogo] = useState(extras.logo);
  const [address, setAddress] = useState(extras.address);
  const [commissionMode, setCommissionMode] = useState<CommissionMode>(extras.commission_mode);
  const [commissionValue, setCommissionValue] = useState(extras.commission_value);
  const [intro, setIntro] = useState(extras.intro);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const logoRef = useRef<HTMLInputElement | null>(null);

  const submit = async () => {
    if (!name.trim()) { setError("请填写门店名称"); return; }
    if (!editing && !/^[A-Za-z0-9_-]{2,64}$/.test(code.trim())) {
      setError("门店编码仅支持 2-64 位字母、数字、下划线或短横线");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        display_name: displayName.trim() || null,
        region_code: regionCode.trim() || null,
        link_url: linkUrl.trim() || null,
        sort_order: Number(sortOrder) || 0,
        qr_code: qrCode,
        auto_redirect: autoRedirect,
      };
      let saved: StoreAdminItem;
      if (editing && row) {
        saved = await adminEndpoints.updateStoreAdmin(row.id, payload);
        if (status !== row.status) {
          await adminEndpoints.updateStoreStatus(row.id, { status });
        }
      } else {
        saved = await adminEndpoints.createStore({ code: code.trim(), ...payload });
      }
      showConfigToast(editing ? "已保存" : "已创建");
      await onSaved(saved.id, {
        logo,
        address,
        commission_mode: commissionMode,
        commission_value: commissionValue,
        intro,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel" style={{ width: 560 }}>
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">{editing ? "编辑门店" : "添加门店"}</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary" disabled={saving} onClick={() => void submit()}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>

        <div className="tlc-panel-body">
          <div className="bd-form">
            {!editing && (
              <div className="bd-form-row">
                <span className="bd-form-label"><span className="bd-req">*</span>门店编码</span>
                <input className="bd-input" value={code} placeholder="如 nanjing-01（创建后不可修改）" onChange={(e) => setCode(e.target.value)} />
              </div>
            )}
            <div className="bd-form-row">
              <span className="bd-form-label"><span className="bd-req">*</span>门店名称</span>
              <input className="bd-input" value={name} placeholder="请输入门店名称" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="bd-form-row">
              <span className="bd-form-label">显示名称</span>
              <input className="bd-input" value={displayName} placeholder="对外展示名，留空使用门店名称" onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="bd-form-row">
              <span className="bd-form-label">所在地区</span>
              <input className="bd-input" value={regionCode} placeholder="行政区划码，如 320100" onChange={(e) => setRegionCode(e.target.value)} />
            </div>
            <div className="bd-form-row">
              <span className="bd-form-label">门店地址</span>
              <input className="bd-input" value={address} placeholder="请输入门店地址" onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="bd-form-row bd-form-icon-row">
              <span className="bd-form-label">门店独立LOGO</span>
              <div className="bd-icon-group">
                <button type="button" className="bd-icon-upload" onClick={() => logoRef.current?.click()}>上传图片</button>
                {logo && (
                  <>
                    <img src={resolveMediaUrl(logo) ?? logo} alt="LOGO" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4 }} />
                    <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => setLogo("")}>移除</button>
                  </>
                )}
              </div>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  pickAndUploadImage(e.target.files?.[0], setLogo, setError);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="bd-form-row bd-form-icon-row">
              <span className="bd-form-label">门店分成</span>
              <div className="bm-radio-row">
                {(Object.keys(COMMISSION_MODE_LABEL) as CommissionMode[]).map((m) => (
                  <label key={m} className={`bm-radio ${commissionMode === m ? "active" : ""}`}>
                    <input type="radio" name="commission-mode" checked={commissionMode === m} onChange={() => setCommissionMode(m)} />
                    <span>{COMMISSION_MODE_LABEL[m]}</span>
                  </label>
                ))}
                <input
                  className="bd-input"
                  style={{ width: 120 }}
                  value={commissionValue}
                  placeholder={commissionMode === "ratio" ? "比例(%)" : "金额(元)"}
                  onChange={(e) => setCommissionValue(e.target.value.replace(/[^\d.]/g, ""))}
                />
              </div>
            </div>

            <div className="bd-form-row">
              <span className="bd-form-label">门店简介</span>
              <textarea
                className="bd-input"
                style={{ minHeight: 72, paddingTop: 6 }}
                value={intro}
                placeholder="请输入门店简介"
                onChange={(e) => setIntro(e.target.value)}
              />
            </div>

            <div className="bd-form-row">
              <span className="bd-form-label">门店链接</span>
              <input className="bd-input" value={linkUrl} placeholder="留空使用系统内置默认" onChange={(e) => setLinkUrl(e.target.value)} />
            </div>
            <div className="bd-form-row">
              <span className="bd-form-label">显示排序</span>
              <input className="bd-input" value={sortOrder} inputMode="numeric" onChange={(e) => setSortOrder(e.target.value.replace(/[^\d]/g, ""))} />
            </div>

            <div className="bd-form-row bd-form-icon-row">
              <span className="bd-form-label">门店二维码</span>
              <div className="bd-icon-group">
                <button type="button" className="bd-icon-upload" onClick={() => fileRef.current?.click()}>上传图片</button>
                {qrCode && (
                  <>
                    <img src={resolveMediaUrl(qrCode) ?? qrCode} alt="二维码" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4 }} />
                    <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => setQrCode(null)}>移除</button>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  pickAndUploadImage(e.target.files?.[0], setQrCode, setError);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="bd-form-row bd-form-icon-row">
              <span className="bd-form-label">状态</span>
              <div className="bm-radio-row">
                {STATUS_OPTIONS.map((o) => (
                  <label key={o.value} className={`bm-radio ${status === o.value ? "active" : ""}`}>
                    <input type="radio" name="store-status" checked={status === o.value} onChange={() => setStatus(o.value)} />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bd-form-row bd-form-icon-row">
              <span className="bd-form-label">自动跳转</span>
              <div className="bm-radio-row">
                {[{ label: "开启", value: true }, { label: "关闭", value: false }].map((o) => (
                  <label key={o.label} className={`bm-radio ${autoRedirect === o.value ? "active" : ""}`}>
                    <input type="radio" name="autoRedirect" checked={autoRedirect === o.value} onChange={() => setAutoRedirect(o.value)} />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {error && <p style={{ color: "#ff4d4f", fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    </>
  );
}
