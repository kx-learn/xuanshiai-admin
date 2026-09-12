"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, X } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

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
  { id: "Q1317", text: "您好，很遗憾。您报名参加的本场互动活动未能通过筛选。我们还会持续组织更多精彩的互动活动。" },
  { id: "Q1138", text: "恭喜您成为我们的会员，您已经踏出了幸福的第一步！请认真填写您的更多资料。" },
  { id: "Q1137", text: "您好，给您电话您没有接到，不知道是不是在忙的。根据您的资料需求，联系关注了几个不错的需要。" },
  { id: "Q1136", text: "您好，据我们服务老师给您打电话，是想邀请您来线下门店做一下实名认证。" },
  { id: "Q1135", text: "您好！欢迎您注册成为我们的会员，稍后我们会对您的情况做一个详细的回访。" },
  { id: "Q1134", text: "注册登记成功后，请及时联系服务老师对您的资料完成核实。" },
  { id: "Q1133", text: "您好，我们为您筛选出了好几位符合您要求的嘉宾，希望为您做沟通了解。" },
  { id: "Q1132", text: "刚我们服务老师给您去电话，未能联系到您。我们为您筛选出好几位符合您要求的嘉宾。" },
  { id: "Q1131", text: "为了保证会员真实性，请进行实名认证，实名认证会员免费获得一次服务。" },
  { id: "Q1130", text: "我们还会的服务老师跟您电话联系了您，了解下您的个人情况和需求。" },
  { id: "Q1129", text: "会员您好，我们邀请您前往我们的线下门店进行资料认证。" },
  { id: "Q1025", text: "多多上传美照会大大提升您的个人吸引力哦" },
  { id: "Q1023", text: "新年到，又大了一岁！愿您早日与爱情抱抱，幸福美好。" },
  { id: "Q1022", text: "近期有我们的大型线下活动，诚邀您参加！本次活动有非常多优秀嘉宾参加。" },
  { id: "Q1021", text: "发帖提醒：会员之间无论是线上还是线下交往中，切记涉及金钱往来、谨防诈骗。" },
  { id: "Q1020", text: "完善更多资料，进行实名认证，提升个人真诚度。" },
  { id: "Q1019", text: "恭喜您正式成为我们的会员，稍后我们会对您的情况做一个详细的回访。" },
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

type SmsTask = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  amount: number | null;
  status: number;
  sort: number;
  extra: Record<string, unknown>;
  created_at: string | null;
};

type SmsTaskPage = { items: SmsTask[]; total: number; page: number; page_size: number };

