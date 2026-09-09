"use client";
import { useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "搭子社群", href: "/group-menu" },
  { label: "栏目配置" },
];

const toolbar = [
  { t: "H", title: "标题" },
  { t: "B", title: "加粗" },
  { t: "T", title: "正文" },
  null,
  { t: "I", title: "斜体" },
  { t: "U", title: "下划线" },
  { t: "S", title: "删除线" },
  null,
  { t: "≡", title: "左对齐" },
  { t: "☰", title: "居中" },
  { t: "≡", title: "右对齐" },
  null,
  { t: "••", title: "无序列表" },
  { t: "1.", title: "有序列表" },
  null,
  { t: "❝", title: "引用" },
  { t: "🔗", title: "链接" },
  { t: "🖼", title: "图片" },
  { t: "⋯", title: "更多" },
  null,
  { t: "↶", title: "撤销" },
  { t: "↷", title: "重做" },
  null,
  { t: "🗑", title: "清空" },
];

const noticeText = "为了确保本群的良好秩序与活跃氛围，请各位新成员仔细阅读以下入群须知，并自觉遵守：";
const noticeContent = [
  { h: "一、群目的与定位：", p: "本群旨在提供一个健康、有趣、有爱的交友活动平台。\n请确保您的加入与群的宗旨相关，共同维护群的专业性和专注度。" },
  { h: "二、文明交流：", p: "在群内发言时，请使用文明、尊重的语言，避免发表攻击性、侮辱性、色情、违法或不良信息。\n鼓励积极正面的交流，禁止任何形式的骚扰、歧视或恶意攻击他人。" },
  { h: "三、遵守法律法规：", p: "群内不得传播违反国家法律法规的内容，包括但不限于谣言、暴力、恐怖主义、色情信息等。\n如发现违规行为，群管理将有权采取警告、禁言或移出群聊等措施，并视情况向相关部门报告。" },
  { h: "四、分享与互助：", p: "鼓励成员分享有价值的信息、经验和资源，促进知识共享与互助合作。\n提问时请尽量描述清楚，以便他人更好地提供帮助。" },
  { h: "五、广告与推广：", p: "未经群管理同意，禁止在群内发布任何形式的广告、推广链接或招募信息。\n对于违规推广行为，群管理将严格处理。" },
  { h: "六、群管理与规则执行：", p: "群管理团队负责监督群内秩序，执行群规，处理违规行为。\n如对群管理有建议或意见，请私下与管理员沟通，避免在群内引起不必要的争议。" },
  { h: "七、退群与申诉：", p: "成员有权自由选择退群，退群前请告知群管理，以便维护群成员资料的准确性。\n如因操作被误退或认为处理不公，可向群管理提出申诉，我们将公正处理。" },
];
const noticeEnd = "最后，感谢大家的加入与支持！让我们携手共创一个和谐、有价值、充满正能量的社群环境，期待与您共同成长，收获满满！";

const agreementContent = [
  { h: "一、群目的与定位", p: "本群旨在提供一个学习交流、兴趣爱好分享的平台。\n您应确保您的加入与群的宗旨相关，并愿意积极参与群内的讨论和活动。" },
  { h: "二、文明交流", p: "在群内发言时，您应使用文明、尊重的语言，避免发表攻击性、侮辱性、色情、违法或不良信息。\n您应鼓励积极正面的交流，禁止任何形式的骚扰、歧视或恶意攻击他人。" },
  { h: "三、遵守法律法规", p: "您应在群内不得传播违反国家法律法规的内容，包括但不限于谣言、暴力、恐怖主义、色情信息等。\n如您发现群内有违规行为，应及时向群管理举报。" },
  { h: "四、分享与互助", p: "鼓励成员分享有价值的信息、经验和资源，促进知识共享与互助合作。" },
];

const agreementIntro = "尊敬的用户：\n欢迎您加入我们的群！为了维护本群的良好秩序和积极氛围，确保每位成员都能从中受益，特制定本入群协议。请您在加入本群前仔细阅读以下条款，并确认同意遵守。";

