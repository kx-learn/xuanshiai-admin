"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { asStr, pickAndUploadImage, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

/**
 * 公众号参数配置：全部字段接后端 wechat_mp 配置域（改动即保存 + 提交按钮手动落库）
 */

/** 加密模式 */
type CryptoMode = "plain" | "compat" | "safe";

const DEFAULTS = {
  wx_no: "", app_id: "", app_secret: "", api_token: "", encoding_aes_key: "",
  crypto_mode: "safe", qrcode_url: null, verify_file_name: "", verify_file_url: null,
  platform_templates: [],
} as const;

export default function WechatConfigPage() {
  const domain = useConfigDomain<Dict>("wechat_mp", DEFAULTS as Dict);
  const c = domain.snapshot?.config ?? (DEFAULTS as unknown as Dict);

  const [wxNo, setWxNo] = useState("");
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [mode, setMode] = useState<CryptoMode>("safe");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const qrInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apply = useCallback((config: Dict | null) => {
    if (!config) return;
    setWxNo(asStr(config.wx_no, ""));
    setAppId(asStr(config.app_id, ""));
    setAppSecret(asStr(config.app_secret, ""));
    setApiToken(asStr(config.api_token, ""));
    setSecretKey(asStr(config.encoding_aes_key, ""));
    const m = asStr(config.crypto_mode, "safe");
    setMode((["plain", "compat", "safe"].includes(m) ? m : "safe") as CryptoMode);
    setQrUrl(asStr(config.qrcode_url, "") || null);
    setFileName(asStr(config.verify_file_name, ""));
    setFileUrl(asStr(config.verify_file_url, "") || null);
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const payload = () => ({
    wx_no: wxNo, app_id: appId, app_secret: appSecret, api_token: apiToken,
    encoding_aes_key: secretKey, crypto_mode: mode, qrcode_url: qrUrl,
    verify_file_name: fileName, verify_file_url: fileUrl,
    platform_templates: Array.isArray(c.platform_templates) ? c.platform_templates : [],
  } as Partial<Dict>);

  const submit = async () => {
    const ok = await domain.save(payload(), "公众号参数配置更新");
    if (ok) showConfigToast("已保存");
    else if (domain.error) showConfigToast(domain.error, "error");
  };

  // 防抖自动保存（与其它配置页一致）
  useEffect(() => {
    if (!domain.ready) return;
    const t = setTimeout(() => { domain.save(payload(), "公众号参数配置更新"); }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wxNo, appId, appSecret, apiToken, secretKey, mode, qrUrl, fileName, fileUrl, domain.ready]);

  const modeOptions: { value: CryptoMode; label: string }[] = [
    { value: "plain", label: "明文模式" },
    { value: "compat", label: "兼容模式" },
    { value: "safe", label: "安全模式" },
  ];

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "公众号", href: "/wechat-config", children: [{ label: "参数配置", href: "/wechat-config" }] },
          { label: "公众号参数配置" },
        ]}
      />

      {/* 须知 */}
      <div className="gzh-notice">
        <div className="gzh-notice-title">
          <span className="gzh-notice-icon">i</span>须知
        </div>
        <p>以下内容的配置正确与否将影响到您平台中与公众号的相关功能的正常。</p>
      </div>

      {/* 公众号配置 */}
      <div className="admin-card gzh-card">
        <div className="admin-card-header">公众号配置</div>
        <div className="admin-card-body gzh-card-body">
          <div className="gzh-form">
            <div className="gzh-field">
              <span className="gzh-label gzh-required">公众号微信号</span>
              <input className="gzh-input" value={wxNo} onChange={(e) => setWxNo(e.target.value)} placeholder="请输入公众号微信号" />
            </div>

            <div className="gzh-field">
              <span className="gzh-label gzh-required">appId</span>
              <input className="gzh-input" value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="请输入 appId" />
            </div>

            <div className="gzh-field">
              <span className="gzh-label gzh-required">appSecret</span>
              <input className="gzh-input" value={appSecret} onChange={(e) => setAppSecret(e.target.value)} placeholder="请输入 appSecret" />
            </div>

            <div className="gzh-field">
              <span className="gzh-label gzh-required">apiToken</span>
              <input className="gzh-input" value={apiToken} onChange={(e) => setApiToken(e.target.value)} placeholder="请输入 apiToken" />
            </div>

            <div className="gzh-field">
              <span className="gzh-label gzh-required">消息加解密密钥</span>
              <input className="gzh-input" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="请输入消息加解密密钥" />
            </div>

            <div className="gzh-field">
              <span className="gzh-label">加密模式</span>
              <div className="gzh-radio-wrap">
                {modeOptions.map((opt) => (
                  <label key={opt.value} className="gzh-radio">
                    <input
                      type="radio"
                      name="cryptoMode"
                      value={opt.value}
                      checked={mode === opt.value}
                      onChange={() => setMode(opt.value)}
                    />
                    <span className="gzh-radio-dot" />
                    <span className="gzh-radio-label">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="gzh-field gzh-field-top">
              <span className="gzh-label">二维码</span>
              <div className="gzh-qr-group">
                <div className="gzh-qr">
                  {qrUrl ? (
                    <img src={qrUrl} alt="公众号二维码" className="pcfg-upload-img" style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 4 }} />
                  ) : (
                    <span className="gzh-qr-empty">未上传</span>
                  )}
                </div>
                <div className="gzh-qr-actions">
                  <button type="button" className="gzh-icon-btn" onClick={() => qrInputRef.current?.click()}>
                    <span className="gzh-icon">↑</span>上传二维码
                  </button>
                  <button type="button" className="gzh-icon-btn" onClick={() => showConfigToast("生成二维码需接入公众号平台后可用", "error")}>
                    <span className="gzh-icon">↻</span>生成二维码
                  </button>
                </div>
              </div>
            </div>

            <div className="gzh-field">
              <span className="gzh-label" />
              <button type="button" className="gzh-submit" onClick={submit}>确定提交</button>
            </div>
          </div>
        </div>
      </div>

      {/* 安全验证 */}
      <div className="admin-card gzh-card">
        <div className="admin-card-header">安全验证</div>
        <div className="admin-card-body gzh-card-body">
          <div className="gzh-form">
            <div className="gzh-field">
              <span className="gzh-label">上传文件</span>
              <div className="gzh-file">
                <button type="button" className="gzh-file-btn" onClick={() => fileInputRef.current?.click()}>
                  选择文件
                </button>
                <span className="gzh-file-name">{fileName || "未选择文件"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.html"
                  className="gzh-file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    pickAndUploadImage(
                      file,
                      (url) => { setFileName(file.name); setFileUrl(url); },
                      (msg) => showConfigToast(msg, "error"),
                    );
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <div className="gzh-field gzh-field-top">
              <span className="gzh-label" />
              <div className="gzh-tipbox">
                <span className="gzh-tip-icon">i</span>
                请上传.txt或.html文件
              </div>
            </div>

            <div className="gzh-field">
              <span className="gzh-label" />
              <button type="button" className="gzh-submit" onClick={submit}>确定提交</button>
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
    </div>
  );
}
