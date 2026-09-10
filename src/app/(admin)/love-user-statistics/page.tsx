"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

type TabKey = "growth" | "follow" | "intention" | "basic" | "requirement" | "browse" | "popularity";
type Dist = { label: string; pct: number; count: number; pctText?: string };
type GrowthRow = { date: string; m: number; f: number; apply: number; failed: number; success: number };

const tabs: { key: TabKey; label: string }[] = [
  { key: "growth", label: "会员增长统计" },
  { key: "follow", label: "会员跟进统计" },
  { key: "intention", label: "会员意向统计" },
  { key: "basic", label: "会员基本状况统计" },
  { key: "requirement", label: "会员择偶要求统计" },
  { key: "browse", label: "浏览统计" },
  { key: "popularity", label: "人气统计" },
];

const DONUT_COLORS = ["#4a6cf7", "#52c41a", "#fa8c16", "#ff4d4f", "#9254de", "#13c2c2"];
const AVATARS = [
  "linear-gradient(135deg,#f5c6d0,#e58aa8)",
  "linear-gradient(135deg,#c9d6f7,#8aa3e8)",
  "linear-gradient(135deg,#f8d8b0,#e8a95c)",
  "linear-gradient(135deg,#bfe6d4,#6fc39b)",
  "linear-gradient(135deg,#d9cdf5,#a58ae0)",
  "linear-gradient(135deg,#f7d0c2,#e88e6c)",
];

const growthRows: GrowthRow[] = [
  { date: "2026-09-01", m: 1, f: 0, apply: 1, failed: 0, success: 1 },
  { date: "2026-08-21", m: 0, f: 2, apply: 0, failed: 0, success: 0 },
  { date: "2026-07-20", m: 0, f: 2, apply: 0, failed: 0, success: 0 },
  { date: "2026-07-19", m: 0, f: 2, apply: 0, failed: 0, success: 0 },
  { date: "2026-07-18", m: 1, f: 2, apply: 0, failed: 0, success: 0 },
  { date: "2026-07-17", m: 0, f: 3, apply: 0, failed: 0, success: 0 },
  { date: "2026-07-16", m: 0, f: 1, apply: 0, failed: 0, success: 0 },
  { date: "2026-07-15", m: 0, f: 1, apply: 1, failed: 0, success: 0 },
  { date: "2026-07-14", m: 1, f: 1, apply: 0, failed: 0, success: 0 },
  { date: "2026-07-13", m: 0, f: 1, apply: 0, failed: 0, success: 0 },
  { date: "2026-07-12", m: 1, f: 1, apply: 1, failed: 0, success: 0 },
  { date: "2026-07-11", m: 0, f: 1, apply: 0, failed: 0, success: 0 },
  { date: "2026-07-10", m: 0, f: 1, apply: 0, failed: 0, success: 0 },
];

const intentionRows = [
  { label: "A类 未接", hot: true },
  { label: "B类 初步沟通", hot: false },
  { label: "C类 深入沟通未缔结", hot: false },
  { label: "D类 待确定到店时间", hot: false },
  { label: "E类 已确定到店", hot: false },
  { label: "F类 预约需二邀", hot: false },
  { label: "G类 已到店未签约", hot: false },
  { label: "I类 已签单", hot: false },
  { label: "J类 放弃资源", hot: false },
];

