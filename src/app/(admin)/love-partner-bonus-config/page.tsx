"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { PartnerBonusItem, PartnerLevelId, PartnerLevelItem } from "@/lib/admin-endpoints";
import { readPlatformConfig, savePlatformConfig, showConfigToast, type Dict } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("合伙红娘", "分成配置");

// 「更新数据」按比例写入的后端配置域（levels 按合伙级别 level_id 逐条保存）
const BONUS_DOMAIN = "tools_partner_bonus";

const columns = ["ID", "分成级别", "级别名称", "分成模式", "合伙人数量", "自动升级条件", "操作"];

// 「分成金额」网格的默认事件清单（与设计稿一致）；配置域有值时以服务端为准。
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

const SPLIT_MODES = ["自定义固定金额", "按比例自动计算"] as const;
const CONSUME_MODES = ["不分成", "给予分成"] as const;

const splitModeLabel = (mode: string) => (mode === "auto_rate" ? SPLIT_MODES[1] : SPLIT_MODES[0]);
const consumeModeLabel = (mode: string) => (mode === "auto_rate" ? CONSUME_MODES[1] : CONSUME_MODES[0]);

export default function LovePartnerBonusConfigPage() {
  const [rows, setRows] = useState<PartnerLevelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<PartnerLevelItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminEndpoints.partnerLevelList();
      setRows(result.items);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

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
              {rows.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{`级别${l.level_id}`}</td>
                  <td>{l.level_name}</td>
                  <td>{l.auto_split_mode_label}</td>
                  <td>{l.partner_count}</td>
                  <td>{l.promote_condition_text}</td>
                  <td><a className="finord-link" onClick={() => setEditing(l)}>编排配置</a></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center", color: "#999" }}>
                    {loading ? "加载中…" : "暂无数据"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {message && <p style={{ color: "#ff4d4f", marginTop: 12 }}>{message}</p>}
      </div>

      {editing && (
        <EditBonusDrawer
          level={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); void load(); }}
        />
      )}
    </div>
  );
}

