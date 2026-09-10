"use client";
import { useState } from "react";
import { X, Upload, ArrowUp, ArrowDown } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "销售匹配库");

export default function SalesMatchPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [cfgOpen, setCfgOpen] = useState(false);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色信息条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>销售匹配库（也叫"眼缘库"）是专业婚恋机构中对于到店客户使用的最常见、最有效的"销售方法"，不但能够给客户提供更加直观有效的服务价值传导、还大大简化销售过程的难度、提升开单转化率，也为后端的红娘匹配服务提供了更加精准的参考，是一个能提升销售、又能提高服务质量的重要工具。</p>
            <p><b>使用步骤：</b>销售红娘在客户到店之前，为客户创建一个专属的"销售匹配库"，根据之前对客户情况的沟通了解，从系统的会员资料库中挑选出5-10位有吸引力的人选作为"红娘推荐"。红娘将创建好的销售库的页面路径或者二维码保存到手机，在客户到店谈话的过程中让客户在IPAD或专用手机中打开这个"匹配库"，红娘先给客户展示并介绍"推荐人选"，然后再引导客户自己从平台资料库中筛选出中意的人选，加入到"眼缘清单"。客户挑选的"眼缘清单"将保留在系统后台，方便之后红娘进行匹配服务和对客户择偶需求的精准掌握。</p>
            <p><b>特别注意事项：</b>销售匹配库与线上对外平台不同，其展示嘉宾信息中的头像、照片不受权限控制，包括"完全私密"状态的会员信息也会显示，红娘匹配库在完成使用场景之后建议将前端设置为"关闭"，关闭状态下将无法浏览。</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        {/* 标题行 */}
        <div className="slm-head">
          <div className="slm-title-wrap">
            <div className="slm-title">销售匹配库</div>
            <a className="slm-demo" href="#">客户签署流程演示</a>
          </div>
          <div className="slm-actions">
            <button className="finord-btn finord-btn-primary" onClick={() => setCreateOpen(true)}>创建销售匹配库</button>
            <button className="finord-btn finord-btn-primary" onClick={() => setCfgOpen(true)}>功能配置</button>
          </div>
        </div>

        {/* 筛选条 */}
        <div className="finord-filters slm-filters">
          <div className="finord-searchbox">
            <span className="finord-search-label">状态:</span>
            <select className="finord-select">
              <option>不限</option>
            </select>
          </div>
          <div className="finord-searchbox">
            <span className="finord-search-label">红娘:</span>
            <select className="finord-select">
              <option>不限</option>
            </select>
          </div>
          <div className="finord-searchbox">
            <span className="finord-search-label">请输入</span>
            <input className="finord-search-input" placeholder="请输入关联会员的昵称/手机/姓名" />
          </div>
          <button className="finord-btn finord-btn-primary">搜索</button>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table slm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>标题</th>
                <th>关联账号</th>
                <th>创建时间</th>
                <th>创建人</th>
                <th>是否到店</th>
                <th>销售红娘</th>
                <th>销售库前端</th>
                <th>链接/二维码</th>
                <th>红娘推荐人选</th>
                <th>客户眼缘清单</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={12} className="ecl-empty">
                  <div className="ecl-empty-inner">
                    <div className="ecl-empty-icon">▤</div>
                    <div className="ecl-empty-text">暂无数据</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {createOpen && <CreateMatchDrawer onClose={() => setCreateOpen(false)} />}
      {cfgOpen && <FuncConfigDrawer onClose={() => setCfgOpen(false)} />}
    </div>
  );
}

