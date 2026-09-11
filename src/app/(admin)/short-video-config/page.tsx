"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("短视频", "参数配置");

const TOOLBAR: { t: string; title: string }[] = [
  { t: "H", title: "标题" },
  { t: "B", title: "加粗" },
  { t: "Tt", title: "正文" },
  { t: "f", title: "字体" },
  { t: "I", title: "斜体" },
  { t: "U", title: "下划线" },
  { t: "S", title: "删除线" },
  { t: "≡", title: "左对齐" },
  { t: "☰", title: "居中" },
  { t: "≡", title: "右对齐" },
  { t: "••", title: "无序" },
  { t: "1.", title: "有序" },
  { t: "❝", title: "引用" },
  { t: "😊", title: "表情" },
  { t: "🖼", title: "图片" },
  { t: "🎬", title: "视频" },
  { t: "📝", title: "表单" },
  { t: "—", title: "分割线" },
  { t: "↶", title: "撤销" },
  { t: "↷", title: "重做" },
  { t: "⋯", title: "更多" },
  { t: "⤢", title: "全屏" },
];

const AGREEMENT_CONTENT = `一、网络短视频内容审核基本标准
（一）《互联网视听节目服务管理规定》第十六条所列10条标准。
（二）《网络视听节目内容审核通则》第四章第七、八、九、十、十一、十二条所列94条标准。
二、网络短视频内容审核具体细则
依据网络短视频内容审核基本标准，网络播放的短视频节目，及其标题、名称、评论、弹幕、表情包等，其语言、表演、字幕、背景中不得出现以下具体内容（常见问题）：
（一）攻击我国政治制度、法律制度的内容
比如：
1.调侃、讽刺、反对、谩骂中国特色社会主义道路、理论、制度和文化以及国家既定重大方针政策的，如（略）；
2.对宪法等国家重大法律法规的制定、修订进行曲解、否定、攻击、谩骂，或对其具体条款进行调侃、讽刺、反对、谩骂的；
2.影响公共秩序与公共安全的群体性事件的，如（略）；
3.传播非省级以上新闻单位发布的涉重大突发事件信息的，如（略）。`;

const VIDEO_CATEGORIES = [
  "关于我们",
  "脱单干货",
  "活动瞬间",
  "优质嘉宾",
  "直播切片",
];

