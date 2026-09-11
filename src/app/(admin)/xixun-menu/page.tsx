"use client";
import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "红娘喜讯", href: "/xixun-menu" },
  { label: "栏目配置" },
];

interface CategoryRow {
  label: string;
  value: string;
  canDown?: boolean;
}

const categories: CategoryRow[] = [
  { label: "牵手成功", value: "牵手成功" },
  { label: "恋爱生活", value: "恋爱生活" },
  { label: "已见父母", value: "已见父母" },
  { label: "已订婚", value: "已订婚" },
  { label: "已领证", value: "已领证" },
  { label: "已办婚礼", value: "已办婚礼" },
  { label: "婚后生活", value: "婚后生活" },
  { label: "锦旗飘飘", value: "锦旗飘飘", canDown: false },
];

const blessings = [
  "恭喜这位孤寡青蛙成功上岸！从此下雨有人撑伞，吃火锅有人递纸。愿你们往后的日子，眼里有光，心里有爱，身边有彼此。",
  "终于有人把你这个人间宝藏捡回家啦！祝你们在平淡生活里，也能把日子过成糖。",
  "国家分配的CP终于到货了！祝您在这个看脸的世界里，不仅收获颜值，更收获满满的幸福。",
  "叮！您的单身贵族体验卡已到期，系统自动为您续费双人甜蜜套餐。愿往后余生，酸甜苦辣都有他/她陪。",
  "恭喜解锁人生新地图——恋爱副本！愿你们在这个快节奏的时代里，慢慢喜欢，慢慢相爱。",
  "听闻你们要锁死啦！一个像夏天，一个像秋天，在一起就是最好的春天。愿这份美好常伴左右。",
  "始于初见，止于终老。订婚快乐！愿你们往后踏遍远方，有灯、有家、有彼此。",
  "全网通告：这两位同志已于今日正式组团成功！祝你们拥有9999纯金的幸福。",
  "祝你们哪怕以后凑在一起买菜，都能砍价成功，然后回家愉快地做饭！这才是最踏实的人间烟火。",
  "佳偶天成，百年好合！",
  "谨以白头之约，书向鸿笺；好将红叶之盟，载明鸳谱。祝琴瑟和鸣，岁月静好。",
  "恭喜你正式从单身版升级为双人版！以后吵架记得别拔网线，祝幸福！",
  "最好的爱情大概就是：他像太阳，她像月亮，相遇时便有了满天星光。祝你们新婚快乐！",
  "愿你们不仅是这一天的公主和王子，更是余生里彼此最坚实的依靠。订婚快乐！",
  "从今以后，风有风，海有海，你们有彼此。愿你们无论走多远，回头都有家。",
];

export default function XixunMenuPage() {
  const [coverMode, setCoverMode] = useState<"system" | "custom">("custom");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色须知条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>红娘喜讯栏目是给婚介机构搭建一个基于"用户反馈"的成功案例"展示平台。致力于解决客户对"婚介不信任"的社会难题，帮助其提升信任度、口碑、品牌形象</p>
            <p>并创新性的设置了"线上送锦旗"功能。让客户能够快捷方便、不花1分钱就可以给婚介或红娘赠送锦旗，平台上设有专门的"锦旗墙"栏目来集中展示这些锦旗。同时也可以将这些锦旗自行制作为实物悬挂于门店中或任何行业。我们始终坚信：客户的认可才是最佳的销售利器</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="xm-title">栏目设置</div>

        {/* 栏目浏览 */}
        <div className="xm-row">
          <span className="xm-label">栏目浏览</span>
          <div className="xm-content">
            <span className="xm-inline">网址路径:</span>
            <span className="xm-link">https://www.xuanshiai.com/subpages/xixun/index</span>
            <span className="xm-inline">二维码:</span>
            <a className="xm-blue" href="#">查看</a>
            <span className="xm-inline">在线预览:</span>
            <a className="xm-blue" href="#">点击这里</a>
          </div>
        </div>

        {/* 栏目标题 */}
        <div className="xm-row">
          <span className="xm-label">栏目标题</span>
          <input className="xm-input" defaultValue="脱单喜讯" />
        </div>

        {/* 栏目描述 */}
        <div className="xm-row">
          <span className="xm-label">栏目描述</span>
          <input className="xm-input" defaultValue="脱单喜讯" />
        </div>

        {/* 分享封面 */}
        <div className="xm-row">
          <span className="xm-label">分享封面</span>
          <div className="xm-content">
            <div className="xm-radios">
              <label className="xm-radio">
                <input type="radio" checked={coverMode === "system"} onChange={() => setCoverMode("system")} />
                系统默认
              </label>
              <label className="xm-radio">
                <input type="radio" checked={coverMode === "custom"} onChange={() => setCoverMode("custom")} />
                自定义 (300*300)
              </label>
            </div>
            {coverMode === "custom" && (
              <div className="xm-cover">
                <div className="xm-cover-img">
                  <span className="xm-cover-name">脱单喜讯</span>
                  <span className="xm-cover-upload">上传图片</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 宣传头图 */}
        <div className="xm-row">
          <span className="xm-label">宣传头图</span>
          <div className="xm-content xm-upload-row">
            <button className="xm-upload-btn">上 上传</button>
            <span className="xm-muted">最佳尺寸: 698像素x240像素</span>
          </div>
        </div>

        {/* 喜讯分类 */}
        <div className="xm-row">
          <span className="xm-label">喜讯分类</span>
          <div className="xm-content xm-cats">
            {categories.map((c, i) => (
              <div className="xm-cat" key={c.label}>
                <span className="xm-cat-label">{c.label}:</span>
                <input className="xm-cat-input" defaultValue={c.value} />
                <button className="xm-cat-icon">👤 更换图标</button>
                <span className="xm-cat-moves">
                  {(c.canDown !== false || i < categories.length - 1) && (
                    <button className="xm-cat-move up">↑ 上移</button>
                  )}
                  {c.canDown !== false && (
                    <button className="xm-cat-move down">↓ 下移</button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 祝福语管理 */}
        <div className="xm-row">
          <span className="xm-label">祝福语管理</span>
          <div className="xm-content xm-bless">
            <button className="xm-add-btn">＋ 添加</button>
            {blessings.map((b, i) => (
              <div className="xm-bless-item" key={i}>
                <span className="xm-bless-text">{b}</span>
                <button className="xm-bless-del">🗑 删除</button>
              </div>
            ))}
          </div>
        </div>

        {/* 提交 */}
        <div className="xm-actions">
          <button className="xm-submit">确定提交</button>
        </div>
      </div>
    </div>
  );
}
