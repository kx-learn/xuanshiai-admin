"use client";
import { useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import Link from "next/link";
import { ChevronRight, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["基本信息", "注册访问", "文件存储", "支付配置", "图片水印", "海报配置", "自定义区域"];

/* ------------------------- 通用小组件 ------------------------- */

function Switch({ on, onChange, text = "开启" }: { on: boolean; onChange?: (v: boolean) => void; text?: string }) {
  return (
    <span
      className={cn("mp-switch", on && "on")}
      onClick={() => onChange?.(!on)}
      role="switch"
      aria-checked={on}
    >
      {on && <span className="mp-switch-label">{text}</span>}
      <span className="mp-switch-knob" />
    </span>
  );
}

function Radio({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="pcfg-radio-wrap">
      {options.map((opt) => (
        <label key={opt} className="pcfg-radio" onClick={() => onChange(opt)}>
          <input type="radio" checked={value === opt} readOnly />
          <span className="pcfg-radio-dot" />
          <span className="pcfg-radio-label">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function Info({ children }: { children: React.ReactNode }) {
  return (
    <div className="sy-info">
      <span className="sy-info-i">i</span>
      <span>{children}</span>
    </div>
  );
}

function Row({ label, required, children, tips }: { label: string; required?: boolean; children: React.ReactNode; tips?: React.ReactNode }) {
  return (
    <div className="sy-row">
      <span className="sy-label">
        {required && <span className="sy-req">*</span>}
        {label}
      </span>
      <div className="sy-ctrl">
        <div>{children}</div>
        {tips && <div className="mt-2">{tips}</div>}
      </div>
    </div>
  );
}

function UploadBox({ size = "lg", label = "上传图片" }: { size?: "lg" | "sm"; label?: string }) {
  return (
    <div className={cn("sy-upload", size === "sm" && "sy-upload-sm")}>
      <Upload className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}

function Editor({ height = 120, children }: { height?: number; children: React.ReactNode }) {
  const tools = ["H", "B", "T₁", "T₂", "I", "U", "S", "文", "引", "链接", "图片", "表格", "代码", "表情", "对齐", "撤销", "重做", "全屏"];
  return (
    <div className="sy-editor">
      <div className="sy-editor-tools">
        {tools.map((t) => (
          <span key={t} className="sy-editor-tool">{t}</span>
        ))}
      </div>
      <div className={cn("sy-editor-content", height > 200 && "sy-editor-scroll")} style={{ minHeight: height }}>
        {children}
      </div>
    </div>
  );
}

function SaveBtn() {
  return <button className="sy-save-btn">确定提交</button>;
}

/* ------------------------- Tabs 内容 ------------------------- */

function BasicTab() {
  return (
    <div className="sy-form">
      <Row label="经营主体" required tips={<Info>与您执照完全一致的工商注册名称</Info>}>
        <input className="sy-input w-[460px]" placeholder="" />
      </Row>
      <Row label="域名绑定" required tips={<Info>域名需在腾讯接入备案，修改和解析域名请联系系统服务商</Info>}>
        <div className="sy-domain">
          <span className="sy-domain-prefix">https://</span>
          <input className="sy-input" defaultValue="www.xuanshiai.com" />
          <button className="sy-domain-btn">SSL 证书</button>
        </div>
      </Row>
      <Row label="域名备案">
        <input className="sy-input w-[460px]" defaultValue="苏ICP备2026018853号-3" />
      </Row>
      <Row label="公安备案">
        <input className="sy-input w-[460px]" />
      </Row>
      <Row label="运营区域" tips={<Info>修改运营区域请联系系统服务商</Info>}>
        <input className="sy-input w-[460px]" defaultValue="江苏省-南京市" />
      </Row>
      <Row label="客服电话" required>
        <input className="sy-input w-[460px]" defaultValue="18926072282" />
      </Row>
      <Row label="客服微信">
        <input className="sy-input w-[460px]" defaultValue="18926072282" />
      </Row>
      <Row label="客服微信二维码">
        <div className="sy-qrcode">
          <div className="sy-qr" />
          <button className="sy-upload-sm"><Upload className="h-4 w-4" /><span>上传图片</span></button>
        </div>
      </Row>
      <Row label="电脑尾部" required tips={<Info>应用于PC端网页尾部的版权信息，留空则不启用</Info>}>
        <Editor height={140}>版权所有：南京信达宣智爱文化科技有限公司©2026 xuanshiai.com</Editor>
      </Row>
      <Row label="后台LOGO" tips={<Info>最佳尺寸：108像素×58像素</Info>}>
        <div className="sy-logo"><UploadBox label="上传图片" /></div>
      </Row>
      <Row label="红娘工作台LOGO" tips={<Info>最佳尺寸：300像素×60像素</Info>}>
        <div className="sy-logo"><UploadBox label="上传图片" /></div>
      </Row>
      <Row label="用户协议">
        <Editor height={220}>
          <p>在注册前，敬请您阅读以下内容，在进行注册程序过程中点击“同意”按钮即表示用户完全接受本协议项下的全部条款。</p>
          <p><strong>第一条 会员资格</strong><br />在您承诺完全同意本服务条款并在本系统完成注册程序后，即可成为本站会员，享受本站为您提供的服务。如用户拒绝支付该项费用，则只能使用与查看非付费的内容。</p>
          <p><strong>第二条 会员权限</strong><br />1 会员想观看/下载付费资源，须支付费用才能查看相关条目，可参看内容条目收费标准及服务内容表；<br />2 任何会员均有义务遵守本规定及其他网络服务的协议、规定、程序及惯例。</p>
          <p><strong>第三条 会员资料</strong><br />1 为了使您能够更好地为会员提供服务，请您提供详尽准确的个人资料，如更改请及时更新，提供虚假资料所造成的后果由会员承担；</p>
        </Editor>
      </Row>
      <Row label="隐私政策">
        <Editor height={260}>
          <p>本平台（以下简称“我们”）深知个人信息对您的重要性。我们尊重并保护所有使用我们平台服务的用户的个人信息，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。同时，我们承诺，我们将按业界成熟的安全标准，采取相应的安全保护措施来保护您的个人信息。请在使用我们的产品或服务前，仔细阅读并了解本《隐私政策》（下称“本隐私政策”）。</p>
          <p><strong>一、我们处理个人信息的法律依据</strong><br />本隐私政策制定的法律依据为《中华人民共和国消费者权益保护法》、《中华人民共和国网络安全法》、《中华人民共和国电子商务法》、《信息安全技术个人信息安全规范》以及其他涉及公民个人信息的相关法律法规。通常，我们会基于本隐私政策提示的功能收集您的个人信息。某些情况下，如果涉及其他信息的收集我们会单独向您出示个人信息保护说明条款。</p>
          <p><strong>二、本隐私政策的适用范围</strong><br />本隐私政策适用于您使用本平台的产品或服务时使用。</p>
        </Editor>
      </Row>
      <SaveBtn />
    </div>
  );
}

function RegisterTab() {
  const [browse, setBrowse] = useState(true);
  const [secure, setSecure] = useState(false);
  const [reg, setReg] = useState(true);
  const [iptype, setIptype] = useState("黑名单");
  const [sms, setSms] = useState(false);
  return (
    <div className="sy-form">
      <Row label="是否开启浏览" tips={<Info>关闭后管理后台、服务红娘中心不受影响；管理员在登录状态下可照常访问平台用户端；非管理员用户无法浏览平台前端</Info>}>
        <Switch on={browse} onChange={setBrowse} />
      </Row>
      <Row label="登录安全增强" tips={<Info>开启后无法使用“账号密码”的模式登录到系统后台和红娘平台PC端，只能通过手机验证或微信扫码登录</Info>}>
        <Switch on={secure} onChange={setSecure} />
      </Row>
      <Row label="是否开启注册" tips={<Info>关闭后，用户无法在前台完成账号注册</Info>}>
        <Switch on={reg} onChange={setReg} />
      </Row>
      <Row label="IP限制类型" tips={<Info>黑名单阻止设置的ip访问网站；白名单则只允许设置的ip访问网站</Info>}>
        <Radio options={["黑名单", "白名单"]} value={iptype} onChange={setIptype} />
      </Row>
      <Row label="IP设置">
        <textarea className="sy-textarea w-[560px]" rows={4} defaultValue={"您可以添加多个限制IP，每个IP用逗号分隔。限制IP的书写方式如202.152.12.1就限制了202.152.12.1这个IP的访问，如202.152.12.*就限制了以202.152.12.开头的IP访问，同理*.*.*就限制了所有的IP的访问。"} />
      </Row>
      <Row label="注册短信验证码" tips={<Info>须知：关闭验证码后，用户在平台H5网页中注册时不需要输入手机的短信验证码就可完成账号注册。建议仅在特殊必要情况下临时关闭验证码</Info>}>
        <Switch on={sms} onChange={setSms} />
      </Row>
      <SaveBtn />
    </div>
  );
}

function StorageTab() {
  return (
    <div className="sy-form">
      <div className="sy-info mb-5">
        <span className="sy-info-i">i</span>
        <span><strong>须知</strong><br />本系统的附件数据为私有化部署方案，即您和用户所上传的图片、视频、文档、PPT、PDF、ZIP等附件数据均存储在您自有的七牛云存储空间。推荐您开通购买七牛包年1T流量套餐包。七牛云官网：<a className="sy-link" href="#">https://www.qiniu.com/</a></span>
      </div>
      <Row label="七牛accessKey">
        <input className="sy-input w-[460px]" defaultValue="ha3XTpZ-ZJcDlLlpqaKlbZQ1Z0nRJoPUSBoyhev8" />
      </Row>
      <Row label="七牛secretKey">
        <input className="sy-input w-[460px]" defaultValue="3lUlTSRzSknUn5GjoQ4osXg9u7yYskjOLEN4ll" />
      </Row>
      <Row label="空间名称">
        <input className="sy-input w-[460px]" defaultValue="xuanshiai" />
      </Row>
      <Row label="上传地址" tips={<Info>不要带https://请求头，如：upload.qiniup.com</Info>}>
        <input className="sy-input w-[460px]" defaultValue="up.qiniup.com" />
      </Row>
      <Row label="远程地址">
        <input className="sy-input w-[460px]" defaultValue="https://" />
      </Row>
      <Row label="私有队列">
        <input className="sy-input w-[460px]" defaultValue="xuanshiai" />
      </Row>
      <SaveBtn />
    </div>
  );
}

function PayTab() {
  const [sub, setSub] = useState("微信支付配置");
  const [on, setOn] = useState(true);
  const [cert, setCert] = useState("公钥模式");
  const [sort, setSort] = useState(1);
  return (
    <div className="sy-form">
      <div className="sy-subtabs">
        {["微信支付配置", "支付宝配置"].map((t) => (
          <span key={t} className={cn("sy-subtab", sub === t && "active")} onClick={() => setSub(t)}>{t}</span>
        ))}
      </div>
      {sub === "微信支付配置" ? (
        <>
          <Row label="是否启用">
            <Switch on={on} onChange={setOn} />
          </Row>
          <Row label="微信支付appid">
            <input className="sy-input w-[460px]" defaultValue="wx8b814cd5d8a3b2d" />
          </Row>
          <Row label="微信支付商户号">
            <input className="sy-input w-[460px]" defaultValue="1111571577" />
          </Row>
          <Row label="证书类型">
            <Radio options={["平台模式", "公钥模式"]} value={cert} onChange={setCert} />
          </Row>
          <Row label="微信支付公钥证书ID">
            <input className="sy-input w-[460px]" defaultValue="PUB_KEY_ID_0111115715772026042100111692002607" />
          </Row>
          <Row label="微信支付公钥">
            <textarea className="sy-textarea w-[560px]" rows={6} defaultValue={`-----BEGIN PUBLIC KEY-----
MIlBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAul
MwoCzDe+om2lZWxQbrx
UDflarOL7q93f2Gw+fx+NenJ71oiNTf9LaLi8bfFov3OzCe78jeO
SDWwx7reqRJR6n4`} />
          </Row>
          <Row label="微信支付APIv2密钥">
            <input className="sy-input w-[460px]" defaultValue="kCuixl6UsPyIerC7Mm5aksvSfgnRe3Xs" />
          </Row>
          <Row label="微信支付APIv3密钥">
            <input className="sy-input w-[460px]" defaultValue="kCuixl6UsPyIerC7Mm5aksvSfgnRe3Xs" />
          </Row>
          <Row label="apiclient_cert.p12证书">
            <div className="sy-upload-sm sy-upload-file"><Upload className="h-4 w-4" /><span>上传p12文件</span></div>
            <div className="sy-p12">data:application/octet-stream;base64,...</div>
          </Row>
          <Row label="显示排序">
            <input className="sy-input w-[120px]" type="number" value={sort} onChange={(e) => setSort(Number(e.target.value))} />
          </Row>
          <SaveBtn />
        </>
      ) : (
        <div className="sy-empty"><div className="sy-empty-icon"><ImageIcon className="h-10 w-10" /></div><div>暂无支付宝配置，请切换</div></div>
      )}
    </div>
  );
}

function WatermarkTab() {
  const [on, setOn] = useState(true);
  const [type, setType] = useState("指定位置");
  const [scale, setScale] = useState(40);
  const [fontSize, setFontSize] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [opacity, setOpacity] = useState(0);
  return (
    <div className="sy-wm">
      <div className="sy-wm-form">
        <Row label="水印开关">
          <Switch on={on} onChange={setOn} />
        </Row>
        <Row label="水印类型">
          <Radio options={["指定位置", "平铺显示"]} value={type} onChange={setType} />
        </Row>
        <Row label="水印文字">
          <input className="sy-input w-[460px]" defaultValue="宣智爱" />
        </Row>
        <Row label="水印字体">
          <div className="sy-select w-[460px]">微软雅黑<ChevronRight className="rotate-90 h-3 w-3" /></div>
        </Row>
        <Row label="缩放比例" tips={<Info>水印图片根据源图的尺寸按比例自适应缩放</Info>}>
          <input type="range" className="sy-range w-[460px]" min={0} max={100} value={scale} onChange={(e) => setScale(Number(e.target.value))} />
        </Row>
        <Row label="字体大小">
          <input type="range" className="sy-range w-[460px]" min={0} max={100} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
        </Row>
        <Row label="文字颜色">
          <div className="sy-color" />
        </Row>
        <Row label="旋转角度">
          <input type="range" className="sy-range w-[460px]" min={0} max={360} value={rotate} onChange={(e) => setRotate(Number(e.target.value))} />
        </Row>
        <Row label="透明度">
          <input type="range" className="sy-range w-[460px]" min={0} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
        </Row>
        <Row label="填充尺寸">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#666]">宽度</span>
            <input className="sy-input w-[80px]" type="number" defaultValue={400} />
            <span className="text-[13px] text-[#666]">px</span>
            <span className="text-[13px] text-[#666] ml-3">高度</span>
            <input className="sy-input w-[80px]" type="number" defaultValue={400} />
            <span className="text-[13px] text-[#666]">px</span>
          </div>
          <Info>用于控制文字平铺的间距</Info>
        </Row>
        <SaveBtn />
      </div>
      <div className="sy-wm-preview">
        <div className="sy-preview-title">效果预览</div>
        <div className="sy-wm-photo">
          <span className="sy-wm-text">宣智爱</span>
          <span className="sy-wm-text sy-wm-text-2">宣智爱</span>
        </div>
      </div>
    </div>
  );
}

function PosterTab() {
  const rows: { name: string; forever: boolean; on: boolean }[] = [
    { name: "平台首页分享海报", forever: true, on: true },
    { name: "会员分享海报", forever: true, on: false },
    { name: "视频分享海报", forever: false, on: true },
    { name: "活动分享海报", forever: true, on: true },
    { name: "服务红娘海报", forever: true, on: false },
    { name: "推广红娘海报", forever: true, on: false },
    { name: "合伙红娘海报", forever: true, on: true },
    { name: "社群活子海报", forever: false, on: true },
    { name: "单页海报", forever: true, on: true },
    { name: "活动签到海报", forever: true, on: false },
  ];
  const [state, setState] = useState(rows);
  return (
    <div className="sy-form">
      <div className="sy-info mb-5"><span className="sy-info-i">i</span><span><strong>须知</strong><br />扫码强制引导关注公众号功能仅支持H5下使用，小程序中开启无效</span></div>
      <table className="sy-table">
        <thead>
          <tr>
            <th className="sy-th text-left pl-8">海报名称</th>
            <th className="sy-th text-left">是否永久二维码</th>
            <th className="sy-th text-left">扫码强制引导关注公众号</th>
          </tr>
        </thead>
        <tbody>
          {state.map((row, idx) => (
            <tr key={row.name}>
              <td className="sy-td pl-8">{row.name}</td>
              <td className="sy-td"><span className={cn("sy-tag", row.forever ? "sy-tag-perm" : "sy-tag-temp")}>{row.forever ? "永久" : "临时"}</span></td>
              <td className="sy-td"><Switch on={row.on} onChange={(v) => setState((s) => s.map((r, i) => (i === idx ? { ...r, on: v } : r)))} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RegionTab() {
  return (
    <div className="sy-region">
      <div className="sy-region-head">
        <span className="sy-region-title">区域数据管理</span>
        <div className="flex items-center gap-4">
          <a className="sy-link" href="#">云端数据迁移下载</a>
          <button className="sy-add-btn">+ 添加省份</button>
        </div>
      </div>
      <div className="sy-region-empty">
        <div className="sy-empty-icon"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" className="text-[#d6dbe7]"><path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 9h8M8 13h8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg></div>
        <div className="sy-empty-text">暂无区域数据，请点击右上角添加省份</div>
      </div>
    </div>
  );
}

/* ------------------------- 页面 ------------------------- */

export default function Page() {
  const [tab, setTab] = useState("基本信息");
  const crumbs = getBreadcrumb("系统管理", "系统配置");

  return (
    <div>
      <div className="mb-4 flex items-center gap-1.5 text-[13px] text-[#8c96a8]">
        {crumbs.map((item, index) => (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {item.href ? <Link href={item.href} className="hover:text-[#3658f7]">{item.label}</Link> : <span className="text-[#333]">{item.label}</span>}
          </span>
        ))}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[#333]">{tab}</span>
      </div>

      <div className="sy-wrap">
        <div className="sy-tabs">
          {TABS.map((t) => (
            <span key={t} className={cn("sy-tab", tab === t && "active")} onClick={() => setTab(t)}>{t}</span>
          ))}
        </div>
        <div className="sy-body">
          {tab === "基本信息" && <BasicTab />}
          {tab === "注册访问" && <RegisterTab />}
          {tab === "文件存储" && <StorageTab />}
          {tab === "支付配置" && <PayTab />}
          {tab === "图片水印" && <WatermarkTab />}
          {tab === "海报配置" && <PosterTab />}
          {tab === "自定义区域" && <RegionTab />}
        </div>
      </div>
    </div>
  );
}
