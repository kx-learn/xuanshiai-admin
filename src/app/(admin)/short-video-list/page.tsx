"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("短视频", "视频管理");

const STATUS_TABS = ["全部", "通过", "待审", "未通过"];
const FLAG_TABS = ["置顶", "推荐", "热门"];

interface VideoRow {
  id: number;
  cover: string;
  desc: string;
  category: string;
  duration: string;
  publisher: string;
  time: string;
  views: number;
  comments: number;
  likes: number;
  tip: string;
  hasRedPacket: boolean;
  visible: boolean;
  audit: string;
  top: boolean;
  recommend: boolean;
  hot: boolean;
}

const videos: VideoRow[] = [
  { id: 1, cover: "脱单干货", desc: "相亲一定要先见见面聊天！！文字都是冷冰冰的，真实的见面才能拉近两颗心的距离 ❤", category: "脱单干货", duration: "126.36s", publisher: "扒姐说媒", time: "2026-06-17 13:47:40", views: 2477, comments: 3, likes: 4, tip: "0元", hasRedPacket: true, visible: true, audit: "通过", top: false, recommend: true, hot: false },
  { id: 2, cover: "5.24脱单活动", desc: "5.24脱单活动《寻找灵魂伴侣》圆满收官，现场精彩回顾", category: "活动瞬间", duration: "143.38s", publisher: "扒姐说媒", time: "2026-06-17 13:47:40", views: 2610, comments: 0, likes: 0, tip: "0元", hasRedPacket: true, visible: true, audit: "通过", top: false, recommend: true, hot: false },
  { id: 3, cover: "社员来了", desc: "南京90年男生，985硕士，产品经理，飞盘全国冠军，喜欢游泳唱歌打羽毛球，长相清爽，你想认识他吗？", category: "优质嘉宾", duration: "43.26s", publisher: "扒姐说媒", time: "2026-06-17 13:47:40", views: 3448, comments: 0, likes: 1, tip: "0元", hasRedPacket: true, visible: true, audit: "通过", top: false, recommend: true, hot: false },
  { id: 4, cover: "关于我们", desc: "来听听我们的价值观和服务亮点", category: "关于我们", duration: "257.25s", publisher: "扒姐说媒", time: "2026-06-17 13:47:40", views: 3464, comments: 0, likes: 0, tip: "0元", hasRedPacket: true, visible: true, audit: "通过", top: false, recommend: true, hot: false },
];

