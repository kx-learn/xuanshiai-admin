"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Camera,
  Clipboard,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  Link2,
  Menu,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/admin-api";

type Member = {
  id?: number;
  nickname?: string | null;
  avatar?: string | null;
};

const TABS = [
  { key: "basic", label: "基本资料" },
  { key: "auth", label: "认证信息" },
  { key: "media", label: "照片视频" },
  { key: "intro", label: "自我介绍" },
  { key: "requirement", label: "择偶要求" },
  { key: "follow", label: "服务跟进" },
  { key: "private", label: "私密信息" },
  { key: "match", label: "推荐匹配" },
  { key: "calls", label: "通话记录" },
  { key: "line", label: "牵线记录" },
  { key: "dating", label: "约会记录" },
  { key: "activities", label: "活动报名" },
  { key: "behavior", label: "线上行为" },
  { key: "super", label: "超级管理" },
  { key: "source", label: "信息溯源" },
];

const STATUS_OPTIONS = ["公开相亲", "委托红娘", "完全私密", "停止相亲", "已经脱单"];
const TAG_OPTIONS = [
  "高颜值",
  "高收入",
  "985毕业",
  "211毕业",
  "事业单位",
  "双一流",
  "海归",
  "身材好",
  "博士",
  "央国企",
  "银行金融",
  "公务员",
];
const ZODIAC = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const EDUCATION = ["初中", "技校", "高中", "中专", "大专", "本科", "硕士", "博士"];
const INCOME = ["3千元以下", "3-5千元", "5-8千元", "8千-1万元", "1-2万元", "2万以上", "5万以上", "年入百万"];
const OCCUPATION = [
  "私企员工",
  "央企/国企",
  "外企",
  "事业单位",
  "公务员",
  "教师",
  "医生",
  "护士",
  "互联网行业",
  "自由职业",
  "军人",
  "工人",
  "服务业",
  "金融",
  "律师",
  "求职中",
  "在校学生",
  "个体老板",
  "公司高管",
  "美容师/健身教练",
];
const MARRIAGE_TARGET = ["一年内结婚", "两年内结婚", "三年内结婚", "时机成熟时结婚"];
const ETHNICITY = ["汉族", "蒙古族", "回族", "藏族", "维吾尔族", "苗族", "其他"];
const HOUSE = ["不限", "愿意和父母同住", "要有独立婚房", "住房无所谓"];
const SMOKE = ["不限", "不接受吸烟", "可以偶尔吸烟", "吸烟无所谓"];
const DRINK = ["不限", "不接受喝酒", "可以偶尔小酌", "喝酒无所谓"];
const MARITAL_ACCEPT = ["不限", "不接受离异", "可接受离异未育", "可接受离异有孩子", "视情况而定"];

/* ------------------------------------------------------------------ */
/* 基础表单组件（静态：使用 defaultValue / defaultChecked）            */
/* ------------------------------------------------------------------ */

function Inp({
  value,
  placeholder,
  readOnly,
  type,
  unit,
}: {
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
  unit?: string;
}) {
  return (
    <span className="mdt-input-wrap">
      <input
        className="mdt-input"
        defaultValue={value}
        placeholder={placeholder}
        readOnly={readOnly}
        type={type}
        style={unit ? { paddingRight: 36 } : undefined}
      />
      {unit ? <span className="mdt-unit">{unit}</span> : null}
    </span>
  );
}

function Sel({
  value,
  options,
  placeholder = "请选择",
}: {
  value?: string;
  options: string[];
  placeholder?: string;
}) {
  const list = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <span className="mdt-select-wrap">
      <select className="mdt-select" defaultValue={value ?? ""}>
        {value ? null : <option value="">{placeholder}</option>}
        {list.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </span>
  );
}

function Radios({
  name,
  options,
  value,
}: {
  name: string;
  options: string[];
  value?: string;
}) {
  return (
    <span className="mdt-radios">
      {options.map((item) => (
        <label key={item} className="mdt-radio">
          <input type="radio" name={name} defaultChecked={item === value} />
          <span>{item}</span>
        </label>
      ))}
    </span>
  );
}

function Checks({
  options,
  checked = [],
}: {
  options: string[];
  checked?: string[];
}) {
  return (
    <span className="mdt-radios">
      {options.map((item) => (
        <label key={item} className="mdt-check">
          <input type="checkbox" defaultChecked={checked.includes(item)} />
          <span>{item}</span>
        </label>
      ))}
    </span>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mdt-field">
      <span className="mdt-label">
        {required ? <b>*</b> : null}
        {label}
      </span>
      <span className="mdt-control">{children}</span>
    </div>
  );
}

