"use client";
import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "互动消息", href: "/interact-config" },
  { label: "功能设置" },
];

const noticeTitle = "须知";
const noticeIntro =
  "会员消息功能（也叫「打招呼」）是指会员之间可以在线上平台互相发送消息,但消息内容仅限从平台设置好的模板中选择;通过平台设置的「消息话术」,可以大大提升会员之间的互动,提高牵线需求率、促进会员开通VIP会员!";
const noticeFeatures = [
  "确保会员之间在聊天中无法绕过红娘自行交换联系方式",
  "控制了会员的言论,规避了平台的责任风险",
  "自动引导会员完善资料、实名认证、申请牵线、开通VIP会员",
  "默认只有已完善资料且实名认证的会员才可以使用消息功能,系统会在相关环节引导完善资料、实名认证,帮助平台提升资料的完善和认证",
  "拥有短信提醒功能:会员A首次在平台上给会员B发送消息的时候,系统会给会员B发送短信提醒;会员B在首次回复会员A的时候,系统会给会员A发送短信提醒",
  "所有信息主题和对应的回复内容均可以由平台任意设置",
  "拥有丰富灵活的权限控制功能",
];

export default function InteractConfigPage() {
  const [systemOn, setSystemOn] = useState<"on" | "off">("on");
  const [realNameAllow, setRealNameAllow] = useState<"allow" | "deny">("deny");
  const [vipSend, setVipSend] = useState<"allow" | "deny">("allow");
  const [vipReply, setVipReply] = useState<"allow" | "deny">("allow");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">{noticeTitle}</div>
            <p>{noticeIntro}</p>
            <p>本功能具备七大特色:</p>
            {noticeFeatures.map((f, i) => (
              <p key={i}>{i + 1}、{f}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="xm-title">功能设置</div>

        {/* 开启会员消息系统 */}
        <div className="xm-row">
          <span className="xm-label">开启&ldquo;会员消息系统&rdquo;</span>
          <div className="xm-content">
            <div className="xm-radios">
              <label className="xm-radio">
                <input type="radio" checked={systemOn === "on"} onChange={() => setSystemOn("on")} />
                开启
              </label>
              <label className="xm-radio">
                <input type="radio" checked={systemOn === "off"} onChange={() => setSystemOn("off")} />
                关闭
              </label>
            </div>
            <div className="ifs-info">开启状态下会员在线上平台才可以使用本功能。</div>
          </div>
        </div>

        {/* 非实名认证会员消息功能 */}
        <div className="xm-row">
          <span className="xm-label">非实名认证会员是否允许使用消息功能</span>
          <div className="xm-content">
            <div className="xm-radios">
              <label className="xm-radio">
                <input type="radio" checked={realNameAllow === "allow"} onChange={() => setRealNameAllow("allow")} />
                允许
              </label>
              <label className="xm-radio">
                <input type="radio" checked={realNameAllow === "deny"} onChange={() => setRealNameAllow("deny")} />
                不允许
              </label>
            </div>
            <div className="ifs-info">若设为&ldquo;不允许&rdquo;,系统将提示引导进行实名认证</div>
          </div>
        </div>

        {/* 非VIP主动发消息 */}
        <div className="xm-row">
          <span className="xm-label">非VIP会员是否允许主动发送消息</span>
          <div className="xm-content">
            <div className="xm-radios">
              <label className="xm-radio">
                <input type="radio" checked={vipSend === "allow"} onChange={() => setVipSend("allow")} />
                允许
              </label>
              <label className="xm-radio">
                <input type="radio" checked={vipSend === "deny"} onChange={() => setVipSend("deny")} />
                不允许
              </label>
            </div>
            <div className="ifs-info">若设为&ldquo;不允许&rdquo;,系统将提示引导会员开通办理VIP</div>
          </div>
        </div>

        {/* 非VIP每日条数 */}
        <div className="xm-row">
          <span className="xm-label">非VIP会员每天最多发多少条消息</span>
          <div className="xm-content">
            <div className="ifs-inputline">
              <input className="ifs-input" defaultValue={3} />
              <span className="ifs-unit">条</span>
            </div>
            <div className="ifs-info">0 表示不限制,不含回复</div>
          </div>
        </div>

        {/* VIP每日条数 */}
        <div className="xm-row">
          <span className="xm-label">VIP会员每天最多发多少条消息</span>
          <div className="xm-content">
            <div className="ifs-inputline">
              <input className="ifs-input" defaultValue={10} />
              <span className="ifs-unit">条</span>
            </div>
            <div className="ifs-info">0 表示不限制,不含回复</div>
          </div>
        </div>

        {/* 非VIP回复消息 */}
        <div className="xm-row">
          <span className="xm-label">非VIP会员是否允许回复消息</span>
          <div className="xm-content">
            <div className="xm-radios">
              <label className="xm-radio">
                <input type="radio" checked={vipReply === "allow"} onChange={() => setVipReply("allow")} />
                允许
              </label>
              <label className="xm-radio">
                <input type="radio" checked={vipReply === "deny"} onChange={() => setVipReply("deny")} />
                不允许
              </label>
            </div>
            <div className="ifs-info">若设为&ldquo;不允许&rdquo;,系统将提示引导会员开通办理VIP</div>
          </div>
        </div>

        {/* 对方未回复前最多发送条数 */}
        <div className="xm-row">
          <span className="xm-label">对方未回复之前最多发送消息条数</span>
          <div className="xm-content">
            <div className="ifs-inputline">
              <input className="ifs-input" defaultValue={2} />
              <span className="ifs-unit">条</span>
            </div>
            <div className="ifs-info">0 表示不限制</div>
          </div>
        </div>

        <div className="xm-actions">
          <button className="xm-submit">确定提交</button>
        </div>
      </div>
    </div>
  );
}