export default function ShortVideoListPage() {
  const [statusTab, setStatusTab] = useState("全部");
  const [searchMode, setSearchMode] = useState("按标题搜");
  const [addOpen, setAddOpen] = useState(false);
  const [flags, setFlags] = useState<Record<number, { top: boolean; recommend: boolean; hot: boolean }>>(
    () => videos.reduce((acc, v) => ({ ...acc, [v.id]: { top: v.top, recommend: v.recommend, hot: v.hot } }), {})
  );

  const toggleFlag = (id: number, key: "top" | "recommend" | "hot") => {
    setFlags((cur) => ({ ...cur, [id]: { ...cur[id], [key]: !cur[id][key] } }));
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card svl-card">
        {/* 标题行 */}
        <div className="svl-head">
          <h2 className="svl-title">视频管理</h2>
          <div className="svl-head-actions">
            <button className="finord-btn finord-btn-primary svl-add-btn" onClick={() => setAddOpen(true)}>＋ 添加视频</button>
            <button className="finord-btn finord-btn-primary svl-refresh-btn">⟳ 一键刷新发布时间</button>
          </div>
        </div>

        {/* 筛选条 */}
        <div className="svl-filters">
          <div className="svl-tabs">
            {STATUS_TABS.map((t) => (
              <button key={t} className={`svl-tab ${statusTab === t ? "active" : ""}`} onClick={() => setStatusTab(t)}>{t}</button>
            ))}
            <span className="svl-tab-sep" />
            {FLAG_TABS.map((t) => (
              <button key={t} className="svl-tab">{t}</button>
            ))}
          </div>
          <select className="svl-select"><option>全部分类</option></select>
          <label className="svl-radio">
            <input type="radio" name="searchMode" checked={searchMode === "按标题搜"} onChange={() => setSearchMode("按标题搜")} />
            <span>按标题搜</span>
          </label>
          <input className="svl-input" placeholder="请输入" />
          <button className="finord-btn finord-btn-primary svl-search-btn">搜索</button>
          <select className="svl-select svl-time-select"><option>按发布时间</option></select>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table svl-table">
            <thead>
              <tr>
                <th className="svl-col-check"><input type="checkbox" className="svl-check" /></th>
                <th>ID</th>
                <th>封面</th>
                <th>描述</th>
                <th>浏览权限</th>
                <th>关联内容</th>
                <th>统计数据</th>
                <th>打赏收入</th>
                <th>红包</th>
                <th>显示</th>
                <th>审核</th>
                <th>属性</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.id}>
                  <td className="svl-col-check"><input type="checkbox" className="svl-check" /></td>
                  <td className="svl-id">{v.id}</td>
                  <td>
                    <div className="svl-cover">{v.cover}</div>
                  </td>
                  <td className="svl-desc">
                    <div className="svl-desc-text">{v.desc}</div>
                    <div className="svl-desc-meta">
                      <span>分类：<span className="svl-meta-blue">{v.category}</span></span>
                      <span>时长：{v.duration}</span>
                      <span>发布：{v.publisher}</span>
                      <span>时间：{v.time}</span>
                    </div>
                  </td>
                  <td>
                    <select className="svl-perm-select"><option>必须先登录</option></select>
                  </td>
                  <td>自定义</td>
                  <td className="svl-stats">
                    <div>播放数：{v.views}</div>
                    <div>评论数：{v.comments}</div>
                    <div>点赞数：{v.likes}</div>
                  </td>
                  <td><span className="svl-tip">{v.tip}</span></td>
                  <td>
                    <div className="svl-redpacket">
                      <span className="svl-redpacket-text">有红包</span>
                      <button type="button" className={`mp-switch ${v.hasRedPacket ? "on" : ""}`}>
                        <span className="mp-switch-knob"></span>
                      </button>
                    </div>
                  </td>
                  <td>
                    <button type="button" className={`mp-switch ${v.visible ? "on" : ""}`}>
                      <span className="mp-switch-knob"></span>
                    </button>
                  </td>
                  <td>
                    <select className="svl-audit-select">
                      <option>{v.audit}</option>
                      <option>待审</option>
                      <option>未通过</option>
                    </select>
                  </td>
                  <td className="svl-flags">
                    <div className="svl-flag-row">置顶：
                      <button type="button" className={`mp-switch ${flags[v.id].top ? "on" : ""}`} onClick={() => toggleFlag(v.id, "top")}>
                        <span className="mp-switch-knob"></span>
                      </button>
                    </div>
                    <div className="svl-flag-row">推荐：
                      <button type="button" className={`mp-switch ${flags[v.id].recommend ? "on" : ""}`} onClick={() => toggleFlag(v.id, "recommend")}>
                        <span className="mp-switch-knob"></span>
                      </button>
                    </div>
                    <div className="svl-flag-row">热门：
                      <button type="button" className={`mp-switch ${flags[v.id].hot ? "on" : ""}`} onClick={() => toggleFlag(v.id, "hot")}>
                        <span className="mp-switch-knob"></span>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="svl-ops">
                      <a className="finord-link">编辑</a>
                      <a className="finord-link">预览视频</a>
                      <a className="finord-link svl-op-del">删除</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && <AddVideoDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddVideoDrawer({ onClose }: { onClose: () => void }) {
  const [cover, setCover] = useState("系统自动截图");
  const [link, setLink] = useState("不关联");
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel svl-add-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加视频</span>
          </div>
          <div className="svl-add-actions">
            <button className="finord-btn svl-add-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 发布账号 */}
          <div className="svl-add-row">
            <span className="svl-add-label">＊发布账号</span>
            <input className="svl-add-input svl-add-input-wide" placeholder="请输入账号昵称" />
          </div>

          {/* 上传视频 */}
          <div className="svl-add-row">
            <span className="svl-add-label">＊上传视频</span>
            <div className="svl-add-pick"><Plus size={18} /><span>上传视频</span></div>
          </div>

          {/* 视频封面 */}
          <div className="svl-add-row">
            <span className="svl-add-label">视频封面</span>
            <div className="svl-add-options svl-add-options-row">
              {["系统自动截图", "自定义上传"].map((o) => (
                <label key={o} className={`svl-add-radio ${cover === o ? "active" : ""}`}>
                  <input type="radio" name="cover" value={o} checked={cover === o} onChange={() => setCover(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 视频分类 */}
          <div className="svl-add-row">
            <span className="svl-add-label">＊视频分类</span>
            <select className="svl-add-select svl-add-select-wide"><option>选择视频分类</option></select>
          </div>

          {/* 视频描述 */}
          <div className="svl-add-row">
            <span className="svl-add-label">＊视频描述</span>
            <textarea className="svl-add-textarea" placeholder="不要超出50汉字" rows={2} />
          </div>

          {/* 关联链接 */}
          <div className="svl-add-row">
            <span className="svl-add-label">关联链接</span>
            <div className="svl-add-options svl-add-options-row">
              {["不关联", "自定义", "关联相亲资料", "关联平台活动", "关联平台首页"].map((o) => (
                <label key={o} className={`svl-add-radio ${link === o ? "active" : ""}`}>
                  <input type="radio" name="link" value={o} checked={link === o} onChange={() => setLink(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 显示排序 */}
          <div className="svl-add-row">
            <span className="svl-add-label">显示排序</span>
            <div className="svl-add-content">
              <input className="svl-add-input" style={{ width: 220 }} />
              <div className="svl-add-info">① 数字越大显示越靠前</div>
            </div>
          </div>

          {/* 虚拟播放数 */}
          <div className="svl-add-row">
            <span className="svl-add-label">虚拟播放数</span>
            <div className="svl-add-content">
              <input className="svl-add-input" defaultValue="0" style={{ width: 220 }} />
              <div className="svl-add-info">① 修改后将在此基数上累计计算</div>
            </div>
          </div>

          {/* 功能设置 */}
          <div className="svl-add-row">
            <span className="svl-add-label">功能设置</span>
            <div className="svl-add-func">
              <span className="svl-add-func-item">评论</span>
              <button type="button" className="mp-switch on">
                <span className="mp-switch-knob"></span>
              </button>
              <span className="svl-add-func-item">打赏</span>
              <button type="button" className="mp-switch on">
                <span className="mp-switch-knob"></span>
              </button>
              <span className="svl-add-func-item">发布时间</span>
              <span className="svl-add-func-dots">...</span>
            </div>
          </div>

          {/* 浏览权限 */}
          <div className="svl-add-row">
            <span className="svl-add-label">浏览权限</span>
            <select className="svl-add-select"><option>不限</option></select>
          </div>
        </div>
      </div>
    </>
  );
}