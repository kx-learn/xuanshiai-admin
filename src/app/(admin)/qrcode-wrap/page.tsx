"use client";

import { useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "吸粉二维码", href: "/qrcode-wrap" },
  { label: "二维码管理" },
];

const columns = ["ID", "分享封面", "标识", "分享内容", "二维码有效期", "生成时间", "推送次数", "带来关注", "二维码", "操作"];

export default function QrcodeWrapPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [headChecked, setHeadChecked] = useState(false);
  const [rowChecked, setRowChecked] = useState(false);

  const toggleHead = () => {
    const next = !headChecked;
    setHeadChecked(next);
    setRowChecked(next);
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色须知条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>本应用可以用来生成自定义微信分享内容且带公众号引导关注的二维码，将给您的吸粉，推广带来极大的方便和灵活性。而且后台会统计到每个二维码带来的吸粉效果</p>
            <p>使用示例：比如给每一个推广渠道(或人或事件)建立一个专属二维码，将该二维码应用到其各自的推广中。系统可以实时统计到每个渠道带来的吸粉和引流效果</p>
            <p>若用户未关注公众号，扫码后将出现的公众号关注页面，点击关注后，在公众号对话框中您设置的分享内容发送给用户</p>
            <p>若用户已经关注公众号，扫码后将直接在公众号对话框中您设置的分享内容发送给用户</p>
          </div>
        </div>
      </div>

      <div className="finord-card fq-card">
        <div className="fq-head">
          <h2 className="fq-title">二维码管理</h2>
          <button type="button" className="finord-btn finord-btn-primary" onClick={() => setDrawerOpen(true)}>
            <span className="fq-btn-plus">+</span> 添加二维码
          </button>
        </div>

        <div className="fq-table-wrap">
          <table className="fq-table">
            <thead>
              <tr>
                <th className="fq-col-check">
                  <input type="checkbox" className="fq-check" checked={headChecked} onChange={toggleHead} />
                </th>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fq-col-check">
                  <input type="checkbox" className="fq-check" checked={rowChecked} onChange={(e) => setRowChecked(e.target.checked)} />
                </td>
                <td className="fq-id">1</td>
                <td>
                  <div className="fq-cover">约会<br />启</div>
                </td>
                <td className="fq-ident">123</td>
                <td className="fq-share">
                  <div className="fq-share-title">标题: 南京单身</div>
                  <div className="fq-share-sub">摘要: 给你发一个高颜值对象</div>
                  <div className="fq-share-link">链接: sdfghjk</div>
                </td>
                <td><span className="fq-expired">已过期</span></td>
                <td className="fq-time">2026-07-03 11:40:10</td>
                <td className="fq-num">1</td>
                <td className="fq-num">0</td>
                <td><a className="finord-link">查看</a></td>
                <td>
                  <div className="fq-ops">
                    <a className="fq-op">数据统计</a>
                    <a className="fq-op">延期</a>
                    <a className="fq-op fq-op-del">删除</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="fq-pager">
          <span className="fq-pager-arrow">‹</span>
          <span className="fq-pager-cur">1</span>
          <span className="fq-pager-arrow">›</span>
        </div>
      </div>

      {drawerOpen && <AddQrcodeDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}

function AddQrcodeDrawer({ onClose }: { onClose: () => void }) {
  const [validity, setValidity] = useState("临时二维码（30天后失效）");

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel fq-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加二维码</span>
          </div>
          <div className="fq-head-actions">
            <button className="finord-btn fq-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>

        <div className="tlc-panel-body">
          {/* 分享封面 */}
          <div className="fq-form-row">
            <span className="fq-form-label">＊分享封面</span>
            <div className="fq-content">
              <div className="fq-upload-box">
                <span className="fq-upload-plus">+</span>
                <span className="fq-upload-text">上传图片</span>
              </div>
              <div className="fq-info">① 最佳尺寸：300像素x300像素</div>
            </div>
          </div>

          {/* 标识 */}
          <div className="fq-form-row">
            <span className="fq-form-label">＊标识</span>
            <div className="fq-content">
              <input className="fq-input fq-input-wide" placeholder="不要超出50字符" />
              <div className="fq-info">① 自定义文字，仅用于方便区分和管理</div>
            </div>
          </div>

          {/* 分享标题 */}
          <div className="fq-form-row">
            <span className="fq-form-label">＊分享标题</span>
            <div className="fq-content">
              <input className="fq-input fq-input-wide" placeholder="不要超出50字符" />
            </div>
          </div>

          {/* 分享摘要 */}
          <div className="fq-form-row">
            <span className="fq-form-label">＊分享摘要</span>
            <div className="fq-content">
              <input className="fq-input fq-input-wide" placeholder="请输入" />
            </div>
          </div>

          {/* 分享链接 */}
          <div className="fq-form-row">
            <span className="fq-form-label">＊分享链接</span>
            <div className="fq-content">
              <input className="fq-input fq-input-wide" />
            </div>
          </div>

          {/* 有效期 */}
          <div className="fq-form-row">
            <span className="fq-form-label">有效期</span>
            <div className="fq-options">
              {["临时二维码（30天后失效）", "永久有效二维码"].map((o) => (
                <label key={o} className={`fq-radio ${validity === o ? "active" : ""}`}>
                  <input type="radio" name="validity" value={o} checked={validity === o} onChange={() => setValidity(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 确定提交 */}
          <div className="fq-submit-row">
            <button type="button" className="finord-btn finord-btn-primary fq-submit">确定提交</button>
          </div>
        </div>
      </div>
    </>
  );
}
