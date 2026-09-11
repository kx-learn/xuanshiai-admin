"use client";

import { useState } from "react";
import { ChevronDown, Inbox, Settings } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

type Tab = "browse" | "favorite" | "superlike" | "gift" | "report";

const tabs: { key: Tab; label: string }[] = [
  { key: "browse", label: "浏览记录" },
  { key: "favorite", label: "收藏记录" },
  { key: "superlike", label: "线上爆灯" },
  { key: "gift", label: "赠送礼物" },
  { key: "report", label: "网友举报" },
];

const NOTICE =
  "您可以在这里快速浏览到平台所有会员的Ta人的资料的记录，能方便红娘分析掌握会员的意向对象，以便为其提供更加精准的匹配和牵线服务";

/* ---------- 浏览记录 ---------- */
type PairRow = {
  from: string; fromCode: string; to: string; toCode: string; fg: string; tg: string;
};
type BrowseRow = PairRow & { times: string; time: string };

const browseRows: BrowseRow[] = [
  { from: "是静香本人没错", fromCode: "G858401", to: "画爸爸打球", toCode: "G412252", times: "第3次", time: "2026-09-08 14:34:45", fg: "a", tg: "b" },
  { from: "宜萱爱~扒姐助理", fromCode: "G257956", to: "我脸1点也不圆", toCode: "B328247", times: "第1次", time: "2026-09-03 11:03:13", fg: "c", tg: "d" },
  { from: "是静香本人没错", fromCode: "G858401", to: "宋宋", toCode: "G765156", times: "第3次", time: "2026-09-01 16:32:59", fg: "a", tg: "e" },
  { from: "是静香本人没错", fromCode: "G858401", to: "宋宋", toCode: "G765156", times: "第2次", time: "2026-09-01 16:31:56", fg: "a", tg: "e" },
  { from: "是静香本人没错", fromCode: "G858401", to: "宋宋", toCode: "G765156", times: "第1次", time: "2026-09-01 16:31:19", fg: "a", tg: "e" },
  { from: "是静香本人没错", fromCode: "G858401", to: "超级无敌赖格宝", toCode: "B819352", times: "第1次", time: "2026-09-01 16:30:51", fg: "a", tg: "f" },
  { from: "是静香本人没错", fromCode: "G858401", to: "画爸爸打球", toCode: "G412252", times: "第2次", time: "2026-09-01 16:30:25", fg: "a", tg: "b" },
  { from: "是静香本人没错", fromCode: "G858401", to: "画爸爸打球", toCode: "G412252", times: "第1次", time: "2026-09-01 16:29:53", fg: "a", tg: "b" },
];

/* ---------- 收藏记录 ---------- */
type FavRow = PairRow & { time: string };

const favRows: FavRow[] = [
  { from: "lll", fromCode: "G396140", to: "lll", toCode: "G396140", time: "2026-08-27 09:27:58", fg: "b", tg: "b" },
  { from: "禾禾禾", fromCode: "G944467", to: "kkzz", toCode: "B801415", time: "2026-07-19 09:33:57", fg: "c", tg: "d" },
  { from: "禾禾禾", fromCode: "G944467", to: "众里寻她", toCode: "B652108", time: "2026-07-19 09:33:37", fg: "c", tg: "e" },
  { from: "泥絮", fromCode: "B914415", to: ",", toCode: "G397921", time: "2026-07-16 15:43:19", fg: "f", tg: "a" },
  { from: "rasin", fromCode: "G847150", to: "一个好人", toCode: "B124065", time: "2026-07-12 21:36:52", fg: "g", tg: "h" },
  { from: "乌龙茶607i", fromCode: "G714715", to: "我脸1点也不圆", toCode: "B328247", time: "2026-07-01 10:37:00", fg: "i", tg: "j" },
  { from: "代表月亮消灭你", fromCode: "G298183", to: "q~nd~N", toCode: "B134461", time: "2026-06-28 18:12:03", fg: "d", tg: "b" },
  { from: "出现1", fromCode: "B241050", to: "三世暖眬梦", toCode: "G415647", time: "2026-06-24 21:05:41", fg: "e", tg: "c" },
];

/* ---------- 线上爆灯 ---------- */
type LikeRow = PairRow & {
  id: string; time: string; pay: "已支付" | "未支付"; method: string; order: string; on: boolean;
};

