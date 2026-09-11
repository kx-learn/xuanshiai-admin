"use client";

import { useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("合伙红娘", "分成配置");

const columns = ["ID", "分成级别", "级别名称", "分成模式", "合伙人数量", "自动升级条件", "操作"];

const levels = [
  { id: 1, name: "级别1", label: "初级合伙人", mode: "按比例自动计算：35%", count: 1, condition: "默认" },
  { id: 2, name: "级别2", label: "中级合伙人", mode: "按比例自动计算：40%", count: 0, condition: "团队累计业绩>=10000元 或 团队累计发展有效相亲会员数量>=100人" },
  { id: 3, name: "级别3", label: "战略合伙人", mode: "按比例自动计算：45%", count: 0, condition: "团队累计业绩>=30000元 或 团队累计发展有效相亲会员数量>=500人" },
];

const BONUS_ITEMS = [
  { name: "资料审核费", base: "0.00" },
  { name: "推广展示", base: "13.65" },
  { name: "资料置顶套餐1", base: "6.65" },
  { name: "资料置顶套餐2", base: "17.50" },
  { name: "资料置顶套餐3", base: "34.65" },
  { name: "资料置顶套餐4", base: "52.50" },
  { name: "资料置顶套餐5", base: "69.65" },
  { name: "资料置顶套餐6", base: "94.15" },
  { name: "牵线套餐1", base: "69.65" },
  { name: "牵线套餐2", base: "69.65" },
  { name: "牵线套餐3", base: "104.65" },
  { name: "牵线套餐4", base: "139.65" },
  { name: "单次牵线服务", base: "69.65" },
  { name: "爆灯", base: "3.47" },
  { name: "新人专享", base: "104.65" },
  { name: "心动专享", base: "182.00" },
  { name: "臻爱专享", base: "349.65" },
  { name: "牵线套餐5", base: "385.00" },
  { name: "牵线套餐6", base: "420.00" },
  { name: "牵线套餐7", base: "472.50" },
  { name: "牵线套餐9", base: "560.00" },
  { name: "牵线套餐10", base: "595.00" },
];

export default function LovePartnerBonusConfigPage() {
  const [editOpen, setEditOpen] = useState(false);
  const [consumeMode, setConsumeMode] = useState("给予分成");
  const [splitMode, setSplitMode] = useState("按比例自动计算");
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card lpb-card">
        <h2 className="lpb-title">合伙人级别分成配置</h2>

        <div className="finord-table-wrap">
          <table className="finord-table lpb-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {levels.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.name}</td>
                  <td>{l.label}</td>
                  <td>{l.mode}</td>
                  <td>{l.count}</td>
                  <td>{l.condition}</td>
                  <td><a className="finord-link" onClick={() => setEditOpen(true)}>编排配置</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editOpen && (
        <EditBonusDrawer
          onClose={() => setEditOpen(false)}
          consumeMode={consumeMode} setConsumeMode={setConsumeMode}
          splitMode={splitMode} setSplitMode={setSplitMode}
        />
      )}
    </div>
  );
}

function EditBonusDrawer({ onClose, consumeMode, setConsumeMode, splitMode, setSplitMode }: {
  onClose: () => void;
  consumeMode: string; setConsumeMode: (v: string) => void;
  splitMode: string; setSplitMode: (v: string) => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel lpb-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">编辑配置</span>
          </div>
          <div className="lpb-head-actions">
            <button className="finord-btn lpb-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 分成级别名称 */}
          <div className="lpb-row">
            <span className="lpb-label">＊分成级别名称</span>
            <div className="lpb-content">
              <input className="lpb-input-wide" defaultValue="初级合伙人" />
              <div className="lpb-info">① 不要超过4个汉字</div>
            </div>
          </div>

          {/* 会员注册奖励 */}
          <div className="lpb-row">
            <span className="lpb-label">＊会员注册奖励</span>
            <div className="lpb-content">
              <div className="lpb-fee-row">
                <span>男会员</span>
                <input className="lpb-num" defaultValue="1.00" />
                <span className="lpb-unit">元/人</span>
                <span>女会员</span>
                <input className="lpb-num" defaultValue="1.00" />
                <span className="lpb-unit">元/人</span>
              </div>
              <div className="lpb-info">① 隶属合伙人团队的推广红娘发展的用户注册为平台相亲会员并通过资料审核后纳入计算</div>
            </div>
          </div>

          {/* 推广红娘纳入分成 */}
          <div className="lpb-row">
            <span className="lpb-label">＊推广红娘纳入分成</span>
            <div className="lpb-content">
              <div className="lpb-fee-row">
                <input className="lpb-num" defaultValue="0.00" />
                <span className="lpb-unit">元/人</span>
              </div>
              <div className="lpb-info">① 合伙红娘用团队二维码给Ta人,Ta人扫码进入平台注册账号后就绑定了关系，该账号日后在线付费入伙成为推广红娘后，该合伙人获得对应的分成，且自动归属到该合伙人的团队中</div>
            </div>
          </div>

          {/* 会员消费分成 */}
          <div className="lpb-row">
            <span className="lpb-label">＊会员消费分成</span>
            <div className="lpb-content">
              <div className="lpb-radio-row">
                {["不分成", "给予分成"].map((o) => (
                  <label key={o} className={`lpb-radio ${consumeMode === o ? "active" : ""}`}>
                    <input type="radio" name="consumeMode" value={o} checked={consumeMode === o} onChange={() => setConsumeMode(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="lpb-info">① 合伙人红娘是享有其团队发展来的会员在平台中产生的线上消费分成</div>
            </div>
          </div>

          {/* 分成模式 */}
          <div className="lpb-row">
            <span className="lpb-label">分成模式</span>
            <div className="lpb-content">
              <div className="lpb-mode-row">
                {["自定义固定金额", "按比例自动计算"].map((o) => (
                  <label key={o} className={`lpb-radio ${splitMode === o ? "active" : ""}`}>
                    <input type="radio" name="splitMode" value={o} checked={splitMode === o} onChange={() => setSplitMode(o)} />
                    <span>{o}</span>
                  </label>
                ))}
                <input className="lpb-num" defaultValue="35" />
                <span className="lpb-unit">%</span>
                <button type="button" className="finord-btn finord-btn-primary lpb-update-btn">更新数据</button>
              </div>
              <div className="lpb-info">① 按照百分比模式下系统自动根据平台收费配置中的数值乘以百分比，四舍五入到元，最小单位为1元，不满1元则为0</div>
            </div>
          </div>

          {/* 分成金额 网格 */}
          <div className="lpb-row lpb-row-top">
            <span className="lpb-label">分成金额</span>
            <div className="lpb-content">
              <div className="lpb-bonus-grid">
                {BONUS_ITEMS.map((b) => (
                  <div className="lpb-bonus-item" key={b.name}>
                    <span className="lpb-bonus-name">{b.name}</span>
                    <input className="lpb-num" defaultValue={b.base} />
                    <span className="lpb-unit">元</span>
                  </div>
                ))}
              </div>
              <div className="lpb-info lpb-info-block">① 修改比例后下次开方可查看金额变化</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}