"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("分店管理", "分店红娘");

const columns = ["红娘", "手机/微信", "隶属门店", "锁定", "前台展示", "菜单权限", "操作"];

export default function BranchMatchmakerListPage() {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p><b>分店 店长红娘：</b>在门店管理平台中可以查看、操作、编辑在本集隶属门店下的全部客源信息、会员资料、联系方式、牵线记录、跟进档案等，并可以自行添加、管理分店下的红娘、分派资源、查看门店各种数据报表</p>
            <p><b>分店 普通红娘：</b>在红娘平台中可以查看、操作、编辑在分店中隶属自己名下的全部客源信息、会员资料、联系方式、牵线记录等</p>
            <p>「门店状态为"关闭"时，门店管理系统将被禁止登录，其名下红娘（含店长）登录管理平台时也会提示"门店关闭中，无法登录"</p>
            <p><b>注意：</b>分店的"客源线索"中不会显示总店和其门店的"待分客源"；再海客源中也不会显示总店和其他门店的"待海客源"</p>
          </div>
        </div>
      </div>

      <div className="finord-card bm-card">
        <div className="bm-head">
          <h2 className="bm-title">红娘管理</h2>
          <button className="finord-btn finord-btn-primary bm-add-btn" onClick={() => setAddOpen(true)}>＋ 添加红娘</button>
        </div>

        <div className="bm-filters">
          <select className="bm-select"><option>全部门店</option></select>
          <input className="bm-input" placeholder="请输入红娘称呼/手机" />
          <button className="finord-btn finord-btn-primary bm-search-btn">搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table bm-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="bm-empty">
                  <div className="bm-empty-inner">
                    <div className="bm-empty-icon">📦</div>
                    <div className="bm-empty-text">暂无数据</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && <AddMatchmakerDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddMatchmakerDrawer({ onClose }: { onClose: () => void }) {
  const [accountMode, setAccountMode] = useState("按昵称");
  const [commission, setCommission] = useState("不参与");
  const [editContact, setEditContact] = useState("不允许");
  const [timedLock, setTimedLock] = useState(false);

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel bm-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加/编辑服务红娘</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 账号绑定 */}
          <div className="bm-row">
            <span className="bm-label">＊账号绑定</span>
            <div className="bm-content">
              <div className="bm-acct-row">
                <input className="bm-input-wide" placeholder="请输入已注册用户的昵称" />
                {["按昵称", "按手机"].map((o) => (
                  <label key={o} className={`bm-radio ${accountMode === o ? "active" : ""}`}>
                    <input type="radio" name="accountMode" value={o} checked={accountMode === o} onChange={() => setAccountMode(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="bm-info">① 如果查询不到账号，请先让红娘使用微信在平台上登录注册；一个账号只能绑定一个红娘。</div>
            </div>
          </div>

          {/* 红娘头像 + 微信二维码 */}
          <div className="bm-row bm-row-top">
            <span className="bm-label">红娘头像</span>
            <div className="bm-content">
              <div className="bm-pick-row">
                <div className="bm-pick">
                  <span>红娘头像</span>
                  <button type="button" className="bm-pick-btn"><Plus size={14} /> 上传图片</button>
                </div>
                <div className="bm-pick">
                  <span>微信二维码</span>
                  <button type="button" className="bm-pick-btn"><Plus size={14} /> 上传图片</button>
                </div>
              </div>
            </div>
          </div>

          {/* 红娘称呼 + 岗位描述 */}
          <div className="bm-row">
            <span className="bm-label">＊红娘称呼</span>
            <div className="bm-content">
              <div className="bm-two-col">
                <input className="bm-input-wide" placeholder="请输入红娘称呼" />
                <input className="bm-input-wide" placeholder="如：电话邀约、匹配牵线" />
              </div>
            </div>
          </div>

          {/* 红娘口号 */}
          <div className="bm-row">
            <span className="bm-label">＊红娘口号</span>
            <div className="bm-content">
              <div className="bm-two-col">
                <select className="bm-select bm-select-wide"><option>请选择</option></select>
                <a className="finord-link">自定义输入</a>
              </div>
            </div>
          </div>

          {/* 微信号 + 手机号 */}
          <div className="bm-row">
            <span className="bm-label">＊微信号</span>
            <div className="bm-content">
              <div className="bm-two-col">
                <input className="bm-input-wide" placeholder="请输入微信号" />
                <input className="bm-input-wide" placeholder="请输入手机号" />
              </div>
            </div>
          </div>

          {/* 红娘角色 */}
          <div className="bm-row">
            <span className="bm-label">＊红娘角色</span>
            <select className="bm-select bm-select-wide"><option>请选择红娘角色</option></select>
          </div>

          {/* 分成级别 */}
          <div className="bm-row">
            <span className="bm-label">分成级别</span>
            <div className="bm-content">
              <div className="bm-radio-row">
                {["不参与", "允许"].map((o) => (
                  <label key={o} className={`bm-radio ${commission === o ? "active" : ""}`}>
                    <input type="radio" name="commission" value={o} checked={commission === o} onChange={() => setCommission(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="bm-info">① 分店的红娘分成将由分店自行在分店平台中设置与结算</div>
            </div>
          </div>

          {/* 修改联系方式 */}
          <div className="bm-row">
            <span className="bm-label">修改联系方式</span>
            <div className="bm-content">
              <div className="bm-radio-row">
                {["不允许", "允许"].map((o) => (
                  <label key={o} className={`bm-radio ${editContact === o ? "active" : ""}`}>
                    <input type="radio" name="editContact" value={o} checked={editContact === o} onChange={() => setEditContact(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="bm-info">① 若设置为"不允许"则红娘在其红娘平台中无法修改客户的手机号码和微信（包括客源线索、会员CRM）</div>
            </div>
          </div>

          {/* 定时锁定 */}
          <div className="bm-row">
            <span className="bm-label">定时锁定</span>
            <div className="bm-content">
              <div className="bm-switch-row">
                <span>关闭</span>
                <button type="button" className={`mp-switch ${timedLock ? "on" : ""}`} onClick={() => setTimedLock(!timedLock)}>
                  <span className="mp-switch-knob"></span>
                </button>
              </div>
              <div className="bm-info">① 开启定时锁定后，到了时间后该账号自动锁定</div>
            </div>
          </div>

          {/* 排序值 */}
          <div className="bm-row">
            <span className="bm-label">排序值</span>
            <div className="bm-content">
              <input className="bm-input-num" />
              <div className="bm-info">数字越大显示越靠前</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}