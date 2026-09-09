"use client";
import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

type Row = {
  id: number;
  scene: string;
  content: string;
  targetType: "text" | "admin";
  targetText?: string;
  adminTags?: string[];
  adminType?: "single" | "multi";
  enabled: boolean;
};

const rows: Row[] = [
  { id: 1, scene: "全平台验证码（会员登录、注册、绑定、后台登录等）", content: "验证码为：{1}，5分钟内有效", targetType: "text", targetText: "任意用户", enabled: true },
  { id: 2, scene: "账户余额变动通知（收入）", content: "您的账户余额有变动！收入：{1}元", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 3, scene: "账户余额变动通知（支出）", content: "您的账户余额有变动！支出：{1}元", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 4, scene: "余额提现结果通知（成功）", content: "您提交的余额提现已审核通过，本次申请提现金额：{1}元，扣除手续费：{2}元，实际到账您为：{3}元，请注意查收", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 5, scene: "退款成功通知", content: "您的支付订单{1}退款成功！退款金额：{2}元，退款方式：{3}", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 6, scene: "会员资料审核结果通知（通过）", content: "恭喜！您的资料审核通过，编号为：{1}，有任何问题请联系您的专属服务人员", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 7, scene: "会员资料审核结果通知（未通过）", content: "遗憾！您资料未通过审核，原因：{1}，请完善修正后我们会尽快再次审核", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 8, scene: "实名认证结果通知（通过）", content: "恭喜！您的实名认证审核通过", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 9, scene: "实名认证结果通知（未通过）", content: "遗憾！您的实名认证审核未通过，请核实资料后再次提交", targetType: "text", targetText: "前台会员", enabled: true },
  { id: 10, scene: "承诺书签署结果通知（通过）", content: "恭喜！您签署的承诺书已经通过！", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 11, scene: "承诺书签署结果通知（未通过）", content: "抱歉！您签署的承诺书未通过，请登录平台查看原因并重新签署", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 12, scene: "资料被收藏提醒（通知资料所属会员）", content: "有人收藏了您的资料，快去看看吧", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 13, scene: "被人爆灯提醒（通知被爆灯会员）", content: "恭喜！您的更新被其它成员关注！", targetType: "text", targetText: "前台会员", enabled: true },
  { id: 14, scene: "牵线服务申请确认信息（通知申请人）", content: "已经收到您的服务申请！您的专属服务人员将尽快为您提供服务，请耐心等候反馈。本次服务关联编号：{1}", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 16, scene: "牵线服务结果通知（成功）", content: "恭喜，您申请的本次牵线(编号：{1})服务已完成！请及时登录平台查看信息资料，或者联系您的专属服务客服", targetType: "text", targetText: "前台会员", enabled: true },
  { id: 17, scene: "牵线服务结果通知（失败）", content: "非常遗憾，本次服务失败，服务次数已经退回，继续加油！本次服务关联编号：{1}", targetType: "text", targetText: "前台会员", enabled: true },
  { id: 18, scene: "牵线服务任务通知（通知申请人所属服务红娘）", content: "有新的服务申请，请尽快查看处理！申请人编号：{1}", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 19, scene: "VIP会员即将到期提醒（距离到期还有7天的时候通知）", content: "您的VIP会员资格即将到期，到期后将不再享受VIP权益和服务，请及时联系您的服务专员", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 20, scene: "VIP会员到期提醒", content: "您的VIP会员资格已经到期，将不再享受VIP权益和服务，请及时联系您的服务专员", targetType: "text", targetText: "前台会员", enabled: true },
  { id: 21, scene: "会员分流提醒（通知归属服务红娘）", content: "有新的会员归属分配到您名下，编号：{1}，请及时为会员提供资料审核、完善、跟进等服务", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 22, scene: "推广红娘推广成功（通知归属推广红娘）", content: "在您的推广下，有新的会员：{1}注册成功！继续努力哦", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 23, scene: "推广红娘获得会员消费分成（通知该红娘）", content: "恭喜，您的客户{1}购买了：{2}，您获得提成：{3}元", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 24, scene: "服务红娘获得会员消费分成（通知该红娘）", content: "恭喜，您的客户{1}购买了：{2}，您获得提成：{3}元", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 25, scene: "合伙红娘获得团队所属会员消费分成（通知该红娘）", content: "恭喜，您的客户{1}购买了：{2}，您获得提成：{3}元", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 26, scene: "获赠礼物提醒（通知获赠会员）", content: "尊敬的{1}您好，会员编号{2}，给您赠送了礼物：{3}您获得{4}的积分奖励，积分可以在平台兑换礼品哦", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 27, scene: "活动报名结果通知（通过）", content: "恭喜！您报名的活动：{1}，审核通过了。报名人{2}，活动时间：{3}，活动地点：{4}，请按时到场参加哦", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 28, scene: "活动报名结果通知（未通过）", content: "遗憾！您报名的活动：{1}，审核未通过，原因：{2}", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 29, scene: "新的活动报名（通知活动管理员/发布人）", content: "有新的活动报名申请，报名人：{1}报名活动：{2}，请及时处理", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 30, scene: "新会员提交相亲资料（通知管理员）", content: "有新的会员{1}加入平台，请及时进行资料审核！", targetType: "admin", adminType: "single", enabled: false },
  { id: 31, scene: "新的举报提交（通知管理员）", content: "有新的举报提交，请及时核实情况并做出处理！举报对象：{1} 举报人：{2}", targetType: "admin", adminTags: ["8"], adminType: "multi", enabled: false },
  { id: 32, scene: "会员提交申请推广（通知管理员）", content: "有新的会员申请了朋友圈/公众号推广服务，请及时处理！", targetType: "admin", adminTags: ["admin"], adminType: "multi", enabled: false },
  { id: 33, scene: "会员申请兑换礼物（通知管理员）", content: "有新的礼品兑换申请，请及时处理！申请人：{1}", targetType: "admin", adminTags: ["admin"], adminType: "multi", enabled: false },
  { id: 50, scene: "头像审核不通过提醒", content: "您上传的头像未通过审核，系统已经重置为默认头像，为了您资料的有效性请及时登录平台重新上传头像，谢谢", targetType: "text", targetText: "前台会员", enabled: true },
  { id: 51, scene: "人工匹配后通知会员", content: "我们为您推荐了一位非常符合您要求的会员，请登录平台查看详细资料", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 52, scene: "数据安全提醒", content: "后台账号{1}刚才进行了会员数据导出操作，由于其账号权限不足，已被系统拒绝，请知晓！", targetType: "admin", adminTags: ["7", "admin"], adminType: "multi", enabled: false },
  { id: 53, scene: "客源线索分流提醒", content: "有新的客源线索{1}分派给您，请及时进行跟进与服务", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 54, scene: "客源线索3天未跟进提醒", content: "您的客源线索{1}已经超过3天未进行跟进了，特此提醒", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 55, scene: "给被牵线人发通知", content: "您好，平台中有会员向您发起牵线，想进一步互相了解，请尽快登录平台中查看处理", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 57, scene: "会员诚信认证资料审核通过", content: "您好，您提交的{1}相关资料审核通过", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 58, scene: "会员诚信认证资料审核未通过", content: "您好，您提交的{1}相关资料审核未通过，原因：{2}", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 61, scene: "录入约会记录后给双方会员发送提醒短信", content: "您与会员{1}约见时间为：{2} 约见地方：{3}，请准时赴约，有任何问题请及时联系我们", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 62, scene: "会员提交约会反馈后发送短信通知所属服务红娘", content: "会员{1}提交了约见反馈，请及时查看", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 63, scene: "系统后台登录提醒", content: "账号\"{1}\"刚登录了系统后台，登录地：{2}，时间：{3}请知晓。", targetType: "admin", adminTags: ["admin"], adminType: "multi", enabled: false },
  { id: 64, scene: "创建新的后台账号时通知管理员", content: "系统后台添加了新的账号：\"{1}\"创建人：{2}，时间：{3}请知晓。", targetType: "admin", adminTags: ["admin"], adminType: "multi", enabled: true },
  { id: 65, scene: "会员提交见面申请后短信通知管理员", content: "会员\"{1}\"提交了见面申请，时间：{2}请知晓。", targetType: "admin", adminTags: ["admin"], adminType: "multi", enabled: false },
  { id: 66, scene: "会员提交见面申请后短信通知所属红娘", content: "会员\"{1}\"提交了见面申请，时间：{2}请知晓。", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 67, scene: "合作客源分派", content: "有新的合作客源（编号{1}）分派给您，请及时跟进和服务", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 69, scene: "分店会员线上支付后通知店长", content: "恭喜！您店会员{1}购买了{2}，您店获得分成{3}，更多明细请登录平台查看", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 70, scene: "后台人工调整牵线次数时发短信通知后端管理员", content: "会员\"{1}\"在系统后台{2}牵线次数{3}次，操作人：{4}，理由：{5}请知晓", targetType: "admin", adminTags: ["admin"], adminType: "multi", enabled: false },
  { id: 71, scene: "当天有预约进店的客户的时候发送短信通知所属红娘", content: "您今天有{1}条客户预约进店任务，别忘记了哦", targetType: "text", targetText: "任意用户", enabled: false },
  { id: 72, scene: "当会员给他人首次在线上发送消息的时候短信提醒接收人", content: "您好！{1}给您发送了站内消息，请及时登录平台查看内容！", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 73, scene: "当会员首次回复他人在线发送的消息的时候，短信通知发送人", content: "您好！给{1}发送的消息已经回复，请及时登录平台-消息中心查看内容！", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 74, scene: "当有人成功报名加入社群后通知指定管理员", content: "有新的小伙伴报名加入社群，请知晓", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 1041, scene: "合作客源状态变更时短信通知客源推送方", content: "您好，合作客源{1}业务状态有新的变动，请知晓：{2}", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 1042, scene: "合作客源推送后短信通知客源接收方", content: "您好，您的合作伙伴{1}给您推送了新的客源信息，请及时分派跟进，预祝合作愉快！", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 1151, scene: "发起合同后通知会员签署", content: "有一份电子合同待您签署！请前往平台中的\"会员中心-我的合同\"按照指引完成合同在线签署。如需帮助请及时联系平台老师", targetType: "text", targetText: "前台会员", enabled: true },
  { id: 1293, scene: "客户提交喜讯反馈后通知指定管理员", content: "有客户给您反馈了喜讯！请及时登录系统后台查看", targetType: "admin", adminType: "single", enabled: false },
  { id: 1294, scene: "客户制作锦旗赠送成功后通知指定管理员", content: "恭喜！有客户给您赠送了一面锦旗！请及时登录后台查看", targetType: "admin", adminType: "single", enabled: false },
  { id: 1347, scene: "客户下单成功后通知商家", content: "有新的客户：{1}下单了购买了您的商品或服务", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 1348, scene: "客户下单后通知核销码", content: "购买成功！请凭核销码：{1}前往{2}进行消费", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 1349, scene: "客户下单成功后通知指定管理员", content: "客户：{1}下单了购买了：{2}的商品或服务", targetType: "admin", adminType: "single", enabled: false },
  { id: 1350, scene: "客户下单成功后通知推广红娘", content: "您名下客户：{1}下单了购买了：{2}的商品或服务，消费成功后您可获得分成。", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 1351, scene: "客户下单成功后通知服务红娘", content: "您名下客户：{1}下单了购买了：{2}的商品或服务，消费成功后您可获得分成。", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 1352, scene: "客户消费成功后通知所属推广红娘", content: "订单消费完成！{1}订单：{2}，核销时间：{3}，核销码人：{4}", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 1353, scene: "客户消费成功后通知所属服务红娘", content: "订单消费完成！{1}订单：{2}，核销时间：{3}，核销码人：{4}", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 1354, scene: "客户消费成功后通知指定管理员", content: "订单消费完成！{1}订单：{2}，核销时间：{3}，核销码人：{4}", targetType: "admin", adminType: "single", enabled: false },
  { id: 1358, scene: "互选活动：报名成功后的提醒报名人", content: "活动报名成功！请牢记活动开始时间：{1}结束时间：{2}务必准时参与，并及时关注平台信息。", targetType: "text", targetText: "前台会员", enabled: false },
  { id: 1359, scene: "互选活动：有人报名，通知指定管理员", content: "有新的会员报名加入了本次活动，请知晓。", targetType: "admin", adminTags: ["admin"], adminType: "multi", enabled: false },
  { id: 1439, scene: "修改超级管理员提醒", content: "验证码：{1}注意：您正在修改系统后台超级管理员账号！", targetType: "text", targetText: "任意用户", enabled: true },
  { id: 1463, scene: "自由支付成功通知服务红娘", content: "您的客户{1}已完成一笔线上支付，金额：{2}元，订单号：{3}，请知晓", targetType: "text", targetText: "任意用户", enabled: false },
  { id: 1506, scene: "有人对未实名客户发起牵线，短信通知被牵线人提醒认证", content: "提醒：有客户申请与您沟通，因您暂未完成实名认证，无法开展本次服务。请尽快登录平台完成实名。", targetType: "text", targetText: "前台会员", enabled: false },
];