export default function GroupMenuPage() {
  const [coverMode, setCoverMode] = useState<"system" | "custom">("system");
  const [imgMode, setImgMode] = useState<"system" | "custom">("system");
  const [hotOpen, setHotOpen] = useState(false);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card">
        <div className="xm-title">栏目设置</div>

        {/* 栏目名称 */}
        <div className="xm-row">
          <span className="xm-label">栏目名称</span>
          <div className="xm-content">
            <input className="xm-input" defaultValue="找搭子" style={{ width: 360 }} />
            <div className="gm-info">● 作为首页和分享标题。</div>
          </div>
        </div>

        {/* 栏目描述 */}
        <div className="xm-row">
          <span className="xm-label">栏目描述</span>
          <div className="xm-content">
            <textarea className="gm-textarea" rows={3} defaultValue="年轻人的潮流新社交。放下手机，遇见真实的Ta" />
            <div className="gm-info">● 作为分享描述</div>
          </div>
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
          </div>
        </div>

        {/* 首页头图 */}
        <div className="xm-row">
          <span className="xm-label">首页头图</span>
          <div className="xm-content">
            <div className="xm-radios">
              <label className="xm-radio">
                <input type="radio" checked={imgMode === "system"} onChange={() => setImgMode("system")} />
                系统默认
              </label>
              <label className="xm-radio">
                <input type="radio" checked={imgMode === "custom"} onChange={() => setImgMode("custom")} />
                自定义 (778*417)
              </label>
            </div>
          </div>
        </div>

        {/* 社群分类 */}
        <div className="xm-row">
          <span className="xm-label">社群分类</span>
          <div className="xm-content">
            <div className="gm-catbar">
              <span className="gm-catbar-dot">●</span>
              请在&ldquo;平台配置-基础数据-社群分类&rdquo;中添加和管理
              <a className="gm-catbar-go" href="#">转入</a>
            </div>
          </div>
        </div>

        {/* 热门区域 */}
        <div className="xm-row">
          <span className="xm-label">热门区域</span>
          <div className="xm-content">
            <button className="gm-add-hot" onClick={() => setHotOpen(true)}>＋ 添加热门区域</button>
          </div>
        </div>

        {/* 推广介绍 */}
        <div className="xm-row">
          <span className="xm-label">推广介绍</span>
          <div className="xm-content">
            <div className="gm-editor">
              <div className="gm-toolbar">
                {toolbar.map((tool, i) =>
                  tool === null ? (
                    <span className="gm-tool-sep" key={`sep-${i}`} />
                  ) : (
                    <button className="gm-tool" key={`${tool.title}-${i}`} title={tool.title}>
                      {tool.t}
                    </button>
                  )
                )}
              </div>
              <div className="gm-body">
                {/* 推广介绍图片 */}
                <div className="gm-banner">
                  <div className="gm-banner-text">
                    <div className="gm-banner-badge">邀请朋友一起加入</div>
                    <div className="gm-banner-title">年轻人的潮流社交</div>
                  </div>
                  <div className="gm-banner-illus">
                    <span className="gm-banner-horn">📢</span>
                    <span className="gm-banner-face">☺</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 入群须知 */}
        <div className="xm-row">
          <span className="xm-label">入群须知</span>
          <div className="xm-content">
            <div className="gm-editor">
              <div className="gm-toolbar">
                {toolbar.map((tool, i) =>
                  tool === null ? (
                    <span className="gm-tool-sep" key={`sep-${i}`} />
                  ) : (
                    <button className="gm-tool" key={`${tool.title}-${i}`} title={tool.title}>
                      {tool.t}
                    </button>
                  )
                )}
              </div>
              <div className="gm-body gm-body-text">
                <p>{noticeText}</p>
                {noticeContent.map((c) => (
                  <p key={c.h}>
                    <strong>{c.h}</strong>
                    {c.p.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < c.p.split("\n").length - 1 ? <br /> : null}
                      </span>
                    ))}
                    <br />
                  </p>
                ))}
                <p>{noticeEnd}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 入群协议 */}
        <div className="xm-row">
          <span className="xm-label">入群协议</span>
          <div className="xm-content">
            <div className="gm-editor">
              <div className="gm-toolbar">
                {toolbar.map((tool, i) =>
                  tool === null ? (
                    <span className="gm-tool-sep" key={`sep-${i}`} />
                  ) : (
                    <button className="gm-tool" key={`${tool.title}-${i}`} title={tool.title}>
                      {tool.t}
                    </button>
                  )
                )}
              </div>
              <div className="gm-body gm-body-text">
                {agreementIntro.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
                {agreementContent.map((c) => (
                  <p key={c.h}>
                    <strong>{c.h}</strong>
                    {c.p.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < c.p.split("\n").length - 1 ? <br /> : null}
                      </span>
                    ))}
                    <br />
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 提交 */}
        <div className="xm-actions">
          <button className="xm-submit">确定提交</button>
        </div>
      </div>

      {hotOpen && (
        <>
          <div className="tlc-mask" onClick={() => setHotOpen(false)} />
          <div className="tlc-panel gp-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button className="tlc-x" onClick={() => setHotOpen(false)} aria-label="关闭"><X size={18} /></button>
                <span className="tlc-panel-title">添加热门区域</span>
              </div>
              <div className="gp-head-actions">
            <button className="finord-btn gp-cancel" onClick={() => setHotOpen(false)}>取消</button>
                <button className="finord-btn finord-btn-primary">确定提交</button>
              </div>
            </div>
            <div className="tlc-panel-body">
              {/* 区域选择 */}
              <div className="gp-row">
                <div className="gp-row-top">
                  <span className="gp-label">＊可选择任意省级或以下区域</span>
                  <span className="gp-info-inline">请选择您想要加入的终极区域名</span>
                </div>
                <div className="gp-content">
                  <input className="gp-input" placeholder="" />
                </div>
              </div>

              {/* 热门区域 */}
              <div className="gp-row">
                <div className="gp-row-top">
                  <span className="gp-label">＊热门区域</span>
                </div>
                <div className="gp-content">
                  <select className="gp-select gp-select-wide">
                    <option>请选择</option>
                    <option>北京</option>
                    <option>上海</option>
                    <option>广州</option>
                    <option>深圳</option>
                    <option>杭州</option>
                    <option>南京</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
