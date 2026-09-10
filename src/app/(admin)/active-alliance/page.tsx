"use client";

import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("商家联盟", "运营方案");

const PHONE_PALETTE = [
  { bg: "#fff5f7", accent: "#f0648a" },
  { bg: "#f2f5ff", accent: "#3658f7" },
  { bg: "#fff8e8", accent: "#fa8c16" },
  { bg: "#f0fbff", accent: "#13c2c2" },
];

function PhoneFrame({ children, idx = 0 }: { children: React.ReactNode; idx?: number }) {
  const p = PHONE_PALETTE[idx % PHONE_PALETTE.length];
  return (
    <div className="aa-phone" style={{ background: p.bg, borderColor: p.accent }}>
      <div className="aa-phone-bar" style={{ background: p.accent }} />
      <div className="aa-phone-screen">{children}</div>
    </div>
  );
}

function MockLine({ w = "100%", color = "#cbd5e0" }: { w?: string; color?: string }) {
  return <div className="aa-mock-line" style={{ width: w, background: color }} />;
}

function MockBlock({ h = 14, color = "#cbd5e0" }: { h?: number; color?: string }) {
  return <div className="aa-mock-block" style={{ height: h, background: color }} />;
}

export default function ActiveAlliancePage() {
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="aa-doc">
        <div className="aa-doc-title">联盟商家使用指导</div>

        {/* 一、商家联盟系统的价值与应用 */}
        <div className="aa-section">
          <div className="aa-section-title">一、商家联盟系统的价值与应用</div>
          <div className="aa-section-text">
            商家联盟系统是一套多商家线上商城系统，拥有商品发布、商家展示、下单支付、订单管理、消费券核销、分成结算、提现等较完善的功能。并在本系统中与"推广红娘"的角色和功能进行了深入结合。本商城系统能够帮助您平台大大提升商家异业合作的意愿、借助商家为平台获取单身客源、规范化商家合作流程，信息公开透明，完美解决不清楚商家孤单、漏单行为，为您的业务合作拓展带来更广阔的时间和发展空间，更具竞争力的运营方案。
          </div>
          <div className="aa-phones-row">
            <PhoneFrame idx={0}>
              <div className="aa-mock-title" style={{ background: "#fce4ec", color: "#e6495f" }}>约会去哪里？</div>
              <MockLine w="60%" color="#f8a4b9" />
              <div className="aa-mock-tabs">
                <span className="aa-mock-tab active">全部</span>
                <span className="aa-mock-tab">推荐餐饮</span>
                <span className="aa-mock-tab">休闲娱乐</span>
                <span className="aa-mock-tab">新奇体验</span>
                <span className="aa-mock-tab">生活服务</span>
              </div>
              <div className="aa-mock-tabs">
                <span className="aa-mock-tab active">合作商家</span>
                <span className="aa-mock-tab">专属优惠</span>
              </div>
              <div className="aa-mock-item">
                <div className="aa-mock-thumb" />
                <div className="aa-mock-item-info">
                  <MockLine w="80%" />
                  <MockLine w="60%" color="#e2e8f0" />
                  <MockLine w="50%" color="#e2e8f0" />
                </div>
              </div>
              <div className="aa-mock-item">
                <div className="aa-mock-thumb" />
                <div className="aa-mock-item-info">
                  <MockLine w="80%" />
                  <MockLine w="60%" color="#e2e8f0" />
                  <MockLine w="50%" color="#e2e8f0" />
                </div>
              </div>
            </PhoneFrame>
            <PhoneFrame idx={0}>
              <div className="aa-mock-title" style={{ background: "#fce4ec", color: "#e6495f" }}>约会去哪里？</div>
              <MockLine w="60%" color="#f8a4b9" />
              <div className="aa-mock-tabs">
                <span className="aa-mock-tab">全部</span>
                <span className="aa-mock-tab">推荐餐饮</span>
                <span className="aa-mock-tab">休闲娱乐</span>
                <span className="aa-mock-tab">新奇体验</span>
                <span className="aa-mock-tab">生活服务</span>
              </div>
              <div className="aa-mock-tabs">
                <span className="aa-mock-tab">合作商家</span>
                <span className="aa-mock-tab active">专属优惠</span>
              </div>
              <div className="aa-mock-item">
                <div className="aa-mock-thumb" />
                <div className="aa-mock-item-info">
                  <MockLine w="80%" />
                  <MockLine w="60%" color="#e2e8f0" />
                  <MockLine w="50%" color="#e2e8f0" />
                </div>
              </div>
              <div className="aa-mock-item">
                <div className="aa-mock-thumb" />
                <div className="aa-mock-item-info">
                  <MockLine w="80%" />
                  <MockLine w="60%" color="#e2e8f0" />
                  <MockLine w="50%" color="#e2e8f0" />
                </div>
              </div>
            </PhoneFrame>
            <PhoneFrame idx={0}>
              <div className="aa-mock-title" style={{ background: "#fce4ec", color: "#e6495f" }}>赛博跳动运动空间</div>
              <MockLine w="60%" color="#f8a4b9" />
              <div className="aa-mock-tabs">
                <span className="aa-mock-tab active">全部</span>
                <span className="aa-mock-tab">推荐餐饮</span>
                <span className="aa-mock-tab">休闲娱乐</span>
                <span className="aa-mock-tab">新奇体验</span>
                <span className="aa-mock-tab">生活服务</span>
              </div>
              <div className="aa-mock-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div className="aa-mock-grid-item" key={i} style={{ background: `hsl(${i * 30}, 60%, 80%)` }} />
                ))}
              </div>
            </PhoneFrame>
            <PhoneFrame idx={1}>
              <div className="aa-mock-title" style={{ background: "#cce4ff", color: "#3658f7" }}>商品信息</div>
              <div className="aa-mock-thumb aa-mock-thumb-lg" style={{ background: "linear-gradient(135deg, #4a3aa8, #c93bc8)" }} />
              <MockLine w="70%" />
              <div className="aa-mock-price">
                <span className="aa-mock-price-num">¥69.9</span>
                <span className="aa-mock-price-unit">/份</span>
              </div>
              <div className="aa-mock-section-h">详情介绍</div>
              <MockLine w="90%" color="#e2e8f0" />
              <MockLine w="80%" color="#e2e8f0" />
              <div className="aa-mock-section-h">详情介绍</div>
              <MockLine w="90%" color="#e2e8f0" />
              <MockLine w="80%" color="#e2e8f0" />
              <MockLine w="85%" color="#e2e8f0" />
            </PhoneFrame>
          </div>
        </div>

        {/* 二、商家与婚恋平台的业务逻辑 */}
        <div className="aa-section">
          <div className="aa-section-title">二、商家与婚恋平台的业务逻辑</div>
          <div className="aa-section-text">
            商家通常是婚恋平台店店及婚所、婚介所合作的业务关系及转介绍流量的内容（即如：美食、鲜花、休闲娱乐、婚庆、婚纱摄影等），合作商家可以在您的平台中获得推广展示，并与平台合作制定专享的"消费套餐、代金券"等与平台有差异，从而获得良好的推广效果。消费者可以在平台中选择对应的"联盟商家"，并在门店进行专属服务与使用消费券，间接为门店提供导流。
          </div>
        </div>

        {/* 三、商家入驻-商品发布流程 */}
        <div className="aa-section">
          <div className="aa-section-title">三、商家入驻-商品发布流程</div>
          <ol className="aa-section-list">
            <li>商家需在您平台中注册账号，并成为推广红娘身份</li>
            <li>由管理员在系统后台添加商家店铺、发布商品</li>
            <li>商家资料、商品信息、订单均由平台统一管理与维护</li>
            <li>商家可以在"推广红娘中心-商家联盟"中查看商品信息、订单信息、核算记录，以及核销订单</li>
          </ol>
          <div className="aa-phones-row">
            <PhoneFrame idx={2}>
              <div className="aa-mock-title">确认订单</div>
              <div className="aa-mock-item">
                <div className="aa-mock-thumb" style={{ background: "linear-gradient(135deg, #4a3aa8, #c93bc8)" }} />
                <div className="aa-mock-item-info">
                  <MockLine w="80%" />
                  <MockLine w="50%" color="#e2e8f0" />
                </div>
                <div className="aa-mock-counter">- 1 +</div>
              </div>
              <div className="aa-mock-meta"><MockLine w="40%" color="#e2e8f0" /></div>
              <div className="aa-mock-meta"><MockLine w="60%" color="#e2e8f0" /></div>
              <div className="aa-mock-section-h">购买须知</div>
              <MockLine w="90%" color="#e2e8f0" />
              <MockLine w="80%" color="#e2e8f0" />
            </PhoneFrame>
            <PhoneFrame idx={2}>
              <div className="aa-mock-title">确认订单</div>
              <div className="aa-mock-item">
                <div className="aa-mock-thumb" style={{ background: "linear-gradient(135deg, #4a3aa8, #c93bc8)" }} />
                <div className="aa-mock-item-info">
                  <MockLine w="80%" />
                  <MockLine w="50%" color="#e2e8f0" />
                </div>
                <div className="aa-mock-counter">- 1 +</div>
              </div>
              <div className="aa-mock-meta"><MockLine w="40%" color="#e2e8f0" /></div>
              <div className="aa-mock-meta"><MockLine w="60%" color="#e2e8f0" /></div>
              <div className="aa-mock-section-h">选择支付方式</div>
              <div className="aa-mock-pay">
                <span>账户余额</span>
                <span>¥21433</span>
              </div>
              <div className="aa-mock-pay">
                <span>微信支付</span>
                <span>○</span>
              </div>
              <div className="aa-mock-pay">
                <span>支付宝</span>
                <span>○</span>
              </div>
            </PhoneFrame>
            <PhoneFrame idx={2}>
              <div className="aa-mock-title">确认订单</div>
              <div className="aa-mock-pay">
                <span>合计：¥69.9</span>
              </div>
              <div className="aa-mock-counter">- 1 +</div>
              <div className="aa-mock-buy-success">✓ 购买成功</div>
              <MockLine w="80%" color="#e2e8f0" />
              <MockLine w="80%" color="#e2e8f0" />
              <button className="aa-mock-ok">知道了</button>
            </PhoneFrame>
            <PhoneFrame idx={1}>
              <div className="aa-mock-title">订单管理</div>
              <div className="aa-mock-tabs">
                <span className="aa-mock-tab active">待付款</span>
                <span className="aa-mock-tab">已使用</span>
                <span className="aa-mock-tab">待使用</span>
                <span className="aa-mock-tab">已取消</span>
              </div>
              <div className="aa-mock-pay">
                <span>炸鸡对翅精香酥一辣子鸡</span>
                <span style={{ color: "#e6495f" }}>¥69.9</span>
              </div>
              <div className="aa-mock-pay">
                <span>赛博跳动运动空间</span>
                <span style={{ color: "#e6495f" }}>¥230</span>
              </div>
            </PhoneFrame>
          </div>
        </div>

        {/* 四、客户下单-支付-消费流程 */}
        <div className="aa-section">
          <div className="aa-section-title">四、客户下单-支付-消费流程</div>
          <div className="aa-section-text">
            红娘在牵线过程中（无论线上或是线下），将合作商家作为约会指定地点推荐给会员，引导下单购买消费券，可以把红娘理解为商家推广员，客户在线支付购买所选商家的套餐或消费券，到店出示5位数的消费码给商家扫码核销消费，客户扫码即可完成核销。
          </div>
          <div className="aa-phones-row">
            <PhoneFrame idx={3}>
              <div className="aa-mock-title" style={{ background: "#d8b4f3", color: "#5a2a8a" }}>推广红包</div>
              <div className="aa-mock-stat" style={{ background: "#fce4ec" }}>3,354.00</div>
              <div className="aa-mock-stat-row">
                <div className="aa-mock-stat-cell">12</div>
                <div className="aa-mock-stat-cell">1,325</div>
                <div className="aa-mock-stat-cell">81</div>
              </div>
              <MockLine w="80%" color="#e2e8f0" />
              <MockLine w="60%" color="#e2e8f0" />
              <div className="aa-mock-tag-row">
                <span className="aa-mock-tag" style={{ background: "#fff" }}>商家联盟</span>
                <span className="aa-mock-tag" style={{ background: "#fff" }}>中央商场</span>
              </div>
            </PhoneFrame>
            <PhoneFrame idx={1}>
              <div className="aa-mock-tabs">
                <span className="aa-mock-tab active">在售商品</span>
                <span className="aa-mock-tab">订单记录</span>
                <span className="aa-mock-tab">核销记录</span>
              </div>
              <div className="aa-mock-item">
                <div className="aa-mock-thumb" style={{ background: "linear-gradient(135deg, #4a3aa8, #c93bc8)" }} />
                <div className="aa-mock-item-info">
                  <MockLine w="80%" />
                  <MockLine w="50%" color="#e2e8f0" />
                </div>
              </div>
              <div className="aa-mock-item">
                <div className="aa-mock-thumb" />
                <div className="aa-mock-item-info">
                  <MockLine w="80%" />
                  <MockLine w="50%" color="#e2e8f0" />
                </div>
              </div>
              <div className="aa-mock-item">
                <div className="aa-mock-thumb" />
                <div className="aa-mock-item-info">
                  <MockLine w="80%" />
                  <MockLine w="50%" color="#e2e8f0" />
                </div>
              </div>
            </PhoneFrame>
            <PhoneFrame idx={1}>
              <div className="aa-mock-tabs">
                <span className="aa-mock-tab">在售商品</span>
                <span className="aa-mock-tab active">订单记录</span>
                <span className="aa-mock-tab">核销记录</span>
              </div>
              <MockLine w="80%" color="#e2e8f0" />
              <MockLine w="60%" color="#e2e8f0" />
              <div className="aa-mock-pay">
                <span>炸鸡对翅精香酥一辣子鸡</span>
                <span>已核销</span>
              </div>
              <div className="aa-mock-pay">
                <span>2025-05-21 12:30</span>
                <span>已核销</span>
              </div>
            </PhoneFrame>
            <PhoneFrame idx={1}>
              <div className="aa-mock-tabs">
                <span className="aa-mock-tab">在售商品</span>
                <span className="aa-mock-tab">订单记录</span>
                <span className="aa-mock-tab active">核销记录</span>
              </div>
              <MockLine w="60%" color="#e2e8f0" />
              <div className="aa-mock-pay">
                <span>炸鸡对翅精香酥一辣子鸡</span>
                <span>2025-05-21</span>
              </div>
              <div className="aa-mock-pay">
                <span>情人柱喜浪漫婚家小小时</span>
                <span>2025-05-21</span>
              </div>
            </PhoneFrame>
            <PhoneFrame idx={1}>
              <div className="aa-mock-title">赛博跳动运动空间</div>
              <div className="aa-mock-pay">
                <span>在售商品</span>
                <span>订单记录</span>
                <span>核销记录</span>
              </div>
              <MockLine w="80%" color="#e2e8f0" />
              <div className="aa-mock-pay">
                <span>输入您的搜索</span>
              </div>
              <button className="aa-mock-ok">确定</button>
            </PhoneFrame>
          </div>
        </div>

        {/* 五、订单分成-结算-提现流程 */}
        <div className="aa-section">
          <div className="aa-section-title">五、订单分成-结算-提现流程</div>
          <ol className="aa-section-list">
            <li>客户下单所支付金额均会到账于您的平台（微信商户账号）中，客户到店核销完成消费后，平台自动按照分成金额计入到该商家在平台中的"推广红娘账号"，并可随时申请与平台提现，再由您平台转账给商家进行支付结算</li>
            <li>每个商品均可独立设置给予商家、推广红娘、服务红娘的分成金额，</li>
          </ol>

          <div className="aa-form-mock">
            <div className="aa-form-mock-head">
              <span className="aa-form-mock-close"><X size={12} /></span>
              <span className="aa-form-mock-title">添加/编辑商品</span>
              <span className="aa-form-mock-actions">
                <button className="aa-form-mock-cancel">关闭</button>
                <button className="aa-form-mock-submit">确定提交</button>
              </span>
            </div>
            <div className="aa-form-mock-body">
              <div className="aa-form-mock-row"><span className="aa-form-mock-label">＊合作商家</span><div className="aa-form-mock-input">百年龙凤呈祥婚书</div></div>
              <div className="aa-form-mock-row"><span className="aa-form-mock-label">＊商品名称</span><div className="aa-form-mock-input">怦然心动秒发背景墙罩宇拉花套装</div></div>
              <div className="aa-form-mock-row"><span className="aa-form-mock-label">＊商品封面</span><div className="aa-form-mock-thumb" style={{ width: 80, height: 80, background: "linear-gradient(135deg, #f8a4b9, #c93b76)" }}>800*800</div></div>
              <div className="aa-form-mock-row">
                <span className="aa-form-mock-label">＊商品价格</span>
                <div className="aa-form-mock-range">
                  <div className="aa-form-mock-num">188</div><span className="aa-form-mock-unit">元</span>
                  <span className="aa-form-mock-dash">至</span>
                  <div className="aa-form-mock-num">88</div><span className="aa-form-mock-unit">元</span>
                </div>
              </div>
              <div className="aa-form-mock-info">① 合作优惠价为客户下单实际支付所得价格</div>
              <div className="aa-form-mock-highlight">
                <div className="aa-form-mock-row">
                  <span className="aa-form-mock-label">商家结算</span>
                  <div className="aa-form-mock-num-inline">66</div><span className="aa-form-mock-unit">元/份</span>
                </div>
                <div className="aa-form-mock-info">① 订单核销成功后，平台给予商家结算的金额金额，本金额会自动计入到商家账号的"余额"中，且均带明细账，0元表示不分成</div>
                <div className="aa-form-mock-row">
                  <span className="aa-form-mock-label">红包分成</span>
                  <div className="aa-form-mock-range">
                    <span>推广红娘</span>
                    <div className="aa-form-mock-num-inline">6.6</div><span className="aa-form-mock-unit">元/份</span>
                    <span>服务红娘</span>
                    <div className="aa-form-mock-num-inline">8.8</div><span className="aa-form-mock-unit">元/份</span>
                  </div>
                </div>
                <div className="aa-form-mock-info">① 订单核销成功后，平台可设置给予下下单人所属于的红娘分成(以订单创建时归属关系为准)，本金额会自动计入到红娘账号的"余额"中，且均有明细账。0元表示不分成</div>
              </div>
              <div className="aa-form-mock-row"><span className="aa-form-mock-label">购买限制</span>
                <div className="aa-form-mock-range">
                  <span>每个账号只能购买</span>
                  <div className="aa-form-mock-num-inline">100</div><span className="aa-form-mock-unit">份</span>
                  <span>每个订单只能购买</span>
                  <div className="aa-form-mock-num-inline">2</div><span className="aa-form-mock-unit">份</span>
                </div>
              </div>
              <div className="aa-form-mock-info">① 若一个订单购买多份，只能一次性核销，无法分次核销</div>
            </div>
          </div>

          <ol className="aa-section-list" start={3}>
            <li>会员前往商家消费核销之后，所属于推广红娘、服务红娘也自动获得对应的分成，其金额会自动计入到其平台账号的余额中，每一笔都会有记录</li>
          </ol>

          <div className="aa-phones-row">
            <PhoneFrame idx={3}>
              <div className="aa-mock-title">财务明细</div>
              <div className="aa-mock-stat" style={{ background: "linear-gradient(135deg, #fce4ec, #f9b8d3)" }}>余额(元)<br /><strong>46.40</strong><br /><span style={{ fontSize: 10 }}>提现</span></div>
              <div className="aa-mock-stat" style={{ background: "linear-gradient(135deg, #cce4ff, #a0c4ff)" }}>积分(金币)<br /><strong>0</strong><br /><span style={{ fontSize: 10 }}>充值 兑换礼物</span></div>
              <div className="aa-mock-tabs">
                <span className="aa-mock-tab active">支出明细</span>
                <span className="aa-mock-tab">收入明细</span>
                <span className="aa-mock-tab">积分明细</span>
              </div>
              <div className="aa-mock-pay"><span>05-20 11:13</span></div>
              <MockLine w="80%" />
              <div className="aa-mock-pay"><span>商品销售 +6.60</span></div>
            </PhoneFrame>
            <PhoneFrame idx={3}>
              <div className="aa-mock-title">财务明细</div>
              <div className="aa-mock-stat" style={{ background: "linear-gradient(135deg, #fce4ec, #f9b8d3)" }}>余额(元)<br /><strong>40,958.62</strong><br /><span style={{ fontSize: 10 }}>提现</span></div>
              <div className="aa-mock-stat" style={{ background: "linear-gradient(135deg, #cce4ff, #a0c4ff)" }}>积分(金币)<br /><strong>563</strong><br /><span style={{ fontSize: 10 }}>充值 兑换礼物</span></div>
              <div className="aa-mock-tabs">
                <span className="aa-mock-tab active">支出明细</span>
                <span className="aa-mock-tab">收入明细</span>
                <span className="aa-mock-tab">积分明细</span>
              </div>
              <div className="aa-mock-pay"><span>05-19 14:42</span></div>
              <MockLine w="80%" />
              <div className="aa-mock-pay"><span>商品销售 +8.80</span></div>
              <div className="aa-mock-pay"><span>05-15 10:02</span></div>
              <MockLine w="80%" />
              <div className="aa-mock-pay"><span>商品销售 +17.60</span></div>
            </PhoneFrame>
          </div>

          <ol className="aa-section-list" start={4}>
            <li>系统后台拥有强大的订单管理功能，平台管理员可以查阅到每一笔订单的明细、核销情况</li>
          </ol>

          <div className="aa-info-box">
            <div className="aa-info-icon">i</div>
            <div className="aa-info-text">
              未支付、已支付但未核销状态下的订单均可随时取消订单。<br />
              已支付订单（无论是否核销），若需退款，请在"财务管理-收入明细"中操作订单不可撤除。
            </div>
          </div>

          <div className="aa-orders-mock">
            <div className="aa-orders-mock-filters">
              <select className="aa-orders-mock-select"><option>全部商家</option></select>
              <select className="aa-orders-mock-select"><option>订单状态</option></select>
              <input className="aa-orders-mock-input" placeholder="按商品关键字搜" />
              <input className="aa-orders-mock-input" placeholder="按订单号" />
              <input className="aa-orders-mock-input" placeholder="按昵称" />
              <input className="aa-orders-mock-input" placeholder="下单时间" />
              <button className="finord-btn finord-btn-primary aa-orders-mock-export">导出EXCEL</button>
            </div>
            <table className="aa-orders-mock-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>下单商品</th>
                  <th>商家</th>
                  <th>下单人</th>
                  <th>下单时间</th>
                  <th>订单状态</th>
                  <th>订单金额</th>
                  <th>方式/时间</th>
                  <th>核销状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 11, status: "已取消", amount: "88元", verify: "未核销" },
                  { id: 10, status: "未支付", amount: "88元", verify: "未核销" },
                  { id: 9, status: "已支付", amount: "88元", verify: "未核销" },
                  { id: 8, status: "已消费", amount: "88元", verify: "已核销" },
                  { id: 7, status: "已消费", amount: "88元", verify: "已核销" },
                  { id: 6, status: "已消费", amount: "88元", verify: "已核销" },
                ].map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <div className="aa-orders-mock-product">
                        <div className="aa-orders-mock-thumb" style={{ background: "linear-gradient(135deg, #f8a4b9, #c93b76)" }} />
                        <span>怦然心动秒发背景墙罩宇拉花套装<br />份数: 1</span>
                      </div>
                    </td>
                    <td>百年龙凤呈祥婚礼</td>
                    <td>宫丁<br />手机号: 13600000002</td>
                    <td>2025-05-21 10:15:24</td>
                    <td><span className={`aa-orders-mock-status aa-orders-mock-status-${r.status}`}>{r.status}</span></td>
                    <td><span className="aa-orders-mock-amount">{r.amount}</span></td>
                    <td>余额支付<br />2025-05-21 10:15:24</td>
                    <td><span className={`aa-orders-mock-verify ${r.verify === "已核销" ? "done" : "todo"}`}>{r.verify}</span></td>
                    <td><a className="finord-link">取消订单</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ol className="aa-section-list" start={5}>
            <li>系统后台的财务管理中可以通过选择"商品销售"类别，统计销售数据报表，在"红娘分成明细"中能查看每一笔分成情况</li>
            <li>商家、红娘可以平台中随时申请提现，平台可以通过自动提现到微信零钱和人工审核转账两种模式完成结算</li>
          </ol>

          <div className="aa-phones-row">
            <PhoneFrame idx={3}>
              <div className="aa-mock-title">申请提现</div>
              <div className="aa-mock-pay"><span>可提现余额</span><span style={{ color: "#e6495f" }}>8888 元</span></div>
              <div className="aa-form-mock-input">¥ 输入金额</div>
              <div className="aa-mock-radio-row">
                <span>● 提现到微信零钱</span>
                <span style={{ fontSize: 10, color: "#9aa3b2" }}>仅限10-200元/小额，立即自动提现到您当前微信账号</span>
              </div>
              <div className="aa-mock-radio-row">
                <span>○ 提现到银行卡</span>
                <span style={{ fontSize: 10, color: "#9aa3b2" }}>提交审核后1-2个工作日转账到您的银行卡，提现金额不得超过可提现金额。</span>
              </div>
              <div className="aa-mock-radio-row">
                <span>○ 提现到支付宝</span>
                <span style={{ fontSize: 10, color: "#9aa3b2" }}>提交审核后1-2个工作日转账到您的支付宝，提现金额不得超过可提现金额。</span>
              </div>
              <button className="aa-mock-ok" style={{ background: "#fce4ec", color: "#e6495f" }}>确认提现</button>
            </PhoneFrame>
            <PhoneFrame idx={3}>
              <div className="aa-mock-title">申请提现</div>
              <div className="aa-mock-pay"><span>可提现余额</span><span style={{ color: "#e6495f" }}>8888 元</span></div>
              <div className="aa-form-mock-input">¥ 435</div>
              <div className="aa-mock-radio-row">
                <span>● 提现到微信零钱</span>
              </div>
              <div className="aa-mock-radio-row">
                <span>● 提现到银行卡</span>
              </div>
              <div className="aa-form-mock-input">输入银行卡号</div>
              <div className="aa-form-mock-input">输入收款人姓名</div>
              <div className="aa-form-mock-info">① 请核对上述信息准确无误</div>
              <div className="aa-mock-radio-row">
                <span>○ 提现到支付宝</span>
              </div>
              <button className="aa-mock-ok" style={{ background: "#fce4ec", color: "#e6495f" }}>确认提现</button>
            </PhoneFrame>
            <PhoneFrame idx={3}>
              <div className="aa-mock-title">申请提现</div>
              <div className="aa-mock-pay"><span>可提现余额</span><span style={{ color: "#e6495f" }}>8888 元</span></div>
              <div className="aa-form-mock-input">¥ 10000</div>
              <div className="aa-form-mock-info" style={{ color: "#e6495f" }}>超出可提现金额限制</div>
              <div className="aa-mock-radio-row">
                <span>● 提现到微信零钱</span>
              </div>
              <div className="aa-mock-radio-row">
                <span>○ 提现到银行卡</span>
              </div>
              <div className="aa-mock-radio-row">
                <span>● 提现到支付宝</span>
              </div>
              <div className="aa-form-mock-input">13838383838</div>
              <div className="aa-form-mock-input">王某某</div>
              <div className="aa-form-mock-info">① 请核对上述信息准确无误</div>
              <button className="aa-mock-ok" style={{ background: "#fce4ec", color: "#e6495f" }}>确认提现</button>
            </PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  );
}