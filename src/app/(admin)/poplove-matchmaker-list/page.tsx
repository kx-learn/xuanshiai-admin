"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  FileSpreadsheet,
  Images,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("推广红娘", "红娘管理");

const stats: { value: string; unit: string; label: string; bar: string }[] = [
  { value: "7", unit: "人", label: "兼职推广红娘", bar: "linear-gradient(90deg,#ff6b81,#ff9a76)" },
  { value: "0", unit: "人", label: "全职推广红娘", bar: "linear-gradient(90deg,#ffa940,#ffc069)" },
  { value: "14", unit: "人", label: "共引流注册会员", bar: "linear-gradient(90deg,#a0d911,#d3f261)" },
  { value: "0", unit: "人", label: "本月引流注册会员", bar: "linear-gradient(90deg,#36cfc9,#87e8de)" },
  { value: "0", unit: "人", label: "上月引流注册会员", bar: "linear-gradient(90deg,#40a9ff,#91d5ff)" },
  { value: "9", unit: "人", label: "共录入客源线索", bar: "linear-gradient(90deg,#597ef7,#85a5ff)" },
  { value: "0", unit: "人", label: "本月录入客源线索", bar: "linear-gradient(90deg,#9254de,#b37feb)" },
  { value: "2", unit: "人", label: "上月录入客源线索", bar: "linear-gradient(90deg,#ff7a45,#ffa940)" },
];

type Row = {
  id: number;
  name: string;
  account: string;
  team: string;
  level: string;
  joined: string;
  memberTotal: number;
  memberMonth: number;
  leadTotal: number;
  leadMonth: number;
  visible: boolean;
  palette: string;
};

const rows: Row[] = [
  { id: 13, name: "越可名", account: "越可名", team: "宣爱壹1", level: "初级", joined: "2026-06-30 19:14:43", memberTotal: 1, memberMonth: 0, leadTotal: 0, leadMonth: 0, visible: true, palette: "a" },
  { id: 12, name: "Sofia", account: "Sofia", team: "宣爱壹1", level: "初级", joined: "2026-06-30 15:36:59", memberTotal: 2, memberMonth: 0, leadTotal: 0, leadMonth: 0, visible: true, palette: "b" },
  { id: 10, name: "是静香本人没怪", account: "是静香本人没怪", team: "宣爱壹1", level: "初级", joined: "2026-06-30 11:56:54", memberTotal: 3, memberMonth: 0, leadTotal: 0, leadMonth: 0, visible: true, palette: "c" },
];

