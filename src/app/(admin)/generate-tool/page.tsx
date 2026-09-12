"use client";

import { useEffect, useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "推文助手" },
];

type TaskContent = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  amount: number | null;
  status: number;
  sort: number;
  extra: Record<string, unknown>;
  created_at: string | null;
};

type TaskPage = { items: TaskContent[]; total: number; page: number; page_size: number };

const chipGroups = [
  { id: "gender", label: "会员性别", options: ["男", "女"], defaultSelected: [] },
  { id: "marriage", label: "婚姻状态", options: ["未婚", "离异未育", "离异不带孩", "离异带女孩", "离异带男孩", "丧偶"], defaultSelected: [] },
  { id: "edu", label: "学历", options: ["不限", "初中", "技校", "高中", "大专", "本科", "硕士", "博士"], defaultSelected: [] },
  { id: "job", label: "工作", options: ["不限", "私企员工", "央企/国企", "外企", "事业单位", "公务员", "教师", "医生", "护士", "互联网行业", "自由职业"], defaultSelected: [] },
  { id: "matchmaker", label: "服务红娘", options: ["芸希老师"], defaultSelected: [] },
  { id: "level", label: "会员级别", options: ["普通会员", "新人专享", "心动专享", "挚爱专享"], defaultSelected: [] },
  { id: "status", label: "相亲状态", options: ["公开相亲", "委托红娘", "停止相亲", "已经脱单"], defaultSelected: [] },
];

const STYLE_OPTIONS = ["模板1", "模板2", "模板3"];
const QR_OPTIONS = ["普通H5二维码", "公众号二维码"];

export default function GenerateToolPage() {
  const [style, setStyle] = useState("模板1");
  const [qr, setQr] = useState("普通H5二维码");
  const [genMode, setGenMode] = useState("生成本页全部数据（50条/页）");
  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("70");
  const [genCount, setGenCount] = useState("50");
  const [chipState, setChipState] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(chipGroups.map((g) => [g.id, g.defaultSelected]))
  );
  const [tasks, setTasks] = useState<TaskContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);

  const load = async (page = pageIdx) => {
    try {
      const resp = await adminApi<TaskPage>("admin/content/tweet_task", {
        method: "GET",
        query: { page, page_size: 20 },
      });
      setTasks(resp.items);
      setTotal(resp.total);
      setPageIdx(resp.page);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    try {
      await adminApi("admin/content/tweet_task", {
        method: "POST",
        body: {
          title: `推文-${new Date().toLocaleString("zh-CN")}`,
          subtitle: `${ageMin}-${ageMax}岁 · ${style}`,
          status: 1,
          sort: 100,
          extra: {
            age_min: ageMin,
            age_max: ageMax,
            style,
            qr,
            chips: chipState,
            gen_mode: genMode,
            gen_count: genCount,
          },
        },
      });
      showConfigToast("已生成推文任务", "ok");
      void load(1);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "生成失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该推文任务？")) return;
    try {
      await adminApi(`admin/content/tweet_task/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>1、生成后点击"一键复制"，然后粘贴到公众号的推文编辑器中，也可以粘贴到第三方公众号编辑器中使用</p>
            <p>2、选项中留空或不勾选任何数据则默认为不限</p>
          </div>
        </div>
      </div>

      <div className="finord-card twt-card">
        <div className="twt-title">推文助手</div>

        <div className="twt-wrap">
          <div className="twt-form">
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

            {chipGroups.map((g) => (
              <div key={g.id} className="twt-row">
                <label className="twt-label">{g.label}</label>
                <div className="twt-chips">
                  <button
                    type="button"
                    className={`twt-chip ${(chipState[g.id] ?? []).length === g.options.length ? "active" : ""}`}
                    onClick={() => setChipState((cur) => ({ ...cur, [g.id]: (chipState[g.id] ?? []).length === g.options.length ? [] : [...g.options] }))}
                  >全选</button>
                  {g.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      className={`twt-chip ${(chipState[g.id] ?? []).includes(o) ? "active" : ""}`}
                      onClick={() => setChipState((cur) => {
                        const list = cur[g.id] ?? [];
                        return { ...cur, [g.id]: list.includes(o) ? list.filter((v) => v !== o) : [...list, o] };
                      })}
                    >{o}</button>
                  ))}
                </div>
              </div>
            ))}

            <div className="twt-row">
              <label className="twt-label">风格模版</label>
              <div className="twt-options">
                {STYLE_OPTIONS.map((o) => (
                  <label key={o} className={`twt-radio ${style === o ? "active" : ""}`}>
                    <input type="radio" name="style" value={o} checked={style === o} onChange={() => setStyle(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="twt-row">
              <label className="twt-label">二维码类型</label>
              <div className="twt-options">
                {QR_OPTIONS.map((o) => (
                  <label key={o} className={`twt-radio ${qr === o ? "active" : ""}`}>
                    <input type="radio" name="qr" value={o} checked={qr === o} onChange={() => setQr(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>

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

            <div className="twt-pager">
              <span className="twt-pager-total">共 {total} 条历史任务</span>
              <button className="twt-pager-arrow" onClick={() => load(Math.max(1, pageIdx - 1))} disabled={pageIdx <= 1}>‹</button>
              <span className="twt-pager-cur">{pageIdx} / {totalPages}</span>
              <button className="twt-pager-arrow" onClick={() => load(Math.min(totalPages, pageIdx + 1))} disabled={pageIdx >= totalPages}>›</button>
            </div>

            <button type="button" className="twt-submit" onClick={generate}>生成模版</button>

            {tasks.length > 0 && (
              <div className="twt-history">
                <div className="twt-history-title">历史推文任务</div>
                {tasks.map((t) => (
                  <div key={t.id} className="twt-history-row">
                    <span className="twt-history-name">{t.title}</span>
                    <span className="twt-history-time">{(t.created_at ?? "").replace("T", " ").slice(0, 19)}</span>
                    <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("已复制到剪贴板", "ok"); }}>复制</a>
                    <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void remove(t.id); }}>删除</a>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                <div className="twt-empty">{tasks.length > 0 ? `共 ${total} 条历史任务` : "没有符合要求的数据"}</div>
              </div>
            </div>
            <button type="button" className="twt-copy-btn" onClick={() => showConfigToast("已复制最新生成内容到剪贴板", "ok")}>📋 一键复制</button>
          </div>
        </div>
      </div>
    </div>
  );
}
