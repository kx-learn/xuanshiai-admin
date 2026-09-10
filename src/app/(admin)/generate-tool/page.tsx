"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "推文助手" },
];

type ChipDef = { id: string; label: string; options: string[]; defaultSelected: string[] };
const chipGroups: ChipDef[] = [
  { id: "gender", label: "会员性别", options: ["男", "女"], defaultSelected: [] },
  { id: "marriage", label: "婚姻状态", options: ["未婚", "离异未育", "离异不带孩", "离异带女孩", "离异带男孩", "丧偶"], defaultSelected: [] },
  { id: "edu", label: "学历", options: ["不限", "初中", "技校", "高中", "大专", "本科", "硕士", "博士"], defaultSelected: [] },
  { id: "job", label: "工作", options: ["不限", "私企员工", "央企/国企", "外企", "事业单位", "公务员", "教师", "医生", "护士", "互联网行业", "自由职业", "军人", "工人", "服务业", "金融", "律师", "求职中", "在校学生", "个体老板", "公司高管", "美容师/健身教练"], defaultSelected: [] },
  { id: "matchmaker", label: "服务红娘", options: ["芸希老师"], defaultSelected: [] },
  { id: "level", label: "会员级别", options: ["普通会员", "新人专享", "心动专享", "挚爱专享"], defaultSelected: [] },
  { id: "status", label: "相亲状态", options: ["公开相亲", "委托红娘", "停止相亲", "已经脱单"], defaultSelected: [] },
];

type RadioDef = { label: string; options: string[]; default?: string };

const VipRadio: RadioDef = { label: "线下VIP", options: ["不限", "是"], default: "不限" };
const RegRadio: RadioDef = { label: "注册时间", options: ["不限", "1天内", "3天内", "7天内", "15天内", "30天内"], default: "不限" };
const RealnameRadio: RadioDef = { label: "实名认证", options: ["不限", "已实名认证"], default: "不限" };
const StyleRadio: RadioDef = { label: "风格模版", options: ["模板1", "模板2", "模板3"], default: "模板1" };
const QrRadio: RadioDef = { label: "二维码类型", options: ["普通H5二维码", "公众号二维码"], default: "普通H5二维码" };

