"use client";

import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Download,
  Inbox,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

type StatCard = { value: string; label: string; color: string };
const statCards: StatCard[] = [
  { value: "全部", label: "门店", color: "#fa8c16" },
  { value: "0位", label: "线下VIP", color: "#13c2c2" },
  { value: "0位", label: "服务中", color: "#52c41a" },
  { value: "0位", label: "即将到期", color: "#8c8c8c" },
  { value: "0位", label: "服务到期", color: "#3658f7" },
  { value: "0位", label: "有偿费", color: "#52c41a" },
  { value: "0位", label: "总计安排见面", color: "#722ed1" },
  { value: "0位", label: "本月已安排", color: "#13c2c2" },
  { value: "0位", label: "有退费风险", color: "#13c2c2" },
  { value: "0位", label: "已退费", color: "#ff4d4f" },
];

const statusTabs = [
  { key: "all", label: "全部" },
  { key: "matching", label: "匹配推荐中" },
  { key: "dating", label: "约会进行中" },
  { key: "deep", label: "深度接触" },
  { key: "inLove", label: "已经恋爱" },
  { key: "metParents", label: "已见父母" },
  { key: "paused", label: "暂停服务" },
  { key: "breakup", label: "恋爱分手" },
  { key: "married", label: "已经领证" },
];

const columns = [
  { title: "ID", width: 70 },
  { title: "会员", width: 160 },
  { title: "签约日期", width: 110 },
  { title: "服务套餐", width: 120 },
  { title: "服务进度", width: 120 },
  { title: "最近跟进", width: 130 },
  { title: "合同金额", width: 100 },
  { title: "红娘", width: 90 },
  { title: "电子合同", width: 100 },
  { title: "备注信息", width: 140 },
];

export default function LoveUserVipUnderlinePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [promiseCount, setPromiseCount] = useState("0");
  const [successCount, setSuccessCount] = useState("0");
  const [remark, setRemark] = useState("");

  const openCreate = () => {
    setEditing(false);
    setDrawerOpen(true);
  };

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={getBreadcrumb("会员CRM", "线下VIP")} />

      <section className="lvip-card">
        <div className="lvip-head">
          <div className="lvip-tabs">
            <button type="button" className="lvip-tab active">
              线下VIP
            </button>
            <button type="button" className="lvip-tab">
              约会管理
            </button>
            <button type="button" className="lvip-tab">
              合同管理
            </button>
          </div>
          <div className="lvip-tools">
            <button type="button" className="lvip-btn primary" onClick={openCreate}>
              <Plus className="size-3.5" />
              添加线下VIP会员
            </button>
            <button type="button" className="lvip-btn primary">
              <BarChart3 className="size-3.5" />
              业绩报表
            </button>
            <button type="button" className="lvip-btn primary">
              <Download className="size-3.5" />
              导出EXCEL
            </button>
          </div>
        </div>

        <div className="lvip-notice">
          <div className="lvip-notice-title">
            <span className="lvip-notice-icon">!</span>
            须知
          </div>
          <p>
            线下VIP会员是指您在线下门店付费签约的1对1客户，在这里，您可以为每位签约客户制定可视化的服务计划，让进度一目了然，助您高效、规范地完成服务，打造卓越的客户体验。
          </p>
          <p>
            <b>集中管理：</b>将所有线下VIP客户信息统一归档，高效维护。　
            <b>计划服务：</b>为每位客户制定专属的、可执行的服务计划。　
            <b>流程可视化：</b>实时跟踪服务进度，让管理更直观、更规范。
          </p>
          <p>
            每条VIP信息可多次发起合同，在“财务管理-电子合同-合同管理”中可见您发起的合同内容和状态。
          </p>
        </div>

        <div className="lvip-stats">
          {statCards.map((card) => (
            <div key={card.label} className="lvip-stat">
              <span className="lvip-stat-bar" style={{ background: card.color }} />
              <div className="lvip-stat-value">{card.value}</div>
              <div className="lvip-stat-label">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="lvip-subtabs">
          <div className="lvip-subtabs-list">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`lvip-subtab ${activeTab === tab.key ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button type="button" className="lvip-subtabs-set" aria-label="设置">
            <Settings className="size-4" />
          </button>
        </div>
        <div className="lvip-subtabs-line" />

        <div className="lvip-filters">
          <label className="lvip-select">
            <select defaultValue="">
              <option value="">全部服务红娘</option>
            </select>
            <span className="lvip-caret" />
          </label>
          <label className="lvip-select">
            <select defaultValue="">
              <option value="">全部销售红娘</option>
            </select>
            <span className="lvip-caret" />
          </label>
          <label className="lvip-select">
            <select defaultValue="">
              <option value="">推广红娘</option>
            </select>
            <span className="lvip-caret" />
          </label>
          <div className="lvip-daterange">
            <label className="lvip-date">
              <input type="text" placeholder="签单开始" readOnly />
              <CalendarDays className="size-3.5" />
            </label>
            <span className="lvip-arrow">→</span>
            <label className="lvip-date">
              <input type="text" placeholder="签单结束" readOnly />
              <CalendarDays className="size-3.5" />
            </label>
          </div>
          <div className="lvip-searchbox">
            <span className="lvip-search-label">按昵称搜</span>
            <input type="text" placeholder="请输入" />
          </div>
          <button type="button" className="lvip-btn primary">
            <Search className="size-3.5" />
            搜索
          </button>
        </div>

        <div className="lvip-table-wrap">
          <table className="lvip-table">
            <colgroup>
              {columns.map((col) => (
                <col key={col.title} style={{ width: col.width }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.title}>{col.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length}>
                  <div className="lvip-empty">
                    <Inbox className="lvip-empty-icon" strokeWidth={1.2} />
                    <span>暂无数据</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {drawerOpen && (
        <div className="lvip-mask" onClick={() => setDrawerOpen(false)}>
          <div
            className="lvip-panel"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lvip-panel-head">
              <div className="flex items-center gap-2">
                <span className="lvip-panel-x" onClick={() => setDrawerOpen(false)}>
                  ✕
                </span>
                <h2>{editing ? "编辑线下VIP会员服务信息" : "添加线下VIP会员服务信息"}</h2>
              </div>
              <div className="lvip-panel-actions">
                <button
                  type="button"
                  className="lvip-panel-cancel"
                  onClick={() => setDrawerOpen(false)}
                >
                  关闭
                </button>
                <button type="button" className="lvip-panel-submit">
                  确定提交
                </button>
              </div>
            </div>
            <div className="lvip-panel-body">
              <div className="lvip-drawer-notice">
                <span className="lvip-drawer-notice-icon">!</span>
                超级红娘可以从平台所有会员中录入和管理线下VIP信息，普通红娘仅能录入和管理自己名下会员
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>会员账号
                </div>
                <div className="lvip-field-control">
                  <input
                    className="lvip-input"
                    placeholder="请输入昵称/手机/姓名/编号"
                  />
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>销售红娘
                </div>
                <div className="lvip-field-control">
                  <label className="lvip-select block">
                    <select defaultValue="">
                      <option value="" />
                    </select>
                    <span className="lvip-caret" />
                  </label>
                </div>
              </div>

              <div className="lvip-inline-notice">
                <span className="lvip-inline-icon">i</span>
                销售业绩将计入到此所选择的销售红娘名下
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>服务红娘
                </div>
                <div className="lvip-field-control">
                  <label className="lvip-select block">
                    <select defaultValue="">
                      <option value="" />
                    </select>
                    <span className="lvip-caret" />
                  </label>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>签约日期
                </div>
                <div className="lvip-field-control">
                  <label className="lvip-date block">
                    <input type="text" placeholder="请选择签约日期" readOnly />
                    <CalendarDays className="size-3.5" />
                  </label>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>服务时间
                </div>
                <div className="lvip-field-control">
                  <div className="lvip-daterange grow">
                    <label className="lvip-date">
                      <input type="text" placeholder="开始日期" readOnly />
                      <CalendarDays className="size-3.5" />
                    </label>
                    <span className="lvip-arrow">→</span>
                    <label className="lvip-date">
                      <input type="text" placeholder="结束日期" readOnly />
                      <CalendarDays className="size-3.5" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>套餐类型
                </div>
                <div className="lvip-field-control">
                  <label className="lvip-select block">
                    <select defaultValue="">
                      <option value="" />
                    </select>
                    <span className="lvip-caret" />
                  </label>
                  <button type="button" className="lvip-link">
                    套餐管理
                  </button>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">合同金额</div>
                <div className="lvip-field-control">
                  <div className="lvip-input-with-unit">
                    <input className="lvip-input" />
                    <span className="lvip-unit">元</span>
                  </div>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">承诺约见人数</div>
                <div className="lvip-field-control">
                  <div className="lvip-input-with-unit">
                    <input
                      className="lvip-input"
                      value={promiseCount}
                      onChange={(event) => setPromiseCount(event.target.value)}
                    />
                    <span className="lvip-unit">人</span>
                  </div>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">已成功约见</div>
                <div className="lvip-field-control">
                  <div className="lvip-input-with-unit">
                    <input
                      className="lvip-input"
                      value={successCount}
                      onChange={(event) => setSuccessCount(event.target.value)}
                    />
                    <span className="lvip-unit">人</span>
                  </div>
                </div>
              </div>

              <div className="lvip-hint">
                <p>1、约会状态为“已见面”，才会被计入到“成功见面”的次数中</p>
                <p>
                  2、您可以在这里直接修改该客户“成功见面”的次数，修改提交后系统中将直接以该数字为准
                </p>
                <p>3、修改本数字之后，后续将在本数字基础上累加计算“成功见面”次数</p>
                <p>4、每次人工修改“成功约见次数”均会生成记录</p>
              </div>

              <div className="lvip-field top">
                <div className="lvip-field-label">备注信息</div>
                <div className="lvip-field-control">
                  <div className="lvip-textarea-wrap">
                    <textarea
                      maxLength={200}
                      value={remark}
                      onChange={(event) => setRemark(event.target.value)}
                    />
                    <span className="lvip-textarea-ph">仅限200字</span>
                  </div>
                </div>
              </div>

              <div className="lvip-field top">
                <div className="lvip-field-label">图片附件</div>
                <div className="lvip-field-control">
                  <button type="button" className="lvip-upload">
                    + 上传图片
                  </button>
                </div>
              </div>

              <div className="lvip-inline-notice">
                <span className="lvip-inline-icon">i</span>
                您可以上传纸质合同图片或收款图片
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
