"use client";
import { useEffect, useRef, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import Link from "next/link";
import { ChevronRight, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useConfigDomain,
  showConfigToast,
  pickAndUploadImage,
  asStr,
  asBool,
  asNumber,
  asStrOrNull,
  type Dict,
} from "@/lib/platform-config";

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

/* 上传按钮：点击选文件 -> 统一上传 -> 回调 URL */
function UploadBtn({ size = "lg", label = "上传图片", value, onDone }: { size?: "lg" | "sm"; label?: string; value?: string | null; onDone?: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <div
        className={cn("sy-upload", size === "sm" && "sy-upload-sm", value && "sy-upload-has")}
        onClick={() => inputRef.current?.click()}
        title={value || undefined}
      >
        {value ? <img className="pcfg-upload-img" src={value} alt="" /> : <><Upload className="h-4 w-4" /><span>{label}</span></>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          pickAndUploadImage(
            e.target.files?.[0],
            (url) => {
              onDone?.(url);
              showConfigToast("图片上传成功");
            },
            (msg) => showConfigToast(msg, "error"),
          )
        }
      />
    </>
  );
}

/* 富文本编辑框：seed 回填 + 可编辑取值 */
function Editor({ height = 120, seed, onChange, children }: { height?: number; seed?: string; onChange?: (html: string) => void; children?: React.ReactNode }) {
  const tools = ["H", "B", "T₁", "T₂", "I", "U", "S", "文", "引", "链接", "图片", "表格", "代码", "表情", "对齐", "撤销", "重做", "全屏"];
  const ref = useRef<HTMLDivElement | null>(null);
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !ref.current) return;
    seeded.current = true;
    if (seed) ref.current.innerHTML = seed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  return (
    <div className="sy-editor">
      <div className="sy-editor-tools">
        {tools.map((t) => (
          <span key={t} className="sy-editor-tool">{t}</span>
        ))}
      </div>
      <div
        ref={ref}
        className={cn("sy-editor-content", height > 200 && "sy-editor-scroll")}
        style={{ minHeight: height }}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange?.(ref.current?.innerHTML ?? "")}
      >
        {children}
      </div>
    </div>
  );
}

function SaveBtn({ onSave }: { onSave?: () => void }) {
  return <button className="sy-save-btn" onClick={onSave}>确定提交</button>;
}

/* ------------------------- Tabs 内容 ------------------------- */

