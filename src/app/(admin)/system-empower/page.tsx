"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminApi } from "@/lib/admin-api";
import { adminEndpoints } from "@/lib/admin-endpoints";

/* 后端兼容接口返回结构（LegacyResponse 包装，data 内字段多为占位/null） */
interface LegacyResponse<T> {
  code: number;
  data: T;
  msg: string;
  success: boolean;
}

interface TenantDetail {
  id: number;
  name: string;
  alias: string;
  customerName: string;
  bindingDomain: string;
  bindingDomainWithHttps: string;
  concurrentNumLimit: number;
  grantAuthDeadline: string | null;
  grantPluginIds: string;
  phone: string | null;
  regionDataMode: string;
  whetherLock: boolean;
}

interface TenantAuth {
  name: string;
  alias: string;
  whetherLock: boolean;
  grantAuthDeadline: string | null;
  smsSurplusNum: number;
  realNameSurplusNum: number;
  signSurplusNum: number;
  maritalStatusSurplusNum: number;
  whetherProtect: boolean;
}

const EMPTY_DETAIL: TenantDetail = {
  id: 0,
  name: "",
  alias: "",
  customerName: "",
  bindingDomain: "",
  bindingDomainWithHttps: "",
  concurrentNumLimit: 0,
  grantAuthDeadline: null,
  grantPluginIds: "",
  phone: null,
  regionDataMode: "",
  whetherLock: false,
};

const EMPTY_AUTH: TenantAuth = {
  name: "",
  alias: "",
  whetherLock: false,
  grantAuthDeadline: null,
  smsSurplusNum: 0,
  realNameSurplusNum: 0,
  signSurplusNum: 0,
  maritalStatusSurplusNum: 0,
  whetherProtect: false,
};

/** 后端未返回的字段一律显示 "-"，不编造内容 */
function text(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "-";
  const str = String(value).trim();
  return str ? str : "-";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? `${m[1]}年${m[2]}月${m[3]}日` : value;
}

function remainingDays(value: string | null | undefined) {
  if (!value) return "";
  const end = new Date(value);
  if (Number.isNaN(end.getTime())) return "";
  const diff = Math.ceil((end.getTime() - Date.now()) / 86400000);
  if (diff < 0) return "已到期";
  return `还有 ${diff} 天授权到期`;
}

const OFFICIAL_LINKS = [
  { href: "http://www.163kyun.com", label: "http://www.163kyun.com" },
  { href: "http://www.163k.com", label: "http://www.163k.com" },
];

export default function SystemEmpowerPage() {
  const [detail, setDetail] = useState<TenantDetail>(EMPTY_DETAIL);
  const [auth, setAuth] = useState<TenantAuth>(EMPTY_AUTH);
  const [status, setStatus] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [bootstrap, detailResult, authResult] = await Promise.allSettled([
      adminEndpoints.bootstrap(),
      adminApi<LegacyResponse<TenantDetail>>("common/api/system/getTenantDetail"),
      adminApi<LegacyResponse<TenantAuth>>("commonadmin/api/system/getTenantAuth"),
    ]);
    if (bootstrap.status === "fulfilled") {
      setStatus(bootstrap.value.authorization?.status ?? "");
      setExpiresAt(bootstrap.value.authorization?.expires_at ?? null);
    }
    if (detailResult.status === "fulfilled") {
      setDetail({ ...EMPTY_DETAIL, ...(detailResult.value?.data ?? {}) });
    }
    if (authResult.status === "fulfilled") {
      setAuth({ ...EMPTY_AUTH, ...(authResult.value?.data ?? {}) });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const deadline = detail.grantAuthDeadline || auth.grantAuthDeadline || expiresAt;
  const locked = detail.whetherLock || auth.whetherLock || status === "locked";

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "授权状态", value: loading ? "加载中" : locked ? "已锁定" : status === "active" ? "正常" : text(status) },
    { label: "授权版本", value: "-" },
    { label: "授权机构", value: text(detail.name || auth.name) },
    { label: "运营区域", value: text(detail.regionDataMode) },
    { label: "区域保护", value: auth.whetherProtect ? "已开启" : "未开启" },
    { label: "授权域名", value: text(detail.bindingDomain || detail.bindingDomainWithHttps) },
    {
      label: "授权期限",
      value: (
        <>
          {formatDate(deadline)}
          {deadline && <span className="license-strong" style={{ marginLeft: 8 }}>{remainingDays(deadline)}</span>}
        </>
      ),
    },
    { label: "授权产品", value: "-" },
    { label: "授权协议", value: "-" },
    { label: "客户经理", value: text(detail.customerName) },
    { label: "技术维护", value: "-" },
    { label: "并发上限", value: detail.concurrentNumLimit > 0 ? `${detail.concurrentNumLimit} 路` : "-" },
    { label: "短信余量", value: `${auth.smsSurplusNum ?? 0} 条` },
    {
      label: "产品官网",
      value: (
        <>
          {OFFICIAL_LINKS.map((link, index) => (
            <span key={link.href}>
              {index > 0 && <span>&nbsp;&nbsp;</span>}
              <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
            </span>
          ))}
        </>
      ),
    },
  ];

  /* 后端没有续期/升级/购买/激活/二维码/协议上传接口，按钮统一显式禁用并说明原因 */
  const disabledActions = [
    { label: "续期", hint: "后端未提供授权续期接口，需联系服务商办理" },
    { label: "升级", hint: "后端未提供授权升级接口，需联系服务商办理" },
    { label: "购买", hint: "后端未提供授权购买接口，需联系服务商办理" },
    { label: "激活", hint: "后端未提供授权激活接口，需联系服务商办理" },
    { label: "授权二维码", hint: "后端未提供授权二维码接口，需联系服务商获取" },
    { label: "协议上传", hint: "后端未提供授权协议上传接口，需联系服务商办理" },
  ];

  return (
    <div className="service-page">
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "官方服务" },
          { label: "软件授权" },
        ]}
      />
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="font-medium text-base">软件授权</span>
        </div>
        <div className="admin-card-body">
          <div className="license-info">
            {rows.map((item) => (
              <div key={item.label} className="license-field">
                <span className="license-label">{item.label}</span>
                <span className="license-value">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2.5 border-t border-[#f0f2f7] pt-6">
            {disabledActions.map((action) => (
              <button
                key={action.label}
                type="button"
                disabled
                title={action.hint}
                className="cursor-not-allowed rounded border border-[#dcdfe6] bg-[#f7f8fa] px-4 py-1.5 text-[13px] text-[#b6bcc8]"
              >
                {action.label}
              </button>
            ))}
            <span className="text-[12px] text-[#9aa1ad]">上述操作需联系服务商办理，后台暂未开放。</span>
          </div>
        </div>
      </div>
    </div>
  );
}