const basicDonuts: { title: string; cols: 1 | 2; items: Dist[] }[] = [
  { title: "性别统计", cols: 1, items: [{ label: "男", pct: 63.4, count: 406 }, { label: "女", pct: 36.6, count: 234 }] },
  { title: "婚况统计", cols: 1, items: [
    { label: "未婚", pct: 89.2, count: 571 }, { label: "离异未育", pct: 3.0, count: 19 },
    { label: "离异不带孩", pct: 2.3, count: 15 }, { label: "离异带女孩", pct: 1.9, count: 12 },
    { label: "离异带男孩", pct: 1.3, count: 8 }, { label: "丧偶", pct: 0.6, count: 4 },
  ] },
  { title: "年龄统计", cols: 2, items: [
    { label: "25岁以下", pct: 19.1, count: 122 }, { label: "26-30岁", pct: 40.6, count: 260 },
    { label: "31-35岁", pct: 25.2, count: 161 }, { label: "36-40岁", pct: 11.6, count: 74 },
    { label: "41-45岁", pct: 1.7, count: 11 }, { label: "46-50岁", pct: 0.5, count: 3 },
  ] },
  { title: "学历统计", cols: 2, items: [
    { label: "不限", pct: 0.2, count: 1 }, { label: "初中", pct: 0.5, count: 3 },
    { label: "技校", pct: 0.3, count: 2 }, { label: "高中", pct: 1.9, count: 12 },
    { label: "大专", pct: 28.9, count: 185 }, { label: "本科", pct: 54.5, count: 349 },
  ] },
  { title: "房产统计", cols: 2, items: [
    { label: "未购房", pct: 55.5, count: 355 }, { label: "正在考虑购房", pct: 15.0, count: 96 },
    { label: "已购婚房有贷款", pct: 6.3, count: 40 }, { label: "已购婚房无贷款", pct: 7.2, count: 46 },
    { label: "暂无购房能力", pct: 0.2, count: 1 },
  ] },
  { title: "车辆统计", cols: 2, items: [
    { label: "未购车", pct: 45.3, count: 290 }, { label: "已经购车", pct: 33.6, count: 215 },
    { label: "需要时购置", pct: 3.6, count: 23 },
  ] },
  { title: "收入统计", cols: 2, items: [
    { label: "不限", pct: 0.0, count: 0 }, { label: "3千元以下", pct: 0.5, count: 3 },
    { label: "3-5千元", pct: 1.6, count: 10 }, { label: "5-8千元", pct: 8.9, count: 57 },
    { label: "8千-1万元", pct: 34.7, count: 222 },
  ] },
  { title: "实名统计", cols: 1, items: [{ label: "已实名", pct: 72.3, count: 463 }, { label: "未实名", pct: 27.7, count: 177 }] },
];

const basicBars: { title: string; rows: Dist[] }[] = [
  { title: "最多的职业（前5）", rows: [
    { label: "不限", pct: 0.5, count: 3 }, { label: "私企员工", pct: 37.8, count: 242 },
    { label: "央企/国企", pct: 5.0, count: 32 }, { label: "外企", pct: 3.0, count: 19 },
    { label: "事业单位", pct: 5.2, count: 33 },
  ] },
  { title: "籍贯最多的地区（前5）", rows: [
    { label: "南京市·玄武区", pct: 2.5, count: 16 }, { label: "南京市·市辖区", pct: 2.5, count: 16 },
    { label: "南京市·建邺区", pct: 2.5, count: 16 }, { label: "平顶山市·新华区", pct: 2.0, count: 13 },
    { label: "南京市·雨花台", pct: 1.9, count: 12 },
  ] },
  { title: "现居地最多的地区（前5）", rows: [
    { label: "南京市·秦淮区", pct: 19.1, count: 122 }, { label: "南京市·建邺区", pct: 9.8, count: 63 },
    { label: "南京市·江宁区", pct: 9.1, count: 58 }, { label: "南京市·玄武区", pct: 6.3, count: 40 },
    { label: "南京市·鼓楼区", pct: 5.6, count: 36 },
  ] },
  { title: "会员相亲状态", rows: [
    { label: "公开相亲", pct: 93.4, count: 598 }, { label: "私密", pct: 5.0, count: 32 },
    { label: "已经脱单", pct: 0.3, count: 2 },
  ] },
];