function BasicTab() {
  const domain = useConfigDomain<Dict>("sys_site", {});
  const [business, setBusiness] = useState("");
  const [domainName, setDomainName] = useState("www.xuanshiai.com");
  const [domainIcp, setDomainIcp] = useState("苏ICP备2026018853号-3");
  const [policeIcp, setPoliceIcp] = useState("");
  const [region, setRegion] = useState("江苏省-南京市");
  const [phone, setPhone] = useState("18926072282");
  const [wechat, setWechat] = useState("18926072282");
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [footer, setFooter] = useState("版权所有：南京信达宣智爱文化科技有限公司©2026 xuanshiai.com");
  const [adminLogo, setAdminLogo] = useState<string | null>(null);
  const [mchLogo, setMchLogo] = useState<string | null>(null);
  const [agreement, setAgreement] = useState("");
  const [privacy, setPrivacy] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    void domain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!domain.ready || !domain.snapshot) return;
    const c = domain.snapshot.config as Dict;
    setBusiness(asStr(c.business_entity, ""));
    setDomainName(asStr(c.domain, "www.xuanshiai.com"));
    setDomainIcp(asStr(c.domain_icp, "苏ICP备2026018853号-3"));
    setPoliceIcp(asStr(c.police_icp, ""));
    setRegion(asStr(c.region, "江苏省-南京市"));
    setPhone(asStr(c.service_phone, ""));
    setWechat(asStr(c.service_wechat, ""));
    setQrcode(asStrOrNull(c.service_qrcode_url));
    setFooter(asStr(c.pc_footer_html, "版权所有：南京信达宣智爱文化科技有限公司©2026 xuanshiai.com"));
    setAdminLogo(asStrOrNull(c.admin_logo_url));
    setMchLogo(asStrOrNull(c.matchmaker_logo_url));
    setAgreement(asStr(c.user_agreement_html, ""));
    setPrivacy(asStr(c.privacy_policy_html, ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.ready]);

  const flush = async (summary = "保存基本信息") => {
    const ok = await domain.save(
      {
        business_entity: business,
        domain: domainName,
        domain_icp: domainIcp,
        police_icp: policeIcp,
        region,
        service_phone: phone,
        service_wechat: wechat,
        service_qrcode_url: qrcode,
        pc_footer_html: footer,
        admin_logo_url: adminLogo,
        matchmaker_logo_url: mchLogo,
        user_agreement_html: agreement,
        privacy_policy_html: privacy,
      },
      summary,
    );
    if (!ok && domain.error) showConfigToast(domain.error, "error");
    return ok;
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    if (!domain.ready || !loaded.current) return;
    const timer = setTimeout(() => void flushRef.current("自动保存基本信息"), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business, domainName, domainIcp, policeIcp, region, phone, wechat, qrcode, footer, adminLogo, mchLogo, agreement, privacy]);

  return (
    <div className="sy-form">
      <Row label="经营主体" required tips={<Info>与您执照完全一致的工商注册名称</Info>}>
        <input className="sy-input w-[460px]" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="" />
      </Row>
      <Row label="域名绑定" required tips={<Info>域名需在腾讯接入备案，修改和解析域名请联系系统服务商</Info>}>
        <div className="sy-domain">
          <span className="sy-domain-prefix">https://</span>
          <input className="sy-input" value={domainName} onChange={(e) => setDomainName(e.target.value)} />
          <button className="sy-domain-btn">SSL 证书</button>
        </div>
      </Row>
      <Row label="域名备案">
        <input className="sy-input w-[460px]" value={domainIcp} onChange={(e) => setDomainIcp(e.target.value)} />
      </Row>
      <Row label="公安备案">
        <input className="sy-input w-[460px]" value={policeIcp} onChange={(e) => setPoliceIcp(e.target.value)} />
      </Row>
      <Row label="运营区域" tips={<Info>修改运营区域请联系系统服务商</Info>}>
        <input className="sy-input w-[460px]" value={region} onChange={(e) => setRegion(e.target.value)} />
      </Row>
      <Row label="客服电话" required>
        <input className="sy-input w-[460px]" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Row>
      <Row label="客服微信">
        <input className="sy-input w-[460px]" value={wechat} onChange={(e) => setWechat(e.target.value)} />
      </Row>
      <Row label="客服微信二维码">
        <div className="sy-qrcode">
          {qrcode ? <img className="pcfg-upload-img sy-qr-img" src={qrcode} alt="" /> : <div className="sy-qr" />}
          <UploadBtn size="sm" label="上传图片" value={qrcode} onDone={setQrcode} />
        </div>
      </Row>
      <Row label="电脑尾部" required tips={<Info>应用于PC端网页尾部的版权信息，留空则不启用</Info>}>
        <Editor height={140} seed={footer} onChange={setFooter} />
      </Row>
      <Row label="后台LOGO" tips={<Info>最佳尺寸：108像素×58像素</Info>}>
        <div className="sy-logo"><UploadBtn label="上传图片" value={adminLogo} onDone={setAdminLogo} /></div>
      </Row>
      <Row label="红娘工作台LOGO" tips={<Info>最佳尺寸：300像素×60像素</Info>}>
        <div className="sy-logo"><UploadBtn label="上传图片" value={mchLogo} onDone={setMchLogo} /></div>
      </Row>
      <Row label="用户协议">
        <Editor height={220} seed={agreement} onChange={setAgreement} />
      </Row>
      <Row label="隐私政策">
        <Editor height={260} seed={privacy} onChange={setPrivacy} />
      </Row>
      <SaveBtn onSave={async () => { const ok = await flushRef.current("保存基本信息"); if (ok) showConfigToast("已保存"); }} />
    </div>
  );
}

