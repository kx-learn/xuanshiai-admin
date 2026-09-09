"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { asStr, pickAndUploadImage, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

interface SwitchProps {
  label?: string;
  enabled: boolean;
  onToggle: () => void;
}

/** 圆形开关，选中时蓝底 + 白色圆点靠右，左侧显示文字（默认「启用」） */
function CheckSwitch({ label = "启用", enabled, onToggle }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      className={`mp-switch ${enabled ? "on" : ""}`}
      onClick={onToggle}
    >
      {enabled && <span className="mp-switch-label">{label}</span>}
      <span className="mp-switch-knob" />
    </button>
  );
}

interface UploadBoxProps {
  placeholder: string;
  url: string | null;
  onUpload: () => void;
  onClear?: () => void;
}

/** 上传图片块：预览区，底部叠一条深灰「上传图片」覆盖条（点击上传） */
function UploadBox({ placeholder, url, onUpload }: UploadBoxProps) {
  return (
    <div className="mp-upload">
      <div className={`mp-upload-preview ${url ? "filled" : ""}`}>
        {url ? (
          <img src={url} alt={placeholder} className="pcfg-upload-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span className="mp-upload-placeholder">{placeholder}</span>
        )}
        <button type="button" className="mp-upload-overlay" onClick={onUpload}>
          上传图片
        </button>
      </div>
    </div>
  );
}

const DEFAULTS = {
  enabled: true, app_id: "", app_secret: "", bar_color: "#6a2fbf",
  qrcode_url: null, share_cover_url: null, realname_enabled: true, authorized: false,
} as const;

export default function MiniprogramConfigPage() {
  const domain = useConfigDomain<Dict>("wechat_mini", DEFAULTS as unknown as Dict);

  const [enabled, setEnabled] = useState(true);
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [barColor, setBarColor] = useState("#6a2fbf");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [realName, setRealName] = useState(true);

  const barInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const apply = useCallback((config: Dict | null) => {
    if (!config) return;
    setEnabled(config.enabled !== false);
    setAppId(asStr(config.app_id, ""));
    setAppSecret(asStr(config.app_secret, ""));
    setBarColor(asStr(config.bar_color, "#6a2fbf"));
    setQrUrl(asStr(config.qrcode_url, "") || null);
    setCoverUrl(asStr(config.share_cover_url, "") || null);
    setRealName(config.realname_enabled !== false);
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const payload = () => ({
    enabled, app_id: appId, app_secret: appSecret, bar_color: barColor,
    qrcode_url: qrUrl, share_cover_url: coverUrl, realname_enabled: realName,
    authorized: domain.snapshot?.config.authorized === true,
  } as Partial<Dict>);

  const submit = async () => {
    const ok = await domain.save(payload(), "小程序参数配置更新");
    if (ok) showConfigToast("已保存");
    else if (domain.error) showConfigToast(domain.error, "error");
  };

  useEffect(() => {
    if (!domain.ready) return;
    const t = setTimeout(() => { domain.save(payload(), "小程序参数配置更新"); }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, appId, appSecret, barColor, qrUrl, coverUrl, realName, domain.ready]);

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "小程序", href: "/miniprogram-config", children: [{ label: "参数配置", href: "/miniprogram-config" }] },
          { label: "参数配置" },
        ]}
      />

      {/* 须知 */}
      <div className="mp-notice">
        <div className="mp-notice-title">
          <span className="mp-notice-icon">i</span>须知
        </div>
        <p>
          根据腾讯官方要求，婚恋类的小程序需要您的公司主体具备ICP(电信业务增值许可证)方可上架。当您具备本条件后在微信官方申请开通小程序，然后授权托管给微信第三方服务商，由该服务商为您提供小程序上架与更新发布以及维护工作。
        </p>
      </div>

      {/* 小程序配置 */}
      <div className="admin-card mp-card">
        <div className="admin-card-header">小程序配置</div>
        <div className="admin-card-body mp-card-body">
          <div className="mp-form">
            <div className="mp-field">
              <span className="mp-label">是否开启</span>
              <CheckSwitch label="开" enabled={enabled} onToggle={() => setEnabled((v) => !v)} />
            </div>

            <div className="mp-field">
              <span className="mp-label mp-required">appId</span>
              <input
                className="mp-input"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="请输入 appId"
              />
            </div>

            <div className="mp-field">
              <span className="mp-label mp-required">appSecret</span>
              <input
                className="mp-input"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                placeholder="请输入 appSecret"
              />
            </div>

            <div className="mp-field">
              <span className="mp-label">状态栏背景色</span>
              <button
                type="button"
                className="mp-color-swatch"
                style={{ background: barColor }}
                onClick={() => barInputRef.current?.click()}
                aria-label="选择状态栏背景色"
              />
              <input
                ref={barInputRef}
                type="color"
                value={barColor}
                onChange={(e) => setBarColor(e.target.value)}
                className="mp-color-input"
              />
            </div>

            <div className="mp-field mp-field-top">
              <span className="mp-label">小程序码</span>
              <UploadBox placeholder="二维码图片" url={qrUrl} onUpload={() => qrInputRef.current?.click()} />
            </div>

            <div className="mp-field mp-field-top">
              <span className="mp-label">分享封面</span>
              <div className="mp-upload-group">
                <UploadBox placeholder="封面占位" url={coverUrl} onUpload={() => coverInputRef.current?.click()} />
                <button
                  type="button"
                  className="mp-clear-btn"
                  onClick={() => {
                    setCoverUrl(null);
                    setQrUrl(null);
                  }}
                >
                  清空图片
                </button>
                <div className="mp-tipbox">
                  <span className="mp-tip-icon">i</span>
                  留空默认为首屏截图，图片尺寸：500像素X400像素，建议不超过120KB
                </div>
              </div>
            </div>

            <div className="mp-field">
              <span className="mp-label">实名认证功能</span>
              <CheckSwitch label="启用" enabled={realName} onToggle={() => setRealName((v) => !v)} />
            </div>

            <div className="mp-field">
              <button type="button" className="mp-submit" onClick={submit}>确定提交</button>
            </div>
          </div>
        </div>
      </div>

      {/* 小程序授权 */}
      <div className="admin-card mp-card">
        <div className="admin-card-header">小程序授权</div>
        <div className="admin-card-body mp-card-body">
          <div className="mp-form">
            <div className="mp-field">
              <button type="button" className="mp-authorize-btn" onClick={() => showConfigToast("授权需联系第三方微信服务商完成，当前后端未接入授权服务", "error")}>立即授权</button>
            </div>
            <div className="mp-field">
              <div className="mp-tipbox">
                <span className="mp-tip-icon">i</span>
                请使用您上述小程序管理员的微信进行登录，登录后将您的小程序授权给第三方微信服务商为您提供开发、上架、更新维护等服务
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={qrInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          pickAndUploadImage(file, setQrUrl, (msg) => showConfigToast(msg, "error"));
        }}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          pickAndUploadImage(file, setCoverUrl, (msg) => showConfigToast(msg, "error"));
        }}
      />
    </div>
  );
}
