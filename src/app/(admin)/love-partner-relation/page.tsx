"use client";

import { useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("合伙红娘", "团队关系");

const columns = ["ID", "推广红娘", "隶属合伙人（团队）", "加入团队时间", "发展会员数量", "团队业绩贡献", "团队关系状态", "操作"];

const relations = [
  { id: 6, name: "lemon", team: "富豪爱1", joinedAt: "2026-08-23 21:49:21", members: 0, performance: "0元", status: "正常" },
  { id: 5, name: "是胖春本人没错", team: "富豪爱1", joinedAt: "2026-07-11 16:39:26", members: 0, performance: "0元", status: "正常" },
  { id: 4, name: "越可名", team: "富豪爱1", joinedAt: "2026-07-11 16:39:14", members: 0, performance: "0元", status: "正常" },
  { id: 3, name: "Sofia", team: "富豪爱1", joinedAt: "2026-07-05 14:53:18", members: 2, performance: "0元", status: "正常" },
  { id: 1, name: "σ^^ η'", team: "富豪爱1", joinedAt: "2026-06-30 16:17:55", members: 0, performance: "0元", status: "正常" },
];

export default function LovePartnerRelationPage() {
  const [bindOpen, setBindOpen] = useState(false);
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>推广红娘有4种方式加入合伙人团队，从属建立团队关系：</p>
            <p>1、每个合伙人拥有独立的邀请二维码，别人扫合伙人二维码后，进入平台，只要注册为用户，即可绑定关系。任何时候该用户推广红娘，都会自动加入到之前扫码的那个合伙人团队</p>
            <p>2、在推广红娘中心点击加入团队，在弹出来选择要加入的团队，选择后则立即加入到合伙人团队中</p>
            <p>3、平台管理员在后台人工操作，可将推广红娘加入指定的合伙人团队中去</p>
            <p>4、如果合伙人本身已经是推广红娘且未加入其他团队、或在成为合伙人之后成为推广红娘，则自动加入到自己的团队中</p>
            <p><b>每个推广红娘只可以加入1个合伙人团队，</b>若已经有团队，则不允许加入新的团队以及自动升级为合伙人，若需要变更或者解除团队关系，需要联系平台管理员在后台操作</p>
            <p>只有团队关系状态为"正常"才会为团队成员。当团队关系状态变除了非正常时此记录变更。在原来的团队的记录中团队关系将 移出或变更，并记录有时间，从此时间开始将原成员不再为团队成员</p>
          </div>
        </div>
      </div>

      <div className="finord-card lpr-card">
        <div className="lpr-head">
          <h2 className="lpr-title">合伙人团队关系</h2>
          <button className="finord-btn finord-btn-primary lpr-bind-btn" onClick={() => setBindOpen(true)}>人工绑定团队关系</button>
        </div>

        <div className="lpr-filters">
          <select className="lpr-select"><option>按隶属合伙人搜</option></select>
          <input className="lpr-input" placeholder="请输入" />
          <button className="finord-btn finord-btn-primary lpr-search-btn">搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table lpr-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {relations.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.team}</td>
                  <td className="lpr-time">{r.joinedAt}</td>
                  <td>{r.members}</td>
                  <td><span className="lpr-performance">{r.performance}</span></td>
                  <td><span className="lpr-status">{r.status}</span></td>
                  <td>
                    <div className="lpr-ops">
                      <a className="finord-link">移出团队</a>
                      <a className="finord-link">变更团队</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lpr-pager">
          <span className="lpr-pager-arrow">‹</span>
          <span className="lpr-pager-cur">1</span>
          <span className="lpr-pager-arrow">›</span>
        </div>
      </div>

      {bindOpen && <BindRelationDrawer onClose={() => setBindOpen(false)} />}
    </div>
  );
}

function BindRelationDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel lpr-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">人工绑定团队关系</span>
          </div>
          <div className="lpr-head-actions">
            <button className="finord-btn lpr-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="lpr-warn">① 若推广红娘已经隶属于其他合伙人团队，本操作会将其从原有团队中移除并绑定到您指定的团队中</div>

          {/* 推广红娘 */}
          <div className="lpr-row">
            <span className="lpr-label">＊推广红娘</span>
            <div className="lpr-content">
              <input className="lpr-input-wide" placeholder="请输入推广红娘的账号昵称" />
              <div className="lpr-info">① 请填写推广红娘的账号昵称</div>
            </div>
          </div>

          {/* 绑定到 */}
          <div className="lpr-row">
            <span className="lpr-label">＊绑定到</span>
            <select className="lpr-select-wide"><option>请选择一个团队</option></select>
          </div>
        </div>
      </div>
    </>
  );
}