function RegisterTab() {
  const domain = useConfigDomain<Dict>("sys_access", {});
  const [browse, setBrowse] = useState(true);
  const [secure, setSecure] = useState(false);
  const [reg, setReg] = useState(true);
  const [iptype, setIptype] = useState("黑名单");
  const [iptext, setIptext] = useState("");
  const [sms, setSms] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    void domain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!domain.ready || !domain.snapshot) return;
    const c = domain.snapshot.config as Dict;
    setBrowse(asBool(c.browse_enabled, true));
    setSecure(asBool(c.secure_login, false));
    setReg(asBool(c.register_enabled, true));
    setIptype(asStr(c.ip_type, "黑名单"));
    setIptext(asStr(c.ip_text, ""));
    setSms(asBool(c.sms_captcha_enabled, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.ready]);

  const flush = async (summary = "保存注册访问配置") => {
    const ok = await domain.save(
      { browse_enabled: browse, secure_login: secure, register_enabled: reg, ip_type: iptype, ip_text: iptext, sms_captcha_enabled: sms },
      summary,
    );
    if (!ok && domain.error) showConfigToast(domain.error, "error");
    return ok;
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    if (!domain.ready || !loaded.current) return;
    const timer = setTimeout(() => void flushRef.current("自动保存注册访问配置"), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browse, secure, reg, iptype, iptext, sms]);

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
        <textarea
          className="sy-textarea w-[560px]"
          rows={4}
          value={iptext}
          onChange={(e) => setIptext(e.target.value)}
          placeholder={"您可以添加多个限制IP，每个IP用逗号分隔。限制IP的书写方式如202.152.12.1就限制了202.152.12.1这个IP的访问，如202.152.12.*就限制了以202.152.12.开头的IP访问，同理*.*.*就限制了所有的IP的访问。"}
        />
      </Row>
      <Row label="注册短信验证码" tips={<Info>须知：关闭验证码后，用户在平台H5网页中注册时不需要输入手机的短信验证码就可完成账号注册。建议仅在特殊必要情况下临时关闭验证码</Info>}>
        <Switch on={sms} onChange={setSms} />
      </Row>
      <SaveBtn onSave={async () => { const ok = await flushRef.current("保存注册访问配置"); if (ok) showConfigToast("已保存"); }} />
    </div>
  );
}

function StorageTab() {
  const domain = useConfigDomain<Dict>("sys_storage", {});
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [bucket, setBucket] = useState("");
  const [uploadHost, setUploadHost] = useState("");
  const [remoteHost, setRemoteHost] = useState("");
  const [queue, setQueue] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    void domain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!domain.ready || !domain.snapshot) return;
    const c = domain.snapshot.config as Dict;
    setAccessKey(asStr(c.qiniu_access_key, ""));
    setSecretKey(asStr(c.qiniu_secret_key, ""));
    setBucket(asStr(c.bucket, ""));
    setUploadHost(asStr(c.upload_host, ""));
    setRemoteHost(asStr(c.remote_host, ""));
    setQueue(asStr(c.private_queue, ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.ready]);

  const flush = async (summary = "保存文件存储配置") => {
    const ok = await domain.save(
      { qiniu_access_key: accessKey, qiniu_secret_key: secretKey, bucket, upload_host: uploadHost, remote_host: remoteHost, private_queue: queue },
      summary,
    );
    if (!ok && domain.error) showConfigToast(domain.error, "error");
    return ok;
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    if (!domain.ready || !loaded.current) return;
    const timer = setTimeout(() => void flushRef.current("自动保存文件存储配置"), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessKey, secretKey, bucket, uploadHost, remoteHost, queue]);

  return (
    <div className="sy-form">
      <div className="sy-info mb-5">
        <span className="sy-info-i">i</span>
        <span><strong>须知</strong><br />本系统的附件数据为私有化部署方案，即您和用户所上传的图片、视频、文档、PPT、PDF、ZIP等附件数据均存储在您自有的七牛云存储空间。推荐您开通购买七牛包年1T流量套餐包。七牛云官网：<a className="sy-link" href="#">https://www.qiniu.com/</a></span>
      </div>
      <Row label="七牛accessKey">
        <input className="sy-input w-[460px]" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} placeholder="" />
      </Row>
      <Row label="七牛secretKey">
        <input className="sy-input w-[460px]" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="" />
      </Row>
      <Row label="空间名称">
        <input className="sy-input w-[460px]" value={bucket} onChange={(e) => setBucket(e.target.value)} placeholder="" />
      </Row>
      <Row label="上传地址" tips={<Info>不要带https://请求头，如：upload.qiniup.com</Info>}>
        <input className="sy-input w-[460px]" value={uploadHost} onChange={(e) => setUploadHost(e.target.value)} placeholder="up.qiniup.com" />
      </Row>
      <Row label="远程地址">
        <input className="sy-input w-[460px]" value={remoteHost} onChange={(e) => setRemoteHost(e.target.value)} placeholder="https://" />
      </Row>
      <Row label="私有队列">
        <input className="sy-input w-[460px]" value={queue} onChange={(e) => setQueue(e.target.value)} placeholder="" />
      </Row>
      <SaveBtn onSave={async () => { const ok = await flushRef.current("保存文件存储配置"); if (ok) showConfigToast("已保存"); }} />
    </div>
  );
}

