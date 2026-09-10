"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = getBreadcrumb("总店红娘", "分成配置");

interface LevelRow {
  id: number;
  code: string;
  name: string;
  mode: string;
  condition: string;
  extra: string;
  matchmaker: string;
}

const LEVELS: LevelRow[] = [
  { id: 1, code: "级别1", name: "初级分成", mode: "自定义固定金额", condition: "默认", extra: "5元", matchmaker: "" },
  { id: 2, code: "级别2", name: "中级分成", mode: "自定义固定金额", condition: "牵线成功累积>=10次", extra: "1000元", matchmaker: "芸希老师" },
  { id: 3, code: "级别3", name: "高级分成", mode: "自定义固定金额", condition: "牵线成功累积>=100次", extra: "1000元", matchmaker: "" },
  { id: 4, code: "级别4", name: "合伙分成", mode: "自定义固定金额", condition: "牵线成功累积>=300次", extra: "5000元", matchmaker: "" },
];

const CONDITION_TYPES = ["累积>", "累积>=", "等于"];

const AMOUNT_ITEMS = [
  "资料审核费",
  "推广展示",
  "资料置顶套餐1",
  "资料置顶套餐2",
  "资料置顶套餐3",
  "资料置顶套餐4",
  "资料置顶套餐5",
  "资料置顶套餐6",
  "牵线套餐1",
  "牵线套餐2",
  "牵线套餐3",
  "牵线套餐4",
  "单次牵线服务",
  "爆灯",
  "新人专享",
  "心动专享",
  "臻爱专享",
  "牵线套餐6",
  "牵线套餐7",
  "牵线套餐9",
  "牵线套餐10",
];

