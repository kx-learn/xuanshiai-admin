"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("分店管理", "分站配置");

const columns = ["分站地区", "显示名称", "链接", "显示排序", "链接/二维码", "自动跳转", "操作"];

export default function BranchConfigPage() {
  const [mode, setMode] = useState("全国模式");
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>分站是按照会员的"现居地"为依据进行划分，当访客进入到对应"地区"的分站，则平台首页中只显示出"现居地"为该地区的会员</p>
            <p>默认情况下进入分站显示所有地区的会员，访客可以手动通过点击右上角的区域自行切换到指定区域，切换后只显示出"现居地"为该地区的会员</p>
            <p>分站可以开启"自动跳转"来实现自动切换到指定区域，当系统识别出访客的IP归属地与分站为同一地区的时候将进入平台首页的时候会自动跳转到该地区分站</p>
            <p>分站模式支持全部模式、指定区域两种模式，可以在两种模式之间自由切换；全国模式不支持自动跳转和自定义分站名称文字</p>
          </div>
        </div>
      </div>

      {/* 分站模式 */}
      <div className="finord-card bc-card">
        <div className="bc-mode">
          <span className="bc-mode-label">分站模式</span>
          <div className="bc-mode-options">
            {["全国模式", "指定地区"].map((o) => (
              <label key={o} className={`bc-radio ${mode === o ? "active" : ""}`}>
                <input type="radio" name="mode" value={o} checked={mode === o} onChange={() => setMode(o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
          <button className="finord-btn finord-btn-primary bc-confirm-btn">确定切换</button>
        </div>
      </div>

      {/* 分站列表 */}
      <div className="finord-card bc-card">
        <div className="bc-list-head">
          <button className="finord-btn bc-add-btn" disabled>+ 添加分站</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table bc-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="bc-empty">
                  <div className="bc-empty-inner">
                    <div className="bc-empty-icon">📦</div>
                    <div className="bc-empty-text">暂无数据</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}