"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";
import type {
  PromoterLevelItem,
  PromoterLevelUpdatePayload,
} from "@/lib/admin-endpoints";

const breadcrumb = getBreadcrumb("推广红娘", "分成配置");

export default function PoploveMatchmakerDistributionPage() {
  const [levels, setLevels] = useState<PromoterLevelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<PromoterLevelItem | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminEndpoints.promoterLevelList();
      setLevels(res.items ?? []);
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

  const openEditor = async (row: PromoterLevelItem) => {
    setEditing(row);
    try {
      const detail = await adminEndpoints.promoterLevel(row.level_id);
      setEditing(detail);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载详情失败", "error");
    }
  };

  const closeEditor = () => setEditing(null);

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
              {loading && (
                <tr>
                  <td className="pd-td-id" colSpan={7}>加载中…</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td className="pd-td-id" colSpan={7}>{error}</td>
                </tr>
              )}
              {!loading && !error && levels.length === 0 && (
                <tr>
                  <td className="pd-td-id" colSpan={7}>暂无数据</td>
                </tr>
              )}
              {!loading &&
                !error &&
                levels.map((row) => (
                  <tr key={row.id}>
                    <td className="pd-td-id">{row.level_id}</td>
                    <td className="pd-td-text">{row.level_name}</td>
                    <td className="pd-td-strong">{row.level_name}</td>
                    <td className="pd-td-text">{row.auto_split_mode_label}</td>
                    <td className="pd-td-text">{row.matchmaker_count}</td>
                    <td className="pd-td-text">{row.promote_threshold_text}</td>
                    <td>
                      <button type="button" className="pd-link" onClick={() => void openEditor(row)}>
                        编辑配置
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <EditDrawer row={editing} onClose={closeEditor} onSaved={() => { setEditing(null); void reload(); }} />}
    </div>
  );
}

function EditDrawer({
  row,
  onClose,
  onSaved,
}: {
  row: PromoterLevelItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [levelName, setLevelName] = useState(row.level_name);
  const [operator, setOperator] = useState("累积>");
  const [threshold, setThreshold] = useState(row.promote_threshold != null ? String(row.promote_threshold) : "0");
  const [rewardMale, setRewardMale] = useState(row.register_reward_male ?? "0.00");
  const [rewardFemale, setRewardFemale] = useState(row.register_reward_female ?? "0.00");
  const [consumeMode, setConsumeMode] = useState<"none" | "auto_rate">(row.consume_commission_mode);
  const [consumeRate, setConsumeRate] = useState(row.consume_commission_rate ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLevelName(row.level_name);
    setThreshold(row.promote_threshold != null ? String(row.promote_threshold) : "0");
    setRewardMale(row.register_reward_male ?? "0.00");
    setRewardFemale(row.register_reward_female ?? "0.00");
    setConsumeMode(row.consume_commission_mode);
    setConsumeRate(row.consume_commission_rate ?? "");
  }, [row]);

  const submit = async () => {
    if (consumeMode === "auto_rate" && !consumeRate.trim()) {
      showConfigToast("会员消费分成选择“给予分成”时必须填写分成比例", "error");
      return;
    }
    const body: PromoterLevelUpdatePayload = {
      promote_threshold: threshold.trim() ? Number(threshold.trim()) : null,
      register_reward_male: rewardMale.trim() || null,
      register_reward_female: rewardFemale.trim() || null,
      consume_commission_mode: consumeMode,
      consume_commission_rate: consumeMode === "auto_rate" ? consumeRate.trim() : null,
    };
    setSaving(true);
    try {
      await adminEndpoints.updatePromoterLevel(row.level_id, body);
      showConfigToast("已保存");
      onSaved();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

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
            <button className="pd-btn" onClick={onClose} disabled={saving}>
              关闭
            </button>
            <button className="pd-btn primary" onClick={() => void submit()} disabled={saving}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>

        <div className="pd-panel-body">
          {/* 分成级别名称（后端不可修改，仅展示） */}
          <div className="pd-field">
            <span className="pd-field-label">
              <b className="req">*</b>分成级别名称
            </span>
            <div className="pd-field-body">
              <input
                className="pd-input"
                value={levelName}
                readOnly
                onChange={(e) => setLevelName(e.target.value)}
                placeholder="请输入"
              />
              <div className="pd-hint">
                <i className="pd-hint-icon">i</i>
                不要超过4个汉字（该名称由系统固定，不可修改）
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
                    checked={consumeMode === "auto_rate"}
                    onChange={() => setConsumeMode("auto_rate")}
                  />
                  <span>给予分成</span>
                </label>
                {consumeMode === "auto_rate" && (
                  <>
                    <input
                      className="pd-input short"
                      value={consumeRate}
                      onChange={(e) => setConsumeRate(e.target.value)}
                      placeholder="比例"
                    />
                    <span className="pd-unit">%</span>
                  </>
                )}
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