export default function Page() {
  const router = useRouter();
  const breadcrumb = getBreadcrumb("运营工具", "短信群发");
  const [createOpen, setCreateOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);
  const [tasks, setTasks] = useState<SmsTask[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);

  const load = async (page = pageIdx) => {
    try {
      const resp = await adminApi<SmsTaskPage>("admin/content/sms_broadcast", {
        method: "GET",
        query: { page, page_size: 20 },
      });
      setTasks(resp.items);
      setTotal(resp.total);
      setPageIdx(resp.page);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该任务？")) return;
    try {
      await adminApi(`admin/content/sms_broadcast/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

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
              {tasks.map((t) => {
                const extra = t.extra ?? {};
                return (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{(t.created_at ?? "-").replace("T", " ").slice(0, 19)}</td>
                    <td>{typeof extra.target === "string" ? extra.target : "-"}</td>
                    <td>
                      <span className="grp-phone">{typeof extra.phone_count === "number" ? extra.phone_count : 0}</span>
                      <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("下载手机号列表", "ok"); }}>下载</a>
                    </td>
                    <td>
                      <span className="grp-status">
                        {t.status === 1 ? "已完成" : t.status === 2 ? "进行中" : "已暂停"}
                      </span>
                    </td>
                    <td>
                      发送成功：{typeof extra.sent_count === "number" ? extra.sent_count : 0} /{" "}
                      失败：{typeof extra.fail_count === "number" ? extra.fail_count : 0}
                    </td>
                    <td><a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("查看发送明细", "ok"); }}>查看</a></td>
                    <td>
                      <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void remove(t.id); }}>删除</a>
                    </td>
                  </tr>
                );
              })}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="grp-empty">
                      <Inbox className="grp-empty-icon" />
                      <span className="grp-empty-text">暂无数据</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="finord-pagination">
          <span className="finord-info">共 {total} 条</span>
          <div className="finord-pages">
            <button className="finord-page nav" onClick={() => load(Math.max(1, pageIdx - 1))} disabled={pageIdx <= 1}>‹</button>
            <span className="finord-page active">{pageIdx} / {totalPages}</span>
            <button className="finord-page nav" onClick={() => load(Math.min(totalPages, pageIdx + 1))} disabled={pageIdx >= totalPages}>›</button>
          </div>
        </div>
      </div>

      {createOpen && <CreateTaskDrawer onClose={() => setCreateOpen(false)} onSuccess={() => void load(1)} />}
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
        <button className="finord-btn sms-cancel" onClick={onClose}>取消</button>
      </div>
    </div>
  );
}

function CreateTaskDrawer({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [taskName, setTaskName] = useState("");
  const [target, setTarget] = useState("所有注册用户");
  const [tplId, setTplId] = useState("Q1329");

  const submit = async () => {
    if (!taskName.trim()) {
      showConfigToast("请填写任务名称", "error");
      return;
    }
    try {
      await adminApi("admin/content/sms_broadcast", {
        method: "POST",
        body: {
          title: taskName.trim(),
          subtitle: target,
          status: 2,
          sort: 100,
          extra: {
            target,
            tpl_id: tplId,
            phone_count: 0,
            sent_count: 0,
            fail_count: 0,
          },
        },
      });
      showConfigToast("已创建群发任务", "ok");
      onSuccess();
      onClose();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "创建失败", "error");
    }
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel sms-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">创建群发任务</span>
          </div>
          <div className="sms-head-actions">
            <button className="finord-btn finord-btn-primary sms-upload-btn" onClick={submit}>☁ 拥抱此上传</button>
            <button className="finord-btn sms-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary" onClick={submit}>确定提交</button>
          </div>
        </div>
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
            <input className="sms-input sms-input-wide" placeholder="自定义任务名称,限制20字符" value={taskName} onChange={(e) => setTaskName(e.target.value)} maxLength={20} />
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

  const submit = async () => {
    if (!scene.trim() || !content.trim()) {
      showConfigToast("请填写场景描述与模板内容", "error");
      return;
    }
    try {
      await adminApi("admin/content/sms_broadcast", {
        method: "POST",
        body: {
          title: `模板-${scene.trim()}`,
          subtitle: scene.trim(),
          status: 1,
          sort: 100,
          extra: {
            type: "template_pending",
            scene: scene.trim(),
            content: content.trim(),
          },
        },
      });
      showConfigToast("已提交模板创意", "ok");
      onClose();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "提交失败", "error");
    }
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel sms-panel sms-panel-narrow">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">群发短信模板</span>
          </div>
          <div className="sms-head-actions">
            <button className="finord-btn finord-btn-primary sms-upload-btn" onClick={submit}>☁ 拥抱此上传</button>
            <button className="finord-btn sms-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary" onClick={submit}>确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="obc-notice obc-notice-sms">
            <span className="obc-notice-i">!</span>
            <div className="obc-notice-body">
              <p className="obc-notice-t">须知</p>
              <p>您可以自定义的短信内容模板在此提交。提交后请在微信告知我们的技术工程师，确认后帮您提交至腾讯短信平台审核，通过后即可使用。</p>
              <p>短信服务商对于短信内容审核较为严格，短信内容中不得含有明确的营销性质、婚恋相关字样、不得含有任何具有联系方式和网站。</p>
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
