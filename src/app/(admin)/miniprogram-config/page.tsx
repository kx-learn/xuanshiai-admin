"use client";

import { useRef, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

/**
 * 小程序参数配置（纯前端演示，无后端接口）
 * 页面结构：面包屑 / 须知框 / 小程序配置卡片 / 小程序授权卡片
 */

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
  state: "empty" | "filled";
  onUpload: () => void;
}

/** 上传图片块：预览区，底部叠一条深灰「上传图片」覆盖条（点击上传） */
function UploadBox({ placeholder, state, onUpload }: UploadBoxProps) {
  return (
    <div className="mp-upload">
      <div className={`mp-upload-preview ${state === "filled" ? "filled" : ""}`}>
        {state === "empty" ? (
          <span className="mp-upload-placeholder">{placeholder}</span>
        ) : (
          <span className="mp-upload-thumb">图片</span>
        )}
        <button type="button" className="mp-upload-overlay" onClick={onUpload}>
          上传图片
        </button>
      </div>
    </div>
  );
}

export default function MiniprogramConfigPage() {
  const [enabled, setEnabled] = useState(true);          // 是否开启
  const [appId, setAppId] = useState("wxebcf0a4036441fd1");
  const [appSecret, setAppSecret] = useState("eaf81ec555ce87e96aea923ac");
  const [barColor, setBarColor] = useState("#6a2fbf");   // 状态栏背景色
  const [qrState, setQrState] = useState<"empty" | "filled">("filled"); // 小程序码
  const [coverState, setCoverState] = useState<"empty" | "filled">("filled"); // 分享封面
  const [realName, setRealName] = useState(true);        // 实名认证功能
  const barInputRef = useRef<HTMLInputElement>(null);

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
              <UploadBox
                placeholder="二维码图片"
                state={qrState}
                onUpload={() => setQrState("filled")}
              />
            </div>

            <div className="mp-field mp-field-top">
              <span className="mp-label">分享封面</span>
              <div className="mp-upload-group">
                <UploadBox
                  placeholder="封面占位"
                  state={coverState}
                  onUpload={() => setCoverState("filled")}
                />
                <button
                  type="button"
                  className="mp-clear-btn"
                  onClick={() => {
                    setCoverState("empty");
                    setQrState("empty");
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
              <button type="button" className="mp-submit">确定提交</button>
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
              <button type="button" className="mp-authorize-btn">立即授权</button>
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
    </div>
  );
}