export default function PoploveMatchmakerListPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [teamRow, setTeamRow] = useState<Row | null>(null);
  const [visibleMap, setVisibleMap] = useState<Record<number, boolean>>(() =>
    rows.reduce<Record<number, boolean>>((acc, row) => ({ ...acc, [row.id]: row.visible }), {}),
  );

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={breadcrumb} />

      {/* 须知 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>
              推广红娘是一种专门为平台发展相亲会员的「推广员」身份，只要身边有单身资源的人都可以无门槛成为平台中的「推广红娘」。
            </p>
            <p>
              每个推广红娘拥有专属的链接、二维码、海报，用户在其推广链接下进入平台注册成为会员后即归属在其名下，会员的分佣资料审核通过（成为有效会员）即可获得会员注册奖励，其名下的会员在日后的线上消费均可按比例获得分成。
            </p>
            <p>
              推广红娘根据其累计发展的会员数量划分为四个分成级别，每个级别可以自定义不同的会员注册奖励标准、是否享有会员消费分成，以及详细的分成标准。
            </p>
            <p>
              每个推广红娘都拥有自己独立的红娘管理后台，能够清清楚楚的看到自己发展的会员清单、审核状态、奖励明细、分成标准，以及各类数据统计报表等。
            </p>
            <p>
              推广红娘的提成收入是统一计入到平台的余额账户中，可用于支付在平台中任何消费，也可以随时进行提现，实时自动支付到其微信零钱账户。
            </p>
            <p>通过推广红娘的链接注册的会员默认分散到服务红娘里，如果服务红娘配置进行分派。</p>
            <p>推广红娘与服务红娘身份互斥，状态为展示的推广红娘会按有效会员数前10位进行排序显示在红娘列表中。</p>
            <p>
              推广红娘分为兼职和全职两种类型，全职类型推广红娘为婚恋公司内部专职招客引流人员，全职推广红娘请注意使用PC版进行办公，登录入口：
              <button type="button" className="pml-notice-link">点击打开</button>
            </p>
          </div>
        </div>
      </div>

      {/* 统计卡 */}
      <div className="pml-stats">
        {stats.map((s) => (
          <div className="pml-stat" key={s.label}>
            <span className="pml-stat-bar" style={{ background: s.bar }} />
            <div className="pml-stat-value">
              {s.value}
              <em>{s.unit}</em>
            </div>
            <div className="pml-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="finord-card pml-card">
        <div className="pml-head">
          <h2 className="pml-title">红娘管理</h2>
          <div className="pml-head-actions">
            <button type="button" className="finord-btn finord-btn-primary pml-add-btn" onClick={() => setAddOpen(true)}>
              <Plus size={14} />
              添加推广红娘
            </button>
            <button type="button" className="finord-btn finord-btn-primary pml-export-btn">
              <FileSpreadsheet size={14} />
              导出EXCEL
            </button>
            <button type="button" className="pml-tutorial">
              <Images size={14} />
              图文解说推广红娘
            </button>
          </div>
        </div>

        <div className="pml-filters">
          <div className="pml-select">
            <select defaultValue="不限">
              <option value="不限">按团队：不限</option>
            </select>
            <ChevronDown className="pml-caret" size={14} />
          </div>
          <div className="pml-select">
            <select defaultValue="不限">
              <option value="不限">分成级别：不限</option>
            </select>
            <ChevronDown className="pml-caret" size={14} />
          </div>
          <div className="pml-search-group">
            <span className="pml-search-prefix">按账号搜</span>
            <input className="pml-input" placeholder="请输入" />
          </div>
          <button type="button" className="finord-btn finord-btn-primary pml-search-btn">
            搜索
          </button>
          <button type="button" className="pml-sort">
            <RotateCcw size={13} />
            按加入时间排序(默认)
          </button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table pml-table">
            <colgroup>
              <col style={{ width: 54 }} />
              <col style={{ width: 210 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 96 }} />
              <col style={{ width: 170 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: "auto" }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>推广红娘</th>
                <th>隶属团队</th>
                <th>分成级别</th>
                <th>加入时间</th>
                <th>名下会员</th>
                <th>录入客源线索</th>
                <th>开单明细</th>
                <th>是否展示</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="pml-td-id">{row.id}</td>
                  <td>
                    <div className="pml-member">
                      <span className={`pml-avatar pml-g-${row.palette}`} />
                      <div className="pml-member-info">
                        <div className="pml-line">
                          <span className="pml-k">称呼：</span>
                          {row.name}
                        </div>
                        <div className="pml-line">
                          <span className="pml-k">账号：</span>
                          {row.account}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="pml-team">
                      <span>{row.team}</span>
                      <button type="button" className="pml-team-btn" onClick={() => setTeamRow(row)}>
                        变更团队
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="pml-level">{row.level}</span>
                  </td>
                  <td className="pml-td-time">{row.joined}</td>
                  <td>
                    <div className="pml-cell-lines">
                      <div className="pml-cell-line">
                        <span className="pml-k">共{row.memberTotal}人</span>
                        <span className="pml-k">本月{row.memberMonth}人</span>
                      </div>
                      <div className="pml-cell-links">
                        <button type="button" className="pml-mini-btn">明细</button>
                        <button type="button" className="pml-mini-btn">报表</button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="pml-cell-lines">
                      <div className="pml-cell-line">
                        <span className="pml-k">共{row.leadTotal}条</span>
                        <span className="pml-k">本月{row.leadMonth}条</span>
                      </div>
                      <div className="pml-cell-links">
                        <button type="button" className="pml-mini-btn">明细</button>
                        <button type="button" className="pml-mini-btn">报表</button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button type="button" className="pml-link">线上分成</button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`pml-switch ${visibleMap[row.id] ? "on" : ""}`}
                      onClick={() => setVisibleMap((prev) => ({ ...prev, [row.id]: !prev[row.id] }))}
                      aria-label="是否展示"
                    >
                      <span className="pml-switch-knob" />
                    </button>
                  </td>
                  <td>
                    <div className="pml-actions">
                      <button type="button" className="pml-link">红娘平台</button>
                      <button type="button" className="pml-link">推广海报</button>
                      <button type="button" className="pml-link">编辑</button>
                      <button type="button" className="pml-link danger">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && <AddPromoterDrawer onClose={() => setAddOpen(false)} />}
      {teamRow && <ChangeTeamDrawer onClose={() => setTeamRow(null)} />}
    </div>
  );
}

