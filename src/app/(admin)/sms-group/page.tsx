"use client";

import { useState } from "react";
import { Inbox, X } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const SEND_TARGETS = [
  "所有注册用户",
  "最近1个月注册的会员",
  "所有会员",
  "所有男会员",
  "所有女会员",
  "所有VIP会员",
  "所有推广红娘",
  "指定活动报名名单",
  "互动活动报名嘉宾",
];

type TplDef = { id: string; text: string };

const TPLS: TplDef[] = [
  { id: "Q1474", text: "请尽快完成活动要求的名认证，学历认证及其他诚信认证，以免不能正常参加。" },
  { id: "Q1438", text: "温馨提示：最近各种诈骗活动，有发短信冒充部队、妇联介绍、联姻活动介绍、平台介绍的认识，全是诈骗犯，大家一定要谨慎！" },
  { id: "Q1397", text: "您所报名的线上互动活动已经开始啦，请赶快参加！" },
  { id: "Q1329", text: "您好，平台中有会员向您发起牵线，想进一步相互了解，请尽快登录平台中查看处理。" },
  { id: "Q1317", text: "您好，很遗憾。您报名参加的本场互动活动未能通过筛选。我们还会持续组织更多精彩的互动活动，您也可以报名我们后续的活动！遇您将是我们前进的动力，只为让您早日找到属于自己的爱情。我们也祝愿您，早日牵手成功！@幸福就在这里，愿我们终将成为自己想要的榜样" },
  { id: "Q1138", text: "恭喜您成为我们的会员，您已经踏出了幸福的第一步！请认真填写您的更多资料，上传更多资料，将大大提升您的吸引力，让幸福来的快一些！" },
  { id: "Q1137", text: "您好，给您电话您没有接到，不知道是不是在忙的。根据您的资料需求，联系关注了几个不错的需要。给您帮个介绍，请尽快联系我们服务老师。" },
  { id: "Q1136", text: "您好，据我们服务老师给您打电话，是想邀请您来线下门店做一下实名认证，完成实名认证的会员，可以免费开通服务。" },
  { id: "Q1135", text: "您好！欢迎您注册成为我们的会员，稍后我们会对您的情况做一个详细的回访，方便安排专业人员面对面提供服务。请注意接听电话，祝您早日收获幸福！" },
  { id: "Q1134", text: "注册登记成功后，请及时联系服务老师对您的资料完成核实，平台对资料不属实、未实名信息不展示、不推荐、定期删除清理。" },
  { id: "Q1133", text: "您好，我们为您筛选出了好几位符合您要求的嘉宾，希望为您做沟通了解。请在方便的时候联系我们专属服务老师。" },
  { id: "Q1132", text: "刚我们服务老师给您去电话，未能联系到您。我们为您筛选出好几位符合您要求的嘉宾希望您能沟通了解。请在方便的时候联系我们专属服务老师。" },
  { id: "Q1131", text: "为了保证会员真实性，请进行实名认证，实名认证会员免费获得一次服务。" },
  { id: "Q1130", text: "我们还会的服务老师跟您电话联系了您，了解下您的个人情况和需求，然后给您推荐几位符合您要求的嘉宾。" },
  { id: "Q1129", text: "会员您好，我们邀请您前往我们的线下门店进行资料认证，可以获得更多更好的优质服务，详情请联系您的专属服务老师。" },
  { id: "Q1025", text: "多多上传美照会大大提升您的个人吸引力哦" },
  { id: "Q1023", text: "新年到，又大了一岁！愿您早日与爱情抱抱，幸福美好，新的一年更要有，爱ta，温暖！" },
  { id: "Q1022", text: "近期有我们的大型线下活动，诚邀您参加！本次活动有非常多优秀嘉宾参加，活动详情和报名请联系平台工作人员。" },
  { id: "Q1021", text: "发帖提醒：会员之间无论是线上还是线下交往中，切记涉及金钱往来、谨防诈骗。若发现对方行为异常请务必立即停止交往！" },
  { id: "Q1020", text: "完善更多资料，进行实名认证，提升个人真诚度，让别人感受到您是真实、认真、靠谱，将大大提升您的吸引力哦。" },
  { id: "Q1019", text: "恭喜您正式成为我们的会员，稍后我们会对您的情况做一个详细的回访，方便安排专业人员面对面提供服务。" },
];

const columns = [
  "任务名称",
  "创建时间",
  "发送对象",
  "手机号码清单",
  "任务状态",
  "发送统计",
  "发送明细",
  "操作",
];

export default function Page() {
  const router = useRouter();
  const breadcrumb = getBreadcrumb("运营工具", "短信群发");
  const [createOpen, setCreateOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="obc-notice">
        <span className="obc-notice-i">!</span>
        <div className="obc-notice-body">
          <p className="obc-notice-t">须知</p>
          <p className="obc-notice-desc">本系统整合开发了腾讯短信的群发功能，可以对指定的用户群发各种合规短信内容，提升平台与用户的连接</p>
        </div>
      </div>

      <div className="admin-card grp-card">
        <div className="grp-head">
          <h2 className="grp-title">短信群发</h2>
          <div className="grp-actions">
            <button type="button" className="grp-btn" onClick={() => setCreateOpen(true)}>
              <span className="grp-btn-plus">+</span> 创建群发任务
            </button>
            <button type="button" className="grp-btn" onClick={() => router.push("/sms-record")}>
              <svg className="grp-btn-ico" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2.5A4.5 4.5 0 0 1 12.5 8H8V4.5A4.5 4.5 0 0 1 8 3.5z" />
              </svg>
              短信充值
            </button>
            <button type="button" className="grp-btn" onClick={() => setTplOpen(true)}>
              <svg className="grp-btn-ico" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.5 2.5h8l3 3v8h-11v-11zM9 4v3h3M4 9h8M4 11h8M4 7h2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
              </svg>
              提交群发模板
            </button>
          </div>
        </div>

        <div className="grp-table-wrap">
          <table className="grp-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8}>
                  <div className="grp-empty">
                    <Inbox className="grp-empty-icon" />
                    <span className="grp-empty-text">暂无数据</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {createOpen && <CreateTaskDrawer onClose={() => setCreateOpen(false)} />}
      {tplOpen && <SubmitTplDrawer onClose={() => setTplOpen(false)} />}
    </div>
  );
}

function DrawerHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="tlc-panel-head">
      <div className="tlc-panel-head-left">
        <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
        <span className="tlc-panel-title">{title}</span>
      </div>
      <div className="sms-head-actions">
        <button className="finord-btn finord-btn-primary sms-upload-btn">☁ 拥抱此上传</button>
        <button className="finord-btn sms-cancel" onClick={onClose}>取消</button>
        <button className="finord-btn finord-btn-primary">确定提交</button>
      </div>
    </div>
  );
}

function CreateTaskDrawer({ onClose }: { onClose: () => void }) {
  const [taskName, setTaskName] = useState("");
  const [target, setTarget] = useState("所有注册用户");
  const [tplId, setTplId] = useState("Q1329");

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel sms-panel">
        <DrawerHead title="创建群发任务" onClose={onClose} />
        <div className="tlc-panel-body">
          <div className="sms-notice">
            <div className="sms-notice-head">
              <span className="sms-notice-title">通知</span>
            </div>
            <p>您可以将您需要发送的短信内容创意在这里进行提交，由系统服务商进行二次编辑修改后提交至腾讯审核，待腾讯审核通过后即可下发。</p>
            <p>短信服务商对于短信内容审核较为严格，短信内容中不得含有明确的营销性质、婚恋相关字样、不得含有任何具体联系方式和网站。</p>
          </div>

          <div className="sms-form-row">
            <span className="sms-form-label">＊任务名称</span>
            <input className="sms-input sms-input-wide" placeholder="自定义任务名称,限制20字符" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
          </div>

          <div className="sms-form-row sms-form-row-top">
            <span className="sms-form-label">发送对象</span>
            <div className="sms-targets">
              {SEND_TARGETS.map((t) => (
                <button key={t} type="button" className={`sms-chip ${target === t ? "active" : ""}`} onClick={() => setTarget(t)}>{t}</button>
              ))}
            </div>
          </div>

          <div className="sms-form-row sms-form-row-top">
            <span className="sms-form-label">＊短信模板</span>
            <div className="sms-tpl-wrap">
              <div className="sms-tpl-bar">
                <span className="sms-tpl-bar-dot">●</span>
                <span>从以下内置的短信模板中选择发送内容；欢迎提交您的短信群发内容创意，腾讯审核通过后即可在下面选择发送</span>
              </div>
              <div className="sms-tpl-grid">
                {TPLS.map((tpl) => (
                  <button key={tpl.id} type="button" className={`sms-tpl ${tplId === tpl.id ? "active" : ""}`} onClick={() => setTplId(tpl.id)}>
                    <div className="sms-tpl-head">
                      <span className="sms-tpl-id">◇ {tpl.id}</span>
                      <span className="sms-tpl-cat">短信内容:</span>
                      {tplId === tpl.id && <span className="sms-tpl-check">✓</span>}
                    </div>
                    <p className="sms-tpl-text">{tpl.text}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SubmitTplDrawer({ onClose }: { onClose: () => void }) {
  const [scene, setScene] = useState("");
  const [content, setContent] = useState("");

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel sms-panel sms-panel-narrow">
        <DrawerHead title="群发短信模板" onClose={onClose} />
        <div className="tlc-panel-body">
          <div className="obc-notice obc-notice-sms">
            <span className="obc-notice-i">!</span>
            <div className="obc-notice-body">
              <p className="obc-notice-t">须知</p>
              <p>您可以自定义的短信内容模板在此提交。提交后请在微信告知我们的技术工程师，确认后帮您提交至腾讯短信平台审核，通过后即可使用。</p>
              <p>短信服务商对于短信内容审核较为严格，短信内容中不得含有明确的营销性质、婚恋相关字样、不得含有任何具有联系方式和网站。</p>
              <p>短信长度(签名+正文)不超过70字时，按照1条短信计费；超过70字即为长短信时，按67字/条分隔成多条计费，但会有一条短信内提示。1个汉字、数字、字母、标点、空格均算1字。</p>
            </div>
          </div>

          <div className="sms-form-row sms-form-row-top">
            <span className="sms-form-label">＊场景描述</span>
            <input className="sms-input sms-input-wide" placeholder="发送该短信的目的描述" value={scene} onChange={(e) => setScene(e.target.value)} />
          </div>

          <div className="sms-form-row sms-form-row-top">
            <span className="sms-form-label">＊模板内容</span>
            <div className="sms-textarea-wrap">
              <textarea className="sms-textarea" placeholder="140字符内，请输入您想要群发的信息内容创意" maxLength={140} value={content} onChange={(e) => setContent(e.target.value)} />
              <div className="sms-count">当前 {content.length} 字。实际发送时，签名、变量长度会影响总字数</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