function Empty({ text = "暂无数据" }: { text?: string }) {
  return (
    <div className="mdt-empty">
      <FileText className="mdt-empty-ic size-10" strokeWidth={1.2} />
      {text}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mdt-notice">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 会员管理详情工作台                                                  */
/* ------------------------------------------------------------------ */

export default function MemberDetailWorkspace({
  member,
  initialTab = "basic",
  onClose,
}: {
  member: Member;
  initialTab?: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [showContact, setShowContact] = useState(false);
  const [matchTab, setMatchTab] = useState("smart");
  const [lineTab, setLineTab] = useState("out");
  const [behaviorTab, setBehaviorTab] = useState("viewed");
  const [topRecommend, setTopRecommend] = useState(false);
  const [newRecommend, setNewRecommend] = useState(false);
  const [guestCardOpen, setGuestCardOpen] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const nickname = member.nickname || "Lemon";
  const showFooter = ["basic", "intro", "requirement", "follow", "private", "super"].includes(tab);

  return (
    <div className="mdt-mask">
      <div className="mdt-panel">
        {/* 顶部 */}
        <header className="mdt-head">
          <div className="mdt-head-left">
            <button type="button" className="mdt-head-x" onClick={onClose} aria-label="关闭">
              <X className="size-5" />
            </button>
            <h2 className="mdt-head-title">会员管理</h2>
          </div>
          <div className="mdt-head-actions">
            <button type="button" className="mdt-btn mdt-btn-ai">
              <Sparkles className="size-3.5" />
              AI智能红娘
            </button>
            <button type="button" className="mdt-btn mdt-btn-outline">
              <Clipboard className="size-3.5" />
              复制资料
            </button>
            <button type="button" className="mdt-btn mdt-btn-outline" onClick={() => setPosterOpen(true)}>
              <ImageIcon className="size-3.5" />
              资料海报
            </button>
            <button type="button" className="mdt-btn mdt-btn-outline" onClick={() => setGuestCardOpen(true)}>
              制作嘉宾卡
            </button>
          </div>
        </header>

        {/* 会员资料区 */}
        <section className="mdt-profile">
          <div className="mdt-profile-inner">
            <div className="mdt-avatar">
              {member.avatar ? (
                <img src={resolveMediaUrl(member.avatar)} alt="" />
              ) : (
                <span className="mdt-avatar-ph">
                  <UserRound className="size-14" strokeWidth={1.2} />
                </span>
              )}
              <button type="button" className="mdt-avatar-btn">
                修改头像
              </button>
            </div>
            <div className="mdt-profile-main">
              <div className="mdt-name-row">
                <span>{nickname}</span>
                <span className="sep">/</span>
                <span>B965945</span>
                <span className="sep">/</span>
                <span>
                  薛家乐 <span className="mdt-badge">已实名</span>
                </span>
                <span className="sep">/</span>
                <span>♡ 公开相亲</span>
              </div>

              <div className="mdt-contact-row">
                <div className="mdt-contact">
                  <Phone className="size-5 text-[#f47b36]" />
                  <strong>{showContact ? "13712347543" : "137****7543"}</strong>
                  <button type="button" className="mdt-link" onClick={() => setShowContact((v) => !v)}>
                    <Eye className="mr-1 inline size-3.5" />
                    {showContact ? "隐藏手机" : "查看手机"}
                  </button>
                  <button type="button" className="mdt-chip-btn">发短信</button>
                  <button type="button" className="mdt-chip-btn">一键呼叫</button>
                  <button type="button" className="mdt-link ml-auto">修改</button>
                </div>
                <div className="mdt-contact">
                  <MessageCircle className="size-5 text-[#22bf61]" />
                  <strong>{showContact ? "13712347543" : "137****7543"}</strong>
                  <button type="button" className="mdt-link" onClick={() => setShowContact((v) => !v)}>
                    <Eye className="mr-1 inline size-3.5" />
                    {showContact ? "隐藏微信" : "查看微信"}
                  </button>
                  <span className="ml-auto flex items-center gap-1">
                    <span className="mdt-select-wrap" style={{ width: 96, flex: "none" }}>
                      <select className="mdt-select" style={{ height: 28 }} defaultValue="yes">
                        <option value="yes">加上了？</option>
                        <option value="no">未通过</option>
                      </select>
                    </span>
                    <button type="button" className="mdt-link">修改</button>
                  </span>
                </div>
              </div>

              <div className="mdt-meta">
                <span>ID：678</span>
                <span>加入：2026-09-01 14:46:13</span>
                <span>登记：自己注册</span>
                <span>IP属地：浙江省宁波市鄞州区</span>
                <span>最近登录：2026-09-01 14:45:22</span>
                <span>跟进：芸希老师</span>
                <span>推广：-</span>
                <span>上次跟进：9天前</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab */}
        <nav className="mdt-tabs">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={"mdt-tab" + (tab === item.key ? " active" : "")}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* 内容 */}
        <main className="mdt-body">
          {tab === "basic" && <BasicTab />}
          {tab === "auth" && <AuthTab />}
          {tab === "media" && <MediaTab />}
          {tab === "intro" && <IntroTab />}
          {tab === "requirement" && <RequirementTab />}
          {tab === "follow" && <FollowTab />}
          {tab === "private" && <PrivateTab />}
          {tab === "match" && (
            <MatchTab
              sub={matchTab}
              onSub={setMatchTab}
              onOpenLibrary={() => setLibraryOpen(true)}
            />
          )}
          {tab === "calls" && <CallsTab />}
          {tab === "line" && <LineTab sub={lineTab} onSub={setLineTab} />}
          {tab === "dating" && <DatingTab />}
          {tab === "activities" && <ActivitiesTab />}
          {tab === "behavior" && <BehaviorTab sub={behaviorTab} onSub={setBehaviorTab} />}
          {tab === "super" && (
            <SuperTab
              topRecommend={topRecommend}
              newRecommend={newRecommend}
              onTopRecommend={setTopRecommend}
              onNewRecommend={setNewRecommend}
            />
          )}
          {tab === "source" && <SourceTab />}
        </main>

        {showFooter ? (
          <footer className="mdt-footer">
            <button type="button" className="mdt-submit">
              确定提交
            </button>
          </footer>
        ) : null}
      </div>

      {guestCardOpen ? <GuestCardSheet onClose={() => setGuestCardOpen(false)} nickname={nickname} /> : null}
      {posterOpen ? <PosterSheet onClose={() => setPosterOpen(false)} /> : null}
      {libraryOpen ? <LibraryDrawer onClose={() => setLibraryOpen(false)} nickname={nickname} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 基本资料                                                            */
/* ------------------------------------------------------------------ */

function BasicTab() {
  return (
    <>
      <div className="mdt-field" style={{ marginBottom: 16 }}>
        <span className="mdt-label">状态</span>
        <span className="mdt-control">
          <Radios name="mdt-status" options={STATUS_OPTIONS} value="公开相亲" />
        </span>
      </div>

      <Notice>在平台中公开显示头像，相亲会员可查看您的详细资料(不含任何联系方式)</Notice>

      <div className="mdt-field" style={{ margin: "18px 0" }}>
        <span className="mdt-label">标签</span>
        <span className="mdt-control" style={{ flexWrap: "wrap" }}>
          <Checks options={TAG_OPTIONS} />
          <button type="button" className="mdt-link" style={{ marginLeft: 8 }}>
            标签管理
          </button>
        </span>
      </div>

      <div className="mdt-grid3">
        <Field label="编号" required>
          <Inp value="B965945" readOnly />
        </Field>
        <Field label="姓名" required>
          <Inp value="薛家乐" />
        </Field>
        <Field label="性别" required>
          <Radios name="mdt-gender" options={["男", "女"]} value="男" />
        </Field>

        <Field label="生日" required>
          <Inp value="1990-01-01" type="date" />
        </Field>
        <Field label="星座">
          <Sel value="摩羯座" options={["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"]} />
        </Field>
        <Field label="属相">
          <Sel value="马" options={ZODIAC} />
        </Field>

        <Field label="身高">
          <Inp value="175" unit="cm" />
        </Field>
        <Field label="体重">
          <Inp value="65" unit="kg" />
        </Field>
        <Field label="婚况">
          <Sel value="未婚" options={["未婚", "离异", "丧偶"]} />
        </Field>

        <Field label="家乡">
          <Sel value="江苏省 / 南京市" placeholder="请选择" options={[]} />
        </Field>
        <Field label="现居">
          <Sel value="江苏省 / 南京市" placeholder="请选择" options={[]} />
        </Field>
        <Field label="户口">
          <Sel placeholder="请选择" options={[]} />
        </Field>

        <Field label="学历">
          <Sel value="大专" options={EDUCATION} />
        </Field>
        <Field label="职业">
          <Sel value="不限" options={["不限", ...OCCUPATION]} />
        </Field>
        <Field label="收入">
          <Sel value="8千-1万元" options={INCOME} />
        </Field>

        <Field label="民族">
          <Sel value="汉族" options={ETHNICITY} />
        </Field>
        <Field label="购房">
          <Sel placeholder="请选择购房" options={["无房", "有房", "共有住房"]} />
        </Field>
        <Field label="购车">
          <Sel placeholder="请选择购车" options={["无车", "有车", "计划购车"]} />
        </Field>

        <Field label="吸烟">
          <Sel placeholder="请选择吸烟" options={["不吸烟", "偶尔吸烟", "经常吸烟"]} />
        </Field>
        <Field label="喝酒">
          <Sel placeholder="请选择喝酒" options={["不喝酒", "偶尔喝酒", "经常喝酒"]} />
        </Field>
        <Field label="宗教">
          <Sel value="无宗教信仰" options={["无宗教信仰", "佛教", "道教", "基督教", "伊斯兰教"]} />
        </Field>

        <Field label="结婚">
          <Sel value="一年内结婚" options={MARRIAGE_TARGET} />
        </Field>
        <Field label="学校">
          <Inp placeholder="填写毕业学校" />
        </Field>
        <Field label="单位">
          <Inp placeholder="填写工作单位" />
        </Field>

        <Field label="登记">
          <Sel value="自己注册" options={["自己注册", "后台添加", "父母登记", "推广红娘录入"]} />
        </Field>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 认证信息                                                            */
/* ------------------------------------------------------------------ */

function AuthTab() {
  return (
    <>
      <Notice>
        若会员已在线下提交过相关真实证件凭证、或签署过相关协议，可上传到“证件留档”中并人工设置为“已认证”或“已签署”
      </Notice>

      <div className="mdt-auth-item">
        <div className="mdt-auth-title">实名认证</div>
        <div className="mdt-auth-line">
          <span>姓名：薛家乐</span>
          <span>身份证：330225200512******</span>
          <span className="mdt-badge">认证成功</span>
          <span className="mdt-auth-time">2026-09-01 14:48:19</span>
        </div>
      </div>

      {["婚况核实", "学历认证", "房产认证", "会员承诺"].map((title) => (
        <div key={title} className="mdt-auth-item">
          <div className="mdt-auth-title">{title}</div>
          <div className="mdt-auth-none">暂无信息</div>
        </div>
      ))}

      <div className="mdt-auth-item">
        <div className="mdt-auth-title">证件留档</div>
        <Notice>仅后台和红娘可见，不会对外公开展示</Notice>
        <button type="button" className="mdt-upload" style={{ marginTop: 14 }}>
          <Plus className="size-5" />
          上传图片
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 照片视频                                                            */
/* ------------------------------------------------------------------ */

function MediaTab() {
  return (
    <>
      <div className="mdt-row-end">
        <button type="button" className="mdt-btn mdt-btn-plain">
          <Camera className="size-3.5" />
          手机上传
        </button>
        <button type="button" className="mdt-btn mdt-btn-plain">
          <RefreshCw className="size-3.5" />
          刷新列表
        </button>
      </div>

      <Notice>设置为“私密”后，仅后台和红娘可见，线上平台的相册中不展示、会员自己在会员中心的相册中也看不到</Notice>

      <div className="mdt-section-title">照片</div>
      <button type="button" className="mdt-upload">
        <Plus className="size-5" />
        上传图片
      </button>

      <div className="mdt-section-title">视频</div>
      <button type="button" className="mdt-upload">
        <Plus className="size-5" />
        上传视频
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 自我介绍                                                            */
/* ------------------------------------------------------------------ */

function IntroTab() {
  return (
    <div className="mdt-stack">
      <Field label="性格">
        <Sel placeholder="未选择" options={["内向", "外向", "中性", "活泼开朗", "成熟稳重"]} />
      </Field>
      <Field label="爱好">
        <Sel placeholder="未选择" options={["运动", "旅游", "阅读", "音乐", "电影", "美食"]} />
      </Field>
      <Field label="人格类型（MBTI）">
        <Sel placeholder="未选择" options={["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"]} />
      </Field>

      <div className="mdt-block">
        <div className="mdt-block-label">自我介绍</div>
        <textarea className="mdt-textarea" style={{ minHeight: 150 }} placeholder="请输入，1000字以内" />
        <button type="button" className="mdt-link" style={{ marginTop: 8 }}>
          <Bookmark className="mr-1 inline size-3.5" />
          从模板选择
        </button>
      </div>

      <Field label="语音介绍">
        <span className="mdt-none">未上传</span>
      </Field>

      <button type="button" className="mdt-submit">
        确定提交
      </button>

      <div className="mdt-hr" />

      <div className="mdt-block">
        <div className="mdt-block-label">
          <b>*</b>红娘说
        </div>
        <textarea className="mdt-textarea" style={{ minHeight: 120 }} placeholder="请输入一段红娘对该会员的评价，本信息公开展示，200字以内" />
      </div>

      <button type="button" className="mdt-upload">
        <Plus className="size-5" />
        上传图片
      </button>
      <Notice>仅限上传3张图片</Notice>

      <button type="button" className="mdt-submit">
        确定提交
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 择偶要求                                                            */
/* ------------------------------------------------------------------ */

function RequirementTab() {
  return (
    <div className="mdt-stack">
      <div className="mdt-slider-row">
        <span className="mdt-label">年龄</span>
        <div className="mdt-slider-box">
          <span className="mdt-slider-val">22岁(2004年) - 30岁(1996年)</span>
          <div className="mdt-slider">
            <span className="mdt-slider-fill" style={{ left: "0%", width: "42%" }} />
            <span className="mdt-slider-knob" style={{ left: "0%" }} />
            <span className="mdt-slider-knob" style={{ left: "42%" }} />
          </div>
        </div>
      </div>

      <div className="mdt-slider-row">
        <span className="mdt-label">身高</span>
        <div className="mdt-slider-box">
          <span className="mdt-slider-val">160 - 175 cm</span>
          <div className="mdt-slider">
            <span className="mdt-slider-fill" style={{ left: "18%", width: "52%" }} />
            <span className="mdt-slider-knob" style={{ left: "18%" }} />
            <span className="mdt-slider-knob" style={{ left: "70%" }} />
          </div>
        </div>
      </div>

      <div className="mdt-req-row">
        <span className="mdt-label">收入</span>
        <Radios name="mdt-req-income" options={["不限", ...INCOME]} value="不限" />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">学历</span>
        <Radios name="mdt-req-edu" options={["不限", ...EDUCATION]} value="不限" />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">职业</span>
        <Radios name="mdt-req-job" options={["不限", ...OCCUPATION]} value="不限" />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">婚况</span>
        <Radios name="mdt-req-marital" options={MARITAL_ACCEPT} value="不限" />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">住房</span>
        <Radios name="mdt-req-house" options={HOUSE} value="不限" />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">吸烟</span>
        <Radios name="mdt-req-smoke" options={SMOKE} value="不限" />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">喝酒</span>
        <Radios name="mdt-req-drink" options={DRINK} value="不限" />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">结婚</span>
        <Radios name="mdt-req-marry" options={["不限", ...MARRIAGE_TARGET]} value="不限" />
      </div>

      <div className="mdt-block">
        <div className="mdt-block-label">补充</div>
        <textarea className="mdt-textarea" style={{ minHeight: 100 }} placeholder="请输入，200字以内" />
      </div>

      <button type="button" className="mdt-submit">
        确定提交
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 服务跟进                                                            */
/* ------------------------------------------------------------------ */

function FollowTab() {
  return (
    <div className="mdt-follow">
      <div className="mdt-follow-left">
        <button type="button" className="mdt-btn mdt-btn-outline">
          设置预约跟进时间 &gt;
        </button>

        <div className="mdt-block" style={{ marginTop: 18 }}>
          <div className="mdt-block-label">
            <b>*</b>服务跟进
          </div>
          <textarea className="mdt-textarea" style={{ minHeight: 170 }} placeholder="本跟进内容仅红娘可见，不对外公开，1000字以内" />
          <div className="mdt-upload-col">
            <button type="button" className="mdt-btn mdt-btn-plain">
              <Upload className="size-3.5" />
              上传图片
            </button>
            <button type="button" className="mdt-btn mdt-btn-plain">
              <Upload className="size-3.5" />
              上传录音
            </button>
          </div>
        </div>

        <div className="mdt-template-row">
          <span className="mdt-label">从模板选择:</span>
          <span className="mdt-chips">
            {["核实资料", "邀约到店", "到店面谈", "服务交接"].map((item) => (
              <button key={item} type="button" className="mdt-chip">
                {item}
              </button>
            ))}
          </span>
          <button type="button" className="mdt-link" style={{ marginLeft: "auto" }}>
            管理模板
          </button>
        </div>

        <button type="button" className="mdt-submit" style={{ marginTop: 18 }}>
          确定提交
        </button>
      </div>

      <div className="mdt-follow-right">
        <div className="mdt-follow-sort">
          <span className="mdt-select-wrap" style={{ width: 200, display: "inline-block" }}>
            <select className="mdt-select" defaultValue="new">
              <option value="new">最新记录显示在前面</option>
              <option value="old">最早记录显示在前面</option>
            </select>
          </span>
        </div>
        <div className="mdt-record">
          <div className="mdt-record-head">
            <span className="mdt-record-time">2026-09-01 14:46:54</span>
            <span className="mdt-record-by">芸希老师</span>
            <span className="mdt-record-ops">
              <button type="button" className="mdt-link">
                <Pencil className="mr-1 inline size-3" />
                编辑
              </button>
              <button type="button" className="mdt-link">
                <Trash2 className="mr-1 inline size-3" />
                删除
              </button>
            </span>
          </div>
          <div className="mdt-record-body">
            与会：曾浩蓝（lily|曾浩蓝|G396140），2026年09月01日牵线成功
            <br />
            注：本条记录由系统自动生成
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 私密信息                                                            */
/* ------------------------------------------------------------------ */

function PrivateTab() {
  return (
    <div className="mdt-stack">
      <Notice>
        以下信息默认不对外公开。 可设置修改为对外展示并要求会员填写
        <button type="button" className="mdt-link" style={{ marginLeft: 6 }}>
          修改设置 &gt;
        </button>
      </Notice>

      <div className="mdt-section-title">个人情况</div>
      <div className="mdt-grid3">
        <Field label="身材体型">
          <Sel value="未知" options={["匀称", "苗条", "健壮", "微胖"]} />
        </Field>
        <Field label="脸型">
          <Sel value="未知" options={["圆脸", "方脸", "瓜子脸", "长脸"]} />
        </Field>
        <Field label="皮肤类型">
          <Sel value="未知" options={["白皙", "偏黄", "偏黑", "小麦色"]} />
        </Field>
        <Field label="眼睛类型">
          <Sel value="未知" options={["双眼皮", "单眼皮", "内双"]} />
        </Field>
        <Field label="恋爱经历">
          <Sel value="未知" options={["无", "1段", "2段", "3段及以上"]} />
        </Field>
        <Field label="最长恋爱">
          <Sel value="未知" options={["半年以内", "半年-1年", "1-3年", "3年以上"]} />
        </Field>
        <Field label="单身时长">
          <Sel value="未知" options={["1年以内", "1-3年", "3-5年", "5年以上"]} />
        </Field>
        <Field label="工作情况">
          <Sel value="未知" options={["朝九晚五", "经常加班", "弹性工作", "自由安排"]} />
        </Field>
        <Field label="休息时间">
          <Sel value="未知" options={["双休", "单休", "轮休", "不定时"]} />
        </Field>
        <Field label="身体情况">
          <Sel value="未知" options={["健康", "一般", "有慢性病"]} />
        </Field>
        <Field label="传染病">
          <Sel value="无" options={["无", "有"]} />
        </Field>
        <Field label="遗传病史">
          <Sel value="无" options={["无", "有"]} />
        </Field>
        <Field label="不良嗜好">
          <Sel value="无" options={["无", "有"]} />
        </Field>
        <Field label="犯罪记录">
          <Sel value="无" options={["无", "有"]} />
        </Field>
        <Field label="情感状态">
          <Sel value="未知" options={["单身", "恋爱中", "已婚"]} />
        </Field>
        <Field label="孩子情况">
          <Sel value="未知" options={["无", "有一个", "有两个"]} />
        </Field>
      </div>

      <div className="mdt-block">
        <div className="mdt-block-label">分手原因</div>
        <textarea className="mdt-textarea" style={{ minHeight: 60 }} placeholder="上一次恋爱分手原因是什么，200字以内" />
      </div>
      <div className="mdt-block">
        <div className="mdt-block-label">感情底线</div>
        <textarea className="mdt-textarea" style={{ minHeight: 60 }} placeholder="最不能接受的异性哪方面的问题，200字以内" />
      </div>
      <div className="mdt-block">
        <div className="mdt-block-label">离婚原因</div>
        <textarea className="mdt-textarea" style={{ minHeight: 60 }} placeholder="上一段婚姻破碎原因是什么，200字以内" />
      </div>

      <div className="mdt-section-title">原生家庭</div>
      <div className="mdt-grid3">
        <Field label="父母婚况">
          <Sel value="未知" options={["未婚", "离异", "丧偶", "在婚"]} />
        </Field>
        <Field label="家庭结构">
          <Sel value="未知" options={["双亲家庭", "单亲家庭", "重组家庭"]} />
        </Field>
        <Field label="家庭成员">
          <Sel placeholder="请选择" options={["独生", "有兄弟姐妹"]} />
        </Field>
        <Field label="家中排行">
          <Sel value="未知" options={["老大", "老二", "老三", "老小", "独生"]} />
        </Field>
        <Field label="独生子女">
          <Radios name="mdt-only-child" options={["未知", "独生", "非独生"]} value="未知" />
        </Field>
        <Field label="其他成员">
          <Inp placeholder="家庭中其他成员的情况描述，200字以内" />
        </Field>
        <Field label="父亲年龄">
          <Sel value="未知" options={["45-50岁", "50-55岁", "55-60岁", "60岁以上"]} />
        </Field>
        <Field label="父亲职业">
          <Sel value="未知" options={["在职", "退休", "个体经营"]} />
        </Field>
        <Field label="父亲健康">
          <Sel value="未知" options={["健康", "一般", "欠佳"]} />
        </Field>
        <Field label="退休情况">
          <Sel value="未知" options={["未退休", "已退休"]} />
        </Field>
        <Field label="母亲年龄">
          <Sel value="未知" options={["45-50岁", "50-55岁", "55-60岁", "60岁以上"]} />
        </Field>
        <Field label="母亲职业">
          <Sel value="未知" options={["在职", "退休", "个体经营"]} />
        </Field>
        <Field label="母亲健康">
          <Sel value="未知" options={["健康", "一般", "欠佳"]} />
        </Field>
        <Field label="退休情况">
          <Sel value="未知" options={["未退休", "已退休"]} />
        </Field>
      </div>

      <div className="mdt-section-title">补充信息</div>
      <div className="mdt-block">
        <div className="mdt-block-label">其它信息</div>
        <textarea className="mdt-textarea" style={{ minHeight: 100 }} placeholder="在这里可以自由录入该会员的其它信息资料，限1000汉字以内" />
      </div>

      <button type="button" className="mdt-submit">
        确定提交
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 推荐匹配                                                            */
/* ------------------------------------------------------------------ */

function MatchTab({
  sub,
  onSub,
  onOpenLibrary,
}: {
  sub: string;
  onSub: (key: string) => void;
  onOpenLibrary: () => void;
}) {
  const smartRows = [
    { name: "尔尔", code: "G322362", info: "2002年 / 169cm / 私企员工 / 年入百万 / 未婚" },
    { name: "禾禾禾", code: "G384467", info: "1996年 / 163cm / 教师 / 年入20万 / 未婚" },
  ];
  return (
    <>
      <div className="mdt-subtabs">
        {[
          ["smart", "智能匹配"],
          ["recommend", "推荐名单"],
          ["destiny", "姻缘名单"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={"mdt-subtab" + (sub === key ? " active" : "")}
            onClick={() => onSub(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === "smart" && (
        <>
          <div className="mdt-section-title" style={{ marginTop: 0 }}>
            根据该会员择偶要求
          </div>
          <div className="mdt-chips">
            {["年龄22-30岁", "身高160-175", "学历不限", "收入不限"].map((item) => (
              <span key={item} className="mdt-tag">
                {item}
              </span>
            ))}
          </div>

          <div className="mdt-section-title">附加更多条件</div>
          <div className="mdt-grid3">
            <Field label="门店">
              <Sel value="不限" options={[]} />
            </Field>
            <Field label="服务红娘">
              <Sel value="不限" options={[]} />
            </Field>
            <Field label="抽烟">
              <Sel value="不限" options={[]} />
            </Field>
            <Field label="喝酒">
              <Sel value="不限" options={[]} />
            </Field>
            <Field label="住房">
              <Sel value="不限" options={[]} />
            </Field>
            <Field label="婚况">
              <Sel value="不限" options={[]} />
            </Field>
            <Field label="民族">
              <Sel value="不限" options={[]} />
            </Field>
            <Field label="星座">
              <Sel value="不限" options={[]} />
            </Field>
            <Field label="家乡">
              <Sel value="不限" options={[]} />
            </Field>
            <Field label="现居">
              <Sel value="不限" options={[]} />
            </Field>
            <Field label="职业">
              <Sel value="不限（多选）" options={[]} />
            </Field>
            <Field label="人格类型">
              <Sel value="不限" options={[]} />
            </Field>
          </div>

          <div className="mdt-section-title">按标签筛选</div>
          <Checks options={TAG_OPTIONS} />

          <div className="mdt-match-count">
            查询到 <b>117</b> 位符合条件的会员
          </div>
          <Radios
            name="mdt-match-filter"
            options={["不限", "仅显示线下VIP", "仅显示线上VIP", "仅显示到店核验", "排除弃海会员"]}
            value="不限"
          />

          <table className="mdt-table" style={{ marginTop: 14 }}>
            <thead>
              <tr>
                {["资料", "红娘", "到店核验", "VIP", "安排过", "见过哪些人"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {smartRows.map((row) => (
                <tr key={row.code}>
                  <td>
                    <div className="mdt-match-user">
                      <span className="mdt-match-avatar" />
                      <span>
                        <b>{row.name}</b>
                        <span className="mdt-match-code">编号：{row.code}</span>
                        <span className="mdt-match-info">{row.info}</span>
                      </span>
                    </div>
                  </td>
                  <td>-</td>
                  <td>-</td>
                  <td>非线下VIP</td>
                  <td>0次约见</td>
                  <td>
                    <button type="button" className="mdt-link">
                      查看名单
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {sub === "recommend" && (
        <>
          <Notice>
            推荐名单是红娘销售过程中的重要辅助工具，也为签单后的服务匹配作参考。客户登录平台后会在“匹配”栏中看到该名单，并标有“红娘推荐”。
          </Notice>
          <div className="mdt-recommend-bar">
            <span>添加推荐人：</span>
            <input className="mdt-input" style={{ width: 260 }} placeholder="请输入编号/姓名/手机号/昵称" />
            <button type="button" className="mdt-submit">
              确定提交
            </button>
            <label className="mdt-check">
              <input type="radio" name="mdt-rec-source" defaultChecked />
              从会员CRM中查找
            </label>
          </div>
          <table className="mdt-table">
            <thead>
              <tr>
                {["推荐会员", "已推荐给", "推荐人", "推荐理由", "推荐时间", "操作"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
          </table>
          <Empty />
        </>
      )}

      {sub === "destiny" && (
        <>
          <Notice>
            下面是客户到店与红娘面谈过程中从平台的资料库中选择的姻缘人选，服务红娘可以从下面的人选中给该客户进行撮合牵线搭桥，同时您可以根据客户所选择的这些人选分析总结出客户的核心择偶要求，从资源库中为客户筛选匹配，从更加宽泛的人选中为其提供精准服务。
          </Notice>
          <div className="mdt-destiny-bar">
            <button type="button" className="mdt-submit" onClick={onOpenLibrary}>
              为Ta创建销售姻缘库
            </button>
            <button type="button" className="mdt-link">
              <Link2 className="mr-1 inline size-3.5" />
              姻缘库使用方法
            </button>
          </div>
          <div className="mdt-empty">
            <UserRound className="mdt-empty-ic size-12" strokeWidth={1} />
            Ta还未创建销售姻缘库，
            <button type="button" className="mdt-link" onClick={onOpenLibrary}>
              立即创建
            </button>
          </div>
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 通话 / 牵线 / 约会 / 活动报名                                        */
/* ------------------------------------------------------------------ */

function CallsTab() {
  return (
    <>
      <div className="mdt-check-line">
        <label className="mdt-check">
          <input type="checkbox" />
          呼叫：0次
        </label>
        <label className="mdt-check">
          <input type="checkbox" />
          通话总时长：0秒
        </label>
      </div>
      <table className="mdt-table">
        <thead>
          <tr>
            {["状态", "通话次数", "呼出坐席", "呼出开始时间", "挂机时间", "通话时长", "录音回放", "本次通话小结(同步到服务跟进)"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
      </table>
      <Empty />
    </>
  );
}

function LineTab({ sub, onSub }: { sub: string; onSub: (key: string) => void }) {
  return (
    <>
      <div className="mdt-line-head">
        <div className="mdt-subtabs" style={{ border: 0, margin: 0 }}>
          {[
            ["out", "Ta发起的"],
            ["in", "向Ta发起的"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={"mdt-subtab" + (sub === key ? " active" : "")}
              onClick={() => onSub(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="mdt-line-left">牵线剩余次数：0</span>
      </div>
      <table className="mdt-table">
        <thead>
          <tr>
            {["牵线会员", "牵线时间", "牵线状态", "操作"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
      </table>
      <Empty />
    </>
  );
}

function DatingTab() {
  return (
    <>
      <table className="mdt-table">
        <thead>
          <tr>
            {["约会次数", "约会时间", "见谁", "状态"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
      </table>
      <Empty />
    </>
  );
}

function ActivitiesTab() {
  return (
    <>
      <Notice>该会员报名参加过下面的活动，方便红娘跟进回访</Notice>
      <table className="mdt-table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            {["报名时间", "报名活动"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
      </table>
      <Empty />
    </>
  );
}

function BehaviorTab({ sub, onSub }: { sub: string; onSub: (key: string) => void }) {
  const subTabs = [
    ["viewed", "浏览过谁"],
    ["viewedBy", "被谁浏览"],
    ["favorite", "收藏了谁"],
    ["liked", "给谁爆灯"],
    ["likedBy", "谁给Ta爆灯"],
    ["gift", "赠送礼物"],
    ["giftGot", "收到礼物"],
  ];
  return (
    <>
      <div className="mdt-subtabs">
        {subTabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={"mdt-subtab" + (sub === key ? " active" : "")}
            onClick={() => onSub(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <table className="mdt-table">
        <thead>
          <tr>
            {["浏览过谁", "第几次浏览", "浏览时间", "操作"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
      </table>
      <Empty />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 超级管理                                                            */
/* ------------------------------------------------------------------ */

function SuperTab({
  topRecommend,
  newRecommend,
  onTopRecommend,
  onNewRecommend,
}: {
  topRecommend: boolean;
  newRecommend: boolean;
  onTopRecommend: (value: boolean) => void;
  onNewRecommend: (value: boolean) => void;
}) {
  return (
    <div className="mdt-stack">
      <Field label="账号绑定" required>
        <span className="mdt-bind">
          <span className="mdt-bind-tag">
            Lemon
            <X className="size-3" />
          </span>
          <button type="button" className="mdt-link">
            <Pencil className="mr-1 inline size-3" />
            编辑
          </button>
        </span>
      </Field>
      <Notice>客户可以使用此账号登录平台</Notice>

      <div className="mdt-switch-row">
        <span className="mdt-switch-label">置顶推荐</span>
        <button
          type="button"
          className={"mdt-switch" + (topRecommend ? " on" : "")}
          onClick={() => onTopRecommend(!topRecommend)}
          aria-pressed={topRecommend}
        />
        <span className="mdt-switch-text">开启</span>
      </div>

      <div className="mdt-switch-row">
        <span className="mdt-switch-label">新人推荐</span>
        <button
          type="button"
          className={"mdt-switch" + (newRecommend ? " on" : "")}
          onClick={() => onNewRecommend(!newRecommend)}
          aria-pressed={newRecommend}
        />
        <span className="mdt-switch-text">开启</span>
      </div>

      <div className="mdt-super-row">
        <span className="mdt-label">实名认证</span>
        <span className="mdt-control" style={{ flexWrap: "wrap" }}>
          <Radios name="mdt-super-real" options={["未认证", "已认证"]} value="已认证" />
          <Sel value="中国大陆" options={["中国大陆", "中国香港", "中国澳门", "中国台湾"]} />
          <span className="mdt-inline-label">
            <b>*</b>实名信息
          </span>
          <Inp value="330225200512291779" />
          <span className="mdt-inline-label">姓名</span>
          <Inp value="薛家乐" />
        </span>
      </div>

      {[
        ["房产认证", "mdt-super-house"],
        ["学历认证", "mdt-super-edu"],
        ["单身承诺", "mdt-super-promise"],
      ].map(([label, name]) => (
        <div key={label} className="mdt-super-row">
          <span className="mdt-label">{label}</span>
          <Radios name={name} options={["未认证", "已认证", "待审核", "认证失败"]} value="未认证" />
        </div>
      ))}

      <div className="mdt-super-row">
        <span className="mdt-label">线上VIP</span>
        <Radios
          name="mdt-super-online-vip"
          options={["普通会员", "VIP-新人专享", "VIP-心动专享", "VIP-臻爱专享"]}
          value="普通会员"
        />
      </div>

      <div className="mdt-super-row">
        <span className="mdt-label">线下VIP</span>
        <Radios name="mdt-super-offline-vip" options={["不是", "是"]} value="不是" />
      </div>
      <Notice>指已前往您线下门店签约购买高端服务的会员</Notice>

      <div className="mdt-super-row">
        <span className="mdt-label">牵线剩余</span>
        <span className="mdt-control" style={{ flexWrap: "wrap", gap: 12 }}>
          <span className="mdt-none">0次</span>
          <span className="mdt-inline-label">有效期至:</span>
          <Inp value="2026-09-02" type="date" />
          <span className="mdt-inline-label">增加</span>
          <Inp value="0" />
          <span className="mdt-none">次</span>
          <Inp placeholder="填写理由，20字内" />
          <button type="button" className="mdt-link">
            历史明细
          </button>
        </span>
      </div>

      <div className="mdt-super-row">
        <span className="mdt-label">隐私设置</span>
        <label className="mdt-check">
          <input type="checkbox" defaultChecked />
          对非相亲会员显示头像
        </label>
      </div>

      <Field label="显示排序">
        <Inp value="0" />
      </Field>
      <Notice>数字越大显示越靠前</Notice>

      <Field label="推广红娘">
        <Inp placeholder="请输入推广红娘账号昵称" />
      </Field>
      <Notice>
        设置推广红娘后，该会员将计入到该推广红娘名下，如果该会员是审核通过状态，则自动在此刻给予注册奖励，若是未通过状态，则在下面的收费期都会给予该红娘相应的分成
      </Notice>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 信息溯源                                                            */
/* ------------------------------------------------------------------ */

function SourceTab() {
  const items = [
    ["2026-09-01 14:46:13", "会员录入·自己注册"],
    ["2026-09-01 14:46:13", "会员分派给:芸希老师"],
    ["2026-09-01 14:46:29", "会员审核通过"],
  ];
  return (
    <>
      <Notice>信息溯源记录了本条会员信息从录入、审核、红娘变更、意向变更等行为的变动记录。</Notice>
      <div className="mdt-timeline" style={{ marginTop: 22 }}>
        {items.map(([time, text]) => (
          <div key={text} className="mdt-tl-item">
            <span className="mdt-tl-dot" />
            <div className="mdt-tl-time">{time}</div>
            <div className="mdt-tl-text">{text}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 制作/下载嘉宾信息卡                                                  */
/* ------------------------------------------------------------------ */

function GuestCardSheet({ onClose, nickname }: { onClose: () => void; nickname: string }) {
  const fields = [
    "编号",
    "性别",
    "姓名",
    "出生",
    "属相",
    "星座",
    "身高",
    "体重",
    "学历",
    "工作",
    "收入",
    "家乡",
    "现居",
    "民族",
    "信仰",
    "性格",
    "爱好",
    "父母婚况",
    "家庭结构",
    "是否独生",
    "家中排行",
  ];
  const [hidden, setHidden] = useState<string[]>([]);
  return (
    <div className="mdt-gc-mask">
      <div className="mdt-gc">
        <div className="mdt-gc-head">
          <div className="mdt-head-left">
            <button type="button" className="mdt-head-x" onClick={onClose} aria-label="关闭">
              <X className="size-5" />
            </button>
            <h2 className="mdt-head-title">制作/下载嘉宾信息卡</h2>
          </div>
          <button type="button" className="mdt-submit">
            下载保存
          </button>
        </div>

        <div className="mdt-gc-notice">
          <Info className="size-3.5" />
          <span>在线为该嘉宾制作一张专属的服务信息卡，用于1对1服务场景用途。</span>
          <button type="button" className="mdt-link">
            <Eye className="mr-1 inline size-3.5" />
            效果预览
          </button>
        </div>

        <div className="mdt-gc-body">
          <div className="mdt-gc-left">
            <div className="mdt-gc-photo">
              <span>请在下面的相册选择或上传一张照片</span>
              <span className="mdt-gc-photo-sub">宽度大于1140px</span>
              <span className="mdt-gc-photo-sub">高度大于1584px</span>
            </div>
            <button type="button" className="mdt-upload" style={{ marginTop: 14 }}>
              <Plus className="size-5" />
              上传图片
            </button>
          </div>

          <div className="mdt-gc-card">
            <div className="mdt-gc-paper">
              <div className="mdt-gc-paper-head">
                <span>{nickname}</span>
                <span className="mdt-gc-code">编号：B965945</span>
              </div>
              <div className="mdt-gc-real">人脸实名</div>

              <div className="mdt-gc-sec">💜 个人情况</div>
              <div className="mdt-gc-row">性别: 男</div>
              <div className="mdt-gc-row">婚况: 未婚</div>
              <div className="mdt-gc-row">姓名: 薛*乐</div>
              <div className="mdt-gc-row">出生: 1990年01月</div>
              <div className="mdt-gc-row">属相: 马</div>
              <div className="mdt-gc-row">星座: Capricorn</div>
              <div className="mdt-gc-row">身高: 175cm</div>
              <div className="mdt-gc-row">体重: 65kg</div>
              <div className="mdt-gc-row">学历: 大专</div>
              <div className="mdt-gc-row">工作: 不限</div>
              <div className="mdt-gc-row">收入: 8千-1万元</div>
              <div className="mdt-gc-row">家乡: 江苏省南京市</div>
              <div className="mdt-gc-row">现居: 江苏省南京市</div>
              <div className="mdt-gc-row">民族: 汉族</div>
              <div className="mdt-gc-row">信仰: 无宗教信仰</div>
              <div className="mdt-gc-row">性格: -</div>
              <div className="mdt-gc-row">爱好: -</div>

              <div className="mdt-gc-sec">💜 原生家庭</div>
              <div className="mdt-gc-row">父母婚况: 未知</div>
              <div className="mdt-gc-row">家庭结构: 未知</div>
              <div className="mdt-gc-row">是否独生: 未知</div>
              <div className="mdt-gc-row">家中排行: 未知</div>

              <div className="mdt-gc-foot">
                「内部资料，谢绝外传」
                <span>— 宣爱壹 —</span>
              </div>
            </div>
          </div>

          <div className="mdt-gc-right">
            {fields.map((field) => {
              const off = hidden.includes(field);
              return (
                <div key={field} className="mdt-gc-field">
                  <span>{field}</span>
                  <button
                    type="button"
                    className={"mdt-pill" + (off ? " off" : "")}
                    onClick={() =>
                      setHidden((current) =>
                        off ? current.filter((v) => v !== field) : [...current, field],
                      )
                    }
                  >
                    {off ? "隐藏" : "显示"}
                  </button>
                </div>
              );
            })}
            <textarea
              className="mdt-textarea"
              style={{ minHeight: 90, marginTop: 10 }}
              placeholder="自定义重点介绍文案，100字以内"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 资料海报                                                            */
/* ------------------------------------------------------------------ */

function PosterSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="mdt-poster-mask">
      <div className="mdt-poster">
        <div className="mdt-poster-head">
          <div className="mdt-head-left">
            <ArrowLeft className="size-4" />
            <h2 className="mdt-head-title">会员资料海报</h2>
          </div>
          <div className="mdt-head-actions">
            <UserRound className="size-4 text-[#666]" />
            <Menu className="size-4 text-[#666]" />
            <button type="button" className="mdt-btn mdt-btn-plain" onClick={onClose}>
              关闭
            </button>
          </div>
        </div>
        <div className="mdt-poster-body">
          <div className="mdt-poster-title">请选择您喜欢的样式</div>
          <div className="mdt-poster-grid">
            {["风格1", "风格2"].map((style, index) => (
              <div key={style} className="mdt-poster-card">
                <div className="mdt-poster-name">{index === 0 ? "嘉宾资料" : "真诚觅缘"}</div>
                <div className="mdt-poster-photo">嘉宾照片</div>
                <div className="mdt-poster-line">
                  大专学历，未婚，身高163cm、体重52kg、私企员工，年收入10万元左右，南京市栖霞区…
                </div>
                <div className="mdt-poster-name" style={{ marginTop: 10 }}>
                  {style}
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="mdt-poster-confirm">
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 编辑销售匹配库 Drawer                                               */
/* ------------------------------------------------------------------ */

function LibraryDrawer({ onClose, nickname }: { onClose: () => void; nickname: string }) {
  const [smart, setSmart] = useState(false);
  return (
    <div className="mdt-drawer-mask">
      <div className="mdt-drawer">
        <div className="mdt-head">
          <div className="mdt-head-left">
            <button type="button" className="mdt-head-x" onClick={onClose} aria-label="关闭">
              <X className="size-5" />
            </button>
            <h2 className="mdt-head-title">编辑销售匹配库</h2>
          </div>
          <div className="mdt-head-actions">
            <button type="button" className="mdt-btn mdt-btn-plain" onClick={onClose}>
              取消
            </button>
            <button type="button" className="mdt-submit">
              确定提交
            </button>
          </div>
        </div>

        <div className="mdt-drawer-body">
          <Field label="页面标题" required>
            <Inp placeholder="最多20汉字" />
          </Field>
          <Field label="分享描述">
            <Inp placeholder="请输入分享描述" />
          </Field>
          <Field label="客户性别">
            <Radios name="mdt-lib-gender" options={["男性", "女性"]} value="男性" />
          </Field>
          <Field label="账号昵称">
            <span className="mdt-bind-tag">
              {nickname}
              <X className="size-3" />
            </span>
          </Field>
          <Notice>
            指本客户在平台中已注册的账号昵称，关联后系统默认根据其择偶条件三要素进行智能匹配，若未注册可留空
            <br />
            绑定用户账号之后，姻缘库仅该用户和所属红娘微信登录后可以操作，未绑定的情况下任何人进入该页面均可操作
          </Notice>

          <Field label="智能匹配" required>
            <button
              type="button"
              className={"mdt-switch" + (smart ? " on" : "")}
              onClick={() => setSmart((v) => !v)}
              aria-pressed={smart}
            />
            <span className="mdt-switch-text">开启本功能后，系统将按照下面的条件筛选显示（不含已脱单会员）</span>
          </Field>

          <Field label="销售红娘" required>
            <Sel placeholder="请选择销售红娘" options={["芸希老师", "琴琴", "齐老师"]} />
          </Field>
          <Field label="选人上限" required>
            <Inp value="10" />
          </Field>
          <Notice>该客户最多可以选择的姻缘人选的数量限制</Notice>

          <Field label="状态">
            <Radios name="mdt-lib-status" options={["已到店", "未到店"]} value="未到店" />
          </Field>

          <Field label="温馨提示">
            <textarea className="mdt-textarea" style={{ minHeight: 80 }} placeholder="请输入温馨提示" />
          </Field>
          <Notice>这是前端进入到该匹配库时页面中弹出的提示（弹窗关闭后不再显示）</Notice>

          <button type="button" className="mdt-submit" style={{ marginTop: 16 }}>
            确定提交
          </button>
        </div>
      </div>
    </div>
  );
}
