"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Inbox, Settings } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { MemberBehaviorItem } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";
import { resolveMediaUrl } from "@/lib/admin-api";

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

const PALETTE = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
const gOf = (id: number | null | undefined) =>
  PALETTE[Math.abs(Number(id) || 0) % PALETTE.length];

/* ---------- 通用片段 ---------- */
function Member({
  nick,
  code,
  g,
  avatar,
}: {
  nick: string;
  code: string;
  g: string;
  avatar?: string | null;
}) {
  const resolved = avatar ? resolveMediaUrl(avatar) : null;
  return (
    <div className="lub-member">
      <span
        className={`lub-avatar lub-g-${g}`}
        style={
          resolved
            ? { backgroundImage: `url(${resolved})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      />
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

function SearchBar({
  placeholder,
  byCode,
  keyword,
  onByCodeChange,
  onKeywordChange,
  onSearch,
}: {
  placeholder: string;
  byCode: boolean;
  keyword: string;
  onByCodeChange: (byCode: boolean) => void;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="lub-filter">
      <label className="lub-select">
        <select
          value={byCode ? "code" : "nick"}
          onChange={(e) => onByCodeChange(e.target.value === "code")}
        >
          <option value="nick">按昵称搜</option>
          <option value="code">按编号搜</option>
        </select>
        <ChevronDown className="lub-caret" />
      </label>
      <input
        type="text"
        className="lub-search-input"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
      />
      <button type="button" className="lub-btn primary" onClick={onSearch}>
        搜索
      </button>
    </div>
  );
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).replace("T", " ").slice(0, 19);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`;
}

export default function LoveUserBehaviorPage() {
  const [tab, setTab] = useState<Tab>("browse");
  const [payFilter, setPayFilter] = useState("全部");
  const [reportFilter, setReportFilter] = useState("全部");
  const [browseFilter, setBrowseFilter] = useState("不限");
  const [giftChecked, setGiftChecked] = useState<Set<string>>(new Set());

  // 搜索（受控）
  const [byCode, setByCode] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  const [rows, setRows] = useState<MemberBehaviorItem[]>([]);
  const [loading, setLoading] = useState(false);

  const label = tabs.find((item) => item.key === tab)?.label ?? "浏览记录";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const minTimes =
        tab === "browse"
          ? browseFilter === "3次以上浏览"
            ? 3
            : browseFilter === "5次以上浏览"
              ? 5
              : undefined
          : undefined;
      const payStatus =
        (tab === "superlike" || tab === "gift") && payFilter !== "全部"
          ? payFilter === "已支付"
            ? 1
            : 0
          : undefined;
      const reportStatus =
        tab === "report" && reportFilter !== "全部"
          ? reportFilter === "待处理"
            ? 0
            : 1
          : undefined;

      const page = await adminEndpoints.memberBehaviorEvents({
        page: 1,
        page_size: 20,
        category: tab,
        search: appliedKeyword || undefined,
        min_times: minTimes,
        status: reportStatus,
        pay_status: payStatus,
      });
      setRows(page.items ?? []);
    } catch (err) {
      setRows([]);
      showConfigToast(err instanceof Error ? err.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, browseFilter, payFilter, reportFilter, appliedKeyword]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleGift = (id: string) => {
    setGiftChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runSearch = () => {
    setAppliedKeyword(keyword.trim());
  };

  const removeRow = async (category: "superlike" | "gift" | "report", id: number) => {
    if (!window.confirm("确定删除该条记录吗？删除后不可恢复。")) return;
    try {
      await adminEndpoints.deleteMemberBehaviorEvent(category, id);
      showConfigToast("已删除", "ok");
      setRows((prev) => prev.filter((r) => r.event_id !== id));
    } catch (err) {
      showConfigToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  };

  const emptyRow = (colSpan: number) => (
    <div className="lub-empty">
      <Inbox className="lub-empty-icon" />
      {loading ? "加载中…" : "暂无数据"}
    </div>
  );

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
              onClick={() => {
                setTab(item.key);
                setKeyword("");
                setAppliedKeyword("");
                setGiftChecked(new Set());
              }}
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
                <select
                  value={byCode ? "code" : "nick"}
                  onChange={(e) => setByCode(e.target.value === "code")}
                >
                  <option value="nick">按昵称搜</option>
                  <option value="code">按编号搜</option>
                </select>
                <ChevronDown className="lub-caret" />
              </label>
              <input
                type="text"
                className="lub-search-input"
                placeholder="请输入"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runSearch();
                }}
              />
              <button type="button" className="lub-btn primary" onClick={runSearch}>
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
                  {rows.map((row) => (
                    <tr key={row.event_id}>
                      <td>
                        <Member
                          nick={row.nickname ?? "—"}
                          code={row.member_code}
                          g={gOf(row.user_id)}
                          avatar={row.user_avatar}
                        />
                      </td>
                      <td>
                        <Member
                          nick={row.target_nickname ?? "—"}
                          code={row.target_member_code ?? "—"}
                          g={gOf(row.target_user_id)}
                          avatar={row.target_avatar}
                        />
                      </td>
                      <td>第{row.browse_times ?? 1}次</td>
                      <td className="lub-time">{formatTime(row.occurred_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && emptyRow(4)}
            </div>
          </>
        )}

        {/* ============ 收藏记录 ============ */}
        {tab === "favorite" && (
          <>
            <Notice />
            <SearchBar
              placeholder="请输入"
              byCode={byCode}
              keyword={keyword}
              onByCodeChange={setByCode}
              onKeywordChange={setKeyword}
              onSearch={runSearch}
            />
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
                  {rows.map((row) => (
                    <tr key={row.event_id}>
                      <td>
                        <Member
                          nick={row.nickname ?? "—"}
                          code={row.member_code}
                          g={gOf(row.user_id)}
                          avatar={row.user_avatar}
                        />
                      </td>
                      <td>
                        <Member
                          nick={row.target_nickname ?? "—"}
                          code={row.target_member_code ?? "—"}
                          g={gOf(row.target_user_id)}
                          avatar={row.target_avatar}
                        />
                      </td>
                      <td className="lub-time">{formatTime(row.occurred_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && emptyRow(3)}
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
                  {rows.map((row) => (
                    <tr key={row.event_id}>
                      <td className="lub-muted">{row.event_id}</td>
                      <td>
                        <Member
                          nick={row.nickname ?? "—"}
                          code={row.member_code}
                          g={gOf(row.user_id)}
                          avatar={row.user_avatar}
                        />
                      </td>
                      <td>
                        <Member
                          nick={row.target_nickname ?? "—"}
                          code={row.target_member_code ?? "—"}
                          g={gOf(row.target_user_id)}
                          avatar={row.target_avatar}
                        />
                      </td>
                      <td className="lub-time">{formatTime(row.occurred_at)}</td>
                      <td>
                        <span className={`lub-pay ${row.pay_status === 1 ? "paid" : "unpaid"}`}>
                          {row.pay_status_label ?? "未支付"}
                        </span>
                      </td>
                      <td className="lub-muted">{row.pay_method || "-"}</td>
                      <td className="lub-order">{row.order_no ?? "-"}</td>
                      <td>
                        <span className={`lub-toggle ${row.event_status === 1 ? "on" : "off"}`}>
                          {row.event_status === 1 ? "正常" : "取消"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="lub-link danger"
                          onClick={() => removeRow("superlike", row.event_id)}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && emptyRow(9)}
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
                      <input
                        type="checkbox"
                        className="lub-check"
                        aria-label="全选"
                        checked={rows.length > 0 && rows.every((r) => giftChecked.has(String(r.event_id)))}
                        onChange={() =>
                          setGiftChecked(
                            rows.length > 0 && rows.every((r) => giftChecked.has(String(r.event_id)))
                              ? new Set()
                              : new Set(rows.map((r) => String(r.event_id))),
                          )
                        }
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
                  {rows.map((row) => (
                    <tr key={row.event_id}>
                      <td>
                        <input
                          type="checkbox"
                          className="lub-check"
                          checked={giftChecked.has(String(row.event_id))}
                          onChange={() => toggleGift(String(row.event_id))}
                          aria-label={`选择 ${row.event_id}`}
                        />
                      </td>
                      <td className="lub-muted">{row.event_id}</td>
                      <td>{row.gift_name ?? "—"}</td>
                      <td>
                        {row.gift_qty ?? 0}
                        {row.qty_unit ?? ""}
                      </td>
                      <td>
                        <Member
                          nick={row.nickname ?? "—"}
                          code={row.member_code}
                          g={gOf(row.user_id)}
                          avatar={row.user_avatar}
                        />
                      </td>
                      <td>{row.point_cost ?? 0}金币</td>
                      <td>{row.paid_amount ?? "0"}元</td>
                      <td>{row.reward_points ?? 0}金币</td>
                      <td>
                        <Member
                          nick={row.target_nickname ?? "—"}
                          code={row.target_member_code ?? "—"}
                          g={gOf(row.target_user_id)}
                          avatar={row.target_avatar}
                        />
                      </td>
                      <td>
                        <span className={`lub-pay ${row.pay_status === 1 ? "paid" : "unpaid"}`}>
                          {row.pay_status_label ?? "未支付"}
                        </span>
                      </td>
                      <td className="lub-time">{formatTime(row.occurred_at)}</td>
                      <td>
                        <button
                          type="button"
                          className="lub-link danger"
                          onClick={() => removeRow("gift", row.event_id)}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && emptyRow(12)}
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
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.event_id}>
                      <td className="lub-muted">{row.event_id}</td>
                      <td className="lub-time">{formatTime(row.occurred_at)}</td>
                      <td>
                        <Member
                          nick={row.nickname ?? "—"}
                          code={row.member_code}
                          g={gOf(row.user_id)}
                          avatar={row.user_avatar}
                        />
                      </td>
                      <td className="lub-muted">{row.submit_ip ?? "—"}</td>
                      <td>
                        <Member
                          nick={row.target_nickname ?? "—"}
                          code={row.target_member_code ?? "—"}
                          g={gOf(row.target_user_id)}
                          avatar={row.target_avatar}
                        />
                      </td>
                      <td>{row.report_type ?? "—"}</td>
                      <td>{row.detail ?? "—"}</td>
                      <td>
                        {(row.images ?? []).slice(0, 3).map((url, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={resolveMediaUrl(url)}
                            alt="证据"
                            style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 4, marginRight: 4 }}
                          />
                        ))}
                        {(row.images ?? []).length === 0 && "—"}
                      </td>
                      <td>{row.report_status_label ?? "待处理"}</td>
                      <td>
                        <button
                          type="button"
                          className="lub-link danger"
                          onClick={() => removeRow("report", row.event_id)}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && emptyRow(10)}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
