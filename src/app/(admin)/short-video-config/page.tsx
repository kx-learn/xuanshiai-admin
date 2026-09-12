"use client";

import { useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type VideoCategoryItem } from "@/lib/admin-endpoints";
import { pickAndUploadImage, showConfigToast, useConfigDomain } from "@/lib/platform-config";

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

type VideoConfig = {
  column_name: string;
  share_image_url: string | null;
  share_title: string;
  share_summary: string;
  normal_post_review: boolean;
  normal_comment_review: boolean;
  verified_post_review: boolean;
  verified_comment_review: boolean;
  whitelist: string;
  hot_view_threshold: number;
  new_video_days: number;
  tip_min: number;
  tip_max: number;
  red_packet_countdown: number;
  publish_agreement_html: string;
};

const DEFAULTS: VideoConfig = {
  column_name: "脱单加油站",
  share_image_url: null,
  share_title: "脱单干货",
  share_summary: "了解我们，分享脱单干货和直播高光片段，回顾精彩活动，认识优质嘉宾",
  normal_post_review: true,
  normal_comment_review: false,
  verified_post_review: true,
  verified_comment_review: false,
  whitelist: "",
  hot_view_threshold: 100,
  new_video_days: 7,
  tip_min: 1,
  tip_max: 100,
  red_packet_countdown: 10,
  publish_agreement_html: "",
};