function AddPromoterDrawer({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("兼职");
  const [level, setLevel] = useState(1);
  const [customSlogan, setCustomSlogan] = useState(false);
  const [leadView, setLeadView] = useState("不允许");
  const [leadWrite, setLeadWrite] = useState("不允许");
  const [crmView, setCrmView] = useState("不允许");

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel pml-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭">
              <X size={18} />
            </button>
            <span className="tlc-panel-title">添加/编辑推广红娘</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={onClose}>
              关闭
            </button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 红娘类型 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>红娘类型
            </span>
            <div className="bm-content">
              <div className="pml-radio-row">
                {["兼职", "全职"].map((o) => (
                  <label key={o} className="pml-radio">
                    <input type="radio" name="pml-type" checked={type === o} onChange={() => setType(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 账号绑定 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>账号绑定
            </span>
            <div className="bm-content">
              <input className="bm-input-wide" placeholder="请输入账号昵称" />
              <div className="bm-info">必须是网站已注册用户且绑定了微信，且非服务红娘</div>
            </div>
          </div>

          {/* 红娘称呼 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>红娘称呼
            </span>
            <div className="bm-content">
              <input className="bm-input-wide" placeholder="请输入红娘称呼" />
            </div>
          </div>

          {/* 红娘口号 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>红娘口号
            </span>
            <div className="bm-content">
              <div className="hm-slogan-row">
                <select className="bm-select bm-select-wide" defaultValue="">
                  <option value="">请选择</option>
                </select>
                <label className="hm-check">
                  <input
                    type="checkbox"
                    checked={customSlogan}
                    onChange={() => setCustomSlogan(!customSlogan)}
                  />
                  <span>自定义输入</span>
                </label>
              </div>
            </div>
          </div>

          {/* 分成级别 */}
          <div className="bm-row">
            <span className="bm-label">分成级别</span>
            <div className="bm-content">
              <div className="pml-level-radios">
                {[
                  { id: 1, name: "初级" },
                  { id: 2, name: "推广大师" },
                  { id: 3, name: "推广大使" },
                  { id: 4, name: "推广大使" },
                ].map((item) => (
                  <label key={item.id} className="pml-radio">
                    <input
                      type="radio"
                      name="pml-level"
                      checked={level === item.id}
                      onChange={() => setLevel(item.id)}
                    />
                    <span>
                      级别：{item.id}（{item.name}）
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 查看客源线索跟进记录 */}
          <div className="bm-row">
            <span className="bm-label">查看客源线索跟进记录</span>
            <div className="bm-content">
              <div className="pml-radio-row">
                {["允许", "不允许"].map((o) => (
                  <label key={o} className="pml-radio">
                    <input type="radio" name="pml-lead-view" checked={leadView === o} onChange={() => setLeadView(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 客源线索中写跟进 */}
          <div className="bm-row">
            <span className="bm-label">客源线索中写跟进</span>
            <div className="bm-content">
              <div className="pml-radio-row">
                {["允许", "不允许"].map((o) => (
                  <label key={o} className="pml-radio">
                    <input type="radio" name="pml-lead-write" checked={leadWrite === o} onChange={() => setLeadWrite(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 查看会员CRM跟进记录 */}
          <div className="bm-row">
            <span className="bm-label">查看会员CRM跟进记录</span>
            <div className="bm-content">
              <div className="pml-radio-row">
                {["允许", "不允许"].map((o) => (
                  <label key={o} className="pml-radio">
                    <input type="radio" name="pml-crm-view" checked={crmView === o} onChange={() => setCrmView(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ChangeTeamDrawer({ onClose }: { onClose: () => void }) {
  const [team, setTeam] = useState("");

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel pml-team-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭">
              <X size={18} />
            </button>
            <span className="tlc-panel-title">变更团队</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={onClose}>
              关闭
            </button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="pml-team-tip">
            <i className="pml-team-tip-icon">i</i>
            <span>
              本操作会将其从原有团队中移除并绑定到您新的指定团队中，变更或移出团队后该推广红娘在原有团队中的产生的业绩和有效会员数据依然保留在原有团队，并自动解除与原有名下会员的关联性
            </span>
          </div>

          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>合伙团队
            </span>
            <div className="bm-content">
              <select className="bm-select bm-select-wide" value={team} onChange={(e) => setTeam(e.target.value)}>
                <option value="">请选择合伙团队</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
