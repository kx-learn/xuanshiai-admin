"use client";

import { useState } from "react";
import { Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2, Image as ImageIcon, Smile, Code, Heading1, Heading2, RotateCcw, RotateCw, Maximize2, Minus, Quote } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("合伙红娘", "功能配置");

const TOOLBAR: { icon: React.ReactNode; title: string }[] = [
  { icon: <Heading1 size={14} />, title: "标题" },
  { icon: <Type size={14} />, title: "正文" },
  { icon: <Bold size={14} />, title: "加粗" },
  { icon: <Italic size={14} />, title: "斜体" },
  { icon: <Underline size={14} />, title: "下划线" },
  { icon: <Strikethrough size={14} />, title: "删除线" },
  { icon: <AlignLeft size={14} />, title: "左对齐" },
  { icon: <AlignCenter size={14} />, title: "居中" },
  { icon: <AlignRight size={14} />, title: "右对齐" },
  { icon: <List size={14} />, title: "无序列表" },
  { icon: <ListOrdered size={14} />, title: "有序列表" },
  { icon: <Link2 size={14} />, title: "链接" },
  { icon: <ImageIcon size={14} />, title: "图片" },
  { icon: <Smile size={14} />, title: "表情" },
  { icon: <Code size={14} />, title: "代码" },
  { icon: <Quote size={14} />, title: "引用" },
  { icon: <Minus size={14} />, title: "分割线" },
  { icon: <RotateCcw size={14} />, title: "撤销" },
  { icon: <RotateCw size={14} />, title: "重做" },
  { icon: <Maximize2 size={14} />, title: "全屏" },
  { icon: <Heading2 size={14} />, title: "标题2" },
];

export default function LovePartnerConfigPage() {
  const [shareBonus, setShareBonus] = useState("享有");
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card lp-card">
        <h2 className="lp-title">功能配置</h2>

        <div className="ecl-notice lp-notice">
          <div className="ecl-notice-body">
            <span className="ecl-notice-ic">i</span>
            <div className="ecl-notice-text">
              <div className="ecl-notice-title">合伙人介绍</div>
              <p>合伙人（又称：合伙红娘）于基于推广红娘的模式系统，每个合伙人被视为一个团队或您平台的加盟合作方，每个合伙人可以自定义团队名称，其发展来的推广红娘自动纳入为团队名下成员，团队的推广红娘所发展来的会员在平台上的消费总额度成为团队业绩。系统根据其团队业绩及发展会员数数量将合伙人划分为了三个不同级别，不同的级别享有不同的分佣标准</p>
              <p>合伙人除下能拿到所有团队成员发展来的会员的注册奖励之外，团队成员发展来的相亲会员各自在平台中每一笔消费，合伙人可以获得分成</p>
              <p>合伙人拥有独立的管理中心，团队成员名单、业绩明细、分佣明细、有效相亲会员名单等可清晰透明可见，分佣金额可随时申请提现到微信零钱</p>
              <p>合伙人可以在线付费开通，也可以设置为人工免费开通两种形式，可根据情况灵活运用</p>
              <p>每个合伙人拥有独立的邀请二维码，别人扫合伙人二维码后，进入平台，只要注册为用户，即可绑定关系。任何时候该用户推广红娘，都会自动加入之前扫码的那个合伙人团队</p>
              <p><b>特别提醒：</b>合伙人系统可以结合服务红娘权限，开展同城的个体婚恋联盟联盟合作，实现共享平台、共享品牌、资源共享、服务共享！</p>
            </div>
          </div>
        </div>

        <div className="lp-row">
          <span className="lp-label">＊合伙人介绍文案</span>
          <div className="lp-content">
            <div className="lp-editor">
              <div className="lp-editor-toolbar">
                {TOOLBAR.map((it, idx) => (
                  <button key={idx} type="button" className="lp-editor-tool" title={it.title}>{it.icon}</button>
                ))}
              </div>
              <div className="lp-editor-body" contentEditable suppressContentEditableWarning>
                <div className="lp-banner">
                  <div className="lp-banner-title">寻婚恋事业合伙人</div>
                  <div className="lp-banner-pill">携手共创，共享婚恋市场蓝海！</div>
                  <div className="lp-banner-image" />
                </div>
                <p className="lp-editor-text">作为婚恋服务行业的佼佼者，我们专注于为单身人士提供高端、专业的婚恋匹配服务。秉承"真诚、专业、高效的服务理念，我们已成功帮助数千对有情人牵手成功，赢得了市场的广泛赞誉。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lp-row lp-row-top">
          <span className="lp-label">当合伙人同时是自己团队中的推广红娘时</span>
          <div className="lp-content">
            <div className="lp-options">
              <span className="lp-options-label">是否在合伙人乎享有该推广红娘注册会员奖励和消费分成：</span>
              {["享有", "不享有"].map((o) => (
                <label key={o} className={`lp-radio ${shareBonus === o ? "active" : ""}`}>
                  <input type="radio" name="shareBonus" value={o} checked={shareBonus === o} onChange={() => setShareBonus(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lp-submit-row">
          <button className="finord-btn finord-btn-primary lp-submit">确定提交</button>
        </div>
      </div>
    </div>
  );
}