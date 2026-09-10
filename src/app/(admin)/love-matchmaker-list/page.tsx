"use client";

import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  MessageSquare,
  Phone,
  Plus,
  X,
} from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("总店红娘", "红娘管理");

type Row = {
  id: number;
  name: string;
  account: string;
  store: string;
  desc: string;
  roleTag: string;
  phone: string;
  wechat: string;
  level: string;
  success: number;
  amount: string;
  locked: boolean;
  visible: boolean;
  palette: string;
};

const rows: Row[] = [
  {
    id: 1,
    name: "芸希老师",
    account: "芸希老师",
    store: "总店",
    desc: "-",
    roleTag: "超级红娘",
    phone: "17384472282",
    wechat: "17384472282",
    level: "中级分成",
    success: 21,
    amount: "509元",
    locked: false,
    visible: true,
    palette: "a",
  },
];

const reportCols = [
  "红娘",
  "线索新增客源",
  "会员CRM新增资料",
  "线索跟进",
  "会员CRM跟进",
  "新增线上牵线",
  "牵线成功",
  "预约申请",
  "约会安排",
  "线上分成",
  "线下业绩",
];

const reportValues = ["1", "1", "0", "1", "0", "0", "0", "0", "0元", "0元"];

export default function LoveMatchmakerListPage() {
  const [reportOpen, setReportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

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
              <b>平台运营老板：</b>
              即系统后台管理员,能查看、管理平台中的所有门店的客源信息、会员资料、联系方式、牵线记录、跟进档案等、红娘,并可以创建分店
            </p>
            <p>
              <b>总店-超级红娘：</b>
              在红娘平台中可以查看、操作、编辑平台的全部客源信息、会员资料、联系方式、牵线记录、跟进档案等
            </p>
            <p>
              <b>总店-普通红娘：</b>
              在红娘平台中可以查看、操作、编辑在总店中归属自己名下的全部客源信息、联系方式、会员资料、牵线记录、跟进档案等
            </p>
          </div>
        </div>
      </div>

      <div className="finord-card hm-card">
        <div className="hm-head">
          <div className="hm-head-left">
            <h2 className="hm-title">红娘管理</h2>
            <button type="button" className="hm-tutorial">
              <BookOpen size={13} />
              红娘使用教程
            </button>
          </div>
          <div className="hm-head-actions">
            <button
              type="button"
              className="finord-btn finord-btn-outline hm-report-btn"
              onClick={() => setReportOpen(true)}
            >
              <BarChart3 size={14} />
              红娘工作汇报
            </button>
            <button
              type="button"
              className="finord-btn finord-btn-primary hm-add-btn"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={14} />
              添加红娘
            </button>
          </div>
        </div>

        <div className="hm-filters">
          <input className="hm-input" placeholder="请输入红娘昵称/账号/手机" />
          <button type="button" className="finord-btn finord-btn-primary hm-search-btn">
            搜索
          </button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table hm-table">
            <colgroup>
              <col style={{ width: 250 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 104 }} />
              <col style={{ width: 104 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: "auto" }} />
            </colgroup>
            <thead>
              <tr>
                <th>红娘</th>
                <th>手机/微信</th>
                <th>分成级别</th>
                <th>牵线成功数</th>
                <th>累计分成</th>
                <th>锁定</th>
                <th>前台展示</th>
                <th>菜单权限</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="hm-member">
                      <div className="hm-avatar-wrap">
                        <span className={`hm-avatar hm-g-${row.palette}`} />
                        <span className="hm-role-badge">{row.roleTag}</span>
                      </div>
                      <div className="hm-member-info">
                        <div className="hm-line">
                          <span className="hm-line-k">称呼：</span>
                          {row.name}
                        </div>
                        <div className="hm-line">
                          <span className="hm-line-k">账号：</span>
                          {row.account}
                        </div>
                        <div className="hm-line">
                          <span className="hm-line-k">归属：</span>
                          {row.store}
                        </div>
                        <div className="hm-line">
                          <span className="hm-line-k">描述：</span>
                          {row.desc}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="hm-contact">
                      <Phone size={12} />
                      <span>{row.phone}</span>
                    </div>
                    <div className="hm-contact">
                      <MessageSquare size={12} />
                      <span>{row.wechat}</span>
                    </div>
                  </td>
                  <td>
                    <span className="hm-level">{row.level}</span>
                  </td>
                  <td>{row.success}人</td>
                  <td>{row.amount}</td>
                  <td>
                    <span className={`hm-pill ${row.locked ? "lock" : "normal"}`}>
                      {row.locked ? "已锁定" : "正常"}
                    </span>
                  </td>
                  <td>
                    <span className={`hm-pill ${row.visible ? "show" : "hide"}`}>
                      {row.visible ? "展示" : "隐藏"}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="hm-link">
                      菜单管理
                    </button>
                  </td>
                  <td>
                    <div className="hm-actions">
                      <button type="button" className="hm-link">
                        红娘平台
                      </button>
                      <button type="button" className="hm-link">
                        数据报表
                      </button>
                      <button type="button" className="hm-link">
                        海报
                      </button>
                      <button type="button" className="hm-link">
                        编辑
                      </button>
                      <button type="button" className="hm-link danger">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {reportOpen && <ReportDrawer row={rows[0]} onClose={() => setReportOpen(false)} />}
      {addOpen && <AddMatchmakerDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function ReportDrawer({ row, onClose }: { row: Row; onClose: () => void }) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel hm-report-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭">
              <X size={18} />
            </button>
            <span className="tlc-panel-title">红娘工作汇报</span>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="hm-report-notice">
            <p>
              <b>线上分成：</b>红娘名下的会员在平台中线上消费的分成
            </p>
            <p>
              <b>线下业绩：</b>在线下VIP中作为“销售红娘”的合同金额
            </p>
          </div>

          <div className="hm-report-filters">
            <div className="hm-report-date">
              <input defaultValue="2026-08-11" />
              <span className="hm-report-arrow">→</span>
              <input defaultValue="2026-09-10" />
              <CalendarDays size={14} />
            </div>
            <div className="hm-select">
              <select defaultValue="">
                <option value="">默认排序</option>
              </select>
              <ChevronDown className="hm-caret" size={14} />
            </div>
          </div>

          <div className="hm-report-table-wrap">
            <table className="hm-report-table">
              <thead>
                <tr>
                  {reportCols.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="hm-report-member">
                      <span className={`hm-avatar hm-avatar-sm hm-g-${row.palette}`} />
                      <span>{row.name}</span>
                    </div>
                  </td>
                  {reportValues.map((v, i) => (
                    <td key={i}>{v}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function AddMatchmakerDrawer({ onClose }: { onClose: () => void }) {
  const [lookupBy, setLookupBy] = useState("按昵称");
  const [customSlogan, setCustomSlogan] = useState(false);
  const [editContact, setEditContact] = useState("允许");
  const [timedLock, setTimedLock] = useState(false);

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel bm-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭">
              <X size={18} />
            </button>
            <span className="tlc-panel-title">添加/编辑服务红娘</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={onClose}>
              关闭
            </button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 账号绑定 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>账号绑定
            </span>
            <div className="bm-content">
              <div className="bm-acct-row">
                <input className="bm-input-wide" placeholder="请输入已注册账号的昵称" />
                {["按昵称", "按手机"].map((o) => (
                  <label key={o} className={`bm-radio ${lookupBy === o ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="lookupBy"
                      value={o}
                      checked={lookupBy === o}
                      onChange={() => setLookupBy(o)}
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="bm-info">
                ① 如果查询不到账号，请先让红娘使用微信在平台中登录注册；一个账号只能绑定一个红娘。
              </div>
            </div>
          </div>

          {/* 红娘头像 + 微信二维码 */}
          <div className="bm-row bm-row-top">
            <span className="bm-label">红娘头像</span>
            <div className="bm-content">
              <div className="hm-pick-row">
                <button type="button" className="hm-upload-btn">
                  <Plus size={14} /> 上传图片
                </button>
                <div className="hm-pick-item">
                  <span className="hm-pick-label">微信二维码</span>
                  <button type="button" className="hm-upload-btn">
                    <Plus size={14} /> 上传图片
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 红娘称呼 + 岗位描述 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>红娘称呼
            </span>
            <div className="bm-content">
              <div className="bm-two-col">
                <input className="bm-input-wide" placeholder="请输入红娘称呼" />
                <div className="hm-inline-field">
                  <span className="hm-inline-label">岗位描述</span>
                  <input className="bm-input-wide" placeholder="如：电话邀约、匹配牵线" />
                </div>
              </div>
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

          {/* 微信号 + 手机号码 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>微信号
            </span>
            <div className="bm-content">
              <div className="bm-two-col">
                <input className="bm-input-wide" placeholder="请输入微信号" />
                <div className="hm-inline-field">
                  <span className="hm-inline-label">
                    <b className="hm-req">*</b>手机号码
                  </span>
                  <input className="bm-input-wide" placeholder="请输入手机号码" />
                </div>
              </div>
            </div>
          </div>

          {/* 红娘角色 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>红娘角色
            </span>
            <div className="bm-content">
              <select className="bm-select bm-select-wide" defaultValue="">
                <option value="">请选择红娘角色</option>
              </select>
            </div>
          </div>

          {/* 分成级别 */}
          <div className="bm-row">
            <span className="bm-label">分成级别</span>
            <div className="bm-content">
              <div className="hm-desc-text">分店的红娘分成由分店自行在分店平台中设置与结算</div>
            </div>
          </div>

          {/* 修改联系方式 */}
          <div className="bm-row">
            <span className="bm-label">修改联系方式</span>
            <div className="bm-content">
              <div className="bm-radio-row">
                {["不允许", "允许"].map((o) => (
                  <label key={o} className={`bm-radio ${editContact === o ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="editContact"
                      value={o}
                      checked={editContact === o}
                      onChange={() => setEditContact(o)}
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="bm-info">
                ① 若设置为“不允许”则红娘在其红娘平台中无法修改客户的手机号码和微信（包括客源线索、会员CRM）
              </div>
            </div>
          </div>

          {/* 定时锁定 */}
          <div className="bm-row">
            <span className="bm-label">定时锁定</span>
            <div className="bm-content">
              <div className="bm-switch-row">
                <span className="hm-switch-label">{timedLock ? "开启" : "关闭"}</span>
                <button
                  type="button"
                  className={`mp-switch ${timedLock ? "on" : ""}`}
                  onClick={() => setTimedLock(!timedLock)}
                >
                  <span className="mp-switch-knob" />
                </button>
              </div>
              <div className="bm-info">① 开启定时锁定后，到了时间后该账号自动锁定</div>
            </div>
          </div>

          {/* 显示排序 */}
          <div className="bm-row">
            <span className="bm-label">显示排序</span>
            <div className="bm-content">
              <input className="hm-sort-input" placeholder="数字越大显示越靠前" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