const requirementDonuts: { title: string; cols: 1 | 2; items: Dist[] }[] = [
  { title: "年龄要求", cols: 1, items: [
    { label: "25岁以下", pct: 70.9, count: 288 }, { label: "25-30岁", pct: 94.6, count: 384 },
    { label: "31-35岁", pct: 51.2, count: 208 }, { label: "36-40岁", pct: 16.3, count: 66 },
    { label: "41-45岁", pct: 3.7, count: 15 }, { label: "46-50岁", pct: 0.5, count: 2 },
  ] },
  { title: "婚况要求", cols: 1, items: [
    { label: "不接受离异", pct: 43.8, count: 178 }, { label: "视情况而定", pct: 20.9, count: 85 },
    { label: "可接受离异未育", pct: 11.1, count: 45 }, { label: "接受离异有孩子", pct: 1.5, count: 6 },
  ] },
  { title: "身高要求", cols: 1, items: [
    { label: "155cm-160cm", pct: 68.2, count: 277 }, { label: "161cm-165cm", pct: 42.9, count: 174 },
    { label: "166cm-170cm", pct: 24.4, count: 99 }, { label: "171cm-175cm", pct: 29.3, count: 119 },
    { label: "176cm-180cm", pct: 7.6, count: 31 }, { label: "180cm以上", pct: 43.1, count: 175 },
  ] },
  { title: "学历要求", cols: 1, items: [
    { label: "本科", pct: 50.2, count: 204 }, { label: "大专", pct: 25.4, count: 103 },
    { label: "高中", pct: 6.4, count: 26 }, { label: "技校", pct: 4.7, count: 19 },
    { label: "初中", pct: 2.0, count: 8 }, { label: "不限", pct: 0.2, count: 1 },
  ] },
  { title: "住房要求", cols: 1, items: [
    { label: "愿意和父母同住", pct: 1.7, count: 7 }, { label: "要有独立婚房", pct: 1.2, count: 5 },
    { label: "住房无所谓", pct: 8.4, count: 34 },
  ] },
  { title: "抽烟要求", cols: 1, items: [
    { label: "不接受吸烟", pct: 57.6, count: 234 }, { label: "可以偶尔吸烟", pct: 5.9, count: 24 },
    { label: "吸烟无所谓", pct: 1.0, count: 4 },
  ] },
  { title: "喝酒要求", cols: 1, items: [
    { label: "可以偶尔小酌", pct: 38.9, count: 158, pctText: "0.389%" },
    { label: "不接受喝酒", pct: 5.2, count: 21, pctText: "0.052%" },
    { label: "喝酒无所谓", pct: 1.5, count: 6, pctText: "0.015%" },
  ] },
  { title: "结婚要求", cols: 1, items: [
    { label: "时机成熟时结婚", pct: 16.5, count: 67 }, { label: "一年内结婚", pct: 6.4, count: 26 },
    { label: "两年内结婚", pct: 4.7, count: 19 }, { label: "三年内结婚", pct: 1.5, count: 6 },
  ] },
];

const requirementJobRows: Dist[] = [
  { label: "私企员工", pct: 33.7, count: 137 }, { label: "外企", pct: 15.5, count: 63 },
  { label: "自由职业", pct: 11.6, count: 47 }, { label: "央企/国企", pct: 4.7, count: 19 },
  { label: "事业单位", pct: 4.7, count: 19 }, { label: "个体老板", pct: 4.2, count: 17 },
  { label: "教师", pct: 3.0, count: 12 }, { label: "金融", pct: 2.0, count: 8 },
  { label: "护士", pct: 1.7, count: 7 }, { label: "公务员", pct: 1.2, count: 5 },
];

const browseRows = [
  { date: "2026-09-09", home: "0次", profile: "0次", top: "" },
  { date: "2026-09-08", home: "0次", profile: "1次", top: "面爸爸打球", topCount: "1次" },
  { date: "2026-09-07", home: "1次", profile: "0次", top: "" },
  { date: "2026-09-06", home: "0次", profile: "0次", top: "" },
  { date: "2026-09-05", home: "1次", profile: "0次", top: "" },
  { date: "2026-09-04", home: "1次", profile: "0次", top: "" },
  { date: "2026-09-03", home: "0次", profile: "1次", top: "我脸1点也不圆", topCount: "1次" },
  { date: "2026-09-02", home: "1次", profile: "0次", top: "" },
  { date: "2026-09-01", home: "0次", profile: "10次", top: "宋宋", topCount: "3次" },
  { date: "2026-08-31", home: "9次", profile: "0次", top: "" },
  { date: "2026-08-30", home: "7次", profile: "0次", top: "" },
  { date: "2026-08-29", home: "0次", profile: "0次", top: "" },
  { date: "2026-08-28", home: "0次", profile: "0次", top: "" },
  { date: "2026-08-27", home: "5次", profile: "18次", top: "rasin", topCount: "6次" },
  { date: "2026-08-26", home: "19次", profile: "0次", top: "" },
  { date: "2026-08-25", home: "5次", profile: "0次", top: "" },
];

