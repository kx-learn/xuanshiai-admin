"use client";

import { useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("合伙红娘", "合伙人管理");

const columns = ["ID", "合伙人", "合伙级别", "创建时间", "团队成员", "团队业绩", "团队有效会员", "累计分成", "操作"];

const partners = [
  { id: 2, account: "出现1", team: "富婆爱1", level: "初级合伙人", createdAt: "2026-06-28 14:30:17", members: "5人", memberLink: "名单", performance: "0元", validMembers: "2（男女2）", totalBonus: "2元", bonusLink: "明细" },
];

export default function LovePartnerListPage() {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>1、合伙红娘（简称：合伙人）是同城相亲平台中的一种"合作"角色，合伙人通过为平台大量发展推广红娘作为平台快速且可持续性拓展会员和变现，合伙人从中可得分成奖励。</p>
            <p>2、合伙人可以看到有多多单身的资源，兼容红娘渠道的个人与商机机构，每个合伙人被视为一个团队，可以自定义一个团队的名称，其发展来的推广红娘被纳入为团队成员，旗下推广红娘发展来的会员在平台上产生的消费总额度成为团队业绩。系统根据其团队业绩及发展会员数数量将合伙人划分为了三个不同级别，不同的级别享有不同的分佣标准（级别和分佣比例均可在后台配置）</p>
            <p>3、合伙人除了能拿到所有团队成员发展来的会员的注册奖励之外，团队成员发展来的相亲会员在平台中每一笔消费，合伙人可以获得分成</p>
            <p>4、合伙人拥有独立的管理中心，团队成员名单、业绩明细、分佣明细、有效相亲会员名单等可清晰透明可见，分佣金额可随时申请提现到微信零钱</p>
            <p>5、推广红娘可以与合伙人身份并存，但不得是服务红娘。如果合伙人本身已经是推广红娘且未加入其他团队情况下，或在成为合伙人之后成为推广红娘，则自动加入到自己的团队中。且可在推广红娘中心切换登录到合伙人管理中</p>
            <p>6、平台支持在线付费自助开通、联系平台人工开通合伙人两种形式（在平台配置-收费配置"中设置），由平台管理员人工在"系统后台-合伙人管理-开通管理"于对应权限</p>
            <p>7、推广红娘在加入团队之前，必须先在平台注册账号，再申请成为推广红娘。绑定关系后随时解绑和更换团队，重新计算累计业绩</p>
            <p>8、每个合伙人拥有独立的邀请二维码，别人扫合伙人二维码后，进入平台，只要注册为用户，即可绑定关系。任何时候该用户推广红娘，都会自动加入之前扫码的那个合伙人团队</p>
            <p>9、<b>团队成员：</b>合伙人A的团队中的推广红娘，<b>红娘业绩：</b>合伙人A团队所有推广红娘发展来的相亲会员在平台中的消费总额，<b>团队有效会员：</b>合伙人A团队所有推广红娘发展来的资料审核通过相亲会员总数，<b>累积分成：</b>合伙人获得的分成总额</p>
          </div>
        </div>
      </div>

      <div className="finord-card lpl-card">
        <div className="lpl-head">
          <h2 className="lpl-title">合伙人管理</h2>
          <button className="finord-btn finord-btn-primary lpl-add-btn" onClick={() => setAddOpen(true)}>＋ 添加合伙人</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table lpl-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    <div className="lpl-partner">
                      <div className="lpl-avatar">?</div>
                      <div className="lpl-partner-info">
                        <div>账号：{p.account}</div>
                        <div className="lpl-team">团队：{p.team}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="lpl-level">{p.level}</span></td>
                  <td className="lpl-time">{p.createdAt}</td>
                  <td>{p.members} <a className="finord-link">{p.memberLink}</a></td>
                  <td><span className="lpl-performance">{p.performance}</span></td>
                  <td>{p.validMembers}</td>
                  <td><span className="lpl-bonus">{p.totalBonus}</span><a className="finord-link lpl-bonus-link">[{p.bonusLink}]</a></td>
                  <td>
                    <div className="lpl-ops">
                      <a className="finord-link">合伙人中心</a>
                      <a className="finord-link">编辑</a>
                      <a className="finord-link lpl-op-del">删除</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lpl-pager">
          <span className="lpl-pager-arrow">‹</span>
          <span className="lpl-pager-cur">1</span>
          <span className="lpl-pager-arrow">›</span>
        </div>
      </div>

      {addOpen && <AddPartnerDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddPartnerDrawer({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState("初级合伙人");
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel lpl-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加/编辑合伙人</span>
          </div>
          <div className="lpl-head-actions">
            <button className="finord-btn lpl-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="ecl-notice lpl-drawer-notice">
            <div className="ecl-notice-body">
              <span className="ecl-notice-ic">i</span>
              <div className="ecl-notice-text">
                <p>1、合伙人需先在平台上注册账号，并已绑定手机号和微信号</p>
                <p>2、推广红娘可以同时成为合伙人，服务红娘身份不可成为合伙人</p>
                <p>3、推广红娘若归属有合伙人团队，在成为合伙人后，其默认归属关系依然保留在原有团队，直到平台中进行设置后进行"团队变更"操作</p>
                <p>4、推广红娘若没有归属团队，在成为合伙人后自动加入成为团队成员</p>
                <p>5、一个推广红娘账号只允许隶属一个合伙团队</p>
              </div>
            </div>
          </div>

          {/* 用户账号 */}
          <div className="lpl-row">
            <span className="lpl-label">＊用户账号</span>
            <div className="lpl-content">
              <input className="lpl-input-wide" placeholder="请输入账号昵称" />
              <div className="lpl-info">① 服务红娘不能成为合伙人</div>
            </div>
          </div>

          {/* 团队名称 */}
          <div className="lpl-row">
            <span className="lpl-label">＊团队名称</span>
            <div className="lpl-content">
              <input className="lpl-input-wide" placeholder="请输入团队名称" />
              <div className="lpl-info">① 请输入合伙人团队的名称，如：校园红娘小队</div>
            </div>
          </div>

          {/* 分成级别 */}
          <div className="lpl-row">
            <span className="lpl-label">＊分成级别</span>
            <div className="lpl-content">
              <div className="lpl-radio-row">
                {["初级合伙人", "中级合伙人", "战略合伙人"].map((o) => (
                  <label key={o} className={`lpl-radio ${level === o ? "active" : ""}`}>
                    <input type="radio" name="level" value={o} checked={level === o} onChange={() => setLevel(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="lpl-info">① 不同级别的享有不同的分成标准，请在分级配置中自行设定相关标准</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}