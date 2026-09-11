"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";
import type { CommissionLevel, CommissionLevelMode, CommissionLevelUpdatePayload } from "@/lib/admin-endpoints";

const breadcrumb = getBreadcrumb("总店红娘", "分成配置");

const CONDITION_TYPES = ["累积>", "累积>=", "等于"];

export default function Page() {
  const [levels, setLevels] = useState<CommissionLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<CommissionLevel | null>(null);
  const [saving, setSaving] = useState(false);
  const [levelName, setLevelName] = useState("");
  const [conditionType, setConditionType] = useState("累积>");
  const [conditionValue, setConditionValue] = useState("100");
  const [extraAmount, setExtraAmount] = useState("1000.00");
  const [payMethod, setPayMethod] = useState("manual");
  const [mode, setMode] = useState<CommissionLevelMode>("fixed");
  const [ratePercent, setRatePercent] = useState("");
  const [fixedAmount, setFixedAmount] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminEndpoints.commissionLevels();
      setLevels(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const openEditor = async (row: CommissionLevel) => {
    setEditing(row);
    setLevelName(row.name);
    setExtraAmount(row.platform_extra_amount ?? "");
    setMode(row.mode);
    setRatePercent(row.rate_percent ?? "");
    setFixedAmount(row.fixed_amount ?? "");
    setConditionType("累积>");
    setConditionValue(row.promotion_condition ?? "");
    setPayMethod(row.platform_extra_pay_mode ?? "manual");
    try {
      const detail = await adminEndpoints.commissionLevel(row.id);
      setLevelName(detail.name);
      setExtraAmount(detail.platform_extra_amount ?? "");
      setMode(detail.mode);
      setRatePercent(detail.rate_percent ?? "");
      setFixedAmount(detail.fixed_amount ?? "");
      setConditionValue(detail.promotion_condition ?? "");
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载详情失败", "error");
    }
  };

  const closeEditor = () => setEditing(null);

  const submit = async () => {
    if (!editing) return;
    if (!levelName.trim()) {
      showConfigToast("请填写级别名称", "error");
      return;
    }
    const body: CommissionLevelUpdatePayload = { name: levelName.trim(), mode };
    if (mode === "fixed") {
      if (!fixedAmount.trim()) {
        showConfigToast("固定金额模式必须填写固定金额", "error");
        return;
      }
      body.fixed_amount = fixedAmount.trim();
      body.rate_percent = "0";
    } else {
      if (!ratePercent.trim()) {
        showConfigToast("按比例模式必须填写比例", "error");
        return;
      }
      body.rate_percent = ratePercent.trim();
      body.fixed_amount = null;
    }
    if (extraAmount.trim()) body.platform_extra_amount = extraAmount.trim();
    body.platform_extra_pay_mode = payMethod as "manual" | "balance";
    const cond = `${conditionType}${conditionValue}`.trim();
    if (cond) body.promotion_condition = cond.length > 255 ? cond.slice(0, 255) : cond;

    setSaving(true);
    try {
      await adminEndpoints.updateCommissionLevel(editing.id, body);
      showConfigToast("已保存");
      setEditing(null);
      void reload();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

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
              {loading && (
                <tr>
                  <td className="cd-td-text" colSpan={8}>加载中…</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td className="cd-td-text" colSpan={8}>{error}</td>
                </tr>
              )}
              {!loading && !error && levels.length === 0 && (
                <tr>
                  <td className="cd-td-text" colSpan={8}>暂无数据</td>
                </tr>
              )}
              {!loading &&
                !error &&
                levels.map((row) => (
                  <tr key={row.id}>
                    <td className="cd-td-id">{row.id}</td>
                    <td className="cd-td-strong">{row.code}</td>
                    <td className="cd-td-strong">{row.name}</td>
                    <td className="cd-td-text">
                      {row.mode === "rate"
                        ? `按比例 ${row.rate_percent}%`
                        : `固定金额 ¥${row.fixed_amount ?? "0"}`}
                    </td>
                    <td className="cd-td-text">{row.promotion_condition || "-"}</td>
                    <td className="cd-td-reward">¥{row.platform_extra_amount ?? "0"}</td>
                    <td className="cd-td-text">{row.applicable_matchmaker_count} 人</td>
                    <td>
                      <button type="button" className="cd-link" onClick={() => void openEditor(row)}>
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
                <button type="button" className="cd-btn" onClick={closeEditor} disabled={saving}>
                  关闭
                </button>
                <button type="button" className="cd-btn primary" onClick={() => void submit()} disabled={saving}>
                  {saving ? "提交中…" : "确定提交"}
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

              {/* 分成金额（按模式互斥显示） */}
              <div className="cd-field">
                <label className="cd-field-label">分成金额</label>
                <div className="cd-field-body">
                  <div className="cd-inline">
                    {mode === "rate" ? (
                      <>
                        <input
                          type="text"
                          className="cd-input short"
                          value={ratePercent}
                          placeholder="0-100"
                          onChange={(e) => setRatePercent(e.target.value)}
                        />
                        <span className="cd-unit">%</span>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          className="cd-input short"
                          value={fixedAmount}
                          placeholder="0.00"
                          onChange={(e) => setFixedAmount(e.target.value)}
                        />
                        <span className="cd-unit">元</span>
                      </>
                    )}
                  </div>
                  <div className="cd-hint">
                    <span className="cd-hint-icon">i</span>
                    <span>
                      {mode === "rate"
                        ? "按比例模式：按平台收费配置数值乘以百分比计算，固定金额会被置为 0"
                        : "固定金额模式：必须填写固定金额，按比例会被置为 0"}
                    </span>
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