const popularityGroups: { title: string; unit: string; rows: { name: string; count: number }[] }[] = [
  { title: "人气女会员排行（浏览量前10）", unit: "被浏览", rows: [
    { name: "Jane.", count: 106 }, { name: "余生请指教", count: 65 }, { name: "晚梨不吐梨", count: 53 },
    { name: "单头小狗xox", count: 52 }, { name: ",", count: 44 }, { name: "毛毛", count: 44 },
    { name: "O噼吧啦", count: 36 }, { name: "🌸~?~🌸", count: 29 }, { name: "乐乐", count: 29 },
    { name: "小Yang又困", count: 25 },
  ] },
  { title: "人气男会员排行（浏览量前10）", unit: "被浏览", rows: [
    { name: "别跟我橘子", count: 69 }, { name: "ele3", count: 45 }, { name: "emm", count: 41 },
    { name: "众里寻她", count: 39 }, { name: "一个人", count: 33 }, { name: "降天", count: 33 },
    { name: "出现", count: 32 }, { name: "秋刀鱼", count: 30 }, { name: "等泥不行ya", count: 29 },
    { name: "我脸1点也不圆", count: 26 },
  ] },
  { title: "最受欢迎女会员排行（被申请牵线数前10）", unit: "被申请", rows: [
    { name: "小Yang又困", count: 2 }, { name: "爱情鸟", count: 2 }, { name: "显头小狗xox", count: 2 },
    { name: "余生请指教", count: 2 }, { name: "晚梨不吐梨", count: 2 }, { name: "O噼吧啦", count: 2 },
    { name: "小南瓜", count: 1 }, { name: "草莓味的美味蟹堡", count: 1 }, { name: "蓝色琉璃梦", count: 1 },
    { name: "尹宋", count: 1 },
  ] },
  { title: "最受欢迎男会员排行（被申请牵线数前10）", unit: "被申请", rows: [
    { name: "我脸1点也不圆", count: 1 }, { name: "众里寻她", count: 1 }, { name: "Q铃儿响叮当-", count: 1 },
    { name: "小歪yoo z", count: 1 }, { name: "Lemon", count: 1 }, { name: "一个人", count: 1 },
    { name: "Dylan-L", count: 1 }, { name: "小雨g\"", count: 1 }, { name: "、", count: 0 },
    { name: "晨曦", count: 0 },
  ] },
];

const pctText = (item: Dist) => item.pctText ?? `${item.pct.toFixed(2)}%`;

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="ustat-panel-title"><i aria-hidden />{children}</h3>;
}