export default function Page() {
  const [state, setState] = useState<Row[]>(rows);

  const toggle = (id: number) => {
    setState((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const adminPlaceholder = "请选择管理员";

  return (
    <div className="notif-page">
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          {
            label: "系统管理",
            href: "/system-setting-basic",
            children: [
              { label: "系统配置", href: "/system-setting-basic" },
              { label: "广告管理", href: "/system-setting-adconfig" },
              { label: "外呼平台", href: "/outbound-call-platform" },
              { label: "外呼状态", href: "/out-call-list" },
              { label: "呼叫记录", href: "/out-call-record" },
              { label: "签名配置", href: "/sms-signature" },
              { label: "通知配置", href: "/sms-notices" },
              { label: "短信群发", href: "/sms-group" },
              { label: "发送记录", href: "/sms-record" },
              { label: "添加账号", href: "/system-setting-admin-user-add" },
              { label: "账号管理", href: "/system-setting-admin-user" },
              { label: "权限分组", href: "/system-setting-admin-group" },
              { label: "系统日志", href: "/system-setting-admin-log" },
            ],
          },
          { label: "短信系统" },
          { label: "通知配置" },
        ]}
      />

      <div className="obc-notice">
        <span className="obc-notice-i">!</span>
        <div className="obc-notice-body">
          <p className="obc-notice-t">须知</p>
          <p className="obc-notice-desc">只有启用状态下的通知项目系统才会发送短信</p>
        </div>
      </div>

      <div className="admin-card notif-card">
        <div className="notif-head">通知配置</div>

        <div className="notif-bar">
          <div className="notif-search">
            <input className="notif-search-input" placeholder="请输入关键字搜索" />
            <button type="button" className="notif-search-btn">搜索</button>
          </div>
        </div>

        <div className="notif-table-wrap">
          <table className="notif-table">
            <thead>
              <tr>
                <th className="notif-col-id">编号</th>
                <th className="notif-col-scene">短信通知场景描述</th>
                <th className="notif-col-content">短信内容示例（以实际收到信息为准）</th>
                <th className="notif-col-target">通知对象</th>
                <th className="notif-col-status">状态</th>
              </tr>
            </thead>
            <tbody>
              {state.map((r) => (
                <tr key={r.id}>
                  <td className="notif-td-id">{r.id}</td>
                  <td className="notif-td-scene">{r.scene}</td>
                  <td className="notif-td-content">{r.content}</td>
                  <td className="notif-td-target">
                    {r.targetType === "text" ? (
                      <span className="notif-target-text">{r.targetText}</span>
                    ) : (
                      <div className="notif-admin">
                        {r.adminTags && r.adminTags.length > 0 && (
                          <div className="notif-tags">
                            {r.adminTags.map((tag) => (
                              <span key={tag} className="notif-tag">
                                {tag}
                                <button type="button" className="notif-tag-x">×</button>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="notif-select">
                          <span className="notif-select-label">{adminPlaceholder}</span>
                          {r.adminType === "single" && (
                            <span className="notif-select-ghost">请选择要通知的管理员</span>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="notif-td-status">
                    <button type="button" onClick={() => toggle(r.id)} className={`mp-switch ${r.enabled ? "on" : ""}`}>
                      {r.enabled && <span className="mp-switch-label">启用</span>}
                      <span className="mp-switch-knob"></span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
