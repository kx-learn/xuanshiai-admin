"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("推广红娘", "分成配置");

type LevelRow = {
  id: number;
  level: string;
  name: string;
  mode: string;
  count: number;
  condition: string;
};

const levels: LevelRow[] = [
  { id: 5, level: "级别1", name: "初级", mode: "自定义固定金额", count: 7, condition: "默认" },
  { id: 6, level: "级别2", name: "推广大师", mode: "按照比例自动计算：10%", count: 0, condition: "累计发展有效相亲会员数量>=51人" },
  { id: 7, level: "级别3", name: "推广大使", mode: "自定义固定金额", count: 0, condition: "累计发展有效相亲会员数量>=100人" },
  { id: 8, level: "级别4", name: "推广天使", mode: "自定义固定金额", count: 0, condition: "累计发展有效相亲会员数量>=500人" },
];

export default function PoploveMatchmakerDistributionPage() {
  const [editing, setEditing] = useState<LevelRow | null>(null);

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={breadcrumb} />

      <div className="pd-card">
        <div className="pd-head">
          <h2 className="pd-title">推广红娘分成配置</h2>
        </div>

        <div className="pd-table-wrap">
          <table className="pd-table">
            <colgroup>
              <col style={{ width: 90 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 240 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: "auto" }} />
              <col style={{ width: 120 }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>分成级别</th>
                <th>级别名称</th>
                <th>分成模式</th>
                <th>红娘数量</th>
                <th>自动升级条件</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((row) => (
                <tr key={row.id}>
                  <td className="pd-td-id">{row.id}</td>
                  <td className="pd-td-text">{row.level}</td>
                  <td className="pd-td-strong">{row.name}</td>
                  <td className="pd-td-text">{row.mode}</td>
                  <td className="pd-td-text">{row.count}</td>
                  <td className="pd-td-text">{row.condition}</td>
                  <td>
                    <button type="button" className="pd-link" onClick={() => setEditing(row)}>
                      编辑配置
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <EditDrawer row={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function EditDrawer({ row, onClose }: { row: LevelRow; onClose: () => void }) {
  const [levelName, setLevelName] = useState(row.name);
  const [operator, setOperator] = useState("累积>");
  const [threshold, setThreshold] = useState("100");
  const [rewardMale, setRewardMale] = useState("0.00");
  const [rewardFemale, setRewardFemale] = useState("0.00");
  const [consumeMode, setConsumeMode] = useState("none");

  return (
    <>
      <div className="pd-mask" onClick={onClose} />
      <div className="pd-panel">
        <div className="pd-panel-head">
          <button className="pd-panel-close-icon" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
          <h2 className="pd-panel-title">编辑配置</h2>
          <div className="pd-panel-actions">
            <button className="pd-btn" onClick={onClose}>
              关闭
            </button>
            <button className="pd-btn primary">确定提交</button>
          </div>
        </div>

        <div className="pd-panel-body">
          {/* 分成级别名称 */}
          <div className="pd-field">
            <span className="pd-field-label">
              <b className="req">*</b>分成级别名称
            </span>
            <div className="pd-field-body">
              <input
                className="pd-input"
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                placeholder="请输入"
              />
              <div className="pd-hint">
                <i className="pd-hint-icon">i</i>
                不要超过4个汉字
              </div>
            </div>
          </div>

          {/* 自动升级条件 */}
          <div className="pd-field">
            <span className="pd-field-label">
              <b className="req">*</b>自动升级条件
            </span>
            <div className="pd-field-body">
              <div className="pd-inline">
                <span className="pd-text">累计发展相亲会员数量&gt;=</span>
                <div className="pd-select">
                  <select value={operator} onChange={(e) => setOperator(e.target.value)}>
                    <option value="累积>">累积&gt;</option>
                  </select>
                  <ChevronDown className="pd-caret" size={14} />
                </div>
                <input
                  className="pd-input short"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value.replace(/[^\d]/g, ""))}
                  inputMode="numeric"
                />
                <span className="pd-unit">人</span>
              </div>
              <div className="pd-hint">
                <i className="pd-hint-icon">i</i>
                以通过审核的相亲会员数量为依据
              </div>
            </div>
          </div>

          {/* 会员注册奖励 */}
          <div className="pd-field">
            <span className="pd-field-label">
              <b className="req">*</b>会员注册奖励
            </span>
            <div className="pd-field-body">
              <div className="pd-inline">
                <span className="pd-text">男会员</span>
                <input
                  className="pd-input short"
                  value={rewardMale}
                  onChange={(e) => setRewardMale(e.target.value)}
                />
                <span className="pd-unit">元/人</span>
                <span className="pd-text">女会员</span>
                <input
                  className="pd-input short"
                  value={rewardFemale}
                  onChange={(e) => setRewardFemale(e.target.value)}
                />
                <span className="pd-unit">元/人</span>
              </div>
              <div className="pd-hint">
                <i className="pd-hint-icon">i</i>
                会员在初次被平台审核通过后推广红娘即可获得该金额的奖励
              </div>
            </div>
          </div>

          {/* 会员消费分成 */}
          <div className="pd-field">
            <span className="pd-field-label">
              <b className="req">*</b>会员消费分成
            </span>
            <div className="pd-field-body">
              <div className="pd-inline">
                <label className="pd-radio">
                  <input
                    type="radio"
                    name="pd-consume"
                    checked={consumeMode === "none"}
                    onChange={() => setConsumeMode("none")}
                  />
                  <span>不分成</span>
                </label>
                <label className="pd-radio">
                  <input
                    type="radio"
                    name="pd-consume"
                    checked={consumeMode === "give"}
                    onChange={() => setConsumeMode("give")}
                  />
                  <span>给予分成</span>
                </label>
              </div>
              <div className="pd-hint">
                <i className="pd-hint-icon">i</i>
                推广红娘可享其发展来的会员在相亲平台中产生的线上消费分成佣金
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