function ChipRow({ def }: { def: ChipDef }) {
  const [selected, setSelected] = useState<string[]>(def.defaultSelected);
  const all = selected.length === def.options.length;
  const toggle = (o: string) =>
    setSelected((cur) => (cur.includes(o) ? cur.filter((i) => i !== o) : [...cur, o]));
  const toggleAll = () => setSelected(all ? [] : def.options);
  return (
    <div className="twt-row">
      <label className="twt-label">{def.label}</label>
      <div className="twt-chips">
        <button type="button" className={`twt-chip ${all ? "active" : ""}`} onClick={toggleAll}>全选</button>
        {def.options.map((o) => (
          <button
            key={o}
            type="button"
            className={`twt-chip ${selected.includes(o) ? "active" : ""}`}
            onClick={() => toggle(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function RadioRow({ def, value, onChange, inlineExtra }: {
  def: RadioDef;
  value: string;
  onChange: (v: string) => void;
  inlineExtra?: React.ReactNode;
}) {
  return (
    <div className="twt-row">
      <label className="twt-label">{def.label}</label>
      <div className="twt-options">
        {def.options.map((o) => (
          <label key={o} className={`twt-radio ${value === o ? "active" : ""}`}>
            <input type="radio" name={def.label} value={o} checked={value === o} onChange={() => onChange(o)} />
            <span>{o}</span>
            {inlineExtra && value === o && inlineExtra}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function GenerateToolPage() {
  const [vip, setVip] = useState(VipRadio.default!);
  const [reg, setReg] = useState(RegRadio.default!);
  const [realname, setRealname] = useState(RealnameRadio.default!);
  const [style, setStyle] = useState(StyleRadio.default!);
  const [qr, setQr] = useState(QrRadio.default!);
  const [genMode, setGenMode] = useState("生成本页全部数据（50条/页）");
  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("70");
  const [genCount, setGenCount] = useState("50");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色须知条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>1、生成后点击"一键复制"，然后粘贴到公众号的推文编辑器中，也可以粘贴到第三方公众号编辑（如135编辑器）中使用</p>
            <p>2、选项中留空或不勾选任何数据则默认为不限</p>
          </div>
        </div>
      </div>

      <div className="finord-card twt-card">
        <div className="twt-title">推文助手</div>

        <div className="twt-wrap">
          {/* 左侧表单 */}
          <div className="twt-form">
            {/* 年龄范围 */}
            <div className="twt-row">
              <label className="twt-label">年龄范围</label>
              <div className="twt-range">
                <input className="twt-num" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
                <span className="twt-unit">岁</span>
                <span className="twt-arrow">至</span>
                <input className="twt-num" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
                <span className="twt-unit">岁</span>
              </div>
            </div>

            {chipGroups.map((d) => <ChipRow key={d.id} def={d} />)}

            <RadioRow def={VipRadio} value={vip} onChange={setVip} />

            <RadioRow def={RegRadio} value={reg} onChange={setReg} />

            <RadioRow def={RealnameRadio} value={realname} onChange={setRealname} />

            {/* 现居地 */}
            <div className="twt-row">
              <label className="twt-label">现居地</label>
              <select className="twt-select">
                <option>请选择</option>
              </select>
            </div>

            {/* 指定会员 */}
            <div className="twt-row">
              <label className="twt-label">指定会员</label>
              <div className="twt-content">
                <input className="twt-input" placeholder="请输入" />
                <div className="twt-info">① 输入会员编号“*”逗号隔开</div>
              </div>
            </div>

            <RadioRow def={StyleRadio} value={style} onChange={setStyle} />

            {/* 二维码类型 */}
            <div className="twt-row">
              <label className="twt-label">{QrRadio.label}</label>
              <div className="twt-content">
                <div className="twt-options">
                  {QrRadio.options.map((o) => (
                    <label key={o} className={`twt-radio ${qr === o ? "active" : ""}`}>
                      <input type="radio" name={QrRadio.label} value={o} checked={qr === o} onChange={() => setQr(o)} />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
                <div className="twt-info">① 扫码后直接到资料内容页</div>
              </div>
            </div>

            {/* 生成数量 */}
            <div className="twt-row">
              <label className="twt-label">生成数量</label>
              <div className="twt-options">
                <label className={`twt-radio ${genMode === "生成本页全部数据（50条/页）" ? "active" : ""}`}>
                  <input type="radio" name="genMode" value="生成本页全部数据（50条/页）" checked={genMode === "生成本页全部数据（50条/页）"} onChange={() => setGenMode("生成本页全部数据（50条/页）")} />
                  <span>生成本页全部数据（50条/页）</span>
                </label>
                <label className={`twt-radio ${genMode === "仅生成最新的前" ? "active" : ""}`}>
                  <input type="radio" name="genMode" value="仅生成最新的前" checked={genMode === "仅生成最新的前"} onChange={() => setGenMode("仅生成最新的前")} />
                  <span>仅生成最新的前</span>
                </label>
                <input className="twt-num twt-num-sm" value={genCount} onChange={(e) => setGenCount(e.target.value)} />
                <span className="twt-unit">条</span>
              </div>
            </div>

            {/* 分页 */}
            <div className="twt-pager">
              <span className="twt-pager-total">共 0 条</span>
              <span className="twt-pager-arrow">‹</span>
              <span className="twt-pager-cur">1</span>
              <span className="twt-pager-arrow">›</span>
            </div>

            {/* 生成模版 */}
            <button type="button" className="twt-submit">生成模版</button>
          </div>

          {/* 右侧手机预览 */}
          <div className="twt-phone">
            <div className="twt-phone-frame">
              <div className="twt-topbar">
                <div className="twt-status">
                  <span className="twt-status-time">9:41 AM</span>
                  <span className="twt-status-right">
                    <span>100%</span>
                    <span className="twt-batt" />
                  </span>
                </div>
                <div className="twt-notch" />
              </div>
              <div className="twt-screen">
                <div className="twt-back">‹ 返回</div>
                <div className="twt-empty">没有符合要求的数据</div>
              </div>
            </div>
            <button type="button" className="twt-copy-btn">📋 一键复制</button>
          </div>
        </div>
      </div>
    </div>
  );
}