function CreateMatchDrawer({ onClose }: { onClose: () => void }) {
  const [gender, setGender] = useState("男性");
  const [acctMode, setAcctMode] = useState("按昵称");
  const [status, setStatus] = useState("未到店");
  const [smart, setSmart] = useState(false);

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel sm-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">创建/编辑销售匹配库</span>
          </div>
          <div className="sm-head-actions">
            <button className="finord-btn sm-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 页面标题 */}
          <div className="sm-row">
            <span className="sm-label">＊页面标题</span>
            <div className="sm-content">
              <input className="sm-input sm-input-wide" placeholder="最多20文字" />
            </div>
          </div>

          {/* 分享描述 */}
          <div className="sm-row">
            <span className="sm-label">分享描述</span>
            <div className="sm-content">
              <input className="sm-input sm-input-wide" placeholder="请输入分享描述" />
            </div>
          </div>

          {/* 客户性别 */}
          <div className="sm-row">
            <span className="sm-label">客户性别</span>
            <div className="sm-options">
              {["男性", "女性"].map((o) => (
                <label key={o} className={`sm-radio ${gender === o ? "active" : ""}`}>
                  <input type="radio" name="gender" value={o} checked={gender === o} onChange={() => setGender(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 关联账号 */}
          <div className="sm-row">
            <span className="sm-label">关联账号</span>
            <div className="sm-content">
              <div className="sm-acct-row">
                <input className="sm-input" placeholder="请输入账号昵称" />
                <div className="sm-options sm-options-inline">
                  {["按昵称", "按手机"].map((o) => (
                    <label key={o} className={`sm-radio ${acctMode === o ? "active" : ""}`}>
                      <input type="radio" name="acctMode" value={o} checked={acctMode === o} onChange={() => setAcctMode(o)} />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="sm-info">① 报本客户在平台中已注册的账号昵称，关联后系统默认根据其详细条件要素（年龄、身高、学历、收入）进行智能匹配。若未注册可留空</div>
              <div className="sm-info">绑定用户账号之后，眼缘库仅限该用户和所属红娘可以操作，未绑定的情况下任何人进入该页面均可操作</div>
            </div>
          </div>

          {/* 智能匹配 */}
          <div className="sm-row">
            <span className="sm-label">智能匹配</span>
            <div className="sm-content">
              <div className="sm-switch-row">
                <button type="button" className={`mp-switch ${smart ? "on" : ""}`} onClick={() => setSmart(!smart)}>
                  <span className="mp-switch-knob"></span>
                </button>
                <span className="sm-switch-text">{smart ? "开启" : "关闭"}</span>
              </div>
              <div className="sm-info">开启本功能后，眼缘库中的智能匹配将按照下面的条件筛选显示(不包含脱单会员)</div>
            </div>
          </div>

          {/* 销售红娘 */}
          <div className="sm-row">
            <span className="sm-label">＊销售红娘</span>
            <div className="sm-content">
              <select className="sm-select sm-select-wide">
                <option>请选择销售红娘</option>
                <option>芸希老师</option>
                <option>琴琴</option>
                <option>苓琴</option>
              </select>
            </div>
          </div>

          {/* 选人上限 */}
          <div className="sm-row">
            <span className="sm-label">＊选人上限</span>
            <div className="sm-content">
              <input className="sm-input sm-input-num" defaultValue="10" />
              <div className="sm-info">该客户最多可选择的眼缘人选的数量限制</div>
            </div>
          </div>

          {/* 状态 */}
          <div className="sm-row">
            <span className="sm-label">状态</span>
            <div className="sm-options">
              {["已到店", "未到店"].map((o) => (
                <label key={o} className={`sm-radio ${status === o ? "active" : ""}`}>
                  <input type="radio" name="status" value={o} checked={status === o} onChange={() => setStatus(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 温馨提示 */}
          <div className="sm-row">
            <span className="sm-label">温馨提示</span>
            <div className="sm-content">
              <textarea className="sm-textarea" placeholder="请输入温馨提示" rows={4} />
              <div className="sm-info">这是前端进入到该匹配库时页面中弹出的内容</div>
            </div>
          </div>

          {/* 底部确定提交 */}
          <div className="sm-submit-row">
            <button className="finord-btn finord-btn-primary sm-submit">确定提交</button>
          </div>
        </div>
      </div>
    </>
  );
}

function FuncConfigDrawer({ onClose }: { onClose: () => void }) {
  const [showBanner, setShowBanner] = useState(true);
  const [navItems, setNavItems] = useState([
    { id: 1, label: "嘉宾海选", on: true },
    { id: 2, label: "红娘推荐", on: true },
    { id: 3, label: "智能匹配", on: true },
    { id: 4, label: "眼缘人选", on: true },
  ]);
  const [toggles, setToggles] = useState({
    auth: true, intro: true, mateReq: true, material: true, personIntro: true,
  });

  const move = (idx: number, dir: -1 | 1) => {
    setNavItems((arr) => {
      const next = [...arr];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return arr;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel sm-panel sm-cfg-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">功能配置</span>
          </div>
          <div className="sm-head-actions">
            <button className="finord-btn sm-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 头部宣传图 */}
          <div className="sm-cfg-block">
            <div className="sm-cfg-block-title">头部宣传图:</div>
            <div className="sm-cfg-radio-row">
              <label className="sm-radio">
                <input type="radio" name="banner" checked={showBanner} onChange={() => setShowBanner(true)} />
                <span>展示</span>
              </label>
              <label className="sm-radio">
                <input type="radio" name="banner" checked={!showBanner} onChange={() => setShowBanner(false)} />
                <span>隐藏</span>
              </label>
              <span className="sm-cfg-banner-size">710像素X120像素</span>
            </div>
            <div className="sm-cfg-banner">
              <div className="sm-cfg-banner-text">我 你 她 他 的 采</div>
            </div>
            <div className="sm-cfg-banner-btn"><Upload size={14} /> 上传图片</div>
          </div>

          {/* 导航与功能控制 */}
          <div className="sm-cfg-block">
            <div className="sm-cfg-block-title">导航与功能控制:</div>
            <div className="sm-cfg-nav">
              {navItems.map((n, idx) => (
                <div className="sm-cfg-nav-row" key={n.id}>
                  <span className="sm-cfg-nav-name">{n.label}</span>
                  <span className="sm-cfg-nav-tag">{n.label}</span>
                  <button
                    type="button"
                    className={`mp-switch ${n.on ? "on" : ""}`}
                    onClick={() => setNavItems((arr) => arr.map((x) => x.id === n.id ? { ...x, on: !x.on } : x))}
                  >
                    {n.on && <span className="mp-switch-label">显示</span>}
                    <span className="mp-switch-knob"></span>
                  </button>
                  <button type="button" className="sm-cfg-move" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp size={12} /> 上移</button>
                  <button type="button" className="sm-cfg-move" onClick={() => move(idx, 1)} disabled={idx === navItems.length - 1}><ArrowDown size={12} /> 下移</button>
                </div>
              ))}
            </div>
          </div>

          {/* 会员资料页展示内容控制 */}
          <div className="sm-cfg-block">
            <div className="sm-cfg-block-title">会员资料页展示内容控制:</div>
            <div className="sm-cfg-mat">
              <div className="sm-cfg-mat-row">
                <span className="sm-cfg-mat-name">认证情况</span>
                <button
                  type="button"
                  className={`mp-switch ${toggles.auth ? "on" : ""}`}
                  onClick={() => setToggles((t) => ({ ...t, auth: !t.auth }))}
                >
                  {toggles.auth && <span className="mp-switch-label">显示</span>}
                  <span className="mp-switch-knob"></span>
                </button>
              </div>
              <div className="sm-cfg-mat-row">
                <span className="sm-cfg-mat-name">红娘介绍</span>
                <button
                  type="button"
                  className={`mp-switch ${toggles.intro ? "on" : ""}`}
                  onClick={() => setToggles((t) => ({ ...t, intro: !t.intro }))}
                >
                  {toggles.intro && <span className="mp-switch-label">显示</span>}
                  <span className="mp-switch-knob"></span>
                </button>
                <span className="sm-cfg-mat-name sm-cfg-mat-name-right">择偶要求</span>
                <button
                  type="button"
                  className={`mp-switch ${toggles.mateReq ? "on" : ""}`}
                  onClick={() => setToggles((t) => ({ ...t, mateReq: !t.mateReq }))}
                >
                  {toggles.mateReq && <span className="mp-switch-label">显示</span>}
                  <span className="mp-switch-knob"></span>
                </button>
              </div>
              <div className="sm-cfg-mat-row">
                <span className="sm-cfg-mat-name">个人资料</span>
                <button
                  type="button"
                  className={`mp-switch ${toggles.material ? "on" : ""}`}
                  onClick={() => setToggles((t) => ({ ...t, material: !t.material }))}
                >
                  {toggles.material && <span className="mp-switch-label">显示</span>}
                  <span className="mp-switch-knob"></span>
                </button>
                <span className="sm-cfg-mat-name sm-cfg-mat-name-right">个人介绍</span>
                <button
                  type="button"
                  className={`mp-switch ${toggles.personIntro ? "on" : ""}`}
                  onClick={() => setToggles((t) => ({ ...t, personIntro: !t.personIntro }))}
                >
                  {toggles.personIntro && <span className="mp-switch-label">显示</span>}
                  <span className="mp-switch-knob"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