export default function ShortVideoConfigPage() {
  const [normalPost, setNormalPost] = useState("需要审核");
  const [normalComment, setNormalComment] = useState("无需审核");
  const [verifiedPost, setVerifiedPost] = useState("需要审核");
  const [verifiedComment, setVerifiedComment] = useState("无需审核");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 卡片 1：参数配置 */}
      <div className="finord-card svc-card">
        <div className="svc-head">
          <h2 className="svc-title">参数配置</h2>
          <button className="finord-btn finord-btn-primary svc-submit-head">确定提交</button>
        </div>

        {/* 自定义栏目名称 */}
        <div className="svc-row">
          <span className="svc-label">自定义栏目名称</span>
          <input className="svc-input svc-input-wide" defaultValue="脱单加油站" />
        </div>

        {/* 栏目首页分享图片 + 分享效果预览 */}
        <div className="svc-row svc-row-top">
          <span className="svc-label">栏目首页分享图片</span>
          <div className="svc-share-wrap">
            <div className="svc-pick">
              <div className="svc-pick-preview">脱单<br />加油站</div>
              <button type="button" className="svc-pick-btn">上传图片</button>
            </div>
            <div className="svc-share-preview">
              <div className="svc-share-preview-title">分享效果预览</div>
              <div className="svc-share-preview-card">
                <div className="svc-share-preview-head">
                  <div className="svc-share-preview-name">脱单干货</div>
                  <div className="svc-share-preview-body">了解我们，分享脱单干货和直播高光片段，回顾精彩活动，认识优质嘉宾</div>
                </div>
                <div className="svc-share-preview-badge">脱单<br />加油站</div>
              </div>
            </div>
          </div>
        </div>

        {/* 栏目首页分享标题 */}
        <div className="svc-row">
          <span className="svc-label">栏目首页分享标题</span>
          <input className="svc-input svc-input-wide" defaultValue="脱单干货" />
        </div>

        {/* 栏目首页分享摘要 */}
        <div className="svc-row">
          <span className="svc-label">栏目首页分享摘要</span>
          <textarea className="svc-textarea" rows={3} defaultValue="了解我们，分享脱单干货和直播高光片段，回顾精彩活动，认识优质嘉宾" />
        </div>

        {/* 普通会员发布视频 */}
        <div className="svc-row">
          <span className="svc-label">普通会员发布视频</span>
          <div className="svc-content">
            <div className="svc-options svc-options-row">
              {["需要审核", "无需审核"].map((o) => (
                <label key={o} className={`svc-radio ${normalPost === o ? "active" : ""}`}>
                  <input type="radio" name="normalPost" value={o} checked={normalPost === o} onChange={() => setNormalPost(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
            <div className="svc-info">① 在编辑中重新上传了视频，也是要平台重新审核</div>
          </div>
        </div>

        {/* 普通会员发布评论 */}
        <div className="svc-row">
          <span className="svc-label">普通会员发布评论</span>
          <div className="svc-options svc-options-row">
            {["需要审核", "无需审核"].map((o) => (
              <label key={o} className={`svc-radio ${normalComment === o ? "active" : ""}`}>
                <input type="radio" name="normalComment" value={o} checked={normalComment === o} onChange={() => setNormalComment(o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 认证会员发布视频 */}
        <div className="svc-row">
          <span className="svc-label">认证会员发布视频</span>
          <div className="svc-options svc-options-row">
            {["需要审核", "无需审核"].map((o) => (
              <label key={o} className={`svc-radio ${verifiedPost === o ? "active" : ""}`}>
                <input type="radio" name="verifiedPost" value={o} checked={verifiedPost === o} onChange={() => setVerifiedPost(o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 认证会员发布评论 */}
        <div className="svc-row">
          <span className="svc-label">认证会员发布评论</span>
          <div className="svc-options svc-options-row">
            {["需要审核", "无需审核"].map((o) => (
              <label key={o} className={`svc-radio ${verifiedComment === o ? "active" : ""}`}>
                <input type="radio" name="verifiedComment" value={o} checked={verifiedComment === o} onChange={() => setVerifiedComment(o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 免审核白名单 */}
        <div className="svc-row svc-row-top">
          <span className="svc-label">免审核白名单</span>
          <div className="svc-content">
            <textarea className="svc-textarea" rows={3} />
            <div className="svc-info">输入账号昵称，多个用逗号隔开；白名单的用户发布视频和评论不需要审核</div>
          </div>
        </div>

        {/* 其他配置 */}
        <div className="svc-row svc-row-top">
          <span className="svc-label">其他配置</span>
          <div className="svc-other">
            <span>当视频的播放量达到</span>
            <input className="svc-input svc-input-sm" defaultValue="100" />
            <span>次，自动上热门，成为热门视频</span>
            <input className="svc-input svc-input-sm" defaultValue="7" />
            <span>天内的视频视为新上视频，显示新上标签</span>
          </div>
        </div>

        {/* 现金打赏随机范围 */}
        <div className="svc-row">
          <span className="svc-label">现金打赏随机范围</span>
          <div className="svc-range">
            <input className="svc-input svc-input-sm" defaultValue="1" />
            <span className="svc-unit">元</span>
            <span className="svc-tilde">至</span>
            <input className="svc-input svc-input-sm" defaultValue="100" />
            <span className="svc-unit">元</span>
          </div>
        </div>

        {/* 红包倒计时 */}
        <div className="svc-row">
          <span className="svc-label">红包倒计时</span>
          <div className="svc-content">
            <div className="svc-range">
              <input className="svc-input svc-input-sm" defaultValue="10" />
              <span className="svc-unit">秒</span>
            </div>
            <div className="svc-info">① 可以设置一个最长时间，当视频播放时间超过设置的时候就可以领红包，不必等放完。若视频时长不足设置的时间则按照视频本身时长计</div>
          </div>
        </div>

        {/* 视频发布协议 */}
        <div className="svc-row svc-row-top">
          <span className="svc-label"><span className="svc-req">＊</span>视频发布协议</span>
          <div className="svc-editor">
            <div className="svc-editor-toolbar">
              {TOOLBAR.map((tool, i) => (
                <button className="svc-editor-tool" key={`${tool.title}-${i}`} title={tool.title}>{tool.t}</button>
              ))}
            </div>
            <div className="svc-editor-body" contentEditable suppressContentEditableWarning>
              <pre className="svc-editor-text">{AGREEMENT_CONTENT}</pre>
            </div>
          </div>
        </div>

        <div className="svc-submit-row">
          <button className="finord-btn finord-btn-primary svc-submit">确定提交</button>
        </div>
      </div>

      {/* 卡片 2：数据刷粉 */}
      <div className="finord-card svc-card">
        <div className="svc-section-title">数据刷粉</div>

        {/* 增加人气 */}
        <div className="svc-row svc-row-top">
          <span className="svc-label">增加人气</span>
          <div className="svc-content">
            <div className="svc-brush">
              <input className="svc-input svc-input-brush" defaultValue="100" />
              <span className="svc-dash">-</span>
              <input className="svc-input svc-input-brush" defaultValue="999" />
              <button className="finord-btn finord-btn-primary svc-brush-btn">执行</button>
            </div>
            <div className="svc-info">① 批量给所有视频增加播放量</div>
          </div>
        </div>

        {/* 增加点赞数 */}
        <div className="svc-row svc-row-top">
          <span className="svc-label">增加点赞数</span>
          <div className="svc-content">
            <div className="svc-brush">
              <input className="svc-input svc-input-brush" defaultValue="100" />
              <span className="svc-dash">-</span>
              <input className="svc-input svc-input-brush" defaultValue="999" />
              <button className="finord-btn finord-btn-primary svc-brush-btn">执行</button>
            </div>
            <div className="svc-info">① 批量给所有视频增加点赞数</div>
          </div>
        </div>

        {/* 刷新发布时间 */}
        <div className="svc-row svc-row-top">
          <span className="svc-label">刷新发布时间</span>
          <div className="svc-content">
            <div className="svc-brush">
              <input className="svc-input svc-input-brush" defaultValue="1" />
              <span className="svc-dash">-</span>
              <input className="svc-input svc-input-brush" defaultValue="1000" />
              <button className="finord-btn finord-btn-primary svc-brush-btn">执行</button>
            </div>
            <div className="svc-info">① 批量给ID区间范围内视频刷新发布时间</div>
          </div>
        </div>
      </div>

      {/* 卡片 3：视频分类 */}
      <div className="finord-card svc-card">
        <div className="svc-section-title">视频分类</div>
        <div className="svc-tags-row">
          {VIDEO_CATEGORIES.map((c) => (
            <span className="svc-tag" key={c}>
              {c}
              <span className="svc-tag-icons">
                <span className="svc-tag-icon" aria-label="编辑">✎</span>
                <span className="svc-tag-icon" aria-label="删除">×</span>
                <span className="svc-tag-icon" aria-label="拖动">⋮⋮</span>
              </span>
            </span>
          ))}
          <button type="button" className="svc-add-tag">＋ 添加分类</button>
        </div>
      </div>
    </div>
  );
}