export default function Page() {
  const [editing, setEditing] = useState<LevelRow | null>(null);
  const [levelName, setLevelName] = useState("");
  const [conditionType, setConditionType] = useState("累积>");
  const [conditionValue, setConditionValue] = useState("100");
  const [extraAmount, setExtraAmount] = useState("1000.00");
  const [payMethod, setPayMethod] = useState("manual");
  const [mode, setMode] = useState("fixed");
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    AMOUNT_ITEMS.reduce<Record<string, string>>((acc, item) => ({ ...acc, [item]: "0.00" }), {})
  );

  const openEditor = (row: LevelRow) => {
    setEditing(row);
    setLevelName(row.name);
    setExtraAmount(row.extra.replace("元", ""));
    setPayMethod("manual");
    setMode("fixed");
  };

  const closeEditor = () => setEditing(null);

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={breadcrumb} />

      <section className="cd-card">
        <div className="cd-head">
          <h2 className="cd-title">服务红娘分成配置</h2>
        </div>

        <div className="cd-table-wrap">
          <table className="cd-table">
            <colgroup>
              <col style={{ width: 60 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: "auto" }} />
              <col style={{ width: 120 }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>分成级别</th>
                <th>级别名称</th>
                <th>分成模式</th>
                <th>自动升级条件</th>
                <th>平台额外奖励</th>
                <th>当前适用红娘</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((row) => (
                <tr key={row.id}>
                  <td className="cd-td-id">{row.id}</td>
                  <td className="cd-td-strong">{row.code}</td>
                  <td className="cd-td-strong">{row.name}</td>
                  <td className="cd-td-text">{row.mode}</td>
                  <td className="cd-td-text">{row.condition}</td>
                  <td className="cd-td-reward">{row.extra}</td>
                  <td className="cd-td-text">{row.matchmaker || ""}</td>
                  <td>
                    <button type="button" className="cd-link" onClick={() => openEditor(row)}>
                      编辑配置
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <div className="cd-mask" onClick={closeEditor}>
          <div className="cd-panel" onClick={(e) => e.stopPropagation()}>
            <header className="cd-panel-head">
              <button type="button" className="cd-panel-close-icon" onClick={closeEditor} aria-label="关闭">
                <X size={18} />
              </button>
              <h2 className="cd-panel-title">编辑配置</h2>
              <div className="cd-panel-actions">
                <button type="button" className="cd-btn" onClick={closeEditor}>
                  关闭
                </button>
                <button type="button" className="cd-btn primary" onClick={closeEditor}>
                  确定提交
                </button>
              </div>
            </header>

            <div className="cd-panel-body">
              {/* 自定义级别名称 */}
              <div className="cd-field">
                <label className="cd-field-label">
                  <span className="req">*</span>自定义级别名称
                </label>
                <div className="cd-field-body">
                  <input
                    type="text"
                    className="cd-input"
                    value={levelName}
                    onChange={(e) => setLevelName(e.target.value)}
                  />
                  <div className="cd-hint">
                    <span className="cd-hint-icon">i</span>
                    <span>不要超过4个汉字</span>
                  </div>
                </div>
              </div>

              {/* 自动升级条件 */}
              <div className="cd-field">
                <label className="cd-field-label">
                  <span className="req">*</span>自动升级到本级别条件
                </label>
                <div className="cd-field-body">
                  <div className="cd-inline">
                    <div className="cd-select">
                      <select value={conditionType} onChange={(e) => setConditionType(e.target.value)}>
                        {CONDITION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="cd-caret" size={14} />
                    </div>
                    <input
                      type="text"
                      className="cd-input short"
                      value={conditionValue}
                      onChange={(e) => setConditionValue(e.target.value)}
                    />
                    <span className="cd-unit">次牵线成功</span>
                  </div>
                </div>
              </div>

              {/* 平台额外奖励金额 */}
              <div className="cd-field">
                <label className="cd-field-label">
                  <span className="req">*</span>自动升级到本级别平台额外奖励金额
                </label>
                <div className="cd-field-body">
                  <div className="cd-inline">
                    <input
                      type="text"
                      className="cd-input short"
                      value={extraAmount}
                      onChange={(e) => setExtraAmount(e.target.value)}
                    />
                    <span className="cd-unit">元</span>
                  </div>
                  <div className="cd-hint">
                    <span className="cd-hint-icon">i</span>
                    <span>管理员后台手动修改红娘分成级别系统中将不会自动增加该奖励金额</span>
                  </div>
                </div>
              </div>

              {/* 平台额外奖励支付方式 */}
              <div className="cd-field">
                <label className="cd-field-label">
                  <span className="req">*</span>平台额外奖励支付方式
                </label>
                <div className="cd-field-body">
                  <div className="cd-inline">
                    <label className="cd-radio">
                      <input
                        type="radio"
                        name="pay-method"
                        checked={payMethod === "manual"}
                        onChange={() => setPayMethod("manual")}
                      />
                      <span>平台工作人员人工转账支付</span>
                    </label>
                    <label className="cd-radio">
                      <input
                        type="radio"
                        name="pay-method"
                        checked={payMethod === "balance"}
                        onChange={() => setPayMethod("balance")}
                      />
                      <span>直接转入余额</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 分成模式 */}
              <div className="cd-field">
                <label className="cd-field-label">分成模式</label>
                <div className="cd-field-body">
                  <div className="cd-inline">
                    <label className="cd-radio">
                      <input
                        type="radio"
                        name="mode"
                        checked={mode === "fixed"}
                        onChange={() => setMode("fixed")}
                      />
                      <span>自定义固定金额</span>
                    </label>
                    <label className="cd-radio">
                      <input
                        type="radio"
                        name="mode"
                        checked={mode === "rate"}
                        onChange={() => setMode("rate")}
                      />
                      <span>按照比例自动计算</span>
                    </label>
                    <button type="button" className="cd-update-btn">
                      更新数据
                    </button>
                  </div>
                  <div className="cd-hint">
                    <span className="cd-hint-icon">i</span>
                    <span>
                      按照百分比模式下系统自动根据平台收费配置中的数值乘以百分比，四舍五入到元，最小单位为1元，不满1元则为0
                    </span>
                  </div>
                </div>
              </div>

              {/* 分成金额 */}
              <div className="cd-field">
                <label className="cd-field-label">分成金额</label>
                <div className="cd-field-body">
                  <div className="cd-amount-grid">
                    {AMOUNT_ITEMS.map((item) => (
                      <div key={item} className="cd-amount-item">
                        <span className="cd-amount-name">{item}</span>
                        <input
                          type="text"
                          className="cd-amount-input"
                          value={amounts[item]}
                          onChange={(e) => setAmounts((prev) => ({ ...prev, [item]: e.target.value }))}
                        />
                        <span className="cd-amount-unit">元</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