function EditBonusDrawer({ level, onClose, onSaved }: {
  level: PartnerLevelItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [levelName, setLevelName] = useState(level.level_name);
  const [rewardMale, setRewardMale] = useState(level.register_reward_male);
  const [rewardFemale, setRewardFemale] = useState(level.register_reward_female);
  const [joinReward, setJoinReward] = useState(level.promoter_join_reward);
  const [consumeMode, setConsumeMode] = useState<string>(consumeModeLabel(level.consume_commission_mode));
  const [splitMode, setSplitMode] = useState<string>(splitModeLabel(level.auto_split_mode));
  const [splitRate, setSplitRate] = useState(level.auto_split_rate ? String(Number(level.auto_split_rate)) : "35");
  const [amounts, setAmounts] = useState<Record<string, string>>(() => {
    const stored = new Map((level.bonus_items ?? []).map((item) => [item.name, item.amount]));
    const result: Record<string, string> = {};
    BONUS_ITEMS.forEach((item) => { result[item.name] = stored.get(item.name) ?? item.base; });
    return result;
  });
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const isRatio = splitMode === SPLIT_MODES[1];

  // 「更新数据」：以固定基数（平台收费配置金额）× 比例计算，结果可重复计算（幂等）；
  // 同时把该级别的比例与金额写入配置域 tools_partner_bonus。
  const applyRatio = async () => {
    const rate = Number(splitRate);
    if (!splitRate.trim() || !Number.isFinite(rate) || rate < 0 || rate > 100) {
      setMessage("请输入 0-100 之间的比例数值");
      return;
    }
    const next: Record<string, string> = {};
    BONUS_ITEMS.forEach((item) => {
      next[item.name] = String(Math.round((Number(item.base) * rate) / 100));
    });
    const bonusItems: PartnerBonusItem[] = BONUS_ITEMS.map((item) => ({ name: item.name, amount: next[item.name] }));
    setUpdating(true);
    setMessage("");
    try {
      const snapshot = await readPlatformConfig<Dict>(BONUS_DOMAIN);
      const config = snapshot.config ?? {};
      const others = (Array.isArray(config.levels) ? (config.levels as Dict[]) : [])
        .filter((item) => item.level_id !== level.level_id);
      await savePlatformConfig(
        BONUS_DOMAIN,
        snapshot.version,
        {
          ...config,
          levels: [...others, { level_id: level.level_id, mode: "ratio", ratio: rate, bonus_items: bonusItems }],
        },
        `${level.level_name}分成配置按比例 ${rate}% 更新数据`,
      );
      setAmounts(next);
      showConfigToast("分成金额已按比例更新");
    } catch (error) {
      const text = error instanceof Error ? error.message : "更新数据失败";
      setMessage(text);
      showConfigToast(text, "error");
    } finally {
      setUpdating(false);
    }
  };

  const submit = async () => {
    setSaving(true);
    setMessage("");
    try {
      const bonusItems: PartnerBonusItem[] = BONUS_ITEMS.map((item) => ({
        name: item.name,
        amount: String(amounts[item.name] ?? item.base),
      }));
      await adminEndpoints.updatePartnerLevel(level.level_id as PartnerLevelId, {
        level_name: levelName,
        auto_split_mode: splitMode === SPLIT_MODES[1] ? "auto_rate" : "fixed_amount",
        auto_split_rate: splitMode === SPLIT_MODES[1] ? splitRate : undefined,
        register_reward_male: rewardMale,
        register_reward_female: rewardFemale,
        promoter_join_reward: joinReward,
        consume_commission_mode: consumeMode === CONSUME_MODES[1] ? "auto_rate" : "none",
        consume_commission_rate: consumeMode === CONSUME_MODES[1] ? (level.consume_commission_rate ?? splitRate) : undefined,
        bonus_items: bonusItems,
      });
      showConfigToast("分成配置已保存");
      onSaved();
    } catch (error) {
      const text = error instanceof Error ? error.message : "保存失败";
      setMessage(text);
      showConfigToast(text, "error");
    } finally {
      setSaving(false);
    }
  };

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
            <button className="finord-btn finord-btn-primary" disabled={saving} onClick={() => void submit()}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 分成级别名称 */}
          <div className="lpb-row">
            <span className="lpb-label">＊分成级别名称</span>
            <div className="lpb-content">
              <input className="lpb-input-wide" value={levelName} onChange={(e) => setLevelName(e.target.value)} maxLength={32} />
              <div className="lpb-info">① 不要超过4个汉字</div>
            </div>
          </div>

          {/* 会员注册奖励 */}
          <div className="lpb-row">
            <span className="lpb-label">＊会员注册奖励</span>
            <div className="lpb-content">
              <div className="lpb-fee-row">
                <span>男会员</span>
                <input className="lpb-num" value={rewardMale} onChange={(e) => setRewardMale(e.target.value)} />
                <span className="lpb-unit">元/人</span>
                <span>女会员</span>
                <input className="lpb-num" value={rewardFemale} onChange={(e) => setRewardFemale(e.target.value)} />
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
                <input className="lpb-num" value={joinReward} onChange={(e) => setJoinReward(e.target.value)} />
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
                {CONSUME_MODES.map((o) => (
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
                {SPLIT_MODES.map((o) => (
                  <label key={o} className={`lpb-radio ${splitMode === o ? "active" : ""}`}>
                    <input type="radio" name="splitMode" value={o} checked={splitMode === o} onChange={() => setSplitMode(o)} />
                    <span>{o}</span>
                  </label>
                ))}
                <input
                  className="lpb-num"
                  value={splitRate}
                  disabled={!isRatio}
                  onChange={(e) => setSplitRate(e.target.value)}
                />
                <span className="lpb-unit">%</span>
                <button
                  type="button"
                  className="finord-btn finord-btn-primary lpb-update-btn"
                  disabled={!isRatio || updating}
                  title={isRatio ? undefined : "切换为「按比例自动计算」后可更新数据"}
                  onClick={() => void applyRatio()}
                >
                  {updating ? "更新中…" : "更新数据"}
                </button>
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
                    <input
                      className="lpb-num"
                      value={amounts[b.name] ?? b.base}
                      disabled={isRatio}
                      onChange={(e) => setAmounts((prev) => ({ ...prev, [b.name]: e.target.value }))}
                    />
                    <span className="lpb-unit">元</span>
                  </div>
                ))}
              </div>
              <div className="lpb-info lpb-info-block">① 修改比例后下次开方可查看金额变化</div>
            </div>
          </div>

          {message && <p style={{ color: "#ff4d4f" }}>{message}</p>}
        </div>
      </div>
    </>
  );
}
