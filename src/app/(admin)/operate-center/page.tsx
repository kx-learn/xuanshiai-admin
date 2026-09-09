"use client";

import { useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

/* ------------------------------------------------------------------ */
/* 数据定义                                                            */
/* ------------------------------------------------------------------ */

type ContentType = "video" | "pdf" | "ppt" | "word" | "download" | "link";

interface Teacher {
  id: string;
  name: string;
  count: number;
  hue: number;
  intro: string;
}

interface Course {
  id: string;
  title: string;
  teacher: string;
  date: string;
  access: "all" | "free";
  must?: boolean;
  likes: number;
  type: ContentType;
  duration?: string;
}

const teachers: Teacher[] = [
  { id: "banzhang", name: "班长", count: 101, hue: 210, intro: "163K创始人、985、核心产品经理；爱学习、爱研究，将热爱转化为事业、追求完美，高中时代即投身互联网创业，第一代草根互联网站站长，曾成立多家公司，主导研发多款业内知名软件产品，创业20年，具有丰富的运营经验、产品设计经验，余生将带领163K全身心投入..." },
  { id: "zengchen", name: "曾晨", count: 18, hue: 205, intro: "95后知识青年、央企辞职创业、国家认证心理咨询师、联合国优秀志愿者、资深活动策划人，8年活动策划经验，每年组织300+场城市社交活动，柳州紫荆青年婚恋平台创始人、打造三线城市高学历婚恋品牌、一年半时间将平台做到本地头部" },
  { id: "liuhuanhuan", name: "刘欢欢", count: 88, hue: 330, intro: "合肥在一起高端婚恋创始人，拥有8年活动及培训策划组织及主持经验，跨行自主创业，擅长组织策划优质单身交友局，新婚恋及传统门店结合新玩法，创办的品牌“在一起”是一家专注于服务中高端客户群体的单身交友平台，小型而美的婚恋公司。目前共有7家门店，高级合..." },
  { id: "junjun", name: "君君", count: 8, hue: 260, intro: "在一起金牌情感顾问，国家三级心理咨询师、家庭教育心理顾问，线下咨询案例超过3000小时、恋爱指导个案超过1500例、婚姻指导案例超过1000例" },
  { id: "daxiong", name: "大熊", count: 2, hue: 20, intro: "163K合伙人、新生代婚恋创业导师，从事互联网创业20余年，具有丰富的营销推广经验，善于利用各种新媒体方法从公域低成本获取单身流量，并引流到红娘私域，通过搭建婚恋平台将客源实现线上结合线下运营变现。" },
  { id: "wangge", name: "望哥", count: 9, hue: 265, intro: "六个圈子婚恋平台创始人，「结婚教练」品类开创者，打造常态化《望哥说媒·千人相亲大会》，致力于打造婚恋行业“胖东来”，全国连锁60余家，婚庆行业协会常务秘书长" },
];

const tabs = [
  "分享老师",
  "最新推荐",
  "婚恋创业",
  "红娘话术",
  "线下活动",
  "引流获客",
  "红娘销售",
  "红娘服务",
  "资料下载",
  "用好系统",
  "专属课程",
];

const courseData: Record<string, Course[]> = {
  分享老师: [],
  最新推荐: [
    { id: "a1", title: "《新型婚恋7大盈利模式》六个圈子望哥2025年7月分享会（回放1）", teacher: "望哥", date: "2025年08月12日", access: "all", must: true, likes: 0, type: "video", duration: "36分钟" },
    { id: "a2", title: "《新型婚恋7大盈利模式》六个圈子望哥2025年7月分享会（回放2）", teacher: "望哥", date: "2025年08月12日", access: "all", must: true, likes: 0, type: "video", duration: "36分钟" },
    { id: "a3", title: "《新型婚恋7大盈利模式》六个圈子望哥2025年7月分享会（回放3）", teacher: "望哥", date: "2025年08月12日", access: "all", must: true, likes: 0, type: "video", duration: "36分钟" },
    { id: "a4", title: "《新型婚恋7大盈利模式》六个圈子望哥2025年7月分享会（回放4）", teacher: "望哥", date: "2025年08月12日", access: "all", must: true, likes: 1, type: "video", duration: "36分钟" },
    { id: "a5", title: "《新型婚恋7大盈利模式》六个圈子望哥2025年7月分享会（回放5）", teacher: "望哥", date: "2025年08月12日", access: "all", must: true, likes: 1, type: "video", duration: "36分钟" },
    { id: "a6", title: "《打造万人相亲大会》快速获取流量-新型婚恋爆款实战（2）（2024分享会）", teacher: "望哥", date: "2024年06月06日", access: "free", must: true, likes: 7, type: "video", duration: "60分钟" },
    { id: "a7", title: "六个圈子望哥分享PPT：婚庆转型新型的爆款实战（2024分享会）", teacher: "望哥", date: "2024年06月06日", access: "all", must: true, likes: 0, type: "pdf" },
    { id: "a8", title: "《打造万人相亲大会》快速获取流量-新型婚恋爆款实战（1）（2024分享会）", teacher: "望哥", date: "2024年06月06日", access: "free", must: true, likes: 7, type: "video", duration: "90分钟" },
    { id: "a9", title: "望哥：打造万人相亲大会快速获取流量（2024分享会）", teacher: "望哥", date: "2024年06月06日", access: "all", must: true, likes: 1, type: "video", duration: "60分钟" },
  ],
  婚恋创业: [
    { id: "b1", title: "《打造城市青年综合服务体》紫荆青年-曾晨-2025年7月分享会（回放1）", teacher: "曾晨", date: "2025年08月11日", access: "all", must: true, likes: 6, type: "video", duration: "36分钟" },
    { id: "b2", title: "《打造城市青年综合服务体》紫荆青年-曾晨-2025年7月分享会（回放2）", teacher: "曾晨", date: "2025年08月11日", access: "all", must: true, likes: 1, type: "video", duration: "36分钟" },
    { id: "b3", title: "《打造城市青年综合服务体》紫荆青年-曾晨-2025年7月分享会（回放3）", teacher: "曾晨", date: "2025年08月11日", access: "all", must: true, likes: 0, type: "video", duration: "36分钟" },
    { id: "b4", title: "《打造城市青年综合服务体》紫荆青年-曾晨-2025年7月分享会（回放4）", teacher: "曾晨", date: "2025年08月11日", access: "all", must: true, likes: 0, type: "video", duration: "36分钟" },
    { id: "b5", title: "《打造城市青年综合服务体》紫荆青年-曾晨-2025年7月分享会（回放5）", teacher: "曾晨", date: "2025年08月11日", access: "all", must: true, likes: 0, type: "video", duration: "36分钟" },
    { id: "b6", title: "《打造城市青年综合服务体》紫荆青年-曾晨-2025年7月分享会（PPT）", teacher: "曾晨", date: "2025年08月01日", access: "all", must: true, likes: 1, type: "ppt" },
    { id: "b7", title: "柳州紫荆青年2025年发展报告", teacher: "曾晨", date: "2025年05月29日", access: "all", must: true, likes: 1, type: "pdf" },
  ],
  红娘话术: [
    { id: "c1", title: "红娘话术（全套文档版）", teacher: "班长", date: "2026年01月07日", access: "all", must: true, likes: 0, type: "video", duration: "36分钟" },
    { id: "c2", title: "婚介离异客户，全流程沟通话术模板（直接套用）", teacher: "班长", date: "2026年04月17日", access: "all", likes: 0, type: "video", duration: "36分钟" },
    { id: "c3", title: "没介绍成功，客户要退货？红娘处理流程+话术", teacher: "班长", date: "2026年04月15日", access: "all", likes: 0, type: "video", duration: "36分钟" },
    { id: "c4", title: "红娘话术大全（2026最新版）", teacher: "班长", date: "2026年03月26日", access: "all", likes: 0, type: "video", duration: "36分钟" },
    { id: "c5", title: "红娘待人艺术与实战话术", teacher: "班长", date: "2025年09月26日", access: "all", likes: 0, type: "pdf" },
    { id: "c6", title: "红娘怎么回复女生要不要收费", teacher: "刘欢欢", date: "2025年07月24日", access: "all", likes: 2, type: "video", duration: "36分钟" },
    { id: "c7", title: "红娘怎么回复收费比其他家更贵", teacher: "刘欢欢", date: "2025年07月24日", access: "all", likes: 0, type: "video", duration: "36分钟" },
    { id: "c8", title: "如何解释媒体对婚介的负面报道", teacher: "刘欢欢", date: "2025年07月03日", access: "all", likes: 0, type: "video", duration: "36分钟" },
    { id: "c9", title: "客户问介绍不成功会退费吗？", teacher: "君君", date: "2025年06月27日", access: "all", likes: 1, type: "pdf" },
  ],
  线下活动: [
    { id: "d1", title: "2026年社交型婚恋模式线上分享会", teacher: "曾晨", date: "2026年02月06日", access: "free", likes: 0, type: "video", duration: "120分钟" },
    { id: "d2", title: "曾晨（柳州紫荆青年）：教你玩转本地青年流量（1）", teacher: "曾晨", date: "2024年06月05日", access: "all", must: true, likes: 16, type: "video", duration: "36分钟" },
    { id: "d3", title: "曾晨（柳州紫荆青年）：教你玩转本地青年流量（2）", teacher: "曾晨", date: "2024年06月05日", access: "all", must: true, likes: 5, type: "video", duration: "32分钟" },
    { id: "d4", title: "曾晨（柳州紫荆青年）：教你玩转本地青年流量（3）", teacher: "曾晨", date: "2024年06月05日", access: "all", must: true, likes: 6, type: "video", duration: "59分钟" },
    { id: "d5", title: "曾晨（柳州紫荆青年）：教你玩转本地青年流量（4）", teacher: "曾晨", date: "2024年06月05日", access: "all", must: true, likes: 6, type: "video", duration: "60分钟" },
    { id: "d6", title: "曾晨（柳州紫荆青年）：教你玩转本地青年流量（5）", teacher: "曾晨", date: "2024年06月05日", access: "all", must: true, likes: 8, type: "video", duration: "58分钟" },
    { id: "d7", title: "王婆说媒全程现场实录（学习台上王婆的话术、应变能力）", teacher: "班长", date: "2024年06月04日", access: "all", must: true, likes: 13, type: "video", duration: "87分钟" },
  ],
  引流获客: [
    { id: "e1", title: "红娘短视频促进信任文案十大选题", teacher: "班长", date: "2025年09月23日", access: "all", likes: 1, type: "video", duration: "36分钟" },
    { id: "e2", title: "红娘短视频爆款文案十大选题", teacher: "班长", date: "2025年09月23日", access: "all", likes: 0, type: "video", duration: "36分钟" },
    { id: "e3", title: "红娘短视频高留资文案十大选题", teacher: "班长", date: "2025年09月23日", access: "all", likes: 0, type: "video", duration: "36分钟" },
    { id: "e4", title: "十个值得红娘学习的抖音账号", teacher: "班长", date: "2025年09月05日", access: "all", likes: 1, type: "video", duration: "36分钟" },
    { id: "e5", title: "获客越来越难该如何破局", teacher: "刘欢欢", date: "2025年07月24日", access: "all", likes: 1, type: "video", duration: "36分钟" },
    { id: "e6", title: "红娘账号好的内容标准是什么", teacher: "刘欢欢", date: "2025年07月24日", access: "all", likes: 0, type: "video", duration: "36分钟" },
    { id: "e7", title: "IP的形象表现力如何去提升练习（下）", teacher: "刘欢欢", date: "2025年07月24日", access: "all", likes: 0, type: "video", duration: "36分钟" },
  ],
  红娘销售: [
    { id: "f1", title: "客户质疑见面人为婚托、不信任婚介，红娘应对方案", teacher: "班长", date: "2026年04月17日", access: "all", likes: 0, type: "download" },
    { id: "f2", title: "客户质疑婚托问题，红娘如何应对", teacher: "班长", date: "2026年04月17日", access: "all", likes: 0, type: "download" },
    { id: "f3", title: "50条离异客户实战经验，助你快速建立信任", teacher: "班长", date: "2026年04月17日", access: "all", likes: 0, type: "download" },
    { id: "f4", title: "父母客户：沟通技巧+实战经验+开单话术全攻略", teacher: "班长", date: "2026年04月17日", access: "all", likes: 0, type: "download" },
    { id: "f5", title: "《邀约和面谈销售》刘欢欢（2025年7月分享会PPT）", teacher: "刘欢欢", date: "2025年08月01日", access: "all", likes: 0, type: "video", duration: "36分钟" },
    { id: "f6", title: "客户说婚介都是骗子，红娘如何回答", teacher: "刘欢欢", date: "2025年06月27日", access: "all", likes: 2, type: "video", duration: "36分钟" },
    { id: "f7", title: "红娘怎样做到不被客户讨厌", teacher: "刘欢欢", date: "2025年06月27日", access: "all", likes: 0, type: "video", duration: "36分钟" },
  ],
  红娘服务: [
    { id: "g1", title: "100条单身客户语言的潜在含义与应对指南", teacher: "班长", date: "2026年01月08日", access: "all", must: true, likes: 1, type: "link" },
    { id: "g2", title: "感动！一位从业八年的红娘内心独白", teacher: "班长", date: "2025年07月22日", access: "all", must: true, likes: 2, type: "video", duration: "36分钟" },
    { id: "g3", title: "红娘从业手册（2026版）", teacher: "班长", date: "2026年03月18日", access: "all", likes: 0, type: "download" },
    { id: "g4", title: "红娘服务全流程·红娘服务全流程详解", teacher: "班长", date: "2025年11月17日", access: "all", likes: 0, type: "video", duration: "36分钟" },
    { id: "g5", title: "《服务如何拉动业绩》君君老师2025年7月分享会（回放1）", teacher: "君君", date: "2025年08月12日", access: "free", likes: 0, type: "video", duration: "36分钟" },
    { id: "g6", title: "《服务如何拉动业绩》君君老师2025年7月分享会（回放2）", teacher: "君君", date: "2025年08月12日", access: "all", likes: 0, type: "video", duration: "36分钟" },
    { id: "g7", title: "《高续费服务套餐实操》君君老师（2025年7月分享会PPT）", teacher: "君君", date: "2025年08月01日", access: "all", likes: 0, type: "download" },
  ],
  资料下载: [
    { id: "h1", title: "婚介服务合同26年8月新规模板", teacher: "班长", date: "2026年08月12日", access: "all", must: true, likes: 0, type: "download" },
    { id: "h2", title: "包成功会员服务合同（六个圈子版）", teacher: "班长", date: "2026年03月30日", access: "all", must: true, likes: 1, type: "download" },
    { id: "h3", title: "《结婚版不限时间》（微惠热恋版）", teacher: "班长", date: "2026年03月30日", access: "all", must: true, likes: 0, type: "download" },
    { id: "h4", title: "曾晨400页PPT（天花板级，干货满满）：教你玩转本地青年流量（2024分享会）", teacher: "曾晨", date: "2024年06月06日", access: "all", must: true, likes: 1, type: "video", duration: "36分钟" },
    { id: "h5", title: "曾晨200页PPT：一年300场线下活动是如何做的（2023分享会）", teacher: "曾晨", date: "2024年06月06日", access: "free", likes: 5, type: "video", duration: "36分钟" },
    { id: "h6", title: "最新《婚介线下VIP会员合同》全款版", teacher: "班长", date: "2024年06月06日", access: "all", likes: 1, type: "word" },
    { id: "h7", title: "最新《婚介线下VIP会员合同》定金版", teacher: "班长", date: "2024年06月06日", access: "all", likes: 3, type: "word" },
  ],
  用好系统: [
    { id: "i1", title: "销售匹配库(眼缘库)使用教程", teacher: "班长", date: "2026年01月07日", access: "free", must: true, likes: 0, type: "link" },
    { id: "i2", title: "账号申请注销流程", teacher: "班长", date: "2026年07月06日", access: "free", likes: 0, type: "link" },
    { id: "i3", title: "会员资料页设计效果图展示", teacher: "班长", date: "2026年07月03日", access: "free", likes: 1, type: "link" },
    { id: "i4", title: "客户婚姻状态查询使用流程", teacher: "班长", date: "2026年06月30日", access: "free", likes: 1, type: "link" },
    { id: "i5", title: "云端素材库使用、改图小技巧", teacher: "班长", date: "2026年06月08日", access: "free", likes: 0, type: "link" },
    { id: "i6", title: "会员资料信息收集模板（线下纸质打印）", teacher: "班长", date: "2026年03月11日", access: "free", likes: 0, type: "word" },
    { id: "i7", title: "会员资料信息收集模板（线上）", teacher: "班长", date: "2026年03月11日", access: "free", likes: 0, type: "word" },
  ],
  专属课程: [],
};

/* ------------------------------------------------------------------ */
/* 小组件                                                              */
/* ------------------------------------------------------------------ */

function Avatar({ name, hue, size = 24 }: { name: string; hue: number; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.42),
        background: `linear-gradient(135deg, hsl(${hue} 78% 55%), hsl(${hue + 45} 76% 62%))`,
      }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

function NoticeBox() {
  return (
    <div className="wc-notice">
      <div className="wc-notice-title">
        <span>💡</span> 须知
      </div>
      <p>163K婚创学苑是由合肥一六三信息技术有限公司（简称163K）投入大量资金、人力、服务器带宽，精心打造的婚恋从业者线上学习交流分享平台</p>
      <p>163K婚创学苑内容广泛、形式丰富多样，无论您是初入婚恋行业的小白，还是资深从业者，在这里您都能学习到非常实用的知识和经验，我们也将不断邀请婚恋行业新秀、行业资深老师为我们录制分享最新内容</p>
      <p>如您有需要，我们还可以帮您对接分享老师为您定制专属课程、提供一对一指导和咨询答疑、还可以前往老师们的实体公司门店参访学习、面对面交流，也许还能碰撞合作的火花</p>
    </div>
  );
}

function Banner() {
  return (
    <div className="wc-banner">
      <div className="wc-banner-title">邀请婚恋行业优秀案例，分享成功经验</div>
      <div className="wc-banner-sub">向有结果的人学习，让您的婚恋创业少走弯路</div>
    </div>
  );
}

function Cover({ course }: { course: Course }) {
  if (course.type === "video") {
    return (
      <div className="wc-cover wc-cover-video">
        <span className="wc-play">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </span>
        {course.duration && <span className="wc-duration">{course.duration}</span>}
      </div>
    );
  }
  const meta: Record<Exclude<ContentType, "video">, { cls: string; label: string }> = {
    pdf: { cls: "wc-filetag pdf", label: "P" },
    ppt: { cls: "wc-filetag ppt", label: "P" },
    word: { cls: "wc-filetag word", label: "W" },
    download: { cls: "wc-action download", label: "下载" },
    link: { cls: "wc-action link", label: "链接" },
  };
  const m = meta[course.type as Exclude<ContentType, "video">];
  if (course.type === "download" || course.type === "link") {
    return (
      <div className="wc-cover">
        <div className={m.cls}>
          {course.type === "download" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7" /></svg>
          )}
          <span className="wc-action-label">{m.label}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="wc-cover">
      <div className={m.cls}>{m.label}</div>
    </div>
  );
}

function AccessTag({ access }: { access: Course["access"] }) {
  return access === "free" ? <span className="wc-tag wc-tag-free">免费体验</span> : <span className="wc-tag wc-tag-all">所有正式用户</span>;
}

function CourseCard({ course }: { course: Course }) {
  const teacher = teachers.find((t) => t.name === course.teacher);
  return (
    <div className="wc-course">
      <div className="wc-course-head">
        <AccessTag access={course.access} />
        <span className="wc-course-date">发布：{course.date}</span>
      </div>
      <div className="wc-course-body">
        <Cover course={course} />
        <div className="wc-course-info">
          <div className="wc-course-title">
            {course.must && <span className="wc-must">必看</span>}
            <span>{course.title}</span>
          </div>
          <div className="wc-course-meta">
            {teacher && <Avatar name={teacher.name} hue={teacher.hue} size={18} />}
            <span className="wc-teacher">{course.teacher}</span>
            <span className="wc-like">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12M15 5.9L14 10h5.2a2 2 0 011.9 2.6l-1.8 6A2 2 0 0117.4 22H7m0-12H4a2 2 0 00-2 2v8a2 2 0 002 2h3m0-12V5a2 2 0 012-2h1a2 2 0 012 2v3" /></svg>
              {course.likes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <div className="wc-teacher-card">
      <div className="wc-teacher-photo" aria-hidden>
        {/* 老师照片占位，暂无图片资源 */}
        <span className="wc-teacher-photo-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        </span>
      </div>
      <div className="wc-teacher-card-body">
        <div className="wc-teacher-card-name">{teacher.name}</div>
        <div className="wc-teacher-card-intro">{teacher.intro}</div>
        <div className="wc-teacher-card-foot">
          <span className="wc-share">分享({teacher.count})</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="wc-empty">
      <div className="wc-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
      </div>
      <div className="wc-empty-text">暂无数据</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 主组件                                                              */
/* ------------------------------------------------------------------ */

export default function OperateCenterPage() {
  const [activeTab, setActiveTab] = useState("分享老师");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggleTeacher = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const visibleCourses = useMemo(() => {
    let list = courseData[activeTab] || [];
    if (selected.length) list = list.filter((c) => selected.includes(c.teacher));
    if (searchInput.trim()) list = list.filter((c) => c.title.includes(searchInput.trim()));
    return list;
  }, [activeTab, selected, searchInput]);

  const isShare = activeTab === "分享老师";
  const isEmptyCourse = !isShare && visibleCourses.length === 0;

  return (
    <div className="wc-page">
      <AdminBreadcrumb items={[{ label: "首页", href: "/" }, { label: "婚创学苑" }]} />

      <div className="wc-shell">
        <NoticeBox />
        <Banner />

        <div className="wc-tabs">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              className={`wc-tab ${activeTab === t ? "active" : ""}`}
              onClick={() => {
                setActiveTab(t);
                setKeyword("");
                setSearchInput("");
                setSelected([]);
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="wc-filter">
          <span className="wc-filter-label">按老师：</span>
          <div className="wc-filter-teachers">
            {teachers.map((t) => (
              <label key={t.id} className={`wc-teacher-check ${selected.includes(t.id) ? "checked" : ""}`}>
                <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleTeacher(t.id)} />
                <Avatar name={t.name} hue={t.hue} size={26} />
                <span className="wc-teacher-name">{t.name}</span>
                <span className="wc-teacher-count">({t.count})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="wc-search">
          <input
            className="wc-search-input"
            placeholder="输入内容关键词"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setSearchInput(keyword); }}
          />
          <button type="button" className="wc-search-btn" onClick={() => setSearchInput(keyword)}>搜索</button>
        </div>

        <div className="wc-content">
          {isShare ? (
            <div className="wc-card-grid">
              {teachers.map((t) => <TeacherCard key={t.id} teacher={t} />)}
            </div>
          ) : isEmptyCourse ? (
            <>
              <EmptyState />
              <div className="wc-empty-tip">我们正在邀请更多婚恋行业成功老师为我们录制分享课程中...</div>
            </>
          ) : (
            <div className="wc-card-grid">
              {visibleCourses.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