const likeRows: LikeRow[] = [
  { id: "29", from: "出现1", fromCode: "B241050", to: "0黎吧啦", toCode: "G368717", time: "2026-07-09 09:48:41", pay: "未支付", method: "-", order: "F03667157235269829", on: false, fg: "e", tg: "a" },
  { id: "28", from: "q~nd~N", fromCode: "B134461", to: "余生请指教", toCode: "G519122", time: "2026-07-01 14:15:11", pay: "未支付", method: "-", order: "F09945226857574380", on: false, fg: "b", tg: "c" },
  { id: "27", from: "乌龙茶607i", fromCode: "G714715", to: "q~nd~N", toCode: "B876545", time: "2026-06-30 20:36:27", pay: "已支付", method: "微信支付", order: "F07337230480653545", on: true, fg: "i", tg: "d" },
  { id: "26", from: "Sofia", fromCode: "G410116", to: "muf", toCode: "B198419", time: "2026-06-30 14:45:51", pay: "未支付", method: "-", order: "F01253172594903830", on: false, fg: "j", tg: "e" },
  { id: "25", from: "是静香本人没错", fromCode: "G858401", to: "q~nd~N", toCode: "B876545", time: "2026-06-30 11:53:06", pay: "已支付", method: "微信支付", order: "F0529227950660520", on: true, fg: "a", tg: "d" },
  { id: "24", from: "q~nd~N", fromCode: "x268645", to: "你芝士甘薯么呢", toCode: "G674881", time: "2026-06-28 15:37:54", pay: "已支付", method: "余额支付", order: "F08629559476035556", on: true, fg: "b", tg: "f" },
  { id: "23", from: "出现1", fromCode: "B237195", to: "小猪", toCode: "G916807", time: "2026-06-28 15:37:09", pay: "已支付", method: "后台支付", order: "F02210478728060753", on: true, fg: "e", tg: "g" },
  { id: "22", from: "q~nd~N", fromCode: "x268645", to: "不吃猪肉", toCode: "G022437", time: "2026-06-28 15:32:26", pay: "已支付", method: "后台支付", order: "F04320512358021127", on: true, fg: "b", tg: "h" },
  { id: "21", from: "q~nd~N", fromCode: "x268645", to: "不吃猪肉", toCode: "G022437", time: "2026-06-28 15:14:30", pay: "已支付", method: "后台支付", order: "F02005307216053", on: true, fg: "b", tg: "h" },
  { id: "20", from: "q~nd~N", fromCode: "x268645", to: "余生请指教", toCode: "G519122", time: "2026-06-21 12:38:30", pay: "已支付", method: "后台支付", order: "F03826465941869", on: true, fg: "b", tg: "c" },
];

/* ---------- 赠送礼物 ---------- */
type GiftRow = {
  id: string; gift: string; qty: string; from: string; fromCode: string;
  cost: string; paid: string; reward: string; to: string; toCode: string;
  pay: "已支付" | "未支付"; time: string; fg: string; tg: string;
};

const giftRows: GiftRow[] = [
  { id: "33", gift: "水晶球", qty: "1颗", from: "速发砸老师", fromCode: "G8634017", cost: "900金币", paid: "0元", reward: "450金币", to: "恰口奥立奥", toCode: "G606087", pay: "未支付", time: "2026-07-07 11:44:24", fg: "a", tg: "b" },
  { id: "32", gift: "水晶球", qty: "1颗", from: "秋刀鱼", fromCode: "B976071", cost: "900金币", paid: "0元", reward: "450金币", to: "恰口奥立奥", toCode: "G606087", pay: "未支付", time: "2026-07-07 11:41:40", fg: "c", tg: "b" },
  { id: "31", gift: "水晶球", qty: "1颗", from: "秋刀鱼", fromCode: "B8245655", cost: "900金币", paid: "0元", reward: "450金币", to: "1196", toCode: "G617884", pay: "未支付", time: "2026-07-07 09:55:18", fg: "c", tg: "d" },
  { id: "30", gift: "水晶球", qty: "1颗", from: "秋刀鱼", fromCode: "B8245655", cost: "900金币", paid: "0元", reward: "450金币", to: "乌龙茶607i", toCode: "G714715", pay: "未支付", time: "2026-07-07 09:54:28", fg: "c", tg: "e" },
  { id: "29", gift: "水晶球", qty: "1颗", from: "秋刀鱼", fromCode: "B8245655", cost: "900金币", paid: "0元", reward: "450金币", to: "乌龙茶607i", toCode: "G714715", pay: "未支付", time: "2026-07-07 09:54:23", fg: "c", tg: "e" },
  { id: "28", gift: "宇宙火箭", qty: "1发", from: "Sofia", fromCode: "G410116", cost: "900金币", paid: "0元", reward: "450金币", to: "莓泥不行ya", toCode: "B165423", pay: "未支付", time: "2026-07-06 18:44:24", fg: "j", tg: "f" },
  { id: "27", gift: "宇宙火箭", qty: "1发", from: "Sofia", fromCode: "G410116", cost: "900金币", paid: "0元", reward: "450金币", to: "莓泥不行ya", toCode: "B165423", pay: "未支付", time: "2026-07-06 18:44:15", fg: "j", tg: "f" },
  { id: "26", gift: "爱心气球", qty: "1个", from: "乌龙茶607i", fromCode: "G714715", cost: "200金币", paid: "0元", reward: "100金币", to: "我脸1点也不圆", toCode: "B328247", pay: "未支付", time: "2026-07-06 18:24:08", fg: "e", tg: "g" },
  { id: "25", gift: "炫酷飞机", qty: "1架", from: "q~nd~N", fromCode: "B134461", cost: "500金币", paid: "0元", reward: "250金币", to: "0黎吧啦", toCode: "G368717", pay: "未支付", time: "2026-07-06 18:24:08", fg: "h", tg: "a" },
  { id: "24", gift: "炫酷飞机", qty: "1架", from: "q~nd~N", fromCode: "B134461", cost: "500金币", paid: "0元", reward: "250金币", to: "余生请指教", toCode: "G519122", pay: "未支付", time: "2026-07-06 18:12:04", fg: "h", tg: "c" },
];