export default function ShortVideoConfigPage() {
  const { snapshot, save } = useConfigDomain<VideoConfig>("tools_short_video", DEFAULTS);
  const [cfg, setCfg] = useState<VideoConfig>(DEFAULTS);
  const [categories, setCategories] = useState<VideoCategoryItem[]>([]);
  const [brush, setBrush] = useState({
    views: ["100", "999"],
    likes: ["100", "999"],
    publish: ["1", "1000"],
  });

  useEffect(() => {
    if (snapshot) setCfg({ ...DEFAULTS, ...snapshot.config });
  }, [snapshot]);

  const loadCategories = () => {
    adminEndpoints.videoCategoryList().then(setCategories).catch(() => undefined);
  };
  useEffect(loadCategories, []);

  const set = <K extends keyof VideoConfig>(key: K, value: VideoConfig[K]) =>
    setCfg((cur) => ({ ...cur, [key]: value }));

  const submit = async () => {
    const el = document.getElementById("svc-agreement");
    const payload = { ...cfg, publish_agreement_html: el ? el.innerHTML : cfg.publish_agreement_html };
    const ok = await save(payload, "短视频参数配置更新");
    showConfigToast(ok ? "保存成功" : "内容无变化", ok ? "ok" : "error");
  };

  const runBrush = async (type: "views" | "likes" | "publish_time", range: string[]) => {
    const min = Number(range[0]);
    const max = Number(range[1]);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
      showConfigToast("请输入有效的数值区间", "error");
      return;
    }
    try {
      const res = await adminEndpoints.brushVideos(type, min, max);
      showConfigToast(`执行完成，影响 ${res.affected} 条视频`);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "执行失败", "error");
    }
  };

  const addCategory = async () => {
    const name = window.prompt("请输入视频分类名称");
    if (!name) return;
    try {
      await adminEndpoints.createVideoCategory({ name, sort: categories.length + 1, status: 1 });
      loadCategories();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "新增失败", "error");
    }
  };
  const removeCategory = async (id: number) => {
    try {
      await adminEndpoints.deleteVideoCategory(id);
      setCategories((arr) => arr.filter((c) => c.id !== id));
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const reviewOptions = (key: "normal_post_review" | "normal_comment_review" | "verified_post_review" | "verified_comment_review") => (
    <div className="svc-options svc-options-row">
      {[["需要审核", true], ["无需审核", false]].map(([label, value]) => (
        <label key={String(label)} className={`svc-radio ${cfg[key] === value ? "active" : ""}`}>
          <input type="radio" checked={cfg[key] === value} onChange={() => set(key, value as never)} />
          <span>{label as string}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 卡片 1：参数配置 */}
      <div className="finord-card svc-card">
        <div className="svc-head">
          <h2 className="svc-title">参数配置</h2>
          <button className="finord-btn finord-btn-primary svc-submit-head" onClick={submit}>确定提交</button>
        </div>

        <div className="svc-row">
          <span className="svc-label">自定义栏目名称</span>
          <input className="svc-input svc-input-wide" value={cfg.column_name} onChange={(e) => set("column_name", e.target.value)} />
        </div>

        <div className="svc-row svc-row-top">
          <span className="svc-label">栏目首页分享图片</span>
          <div className="svc-share-wrap">
            <div className="svc-pick">
              <div className="svc-pick-preview">
                {cfg.share_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cfg.share_image_url} alt="分享图" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                ) : (
                  <>脱单<br />加油站</>
                )}
              </div>
              <label className="svc-pick-btn" style={{ cursor: "pointer" }}>
                上传图片
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => pickAndUploadImage(e.target.files?.[0], (url) => set("share_image_url", url), (m) => showConfigToast(m, "error"))}
                />
              </label>
            </div>
            <div className="svc-share-preview">
              <div className="svc-share-preview-title">分享效果预览</div>
              <div className="svc-share-preview-card">
                <div className="svc-share-preview-head">
                  <div className="svc-share-preview-name">{cfg.share_title}</div>
                  <div className="svc-share-preview-body">{cfg.share_summary}</div>
                </div>
                <div className="svc-share-preview-badge">脱单<br />加油站</div>
              </div>
            </div>
          </div>
        </div>

        <div className="svc-row">
          <span className="svc-label">栏目首页分享标题</span>
          <input className="svc-input svc-input-wide" value={cfg.share_title} onChange={(e) => set("share_title", e.target.value)} />
        </div>

        <div className="svc-row">
          <span className="svc-label">栏目首页分享摘要</span>
          <textarea className="svc-textarea" rows={3} value={cfg.share_summary} onChange={(e) => set("share_summary", e.target.value)} />
        </div>

        <div className="svc-row">
          <span className="svc-label">普通会员发布视频</span>
          <div className="svc-content">
            {reviewOptions("normal_post_review")}
            <div className="svc-info">① 在编辑中重新上传了视频，也是要平台重新审核</div>
          </div>
        </div>

        <div className="svc-row">
          <span className="svc-label">普通会员发布评论</span>
          {reviewOptions("normal_comment_review")}
        </div>

        <div className="svc-row">
          <span className="svc-label">认证会员发布视频</span>
          {reviewOptions("verified_post_review")}
        </div>

        <div className="svc-row">
          <span className="svc-label">认证会员发布评论</span>
          {reviewOptions("verified_comment_review")}
        </div>

        <div className="svc-row svc-row-top">
          <span className="svc-label">免审核白名单</span>
          <div className="svc-content">
            <textarea className="svc-textarea" rows={3} value={cfg.whitelist} onChange={(e) => set("whitelist", e.target.value)} />
            <div className="svc-info">输入账号昵称，多个用逗号隔开；白名单的用户发布视频和评论不需要审核</div>
          </div>
        </div>

        <div className="svc-row svc-row-top">
          <span className="svc-label">其他配置</span>
          <div className="svc-other">
            <span>当视频的播放量达到</span>
            <input className="svc-input svc-input-sm" value={cfg.hot_view_threshold} onChange={(e) => set("hot_view_threshold", Number(e.target.value) || 0)} />
            <span>次，自动上热门，成为热门视频</span>
            <input className="svc-input svc-input-sm" value={cfg.new_video_days} onChange={(e) => set("new_video_days", Number(e.target.value) || 0)} />
            <span>天内的视频视为新上视频，显示新上标签</span>
          </div>
        </div>

        <div className="svc-row">
          <span className="svc-label">现金打赏随机范围</span>
          <div className="svc-range">
            <input className="svc-input svc-input-sm" value={cfg.tip_min} onChange={(e) => set("tip_min", Number(e.target.value) || 0)} />
            <span className="svc-unit">元</span>
            <span className="svc-tilde">至</span>
            <input className="svc-input svc-input-sm" value={cfg.tip_max} onChange={(e) => set("tip_max", Number(e.target.value) || 0)} />
            <span className="svc-unit">元</span>
          </div>
        </div>

        <div className="svc-row">
          <span className="svc-label">红包倒计时</span>
          <div className="svc-content">
            <div className="svc-range">
              <input className="svc-input svc-input-sm" value={cfg.red_packet_countdown} onChange={(e) => set("red_packet_countdown", Number(e.target.value) || 0)} />
              <span className="svc-unit">秒</span>
            </div>
            <div className="svc-info">① 可以设置一个最长时间，当视频播放时间超过设置的时候就可以领红包，不必等放完。若视频时长不足设置的时间则按照视频本身时长计</div>
          </div>
        </div>

        <div className="svc-row svc-row-top">
          <span className="svc-label"><span className="svc-req">＊</span>视频发布协议</span>
          <div className="svc-editor">
            <div className="svc-editor-toolbar">
              {TOOLBAR.map((tool, i) => (
                <button className="svc-editor-tool" key={`${tool.title}-${i}`} title={tool.title}>{tool.t}</button>
              ))}
            </div>
            <div
              id="svc-agreement"
              className="svc-editor-body"
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: `<pre class="svc-editor-text">${cfg.publish_agreement_html || AGREEMENT_CONTENT}</pre>` }}
            />
          </div>
        </div>

        <div className="svc-submit-row">
          <button className="finord-btn finord-btn-primary svc-submit" onClick={submit}>确定提交</button>
        </div>
      </div>

      {/* 卡片 2：数据刷粉 */}
      <div className="finord-card svc-card">
        <div className="svc-section-title">数据刷粉</div>

        <div className="svc-row svc-row-top">
          <span className="svc-label">增加人气</span>
          <div className="svc-content">
            <div className="svc-brush">
              <input className="svc-input svc-input-brush" value={brush.views[0]} onChange={(e) => setBrush((b) => ({ ...b, views: [e.target.value, b.views[1]] }))} />
              <span className="svc-dash">-</span>
              <input className="svc-input svc-input-brush" value={brush.views[1]} onChange={(e) => setBrush((b) => ({ ...b, views: [b.views[0], e.target.value] }))} />
              <button className="finord-btn finord-btn-primary svc-brush-btn" onClick={() => runBrush("views", brush.views)}>执行</button>
            </div>
            <div className="svc-info">① 批量给所有视频增加播放量</div>
          </div>
        </div>

        <div className="svc-row svc-row-top">
          <span className="svc-label">增加点赞数</span>
          <div className="svc-content">
            <div className="svc-brush">
              <input className="svc-input svc-input-brush" value={brush.likes[0]} onChange={(e) => setBrush((b) => ({ ...b, likes: [e.target.value, b.likes[1]] }))} />
              <span className="svc-dash">-</span>
              <input className="svc-input svc-input-brush" value={brush.likes[1]} onChange={(e) => setBrush((b) => ({ ...b, likes: [b.likes[0], e.target.value] }))} />
              <button className="finord-btn finord-btn-primary svc-brush-btn" onClick={() => runBrush("likes", brush.likes)}>执行</button>
            </div>
            <div className="svc-info">① 批量给所有视频增加点赞数</div>
          </div>
        </div>

        <div className="svc-row svc-row-top">
          <span className="svc-label">刷新发布时间</span>
          <div className="svc-content">
            <div className="svc-brush">
              <input className="svc-input svc-input-brush" value={brush.publish[0]} onChange={(e) => setBrush((b) => ({ ...b, publish: [e.target.value, b.publish[1]] }))} />
              <span className="svc-dash">-</span>
              <input className="svc-input svc-input-brush" value={brush.publish[1]} onChange={(e) => setBrush((b) => ({ ...b, publish: [b.publish[0], e.target.value] }))} />
              <button className="finord-btn finord-btn-primary svc-brush-btn" onClick={() => runBrush("publish_time", brush.publish)}>执行</button>
            </div>
            <div className="svc-info">① 批量给ID区间范围内视频刷新发布时间</div>
          </div>
        </div>
      </div>

      {/* 卡片 3：视频分类 */}
      <div className="finord-card svc-card">
        <div className="svc-section-title">视频分类</div>
        <div className="svc-tags-row">
          {categories.map((c) => (
            <span className="svc-tag" key={c.id}>
              {c.name}
              <span className="svc-tag-icons">
                <span className="svc-tag-icon" aria-label="编辑">✎</span>
                <span className="svc-tag-icon" aria-label="删除" onClick={() => removeCategory(c.id)}>×</span>
                <span className="svc-tag-icon" aria-label="拖动">⋮⋮</span>
              </span>
            </span>
          ))}
          <button type="button" className="svc-add-tag" onClick={addCategory}>＋ 添加分类</button>
        </div>
      </div>
    </div>
  );
}