function PayTab() {
  const domain = useConfigDomain<Dict>("sys_payment", {});
  const [sub, setSub] = useState("微信支付配置");
  const [on, setOn] = useState(true);
  const [appid, setAppid] = useState("");
  const [mch, setMch] = useState("");
  const [cert, setCert] = useState("公钥模式");
  const [pubKeyId, setPubKeyId] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [v2Key, setV2Key] = useState("");
  const [v3Key, setV3Key] = useState("");
  const [sort, setSort] = useState(1);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    void domain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!domain.ready || !domain.snapshot) return;
    const c = domain.snapshot.config as Dict;
    setOn(asBool(c.enabled, true));
    setAppid(asStr(c.wechat_appid, ""));
    setMch(asStr(c.wechat_mch_id, ""));
    setCert(asStr(c.cert_type, "公钥模式"));
    setPubKeyId(asStr(c.wechat_pubkey_id, ""));
    setPubKey(asStr(c.wechat_pubkey, ""));
    setV2Key(asStr(c.wechat_api_v2_key, ""));
    setV3Key(asStr(c.wechat_api_v3_key, ""));
    setSort(asNumber(c.sort, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.ready]);

  const flush = async (summary = "保存支付配置") => {
    const ok = await domain.save(
      {
        enabled: on,
        provider: "wechat",
        wechat_appid: appid,
        wechat_mch_id: mch,
        cert_type: cert,
        wechat_pubkey_id: pubKeyId,
        wechat_pubkey: pubKey,
        wechat_api_v2_key: v2Key,
        wechat_api_v3_key: v3Key,
        sort,
        alipay_enabled: false,
      },
      summary,
    );
    if (!ok && domain.error) showConfigToast(domain.error, "error");
    return ok;
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    if (!domain.ready || !loaded.current) return;
    const timer = setTimeout(() => void flushRef.current("自动保存支付配置"), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, appid, mch, cert, pubKeyId, pubKey, v2Key, v3Key, sort]);

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
            <input className="sy-input w-[460px]" value={appid} onChange={(e) => setAppid(e.target.value)} placeholder="" />
          </Row>
          <Row label="微信支付商户号">
            <input className="sy-input w-[460px]" value={mch} onChange={(e) => setMch(e.target.value)} placeholder="" />
          </Row>
          <Row label="证书类型">
            <Radio options={["平台模式", "公钥模式"]} value={cert} onChange={setCert} />
          </Row>
          <Row label="微信支付公钥证书ID">
            <input className="sy-input w-[460px]" value={pubKeyId} onChange={(e) => setPubKeyId(e.target.value)} placeholder="" />
          </Row>
          <Row label="微信支付公钥">
            <textarea className="sy-textarea w-[560px]" rows={6} value={pubKey} onChange={(e) => setPubKey(e.target.value)} placeholder="" />
          </Row>
          <Row label="微信支付APIv2密钥">
            <input className="sy-input w-[460px]" value={v2Key} onChange={(e) => setV2Key(e.target.value)} placeholder="" />
          </Row>
          <Row label="微信支付APIv3密钥">
            <input className="sy-input w-[460px]" value={v3Key} onChange={(e) => setV3Key(e.target.value)} placeholder="" />
          </Row>
          <Row label="apiclient_cert.p12证书">
            <div className="sy-upload-sm sy-upload-file"><Upload className="h-4 w-4" /><span>上传p12文件</span></div>
            <div className="sy-p12">data:application/octet-stream;base64,...</div>
          </Row>
          <Row label="显示排序">
            <input className="sy-input w-[120px]" type="number" value={sort} onChange={(e) => setSort(Number(e.target.value))} />
          </Row>
          <SaveBtn onSave={async () => { const ok = await flushRef.current("保存支付配置"); if (ok) showConfigToast("已保存"); }} />
        </>
      ) : (
        <div className="sy-empty"><div className="sy-empty-icon"><ImageIcon className="h-10 w-10" /></div><div>暂无支付宝配置，请切换</div></div>
      )}
    </div>
  );
}

