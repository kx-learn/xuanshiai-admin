"use client";

import { useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { showConfigToast, useConfigDomain } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("运营工具", "功能设置");

type InteractFunctionConfig = {
  system_enabled: boolean;
  allow_unverified: boolean;
  allow_non_vip_send: boolean;
  non_vip_daily_limit: number;
  vip_daily_limit: number;
  allow_non_vip_reply: boolean;
  max_before_reply: number;
};

const DEFAULTS: InteractFunctionConfig = {
  system_enabled: true,
  allow_unverified: false,
  allow_non_vip_send: true,
  non_vip_daily_limit: 3,
  vip_daily_limit: 10,
  allow_non_vip_reply: true,
  max_before_reply: 2,
};

export default function InteractConfigPage() {
  const { snapshot, save } = useConfigDomain<InteractFunctionConfig>("tools_interactive_function", DEFAULTS);
  const [cfg, setCfg] = useState<InteractFunctionConfig>(DEFAULTS);

  useEffect(() => {
    if (snapshot) setCfg({ ...DEFAULTS, ...snapshot.config });
  }, [snapshot]);

  const set = <K extends keyof InteractFunctionConfig>(key: K, value: InteractFunctionConfig[K]) =>
    setCfg((cur) => ({ ...cur, [key]: value }));

  const submit = async () => {
    const ok = await save(cfg, "互动消息功能设置更新");
    showConfigToast(ok ? "保存成功" : "内容无变化", ok ? "ok" : "error");
  };

  const radio = <K extends keyof InteractFunctionConfig>(
    key: K,
    value: InteractFunctionConfig[K],
    label: string,
  ) => (
    <label className="xm-radio" key={`${String(key)}-${String(value)}`}>
      <input
        type="radio"
        checked={cfg[key] === value}
        onChange={() => set(key, value)}
      />
      {label}
    </label>
  );

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>
              会员消息功能（也叫「打招呼」）是指会员之间可以在线上平台互相发送消息,但消息内容仅限从平台设置好的模板中选择;通过平台设置的「消息话术」,可以大大提升会员之间的互动,提高牵线需求率、促进会员开通VIP会员!
            </p>
            <p>本功能具备七大特色:</p>
            <p>1、确保会员之间在聊天中无法绕过红娘自行交换联系方式</p>
            <p>2、控制了会员的言论,规避了平台的责任风险</p>
            <p>3、自动引导会员完善资料、实名认证、申请牵线、开通VIP会员</p>
            <p>4、默认只有已完善资料且实名认证的会员才可以使用消息功能,系统会在相关环节引导完善资料、实名认证,帮助平台提升资料的完善和认证</p>
            <p>5、拥有短信提醒功能:会员A首次在平台上给会员B发送消息的时候,系统会给会员B发送短信提醒;会员B在首次回复会员A的时候,系统会给会员A发送短信提醒</p>
            <p>6、所有信息主题和对应的回复内容均可以由平台任意设置</p>
            <p>7、拥有丰富灵活的权限控制功能</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="xm-title">功能设置</div>

        <div className="xm-row">
          <span className="xm-label">开启&ldquo;会员消息系统&rdquo;</span>
          <div className="xm-content">
            <div className="xm-radios">
              {radio("system_enabled", true, "开启")}
              {radio("system_enabled", false, "关闭")}
            </div>
            <div className="ifs-info">开启状态下会员在线上平台才可以使用本功能。</div>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">非实名认证会员是否允许使用消息功能</span>
          <div className="xm-content">
            <div className="xm-radios">
              {radio("allow_unverified", true, "允许")}
              {radio("allow_unverified", false, "不允许")}
            </div>
            <div className="ifs-info">若设为&ldquo;不允许&rdquo;,系统将提示引导进行实名认证</div>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">非VIP会员是否允许主动发送消息</span>
          <div className="xm-content">
            <div className="xm-radios">
              {radio("allow_non_vip_send", true, "允许")}
              {radio("allow_non_vip_send", false, "不允许")}
            </div>
            <div className="ifs-info">若设为&ldquo;不允许&rdquo;,系统将提示引导会员开通办理VIP</div>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">非VIP会员每天最多发多少条消息</span>
          <div className="xm-content">
            <div className="ifs-inputline">
              <input
                className="ifs-input"
                type="number"
                min={0}
                value={cfg.non_vip_daily_limit}
                onChange={(e) => set("non_vip_daily_limit", Math.max(0, Number(e.target.value) || 0))}
              />
              <span className="ifs-unit">条</span>
            </div>
            <div className="ifs-info">0 表示不限制,不含回复</div>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">VIP会员每天最多发多少条消息</span>
          <div className="xm-content">
            <div className="ifs-inputline">
              <input
                className="ifs-input"
                type="number"
                min={0}
                value={cfg.vip_daily_limit}
                onChange={(e) => set("vip_daily_limit", Math.max(0, Number(e.target.value) || 0))}
              />
              <span className="ifs-unit">条</span>
            </div>
            <div className="ifs-info">0 表示不限制,不含回复</div>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">非VIP会员是否允许回复消息</span>
          <div className="xm-content">
            <div className="xm-radios">
              {radio("allow_non_vip_reply", true, "允许")}
              {radio("allow_non_vip_reply", false, "不允许")}
            </div>
            <div className="ifs-info">若设为&ldquo;不允许&rdquo;,系统将提示引导会员开通办理VIP</div>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">对方未回复之前最多发送消息条数</span>
          <div className="xm-content">
            <div className="ifs-inputline">
              <input
                className="ifs-input"
                type="number"
                min={0}
                value={cfg.max_before_reply}
                onChange={(e) => set("max_before_reply", Math.max(0, Number(e.target.value) || 0))}
              />
              <span className="ifs-unit">条</span>
            </div>
            <div className="ifs-info">0 表示不限制</div>
          </div>
        </div>

        <div className="xm-actions">
          <button className="xm-submit" onClick={submit}>确定提交</button>
        </div>
      </div>
    </div>
  );
}
