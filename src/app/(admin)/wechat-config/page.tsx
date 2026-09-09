"use client";

import { useRef, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

/**
 * 公众号参数配置（纯前端演示，无后端接口）
 * 页面结构：面包屑 / 须知框 / 公众号配置卡片 / 安全验证卡片
 */

/** 加密模式 */
type CryptoMode = "plain" | "compat" | "safe";

/** 运行时生成一个简易二维码 SVG（带三个定位符），纯视觉占位 */
function QrCode({ size = 88 }: { size?: number }) {
  const n = 21;
  const cells: React.ReactNode[] = [];

  const finder = (r: number, c: number) => {
    const centers = [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ];
    return centers.some(([or, oc]) => {
      const lr = r - or;
      const lc = c - oc;
      if (lr < 0 || lr > 6 || lc < 0 || lc > 6) return false;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true; // 外框
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true; // 中心点
      return false;
    });
  };

  let idx = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const dark = finder(r, c) || ((r * 3 + c * 5 + ((r * c) % 7)) % 7) < 3;
      if (dark) {
        cells.push(<rect key={idx} x={c} y={r} width={1} height={1} />);
      }
      idx++;
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} fill="#000" shapeRendering="crispEdges">
      {cells}
    </svg>
  );
}

export default function WechatConfigPage() {
  const [wxNo, setWxNo] = useState("xuanshiai");
  const [appId, setAppId] = useState("wxb0814cd05da63b2d");
  const [appSecret, setAppSecret] = useState("9721122744dbd7ffd31a3f68d7445b8c");
  const [apiToken, setApiToken] = useState("B0HsVwELrf3Xq8ILPRhnTtzFy0wc");
  const [secretKey, setSecretKey] = useState("0KGLVpL2UEAw80Pf2oO28WDwMyBZ2BDsKDEW0Ysv2LQ");
  const [mode, setMode] = useState<CryptoMode>("safe");          // 加密模式
  const [qrFilled, setQrFilled] = useState(true);               // 二维码
  const [fileName, setFileName] = useState("");                 // 上传文件
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                  {qrFilled ? <QrCode /> : <span className="gzh-qr-empty">未上传</span>}
                </div>
                <div className="gzh-qr-actions">
                  <button type="button" className="gzh-icon-btn" onClick={() => setQrFilled(true)}>
                    <span className="gzh-icon">↑</span>上传二维码
                  </button>
                  <button type="button" className="gzh-icon-btn" onClick={() => setQrFilled(true)}>
                    <span className="gzh-icon">↻</span>生成二维码
                  </button>
                </div>
              </div>
            </div>

            <div className="gzh-field">
              <span className="gzh-label" />
              <button type="button" className="gzh-submit">确定提交</button>
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
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
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
              <button type="button" className="gzh-submit">确定提交</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