function WatermarkTab() {
  const domain = useConfigDomain<Dict>("sys_watermark", {});
  const [on, setOn] = useState(true);
  const [type, setType] = useState("指定位置");
  const [text, setText] = useState("宣智爱");
  const [scale, setScale] = useState(40);
  const [fontSize, setFontSize] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(400);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    void domain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!domain.ready || !domain.snapshot) return;
    const c = domain.snapshot.config as Dict;
    setOn(asBool(c.enabled, true));
    setType(asStr(c.mode, "指定位置"));
    setText(asStr(c.text, "宣智爱"));
    setScale(asNumber(c.scale, 40));
    setFontSize(asNumber(c.font_size, 0));
    setRotate(asNumber(c.rotate, 0));
    setOpacity(asNumber(c.opacity, 0));
    setWidth(asNumber(c.fill_width, 400));
    setHeight(asNumber(c.fill_height, 400));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.ready]);

  const flush = async (summary = "保存图片水印配置") => {
    const ok = await domain.save(
      { enabled: on, mode: type, text, scale, font_size: fontSize, rotate, opacity, fill_width: width, fill_height: height },
      summary,
    );
    if (!ok && domain.error) showConfigToast(domain.error, "error");
    return ok;
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    if (!domain.ready || !loaded.current) return;
    const timer = setTimeout(() => void flushRef.current("自动保存图片水印配置"), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, type, text, scale, fontSize, rotate, opacity, width, height]);

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
          <input className="sy-input w-[460px]" value={text} onChange={(e) => setText(e.target.value)} />
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
            <input className="sy-input w-[80px]" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
            <span className="text-[13px] text-[#666]">px</span>
            <span className="text-[13px] text-[#666] ml-3">高度</span>
            <input className="sy-input w-[80px]" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            <span className="text-[13px] text-[#666]">px</span>
          </div>
          <Info>用于控制文字平铺的间距</Info>
        </Row>
        <SaveBtn onSave={async () => { const ok = await flushRef.current("保存图片水印配置"); if (ok) showConfigToast("已保存"); }} />
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
  const rows0: { name: string; forever: boolean; on: boolean }[] = [
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
  const domain = useConfigDomain<Dict>("sys_posters", { rows: [] });
  const [state, setState] = useState(rows0);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    void domain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!domain.ready || !domain.snapshot) return;
    const c = domain.snapshot.config as Dict;
    if (Array.isArray(c.rows) && (c.rows as Dict[]).length === rows0.length) {
      const server = c.rows as Dict[];
      setState(
        rows0.map((r, i) => ({
          name: typeof server[i]?.name === "string" ? (server[i]!.name as string) : r.name,
          forever: typeof server[i]?.forever === "boolean" ? (server[i]!.forever as boolean) : r.forever,
          on: typeof server[i]?.on === "boolean" ? (server[i]!.on as boolean) : r.on,
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.ready]);

  const flush = async (summary = "自动保存海报配置") => {
    const ok = await domain.save({ rows: state }, summary);
    if (!ok && domain.error) showConfigToast(domain.error, "error");
    return ok;
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    if (!domain.ready || !loaded.current) return;
    const timer = setTimeout(() => void flushRef.current(), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

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
  const domain = useConfigDomain<Dict>("sys_region", { provinces: [] });
  const [provinces, setProvinces] = useState<Dict[]>([]);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    void domain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!domain.ready || !domain.snapshot) return;
    const c = domain.snapshot.config as Dict;
    if (Array.isArray(c.provinces)) setProvinces(c.provinces as Dict[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.ready]);

  return (
    <div className="sy-region">
      <div className="sy-region-head">
        <span className="sy-region-title">区域数据管理</span>
        <div className="flex items-center gap-4">
          <a className="sy-link" href="#">云端数据迁移下载</a>
          <button
            className="sy-add-btn"
            onClick={() => {
              showConfigToast("请在数据库或后续版本中添加区域数据");
            }}
          >
            + 添加省份
          </button>
        </div>
      </div>
      {provinces.length === 0 ? (
        <div className="sy-region-empty">
          <div className="sy-empty-icon"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" className="text-[#d6dbe7]"><path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 9h8M8 13h8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg></div>
          <div className="sy-empty-text">暂无区域数据，请点击右上角添加省份</div>
        </div>
      ) : (
        <div className="sy-region-list">
          {provinces.map((p, i) => (
            <div key={i} className="sy-region-province">
              {typeof p.name === "string" ? p.name : `省份${i + 1}`}
            </div>
          ))}
        </div>
      )}
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
