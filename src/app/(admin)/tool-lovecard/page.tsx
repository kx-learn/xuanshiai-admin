"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "批量资料卡" },
];

type BatchContent = {
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

type BatchPage = { items: BatchContent[]; total: number; page: number; page_size: number };

type ChipGroupDef = {
  id: string;
  label: string;
  options: string[];
  defaultSelected: string[];
};

const STATUS_OPTS = ["不限", "公开相亲", "委托红娘", "完全私密", "已经脱单"];
const GENDER_OPTS = ["不限", "男", "女"];
const HEAD_OPTS = ["会员头像", "自定义通用头像"];
const QR_OPTS = ["普通H5二维码", "公众号临时二维码", "公众号永久有效二维码", "指定二维码"];
const LEVEL_OPTS = ["不限", "普通会员", "VIP"];
const CERT_OPTS = ["不限", "已实名认证", "未实名认证", "已学历认证", "已房产认证"];
const TEMPLATE_OPTS = ["常规模版", "A4打印专用"];

const chipGroups: ChipGroupDef[] = [
  { id: "marriage", label: "婚姻状态", options: ["未婚", "离异未育", "离异不带孩", "离异带女孩", "离异带男孩", "丧偶"], defaultSelected: [] },
  { id: "edu", label: "学历", options: ["不限", "初中", "技校", "高中", "大专", "本科", "硕士", "博士"], defaultSelected: ["不限"] },
  { id: "income", label: "收入", options: ["不限", "3千元以下", "3-5千元", "5-8千元", "8千-1万元", "1-2万元", "2万元以上", "5万元以上", "年入百万"], defaultSelected: ["不限"] },
  { id: "job", label: "工作", options: ["不限", "私企员工", "央企", "国企", "外企", "事业单位", "公务员", "教师", "医生", "护士", "互联网行业", "自由职业", "军人", "工人", "服务业", "金融", "律师", "求职中", "在校学生", "个体老板", "公司高管"], defaultSelected: ["不限"] },
];

const BATCH_OPTS = ["第1-50条", "第51-100条", "第101-150条", "第151-200条", "第201-250条", "第251-300条", "第301-350条", "第351-400条", "第401-450条", "第451-500条", "第501-546条", "仅生成最新前50"];

export default function ToolLovecardPage() {
  const [rows, setRows] = useState<BatchContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [overview, setOverview] = useState(false);
  const [drawerTab, setDrawerTab] = useState("自定义条件");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("不限");
  const [gender, setGender] = useState("不限");
  const [headMode, setHeadMode] = useState("会员头像");
  const [qrcode, setQrcode] = useState("普通H5二维码");
  const [level, setLevel] = useState("不限");
  const [cert, setCert] = useState("不限");
  const [template, setTemplate] = useState("常规模版");
  const [batch, setBatch] = useState("第1-50条");
  const [chipState, setChipState] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(chipGroups.map((g) => [g.id, g.defaultSelected]))
  );
  const [selected, setSelected] = useState<number[]>([]);

  const load = async (page = pageIdx) => {
    try {
      const resp = await adminApi<BatchPage>("admin/content/lovecard_batch", {
        method: "GET",
        query: { page, page_size: 20 },
      });
      setRows(resp.items);
      setTotal(resp.total);
      setPageIdx(resp.page);
      setSelected([]);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!title.trim()) {
      showConfigToast("请填写项目标题", "error");
      return;
    }
    try {
      await adminApi("admin/content/lovecard_batch", {
        method: "POST",
        body: {
          title: title.trim(),
          subtitle: `生成数量：${batch}`,
          status: 1,
          sort: 100,
          extra: {
            status,
            gender,
            head_mode: headMode,
            qrcode,
            level,
            cert,
            template,
            batch,
            chips: chipState,
          },
        },
      });
      showConfigToast("已提交生成任务", "ok");
      setDrawer(false);
      void load(1);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "提交失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该批量任务？")) return;
    try {
      await adminApi(`admin/content/lovecard_batch/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const allSelected = rows.length > 0 && selected.length === rows.length;

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>本应用可以从相亲会员资料中按照指定的条件快速筛选出数据批量导出相亲海报供下载到本地。</p>
            <p>批量导出的相亲海报可以用来快速制作相亲信息推文、朋友圈、印刷制作纸质会员资料册、线下活动相亲会员展示墙等各种用途。</p>
            <p>海报批量生成后是保存在您的服务器上，并生成有对应的管理记录，方便您随时查看和下载。</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="tlc-head">
          <div className="tlc-title">批量资料卡</div>
          <div className="tlc-actions">
            <button className="finord-btn finord-btn-primary" onClick={() => setDrawer(true)}>＋ 新建批量生成</button>
            <button className="finord-btn finord-btn-primary" onClick={() => setOverview(true)}>🎨 模板样式总览</button>
          </div>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table tlc-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))} /></th>
                <th>创建时间</th>
                <th>项目标题</th>
                <th>二维码类型</th>
                <th>模板</th>
                <th>数量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const extra = r.extra ?? {};
                return (
                  <tr key={r.id} className={selected.includes(r.id) ? "selected" : undefined}>
                    <td><input type="checkbox" aria-label={`选择批量任务 ${r.id}`} checked={selected.includes(r.id)} onChange={() => setSelected((current) => current.includes(r.id) ? current.filter((id) => id !== r.id) : [...current, r.id])} /></td>
                    <td>{(r.created_at ?? "-").replace("T", " ").slice(0, 19)}</td>
                    <td>{r.title}</td>
                    <td>{typeof extra.qrcode === "string" ? extra.qrcode : "-"}</td>
                    <td>{typeof extra.template === "string" ? extra.template : "默认"}</td>
                    <td>{typeof extra.batch === "string" ? extra.batch : "50"}</td>
                    <td>
                      <button className="finord-link" type="button" onClick={() => showConfigToast("当前后端未提供批量资料卡下载接口", "error")}>下载</button>
                      <span className="cs-op-sep">|</span>
                      <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void remove(r.id); }}>删除</a>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="ecl-empty">
                    <div className="ecl-empty-inner">
                      <div className="ecl-empty-icon">▤</div>
                      <div className="ecl-empty-text">暂无数据</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination page={pageIdx} pageSize={20} total={total} onPageChange={(next) => void load(next)} />
      </div>

      {drawer && (
        <>
          <div className="tlc-mask" onClick={() => setDrawer(false)} />
          <div className="tlc-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button className="tlc-x" onClick={() => setDrawer(false)}><X size={18} /></button>
                <span className="tlc-panel-title">新建批量生成</span>
              </div>
              <button className="finord-btn finord-btn-primary tlc-upload-btn" onClick={submit}>☁ 提交此上传</button>
            </div>

            <div className="tlc-panel-body">
              <div className="tlc-tabs">
                <button className={`tlc-tab ${drawerTab === "自定义条件" ? "active" : ""}`} onClick={() => setDrawerTab("自定义条件")}>自定义条件</button>
                <button className={`tlc-tab ${drawerTab === "按活动报名" ? "active" : ""}`} onClick={() => setDrawerTab("按活动报名")}>按活动报名</button>
              </div>

              {drawerTab === "自定义条件" ? (
                <>
                  <div className="tlc-row">
                    <label className="tlc-label tlc-required">项目标题</label>
                    <div className="tlc-content">
                      <input className="tlc-input" value={title} onChange={(e) => setTitle(e.target.value)} />
                      <div className="tlc-info">● 自定义文字，方便管理识别，如：30岁以上未婚女生</div>
                    </div>
                  </div>

                  <div className="tlc-row">
                    <label className="tlc-label">相亲状态</label>
                    <div className="tlc-options">
                      {STATUS_OPTS.map((o) => (
                        <label key={o} className={`tlc-radio ${status === o ? "active" : ""}`}>
                          <input type="radio" name="status" value={o} checked={status === o} onChange={() => setStatus(o)} />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="tlc-row">
                    <label className="tlc-label">会员性别</label>
                    <div className="tlc-options">
                      {GENDER_OPTS.map((o) => (
                        <label key={o} className={`tlc-radio ${gender === o ? "active" : ""}`}>
                          <input type="radio" name="gender" value={o} checked={gender === o} onChange={() => setGender(o)} />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {chipGroups.map((g) => (
                    <div key={g.id} className="tlc-row tlc-row-top">
                      <label className="tlc-label">{g.label}</label>
                      <div className="tlc-chips">
                        <button
                          type="button"
                          className={`tlc-chip ${(chipState[g.id] ?? []).length === g.options.length ? "active" : ""}`}
                          onClick={() => setChipState((cur) => ({ ...cur, [g.id]: (chipState[g.id] ?? []).length === g.options.length ? [] : [...g.options] }))}
                        >全选</button>
                        {g.options.map((o) => (
                          <button
                            key={o}
                            type="button"
                            className={`tlc-chip ${(chipState[g.id] ?? []).includes(o) ? "active" : ""}`}
                            onClick={() => setChipState((cur) => {
                              const list = cur[g.id] ?? [];
                              return { ...cur, [g.id]: list.includes(o) ? list.filter((v) => v !== o) : [...list, o] };
                            })}
                          >{o}</button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="tlc-row">
                    <label className="tlc-label">会员级别</label>
                    <div className="tlc-options">
                      {LEVEL_OPTS.map((o) => (
                        <label key={o} className={`tlc-radio ${level === o ? "active" : ""}`}>
                          <input type="radio" name="level" value={o} checked={level === o} onChange={() => setLevel(o)} />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="tlc-row">
                    <label className="tlc-label">认证状态</label>
                    <div className="tlc-options">
                      {CERT_OPTS.map((o) => (
                        <label key={o} className={`tlc-radio ${cert === o ? "active" : ""}`}>
                          <input type="radio" name="cert" value={o} checked={cert === o} onChange={() => setCert(o)} />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="tlc-row">
                    <label className="tlc-label">海报模版</label>
                    <div className="tlc-options">
                      {TEMPLATE_OPTS.map((o) => (
                        <label key={o} className={`tlc-radio ${template === o ? "active" : ""}`}>
                          <input type="radio" name="template" value={o} checked={template === o} onChange={() => setTemplate(o)} />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="tlc-row">
                    <label className="tlc-label">海报头像</label>
                    <div className="tlc-options">
                      {HEAD_OPTS.map((o) => (
                        <label key={o} className={`tlc-radio ${headMode === o ? "active" : ""}`}>
                          <input type="radio" name="head" value={o} checked={headMode === o} onChange={() => setHeadMode(o)} />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="tlc-row">
                    <label className="tlc-label">二维码类型</label>
                    <div className="tlc-options">
                      {QR_OPTS.map((o) => (
                        <label key={o} className={`tlc-radio ${qrcode === o ? "active" : ""}`}>
                          <input type="radio" name="qrcode" value={o} checked={qrcode === o} onChange={() => setQrcode(o)} />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="tlc-row tlc-row-top">
                    <label className="tlc-label">生成数量</label>
                    <div className="tlc-content">
                      <div className="tlc-batches">
                        {BATCH_OPTS.map((b) => (
                          <label key={b} className={`tlc-radio tlc-batch ${batch === b ? "active" : ""}`}>
                            <input type="radio" name="batch" value={b} checked={batch === b} onChange={() => setBatch(b)} />
                            <span>{b}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="tlc-panel-footer">
                    <button className="finord-btn finord-btn-primary" onClick={submit}>确定提交</button>
                  </div>
                </>
              ) : (
                <div className="tlc-row">
                  <label className="tlc-label tlc-required">选择活动</label>
                  <div className="tlc-content">
                    <select className="tlc-input">
                      <option>请选择活动</option>
                      <option>往期活动回顾</option>
                      <option>成功案例故事</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {overview && (
        <div className="tlc-overview-mask">
          <button className="tlc-overview-close" onClick={() => setOverview(false)}><X size={20} /></button>
          <div className="tlc-overview">
            <div className="tlc-ov-title">会员资料海报批量制作</div>
            <div className="tlc-ov-sub">线下相亲墙 / 纸质资料册 / 发朋友圈 / 资料相册</div>
            <div className="tlc-ov-grid">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="tlc-ov-card">
                  <span className="tlc-ov-avatar" />
                  <span className="tlc-ov-line w60" />
                  <span className="tlc-ov-line w40" />
                  <span className="tlc-ov-line w50" />
                  <span className="tlc-ov-qr" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
