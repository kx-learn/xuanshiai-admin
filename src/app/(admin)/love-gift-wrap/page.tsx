"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

type GiftRow = {
  id: number;
  name: string;
  unit: string;
  icon: string;
  sales: number;
  required: number;
  reward: number;
};

const giftRows: GiftRow[] = [
  { id: 18, name: "水晶球", unit: "颗", icon: "🔮", sales: 3, required: 900, reward: 450 },
  { id: 17, name: "啤酒", unit: "杯", icon: "🍺", sales: 0, required: 800, reward: 400 },
  { id: 16, name: "小彩礼", unit: "个", icon: "🧧", sales: 0, required: 700, reward: 350 },
  { id: 15, name: "小情书", unit: "个", icon: "💌", sales: 0, required: 600, reward: 300 },
  { id: 14, name: "甜甜圈", unit: "个", icon: "🍩", sales: 0, required: 500, reward: 250 },
  { id: 13, name: "麦旋风风筒", unit: "个", icon: "🍦", sales: 0, required: 400, reward: 200 },
  { id: 11, name: "彩虹糖", unit: "颗", icon: "🍬", sales: 0, required: 300, reward: 150 },
];

type SendRow = {
  id: number;
  giftName: string;
  qty: string;
  fromName: string;
  fromId: string;
  consume: number;
  paid: number;
  reward: number;
  toName: string;
  toId: string;
  status: string;
};

const sendRows: SendRow[] = [
  { id: 33, giftName: "水晶球", qty: "1颗", fromName: "速发明老师", fromId: "B634017", consume: 900, paid: 0, reward: 450, toName: "恰口奥立奥", toId: "G06087", status: "未支付" },
  { id: 32, giftName: "水晶球", qty: "1颗", fromName: "秋刀鱼", fromId: "B976071", consume: 900, paid: 0, reward: 450, toName: "恰口奥立奥", toId: "G066087", status: "未支付" },
  { id: 31, giftName: "水晶球", qty: "1颗", fromName: "秋刀鱼", fromId: "B245655", consume: 900, paid: 0, reward: 450, toName: "1196", toId: "G617884", status: "未支付" },
  { id: 30, giftName: "水晶球", qty: "1颗", fromName: "秋刀鱼", fromId: "B245655", consume: 900, paid: 0, reward: 450, toName: "乌龙茶6071", toId: "G74715", status: "未支付" },
  { id: 29, giftName: "水晶球", qty: "1颗", fromName: "秋刀鱼", fromId: "B245655", consume: 900, paid: 0, reward: 450, toName: "乌龙茶6071", toId: "G74715", status: "未支付" },
  { id: 28, giftName: "宇宙火箭", qty: "1发", fromName: "Sofia", fromId: "G410116", consume: 900, paid: 0, reward: 450, toName: "莓泥不行ya", toId: "B165423", status: "未支付" },
  { id: 27, giftName: "宇宙火箭", qty: "1发", fromName: "Sofia", fromId: "G410116", consume: 900, paid: 0, reward: 450, toName: "莓泥不行ya", toId: "B165423", status: "未支付" },
];

const NOTICE_LINES = [
  <p key="1"><em>「送礼物」</em>能够给相亲会员之间大大增加互动性、给平台增加盈利收入、提高会员对平台的粘度和回头率（促活）。</p>,
  <p key="2">礼物赠送需要向平台支付对应的礼物费用进行赠送（收益归平台所有，实现盈利）</p>,
  <p key="3">赠送礼物后对方将立即收到短信提示，极速传达送赠人的善意（促使用户回访平台，实现促活）</p>,
  <p key="4">礼物获赠方将自动获得平台给予的积分奖励，可以用来在平台兑换礼品</p>,
];