/* ---------- 通用片段 ---------- */
function Member({ nick, code, g }: { nick: string; code: string; g: string }) {
  return (
    <div className="lub-member">
      <span className={`lub-avatar lub-g-${g}`} />
      <div className="lub-member-info">
        <div className="lub-member-nick">{nick}</div>
        <div className="lub-member-code">编号：{code}</div>
      </div>
    </div>
  );
}

function Notice() {
  return (
    <div className="lub-notice">
      <div className="lub-notice-title">
        <span className="lub-notice-icon">!</span>
        须知
      </div>
      <p>{NOTICE}</p>
    </div>
  );
}

function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="lub-filter">
      <label className="lub-select">
        <select defaultValue="nick">
          <option value="nick">按昵称搜</option>
          <option value="code">按编号搜</option>
        </select>
        <ChevronDown className="lub-caret" />
      </label>
      <input type="text" className="lub-search-input" placeholder={placeholder} />
      <button type="button" className="lub-btn primary">
        搜索
      </button>
    </div>
  );
}

export default function LoveUserBehaviorPage() {
  const [tab, setTab] = useState<Tab>("browse");
  const [payFilter, setPayFilter] = useState("全部");
  const [reportFilter, setReportFilter] = useState("全部");
  const [browseFilter, setBrowseFilter] = useState("不限");
  const [giftChecked, setGiftChecked] = useState<Set<string>>(new Set());
  const label = tabs.find((item) => item.key === tab)?.label ?? "浏览记录";

  const toggleGift = (id: string) => {
    setGiftChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={[...getBreadcrumb("会员CRM", "线上行为"), { label }]} />

      <section className="lub-card">
        <div className="lub-tabs">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`lub-tab ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ============ 浏览记录 ============ */}
        {tab === "browse" && (
          <>
            <Notice />
            <div className="lub-filter">
              {["不限", "3次以上浏览", "5次以上浏览"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`lub-chip ${browseFilter === item ? "active" : ""}`}
                  onClick={() => setBrowseFilter(item)}
                >
                  {item}
                </button>
              ))}
              <label className="lub-select">
                <select defaultValue="nick">
                  <option value="nick">按昵称搜</option>
                  <option value="code">按编号搜</option>
                </select>
                <ChevronDown className="lub-caret" />
              </label>
              <input type="text" className="lub-search-input" placeholder="请输入" />
              <button type="button" className="lub-btn primary">
                搜索
              </button>
            </div>

            <div className="lub-table-wrap">
              <table className="lub-table">
                <colgroup>
                  <col style={{ width: "32%" }} />
                  <col style={{ width: "32%" }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 200 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>会员</th>
                    <th>浏览了谁</th>
                    <th>第几次浏览</th>
                    <th>浏览时间</th>
                  </tr>
                </thead>
                <tbody>
                  {browseRows.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <Member nick={row.from} code={row.fromCode} g={row.fg} />
                      </td>
                      <td>
                        <Member nick={row.to} code={row.toCode} g={row.tg} />
                      </td>
                      <td>{row.times}</td>
                      <td className="lub-time">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 收藏记录 ============ */}
        {tab === "favorite" && (
          <>
            <Notice />
            <SearchBar placeholder="请输入" />
            <div className="lub-table-wrap">
              <table className="lub-table">
                <colgroup>
                  <col style={{ width: "38%" }} />
                  <col style={{ width: "38%" }} />
                  <col style={{ width: 200 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>会员</th>
                    <th>收藏了谁</th>
                    <th>收藏时间</th>
                  </tr>
                </thead>
                <tbody>
                  {favRows.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <Member nick={row.from} code={row.fromCode} g={row.fg} />
                      </td>
                      <td>
                        <Member nick={row.to} code={row.toCode} g={row.tg} />
                      </td>
                      <td className="lub-time">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 线上爆灯 ============ */}
        {tab === "superlike" && (
          <>
            <div className="lub-filter">
              {["全部", "已支付", "未支付"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`lub-chip ${payFilter === item ? "active" : ""}`}
                  onClick={() => setPayFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="lub-table-wrap">
              <table className="lub-table">
                <colgroup>
                  <col style={{ width: 70 }} />
                  <col style={{ width: 230 }} />
                  <col style={{ width: 230 }} />
                  <col style={{ width: 190 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 220 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 90 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>爆灯人</th>
                    <th>爆灯对象</th>
                    <th>爆灯时间</th>
                    <th>支付状态</th>
                    <th>支付方式</th>
                    <th>支付订单</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {likeRows.map((row) => (
                    <tr key={row.id}>
                      <td className="lub-muted">{row.id}</td>
                      <td>
                        <Member nick={row.from} code={row.fromCode} g={row.fg} />
                      </td>
                      <td>
                        <Member nick={row.to} code={row.toCode} g={row.tg} />
                      </td>
                      <td className="lub-time">{row.time}</td>
                      <td>
                        <span className={`lub-pay ${row.pay === "已支付" ? "paid" : "unpaid"}`}>
                          {row.pay}
                        </span>
                      </td>
                      <td className="lub-muted">{row.method}</td>
                      <td className="lub-order">{row.order}</td>
                      <td>
                        <span className={`lub-toggle ${row.on ? "on" : "off"}`}>
                          {row.on ? "正常" : "取消"}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="lub-link danger">
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 赠送礼物 ============ */}
        {tab === "gift" && (
          <>
            <div className="lub-filter spread">
              <div className="lub-chips">
                {["全部", "已支付", "未支付"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`lub-chip ${payFilter === item ? "active" : ""}`}
                    onClick={() => setPayFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button type="button" className="lub-link">
                <Settings className="size-3.5" />
                礼物设置
              </button>
            </div>
            <div className="lub-table-wrap">
              <table className="lub-table">
                <colgroup>
                  <col style={{ width: 44 }} />
                  <col style={{ width: 60 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 210 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 210 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 190 }} />
                  <col style={{ width: 80 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" className="lub-check" aria-label="全选" />
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
                  {giftRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="lub-check"
                          checked={giftChecked.has(row.id)}
                          onChange={() => toggleGift(row.id)}
                          aria-label={`选择 ${row.id}`}
                        />
                      </td>
                      <td className="lub-muted">{row.id}</td>
                      <td>{row.gift}</td>
                      <td>{row.qty}</td>
                      <td>
                        <Member nick={row.from} code={row.fromCode} g={row.fg} />
                      </td>
                      <td>{row.cost}</td>
                      <td>{row.paid}</td>
                      <td>{row.reward}</td>
                      <td>
                        <Member nick={row.to} code={row.toCode} g={row.tg} />
                      </td>
                      <td>
                        <span className={`lub-pay ${row.pay === "已支付" ? "paid" : "unpaid"}`}>
                          {row.pay}
                        </span>
                      </td>
                      <td className="lub-time">{row.time}</td>
                      <td>
                        <button type="button" className="lub-link danger">
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 网友举报 ============ */}
        {tab === "report" && (
          <>
            <div className="lub-filter">
              {["全部", "待处理", "已处理"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`lub-chip ${reportFilter === item ? "active" : ""}`}
                  onClick={() => setReportFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="lub-table-wrap">
              <table className="lub-table">
                <colgroup>
                  <col style={{ width: 70 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 150 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 220 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 90 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>举报时间</th>
                    <th>提交人</th>
                    <th>提交人IP</th>
                    <th>举报对象</th>
                    <th>举报原因</th>
                    <th>举报详细内容</th>
                    <th>证据图片</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
              </table>
              <div className="lub-empty">
                <Inbox className="lub-empty-icon" />
                暂无数据
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
