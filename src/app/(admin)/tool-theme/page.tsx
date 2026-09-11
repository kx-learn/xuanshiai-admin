"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

type ZoneRow = {
  id: number;
  name: string;
  createTime: string;
  status: boolean;
};

const seedRows: ZoneRow[] = [
  { id: 2, name: "高颜值专区", createTime: "2026-06-14 16:50:04", status: true },
  { id: 4, name: "高收入专区", createTime: "2026-06-17 16:06:39", status: true },
  { id: 1, name: "高学历专区", createTime: "2026-06-30 16:39:28", status: true },
  { id: 3, name: "95后专区", createTime: "2026-06-17 16:00:06", status: true },
];

export default function Page() {
  const breadcrumb = getBreadcrumb("运营工具", "会员分区");
  const [rows, setRows] = useState<ZoneRow[]>(seedRows);
  const [addOpen, setAddOpen] = useState(false);

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    setRows((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const toggleStatus = (index: number) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, status: !row.status } : row)));
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>会员分区功能可帮助您的企业快速建立各种主题的会员聚合页面，将会员按照性格特征进行分类集中展示，能够给会员快速的引导入口，增强关注度和流量导入。还可以通过专区功能轻松创建互动活动</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="tm-head">
          <div className="tm-title">会员分区</div>
          <button type="button" className="finord-btn finord-btn-primary" onClick={() => setAddOpen(true)}>＋ 添加分区</button>
        </div>

        <div className="tm-table-wrap">
          <table className="tm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>分区名称</th>
                <th>链接/二维码</th>
                <th>创建时间</th>
                <th>状态</th>
                <th>数据</th>
                <th>排序</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="tm-cell-id">{row.id}</td>
                  <td>{row.name}</td>
                  <td><span className="finord-link">查看</span></td>
                  <td className="tm-cell-time">{row.createTime}</td>
                  <td>
                    <span className="tm-status-wrap">
                      <span className={`tm-badge ${row.status ? "on" : "off"}`}>{row.status ? "上架" : "下架"}</span>
                      <button type="button" className={`mp-switch ${row.status ? "on" : ""} tm-switch-sm`} onClick={() => toggleStatus(index)} aria-label="切换状态">
                        <span className="mp-switch-knob"></span>
                      </button>
                    </span>
                  </td>
                  <td><span className="finord-link">自动筛选条件</span></td>
                  <td>
                    <span className="tm-moves">
                      {index > 0 && <button type="button" className="tm-move" onClick={() => move(index, -1)}>↑ 上移</button>}
                      {index < rows.length - 1 && <button type="button" className="tm-move" onClick={() => move(index, 1)}>↓ 下移</button>}
                    </span>
                  </td>
                  <td>
                    <span className="tm-ops">
                      <span className="finord-link">配置条件</span>
                      <span className="tm-op-sep">|</span>
                      <span className="finord-link">编辑</span>
                      <span className="tm-op-sep">|</span>
                      <span className="finord-link tm-op-del">删除</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && <AddZoneDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

const TZ_TPL_COLORS = [
  ["#f6d8e2", "#e8b6c6"],
  ["#dfe6fb", "#c1d0f2"],
  ["#e4f0e3", "#c6e0c4"],
  ["#fde9d9", "#f8d4b8"],
  ["#e6dcf5", "#cfbce8"],
];

function AddZoneDrawer({ onClose }: { onClose: () => void }) {
  const [popup, setPopup] = useState("关闭");
  const [dataMode, setDataMode] = useState("自动条件筛选");
  const [tplIdx, setTplIdx] = useState(0);
  const [online, setOnline] = useState("上线");

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel tz-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加分区</span>
          </div>
          <div className="tz-head-actions">
            <button className="finord-btn tz-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 分区名称 */}
          <div className="tz-row">
            <span className="tz-label">＊分区名称</span>
            <div className="tz-content">
              <input className="tz-input tz-input-wide" />
              <div className="tz-info">① 建议不要超过6个汉字，如：高颜值专区</div>
            </div>
          </div>

          {/* 宣传标语 */}
          <div className="tz-row">
            <span className="tz-label">＊宣传标语</span>
            <div className="tz-content">
              <input className="tz-input tz-input-wide" />
              <div className="tz-info">① 建议不要超过20个汉字</div>
            </div>
          </div>

          {/* 进入页面弹窗 */}
          <div className="tz-row">
            <span className="tz-label">进入页面弹窗</span>
            <div className="tz-options">
              {["关闭", "启用"].map((o) => (
                <label key={o} className={`tz-radio ${popup === o ? "active" : ""}`}>
                  <input type="radio" name="popup" value={o} checked={popup === o} onChange={() => setPopup(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 会员数据 */}
          <div className="tz-row cll-row-top">
            <span className="tz-label">会员数据</span>
            <div className="tz-content">
              <div className="tz-options">
                {["自动条件筛选", "指定会员（可支持会员自助申请加入）"].map((o) => (
                  <label key={o} className={`tz-radio ${dataMode === o ? "active" : ""}`}>
                    <input type="radio" name="dataMode" value={o} checked={dataMode === o} onChange={() => setDataMode(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="tz-info">① 根据您设置的条件实时自动筛选出数据并显示在该分区中</div>
            </div>
          </div>

          {/* 头部背景 */}
          <div className="tz-row tz-row-top">
            <span className="tz-label">头部背景</span>
            <div className="tz-content">
              <div className="tz-bg-row">
                <div className="tz-pick"><Plus size={18} /><span>上传图片</span></div>
                <button type="button" className="tz-cancel-bg">取消背景</button>
              </div>
              <div className="tz-info">① 最佳尺寸：750像素×345像素，点击可重新上传</div>
            </div>
          </div>

          {/* 分区页模板 */}
          <div className="tz-row tz-row-top">
            <span className="tz-label">分区页模板</span>
            <div className="tz-tpl-row">
              {TZ_TPL_COLORS.map(([c1, c2], i) => (
                <label key={i} className={`tz-tpl ${tplIdx === i ? "active" : ""}`}>
                  <input type="radio" name="tpl" checked={tplIdx === i} onChange={() => setTplIdx(i)} />
                  <div className="tz-tpl-frame" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                    <div className="tz-tpl-rows"><span /><span /><span /></div>
                    <div className="tz-tpl-avatar" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 分享标题 */}
          <div className="tz-row">
            <span className="tz-label">分享标题</span>
            <input className="tz-input tz-input-wide" />
          </div>

          {/* 分享摘要 */}
          <div className="tz-row">
            <span className="tz-label">分享摘要</span>
            <input className="tz-input tz-input-wide" />
          </div>

          {/* 分享封面 */}
          <div className="tz-row tz-row-top">
            <span className="tz-label">＊分享封面</span>
            <div className="tz-content">
              <div className="tz-pick"><Plus size={18} /><span>上传图片</span></div>
              <div className="tz-info">① 最佳尺寸：300像素×300像素</div>
            </div>
          </div>

          {/* 是否上线 */}
          <div className="tz-row">
            <span className="tz-label">是否上线</span>
            <div className="tz-options">
              {["暂不上线", "上线"].map((o) => (
                <label key={o} className={`tz-radio ${online === o ? "active" : ""}`}>
                  <input type="radio" name="online" value={o} checked={online === o} onChange={() => setOnline(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