export default function LoveGiftWrapPage() {
  const [tab, setTab] = useState<"礼物管理" | "赠送礼物">("礼物管理");
  const [payFilter, setPayFilter] = useState("全部");
  const [selected, setSelected] = useState<number[]>([]);
  const [gifts, setGifts] = useState<GiftRow[]>(giftRows);
  const [addOpen, setAddOpen] = useState(false);

  const breadcrumb = [
    { label: "首页", href: "/" },
    { label: "运营工具", href: "/free-pay" },
    { label: "送礼物", href: "/love-gift-wrap" },
    { label: tab },
  ];

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= gifts.length) return;
    setGifts((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const toggleSelect = (id: number) =>
    setSelected((current) => (current.includes(id) ? current.filter((i) => i !== id) : [...current, id]));

  const toggleAll = () =>
    setSelected((current) => (current.length === sendRows.length ? [] : sendRows.map((r) => r.id)));

  const visibleSends = payFilter === "全部" ? sendRows : sendRows.filter((r) => r.status === payFilter);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色须知条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            {NOTICE_LINES}
          </div>
        </div>
      </div>

      <div className="finord-card">
        {/* 顶部 tab 栏 */}
        <div className="gift-tabbar">
          <div className="gift-tabs">
            {(["礼物管理", "赠送礼物"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`gift-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "礼物管理" && (
            <button type="button" className="finord-btn finord-btn-primary" onClick={() => setAddOpen(true)}>💳 添加礼物</button>
          )}
        </div>

        {tab === "礼物管理" ? (
          <div className="gift-table-wrap">
            <table className="finord-table gift-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>礼物名称</th>
                  <th>礼物单位</th>
                  <th>礼物图片</th>
                  <th>销量统计</th>
                  <th>所需积分</th>
                  <th>奖励积分</th>
                  <th>排序</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {gifts.map((row, index) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.unit}</td>
                    <td><span className="gift-thumb">{row.icon}</span></td>
                    <td><span className="gift-sales"><b>{row.sales}</b>查看</span></td>
                    <td><span className="gift-coin">{row.required}金币</span></td>
                    <td><span className="gift-coin">{row.reward}金币</span></td>
                    <td>
                      <span className="gift-moves">
                        {index > 0 && <button type="button" className="finord-link gift-move" onClick={() => move(index, -1)}>↑ 上移</button>}
                        {index < gifts.length - 1 && <button type="button" className="finord-link gift-move" onClick={() => move(index, 1)}>↓ 下移</button>}
                      </span>
                    </td>
                    <td>
                      <span className="gift-ops">
                        <span className="finord-link">编辑</span>
                        <span className="gift-op-sep">|</span>
                        <span className="finord-link gift-op-del">删除</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            {/* 支付状态筛选 */}
            <div className="gift-subtabs">
              {(["全部", "已支付", "未支付"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`gift-subtab ${payFilter === f ? "active" : ""}`}
                  onClick={() => setPayFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="gift-table-wrap">
              <table className="finord-table gift-table gift-table-wide">
                <thead>
                  <tr>
                    <th className="gift-col-check">
                      <input
                        type="checkbox"
                        className="gift-check"
                        checked={selected.length === sendRows.length}
                        onChange={toggleAll}
                      />
                    </th>
                    <th>ID</th>
                    <th>赠送礼物</th>
                    <th>赠送数量</th>
                    <th>赠送人</th>
                    <th>消耗积分</th>
                    <th>实付金额</th>
                    <th>奖励积分</th>
                    <th>赠送对象</th>
                    <th>支付状态</th>
                    <th>赠送时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSends.map((r) => (
                    <tr key={r.id}>
                      <td className="gift-col-check">
                        <input
                          type="checkbox"
                          className="gift-check"
                          checked={selected.includes(r.id)}
                          onChange={() => toggleSelect(r.id)}
                        />
                      </td>
                      <td>{r.id}</td>
                      <td>{r.giftName}</td>
                      <td>{r.qty}</td>
                      <td>
                        <span className="gift-person">
                          <span className="gift-avatar" />
                          <span className="gift-person-info">
                            <span className="gift-name">{r.fromName}</span>
                            <span className="gift-id">编号: {r.fromId}</span>
                          </span>
                        </span>
                      </td>
                      <td><span className="gift-coin">{r.consume}金币</span></td>
                      <td><span className="gift-price">{r.paid}元</span></td>
                      <td><span className="gift-coin">{r.reward}金币</span></td>
                      <td>
                        <span className="gift-person">
                          <span className="gift-avatar gift-avatar-recv" />
                          <span className="gift-person-info">
                            <span className="gift-name">{r.toName}</span>
                            <span className="gift-id">编号: {r.toId}</span>
                          </span>
                        </span>
                      </td>
                      <td><span className="gift-status">{r.status}</span></td>
                      <td className="gift-dash">—</td>
                      <td><span className="finord-link gift-op-del">删除</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {addOpen && <AddGiftDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddGiftDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel gi-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加礼物</span>
          </div>
          <div className="gi-head-actions">
            <button className="finord-btn gi-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 礼物名称 */}
          <div className="gi-row">
            <span className="gi-label">＊礼物名称</span>
            <div className="gi-content">
              <input className="gi-input gi-input-wide" />
              <div className="gi-info">① 不要超过8个汉字</div>
            </div>
          </div>

          {/* 礼物单位 */}
          <div className="gi-row">
            <span className="gi-label">＊礼物单位</span>
            <input className="gi-input gi-input-wide" defaultValue="个" />
          </div>

          {/* 礼物图片 */}
          <div className="gi-row">
            <span className="gi-label">＊礼物图片</span>
            <div className="gi-pick"><Plus size={18} /><span>上传图片</span></div>
          </div>

          {/* 购买所需积分数 */}
          <div className="gi-row">
            <span className="gi-label">＊购买所需积分数</span>
            <div className="gi-content">
              <div className="gi-inline">
                <input className="gi-input gi-input-num" />
                <span className="gi-unit">积分</span>
              </div>
              <div className="gi-info">① 礼物赠送方需要支出的积分</div>
            </div>
          </div>

          {/* 平台奖励积分 */}
          <div className="gi-row">
            <span className="gi-label">＊平台奖励积分</span>
            <div className="gi-content">
              <div className="gi-inline">
                <input className="gi-input gi-input-num" />
                <span className="gi-unit">积分</span>
              </div>
              <div className="gi-info">① 礼物获赠方获得的平台奖励积分</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
