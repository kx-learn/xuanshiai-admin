"use client";

import { useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* 数据定义                                                            */
/* ------------------------------------------------------------------ */

interface Album {
  key: string;
  label: string; // 左侧分类名
  cardLabel: string; // 卡片下方的素材类型名
  emojis: string[]; // 图片占位 emoji（轮换）
  hue: number; // 占位渐变基色
  tabs: string[]; // 子 tab（长度>1 才显示 tab 行）
  count: number; // 卡片数量
  startId: number; // ID 起点（递减）
  empty?: boolean; // 是否空态（公众号）
}

const albums: Album[] = [
  { key: "recent", label: "最近更新", cardLabel: "活动小图", emojis: ["🌽", "🎪", "🧩", "🗺", "🎪", "🧑‍🤝‍🧑", "😋", "🌽", "🎪", "🧩", "🗺", "🎪", "🧑‍🤝‍🧑", "🌽", "😋"], hue: 148, tabs: ["最近更新"], count: 15, startId: 4260 },
  { key: "all", label: "全部素材", cardLabel: "活动小图", emojis: ["🏕", "🌽", "🧩", "🎪", "🧗", "🌽", "🧩", "🎪", "🧗", "🌽", "🧩", "🎪", "🧗", "🌽", "🧩"], hue: 128, tabs: ["全部素材"], count: 15, startId: 4260 },
  { key: "lunbo", label: "平台轮播图", cardLabel: "平台轮播图", emojis: ["💃", "🎊", "💑", "🎯", "❤", "🌉", "👫", "⏳", "🤝", "🔗", "👰", "💞"], hue: 288, tabs: ["全部", "平台首页", "活动栏目"], count: 14, startId: 932 },
  { key: "tubiao", label: "平台图标", cardLabel: "线上互选分享图标", emojis: ["💗", "👫", "😊", "💙", "🎈", "🦄", "🌈", "💜", "❤", "💑", "👫", "🌷"], hue: 320, tabs: ["全部", "首页分享图标", "活动分享图标", "互选分享图标", "搭子图标"], count: 14, startId: 3956 },
  { key: "kehu", label: "线下获客", cardLabel: "婚介宣传页效果图", emojis: ["📄", "📄", "📄", "📄", "📄", "📄", "📄", "📄", "📄", "📄", "📄", "📄", "📄", "📄"], hue: 258, tabs: ["全部", "相亲大集", "引流广告扇子", "夜市相亲角", "商场相亲角", "电梯广告", "咖啡厅合作", "健身房合作", "宣传页"], count: 14, startId: 4043 },
  { key: "pengyou", label: "红娘朋友圈", cardLabel: "红娘朋友圈封面图", emojis: ["💬", "❤", "🌿", "🌇", "🩷", "🌅", "🌌", "🌤", "🌠", "🎀", "🧧", "👩‍❤‍👨", "🕊", "🍊"], hue: 358, tabs: ["全部", "朋友圈封面", "情感语录", "鸡汤配图", "营销宣传", "温馨营销"], count: 14, startId: 3198 },
  { key: "haibao", label: "红娘海报", cardLabel: "红娘形象广告海报", emojis: ["💗", "👰", "💑", "👩", "❤", "🎎", "💄", "👠", "🌹", "💝", "🧧", "👩‍❤‍👨"], hue: 350, tabs: ["全部", "广告海报", "招募海报", "私人定制海报"], count: 14, startId: 3903 },
  { key: "cover", label: "活动封面", cardLabel: "活动小图", emojis: ["🏕", "🌽", "🧩", "🎪", "🧗", "🌽", "🧩", "🎪", "🧗", "🌽", "🧩", "🎪", "🧗", "🌽"], hue: 138, tabs: ["全部", "线下活动", "互动活动", "活动小图"], count: 14, startId: 4260 },
  { key: "zhaomu", label: "活动招募", cardLabel: "偷吃大赛引流图", emojis: ["😋", "🍟", "🍕", "🍔", "🌽", "🍿", "🍗", "🍟", "🧀", "🍚", "🍰", "🍭", "🍢", "🍜"], hue: 38, tabs: ["全部", "躺平大赛", "偷吃大赛", "拼豆大赛", "抓捕老鼠", "青年社交", "相亲活动", "线上互选", "公益活动", "政企活动", "特殊节日活动", "剥玉米大赛"], count: 14, startId: 4078 },
  { key: "avatar", label: "人物头像", cardLabel: "卡通头像", emojis: ["👩", "👧", "👱‍♀", "👧", "🦸‍♀", "👩‍🦰", "👩", "👧", "👩‍🦱", "👱‍♀", "👩", "👧"], hue: 340, tabs: ["全部", "男生头像", "女生头像"], count: 13, startId: 983 },
  { key: "zhuangxiu", label: "装修设计", cardLabel: "活动室效果图", emojis: ["🏠", "🏛", "🛋", "🚪", "🖼", "🌿", "🪑", "💡", "🖥", "🖼", "🛋", "🚪"], hue: 210, tabs: ["全部", "房产+婚恋", "红娘工作室", "高端门店", "街边门店", "文化墙", "写字楼店", "约会间", "红娘谈单间", "活动室"], count: 13, startId: 3737 },
  { key: "gongzhong", label: "公众号", cardLabel: "推文封面图", emojis: [], hue: 18, tabs: ["全部", "推文封面图", "推文内容图"], count: 0, startId: 0, empty: true },
];

interface CardItem {
  id: number;
  label: string;
  emoji: string;
  hue: number;
}

const rewards = [
  { icon: "🥇", title: "国内首家", sub: "专注婚恋行业" },
  { icon: "🎨", title: "原创设计", sub: "版权保障" },
  { icon: "🔄", title: "海量更新", sub: "每日上新" },
  { icon: "⚡", title: "直接可用", sub: "商用无忧" },
];

/* ------------------------------------------------------------------ */
/* 小组件                                                              */
/* ------------------------------------------------------------------ */

function Banner() {
  return (
    <div className="cm-banner">
      <div className="cm-banner-title">婚恋行业图片素材库</div>
      <div className="cm-banner-star">✦</div>
      <div className="cm-banner-rewards">
        {rewards.map((r) => (
          <div className="cm-reward" key={r.title}>
            <span className="cm-reward-icon">{r.icon}</span>
            <span className="cm-reward-text">
              <span className="cm-reward-title">{r.title}</span>
              <span className="cm-reward-sub">{r.sub}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ item }: { item: CardItem }) {
  return (
    <div className="cm-card">
      <div
        className="cm-card-img"
        style={{ background: `linear-gradient(150deg, hsl(${item.hue} 70% 90%), hsl(${item.hue} 72% 78%))` }}
      >
        <span className="cm-card-emoji">{item.emoji}</span>
      </div>
      <div className="cm-card-label">
        {item.label} <span className="cm-card-id">(ID:{item.id})</span>
      </div>
      <div className="cm-card-actions">
        <button type="button" className="cm-card-btn" data-act="view" data-id={item.id} data-label={item.label} data-emoji={item.emoji} data-hue={item.hue}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
          查看
        </button>
        <button type="button" className="cm-card-btn" data-act="download">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" /></svg>
          下载
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="cm-empty">
      <div className="cm-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
      </div>
      <div className="cm-empty-text">暂无数据</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 弹窗主体                                                            */
/* ------------------------------------------------------------------ */

export default function CloudMaterialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeKey, setActiveKey] = useState("recent");
  const [activeTab, setActiveTab] = useState("全部");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [preview, setPreview] = useState<{ id: number; label: string; emoji: string; hue: number } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const album = albums.find((a) => a.key === activeKey) ?? albums[0];

  // 关闭时重置状态
  useEffect(() => {
    if (open) {
      setPreview(null);
      setDetailOpen(false);
      setFeedbackOpen(false);
    }
  }, [open]);

  const cards = useMemo<CardItem[]>(() => {
    if (album.empty) return [];
    if (keyword.trim()) setSearchInput(keyword);
    const list: CardItem[] = [];
    for (let i = 0; i < album.count; i++) {
      list.push({
        id: album.startId - i,
        label: album.cardLabel,
        emoji: album.emojis[i % album.emojis.length] ?? "🏞",
        hue: (album.hue + i * 6) % 360,
      });
    }
    if (searchInput.trim()) {
      const q = searchInput.trim().toLowerCase();
      return list.filter((c) => String(c.id).includes(q) || c.label.toLowerCase().includes(q));
    }
    return list;
  }, [album, searchInput]);

  const applySearch = (value: string) => {
    setKeyword(value);
    if (value.trim() === "") setSearchInput("");
  };

  const onGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const btn = target.closest("[data-act='view']") as HTMLElement | null;
    if (btn) {
      setPreview({
        id: Number(btn.dataset.id),
        label: btn.dataset.label ?? "",
        emoji: btn.dataset.emoji ?? "🏞",
        hue: Number(btn.dataset.hue ?? 0),
      });
      return;
    }
    if (target.closest("[data-act='download']")) {
      // 模拟下载
    }
  };

  if (!open) return null;

  return (
    <div className="cm-mask">
      <div className="cm-dialog">
        <div className="cm-head">
          <span className="cm-title">云端素材</span>
          <button type="button" className="cm-close" aria-label="关闭" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <Banner />

        <div className="cm-body">
          <aside className="cm-nav">
            {albums.map((a) => (
              <button
                key={a.key}
                type="button"
                className={`cm-nav-item ${activeKey === a.key ? "active" : ""}`}
                onClick={() => {
                  setActiveKey(a.key);
                  setActiveTab(a.tabs[0]);
                  setSearchInput("");
                  setKeyword("");
                }}
              >
                {a.label}
              </button>
            ))}
          </aside>

          <section className="cm-main">
            <div className="cm-toolbar">
              <div className="cm-toolbar-left">
                <span className="cm-cat-title">{album.label}</span>
                {album.tabs.length > 1 && (
                  <div className="cm-tabs">
                    {album.tabs.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`cm-tab ${activeTab === t ? "active" : ""}`}
                        onClick={() => {
                          setActiveTab(t);
                          setSearchInput("");
                          setKeyword("");
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="cm-toolbar-right">
                <span className="cm-search-label">按标题关键词/ID搜索</span>
                <input
                  className="cm-search-input"
                  value={keyword}
                  placeholder=""
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") applySearch(keyword); }}
                />
                <button type="button" className="cm-search-btn" onClick={() => applySearch(keyword)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                </button>
                <button type="button" className="cm-tip-btn" onClick={() => setDetailOpen(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.3 4.7L19 9l-3.9 3.3.6 5.2L12 15l-3.7 2.5.6-5.2L5 9l4.7-1.3z" /></svg>
                  改图技巧
                </button>
                <button type="button" className="cm-request-btn" onClick={() => setFeedbackOpen(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v5h5L9 21M14 3l-4 5" /></svg>
                  提交需求
                </button>
              </div>
            </div>

            <div className="cm-content">
              {cards.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="cm-grid" onClick={onGridClick}>
                  {cards.map((c) => <Card key={`${album.key}-${c.id}`} item={c} />)}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {preview && (
        <div className="cm-preview-mask" onClick={() => setPreview(null)}>
          <div className="cm-preview" onClick={(e) => e.stopPropagation()}>
            <div
              className="cm-preview-img"
              style={{ background: `linear-gradient(150deg, hsl(${preview.hue} 70% 90%), hsl(${preview.hue} 72% 78%))` }}
            >
              <span className="cm-preview-emoji">{preview.emoji}</span>
            </div>
            <div className="cm-preview-foot">
              <span className="cm-preview-label">{preview.label} (ID:{preview.id})</span>
              <button type="button" className="cm-preview-close" onClick={() => setPreview(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 改图技巧 · 详情抽屉 */}
      {detailOpen && (
        <div className="cf-mask" onClick={() => setDetailOpen(false)}>
          <div className="cf-detail" onClick={(e) => e.stopPropagation()}>
            <div className="cf-head">
              <button type="button" className="cf-close" aria-label="关闭" onClick={() => setDetailOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
              <span className="cf-head-title">详情</span>
            </div>
            <div className="cf-body">
              <div className="cf-article">
                <div className="cf-article-title">云端素材库使用、改图小技巧</div>

                <div className="cf-step">
                  <div className="cf-step-num">1.打开云端素材库,&quot;找到心仪的图片,&quot;查看&quot;图片,点击&quot;下载&quot;</div>
                  <div className="cf-illus cf-illus-lib">
                    <span className="cf-illus-caption">素材库列表 · 点击「查看」→「下载」</span>
                  </div>
                </div>

                <div className="cf-step">
                  <div className="cf-step-num">2.点击浏览器右上角&quot;下载&quot;图标，打开图片所在文件夹</div>
                  <div className="cf-illus cf-illus-down">
                    <span className="cf-illus-caption">浏览器下载记录 · 打开图片所在文件夹</span>
                  </div>
                </div>

                <div className="cf-step">
                  <div className="cf-step-num">3.文件夹中复制（Ctrl+C）图片</div>
                  <div className="cf-illus cf-illus-folder">
                    <span className="cf-illus-caption">文件夹 · 复制图片</span>
                  </div>
                </div>

                <div className="cf-step">
                  <div className="cf-step-num">4.把图片粘贴（Ctrl+V）到豆包对话框中，输入需要改的口令，让豆包生成</div>
                  <div className="cf-illus cf-illus-paste">
                    <span className="cf-illus-caption">豆包对话框 · 粘贴图片 + 输入口令</span>
                  </div>
                  <div className="cf-ps">口令词示例：</div>
                  <div className="cf-ps-line">帮我把图片中的文字&quot;xx商场中庭&quot;，改成&quot;天鹅湖万达中庭&quot;。</div>
                  <div className="cf-ps-line">把文字&quot;200人青春开吃&quot;，改为300人，</div>
                  <div className="cf-ps-line">把&quot;上课偷偷吃，才是真青春&quot;改为：&quot;开吃时间：6.14 14：00&quot;</div>
                </div>

                <div className="cf-step">
                  <div className="cf-step-num">5.等待豆包生成，点击图片查看效果，右上角保存生成的图片。豆包生成展示：</div>
                  <div className="cf-illus cf-illus-doubao">
                    <span className="cf-illus-caption">豆包生成结果 · 右上角保存</span>
                  </div>
                </div>

                <div className="cf-step">
                  <div className="cf-step-num">6.常用提示口令</div>
                  <div className="cf-ps-line">1.改地方：帮我把图片中的文字&quot;xx商场中庭&quot;，改成&quot;天鹅湖万达中庭&quot;</div>
                  <div className="cf-ps-line">2.改时间：帮我把图片中的文字&quot;活动时间 XX月XX日 XX:XX&quot;，改为：&quot;活动时间：6.14 14：00&quot;</div>
                  <div className="cf-ps-line">3.改人数：帮我把图片中的文字&quot;200人&quot;，改成&quot;400人&quot;</div>
                  <div className="cf-ps-line">4.改图片：帮我把图片中的&quot;咪咪虾条&quot;图片，改成&quot;薯片&quot;图片</div>
                  <div className="cf-ps-line">5.改尺寸：保持图片内容不变，把图片尺寸改成&quot;3：4&quot;，&quot;9：16&quot;</div>
                  <div className="cf-ps-note">注：图片文字仅供参考，如有雷同，纯属巧合</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提交需求 · 添加反馈抽屉 */}
      {feedbackOpen && (
        <div className="cf-mask" onClick={() => setFeedbackOpen(false)}>
          <div className="cf-feedback" onClick={(e) => e.stopPropagation()}>
            <div className="cf-head">
              <div className="cf-head-left">
                <span className="cf-head-title">添加反馈</span>
              </div>
              <div className="cf-head-actions">
                <button type="button" className="cf-btn-plain" onClick={() => setFeedbackOpen(false)}>取消</button>
                <button type="button" className="cf-btn-primary" onClick={() => setFeedbackOpen(false)}>确定提交</button>
              </div>
            </div>
            <div className="cf-feedback-body">
              <div className="cf-row">
                <span className="cf-label">反馈类型</span>
                <div className="cf-radios">
                  {["BUG反馈", "使用咨询", "需求建议", "故障诊断", "其他"].map((t) => (
                    <label key={t} className="cf-radio">
                      <input type="radio" name="cf-type" className="cf-radio-input" />
                      <span className="cf-radio-dot"></span>
                      <span className="cf-radio-text">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="cf-row cf-row-top">
                <span className="cf-label cf-label-req">内容<i>*</i></span>
                <div className="cf-editor">
                  <div className="cf-editor-toolbar">
                    {["H", "B", "T₁", "T₂", "I", "U", "S", "字体", "引用", "✓", "链接", "🖼", "表格", "代码", "😊"].map((t) => (
                      <button type="button" key={t} className="cf-tool">{t}</button>
                    ))}
                  </div>
                  <textarea className="cf-editor-text" placeholder="请输入正文" />
                </div>
              </div>

              <div className="cf-row">
                <span className="cf-label cf-label-req">手机<i>*</i></span>
                <input className="cf-input" defaultValue="13285288888" />
              </div>

              <div className="cf-row">
                <span className="cf-label">微信</span>
                <input className="cf-input" defaultValue="" />
              </div>

              <div className="cf-row">
                <span className="cf-label">QQ</span>
                <input className="cf-input" defaultValue="" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