function DonutPanel({ title, items, cols = 2 }: { title: string; items: Dist[]; cols?: 1 | 2 }) {
  const total = items.reduce((sum, item) => sum + item.pct, 0) || 1;
  let acc = 0;
  const segments = items.map((item, index) => {
    const start = acc;
    acc += (item.pct / total) * 360;
    return `${DONUT_COLORS[index % DONUT_COLORS.length]} ${start}deg ${acc}deg`;
  });
  return (
    <section className="ustat-panel">
      <PanelTitle>{title}</PanelTitle>
      <div className="ustat-donut">
        <div className="ustat-donut-ring" style={{ background: `conic-gradient(${segments.join(",")})` }}>
          <span className="ustat-donut-hole" />
        </div>
      </div>
      <div className={`ustat-legend${cols === 2 ? " cols2" : ""}`}>
        {items.map((item, index) => (
          <div className="ustat-legend-item" key={item.label}>
            <i className="ustat-legend-dot" style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }} />
            <span className="ustat-legend-label">{item.label}</span>
            <span className="ustat-legend-pct">{pctText(item)}</span>
            <span className="ustat-legend-num">{item.count}人</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BarPanel({ title, rows }: { title: string; rows: Dist[] }) {
  const max = Math.max(...rows.map((row) => row.pct), 0.001);
  return (
    <section className="ustat-panel">
      <PanelTitle>{title}</PanelTitle>
      <div className="ustat-bars">
        {rows.map((row) => (
          <div className="ustat-bar-row" key={row.label}>
            <span className="ustat-bar-label" title={row.label}>{row.label}</span>
            <span className="ustat-bar-track">
              <span className="ustat-bar-fill" style={{ width: `${Math.max(2, (row.pct / max) * 100)}%` }} />
            </span>
            <span className="ustat-bar-pct">{pctText(row)}</span>
            <span className="ustat-bar-num">{row.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function valueNode(value: number, unit = "") {
  return <b className={value > 0 ? "ustat-num-pos" : "ustat-num-zero"}>{value}{unit}</b>;
}

export default function LoveUserStatisticsPage() {
  const [tab, setTab] = useState<TabKey>("growth");
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("daily");
  const [gender, setGender] = useState<"male" | "female">("male");

  const content = () => {
    if (tab === "growth") {
      return (
        <div>
          <div className="ustat-metrics">
            <div className="ustat-metric">
              <span className="ustat-metric-label">总人数(人)</span>
              <b className="ustat-metric-value">640</b>
            </div>
            <div className="ustat-metric">
              <span className="ustat-metric-label">单日新增最高(人)</span>
              <span className="ustat-metric-main">
                <span className="ustat-metric-date">2026-06-12</span>
                <b className="ustat-metric-value">285</b>
              </span>
            </div>
            <div className="ustat-metric">
              <span className="ustat-metric-label">单月新增最高(人)</span>
              <span className="ustat-metric-main">
                <span className="ustat-metric-date">2026-06</span>
                <b className="ustat-metric-value">586</b>
              </span>
            </div>
          </div>

          <div className="ustat-radios">
            {([["daily", "日报"], ["monthly", "月报"], ["yearly", "年报"]] as ["daily" | "monthly" | "yearly", string][]).map(([key, label]) => (
              <label className="ustat-radio" key={key}>
                <input type="radio" name="ustat-period" checked={period === key} onChange={() => setPeriod(key)} />
                {label}
              </label>
            ))}
          </div>

          <div className="ustat-table-wrap">
            <table className="ustat-table">
              <thead>
                <tr>
                  <th>日期(周期)</th>
                  <th>新增会员</th>
                  <th>新增VIP会员</th>
                  <th>新申请红娘牵线数</th>
                  <th>失败牵线数</th>
                  <th>成功牵线数</th>
                </tr>
              </thead>
              <tbody>
                {growthRows.map((row) => (
                  <tr key={row.date}>
                    <td className="ustat-time">{row.date}</td>
                    <td>
                      <span className="ustat-mf"><span>男: {valueNode(row.m)}</span><span>女: {valueNode(row.f)}</span></span>
                    </td>
                    <td>{valueNode(0)}</td>
                    <td>{valueNode(row.apply)}</td>
                    <td>{valueNode(row.failed)}</td>
                    <td>{valueNode(row.success)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (tab === "follow") {
      return (
        <div className="ustat-table-wrap">
          <table className="ustat-table follow">
            <thead>
              <tr>
                <th>红娘</th>
                <th>名下会员</th>
                <th>从未跟进</th>
                <th>超3天未跟进</th>
                <th>超7天未跟进</th>
                <th>超15天未跟进</th>
                <th>超30天未跟进</th>
                <th>跟进总条数</th>
                <th>本月跟进条数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ustat-strong">芸希老师</td>
                <td>617</td>
                <td>596</td>
                <td>21</td>
                <td>21</td>
                <td>20</td>
                <td>20</td>
                <td>43条</td>
                <td>1条</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    if (tab === "intention") {
      return (
        <div className="ustat-table-wrap">
          <table className="ustat-table">
            <thead>
              <tr>
                <th>客户意向</th>
                <th>客源数量</th>
                <th>占比</th>
              </tr>
            </thead>
            <tbody>
              {intentionRows.map((row) => (
                <tr key={row.label}>
                  <td className={row.hot ? "ustat-intent-hot" : ""}>{row.label}</td>
                  <td>
                    <span className="ustat-intent-cell">
                      <span className="ustat-intent-count">0条</span>
                      <span className="ustat-intent-track" />
                      {row.hot && <span className="ustat-badge-hot">最多</span>}
                    </span>
                  </td>
                  <td>0.00%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (tab === "basic") {
      return (
        <div className="ustat-blocks">
          <div className="ustat-grid c4">
            {basicDonuts.map((panel) => <DonutPanel key={panel.title} title={panel.title} items={panel.items} cols={panel.cols} />)}
          </div>
          <div className="ustat-grid c4">
            {basicBars.map((panel) => <BarPanel key={panel.title} title={panel.title} rows={panel.rows} />)}
          </div>
        </div>
      );
    }

    if (tab === "requirement") {
      return (
        <div className="ustat-blocks">
          <div className="ustat-radios">
            <label className="ustat-radio">
              <input type="radio" name="ustat-gender" checked={gender === "male"} onChange={() => setGender("male")} />
              男生择偶要求统计
            </label>
            <label className="ustat-radio">
              <input type="radio" name="ustat-gender" checked={gender === "female"} onChange={() => setGender("female")} />
              女生择偶要求统计
            </label>
          </div>
          <div className="ustat-grid c4">
            {requirementDonuts.map((panel) => <DonutPanel key={panel.title} title={panel.title} items={panel.items} cols={panel.cols} />)}
          </div>
          <section className="ustat-panel">
            <PanelTitle>择偶职业前10</PanelTitle>
            <div className="ustat-bars">
              {requirementJobRows.map((row, index) => (
                <div className="ustat-bar-row" key={row.label}>
                  <span className="ustat-bar-label">{row.label}</span>
                  <span className="ustat-bar-track">
                    <span className="ustat-bar-fill" style={{ width: `${Math.max(2, (row.count / 137) * 100)}%` }} />
                  </span>
                  <span className="ustat-bar-select">{row.count}人选择</span>
                  <span className="ustat-bar-pct">{pctText(row)}</span>
                  {index === 0 && <span className="ustat-badge-hot">最受欢迎</span>}
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (tab === "browse") {
      return (
        <div>
          <div className="ustat-datebar">
            <span className="ustat-date-field">
              <input type="text" defaultValue="" placeholder="开始日期" readOnly />
            </span>
            <ArrowRight size={14} className="ustat-date-arrow" />
            <span className="ustat-date-field">
              <input type="text" defaultValue="" placeholder="结束日期" readOnly />
            </span>
            <CalendarDays size={15} className="ustat-date-icon" />
          </div>
          <div className="ustat-table-wrap">
            <table className="ustat-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>平台首页浏览次数</th>
                  <th>资料页浏览次数</th>
                  <th>被浏览最多的资料页</th>
                </tr>
              </thead>
              <tbody>
                {browseRows.map((row) => (
                  <tr key={row.date}>
                    <td className="ustat-time">{row.date}</td>
                    <td>{row.home}</td>
                    <td>{row.profile}</td>
                    <td>
                      {row.top ? (
                        <span className="ustat-browse-top">
                          <button type="button" className="ustat-link">{row.top}</button>
                          <span className="ustat-browse-badge">被浏览{row.topCount}</span>
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="ustat-notice">
          <span className="ustat-notice-label"><i className="ustat-notice-icon">i</i>须知</span>
          <span>统计范围为您的平台中状态为“公开相亲”的会员</span>
        </div>
        <div className="ustat-grid c4">
          {popularityGroups.map((group, groupIndex) => (
            <section className="ustat-panel" key={group.title}>
              <PanelTitle>{group.title}</PanelTitle>
              <div className="ustat-rank-list">
                {group.rows.map((row, index) => (
                  <div className="ustat-rank-item" key={`${groupIndex}-${row.name}-${index}`}>
                    <span className={`ustat-rank-no${index < 3 ? ` g${index + 1}` : " plain"}`}>{index + 1}</span>
                    <span className="ustat-rank-avatar" style={{ background: AVATARS[(groupIndex + index) % AVATARS.length] }} />
                    <span className="ustat-rank-name" title={row.name}>{row.name}</span>
                    <span className="ustat-rank-count">{group.unit}{row.count}次</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <AdminBreadcrumb items={[{ label: "会员CRM" }, { label: "数据报表" }]} />
      <div className="ustat-card">
        <div className="ustat-tabs">
          {tabs.map((item) => (
            <button type="button" key={item.key} onClick={() => setTab(item.key)} className={`ustat-tab${tab === item.key ? " active" : ""}`}>
              {item.label}
            </button>
          ))}
        </div>
        {content()}
      </div>
    </div>
  );
}
