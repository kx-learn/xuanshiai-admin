"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

interface ImportResult {
  created: number;
  skipped: number;
  failed: number;
  errors: string[];
}

const TEMPLATE_HEADER = ["姓名(称呼)", "手机号", "微信号", "来源", "意向等级(1-3)", "备注"];

/** 把粘贴的 Excel / CSV 文本解析为行（兼容 Tab、逗号、空格分隔）。 */
function parsePastedRows(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows: Record<string, string>[] = [];
  for (const line of lines) {
    // 跳过模板表头行
    if (/姓名|称呼/.test(line) && /手机/.test(line)) continue;
    const cells = line.includes("\t") ? line.split("\t") : line.includes(",") ? line.split(",") : line.split(/\s{2,}/);
    const [name = "", phone = "", wechat = "", source = "", level = "1", remark = ""] = cells.map((c) => c.trim());
    if (!name) continue;
    rows.push({ name, phone, wechat, source, level, remark });
  }
  return rows;
}

export default function LoveCustomerBatchImportPage() {
  const router = useRouter();
  const [dupMode, setDupMode] = useState<"skip" | "append">("skip");
  const [pasted, setPasted] = useState("");
  const [defaultSource, setDefaultSource] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const breadcrumb = getBreadcrumb("客源线索", "客源批量导入");

  const parsedRows = parsePastedRows(pasted);

  const downloadTemplate = () => {
    const csv = "\uFEFF" + TEMPLATE_HEADER.join(",") + "\n张三,13800000001,wx_zhangsan,抖音,2,来自抖音直播间\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "客源批量导入模版.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const runImport = async () => {
    if (parsedRows.length === 0) {
      showConfigToast("请先粘贴要导入的数据", "error");
      return;
    }
    setImporting(true);
    setResult(null);
    try {
      const payload = {
        dup_mode: dupMode,
        rows: parsedRows.map((r) => ({
          name: r.name,
          phone: r.phone || null,
          wechat: r.wechat || null,
          source: r.source || defaultSource || "批量导入",
          intention_level: Math.min(3, Math.max(1, Number(r.level) || 1)),
          remark: r.remark || null,
        })),
      };
      const res = await adminApi<ImportResult>("admin/customer-leads/batch-import", { method: "POST", body: payload });
      setResult(res);
      showConfigToast(`导入完成：新增 ${res.created}，跳过 ${res.skipped}，失败 ${res.failed}`);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "导入失败", "error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />
      <div className="lcbi-card">
        <div className="lcbi-head">
          <h2>开始您的批量导入</h2>
          <button type="button" className="lcbi-back" onClick={() => router.push("/love-customer-list")}>返回上一页</button>
        </div>

        <p className="lcbi-intro">本应用可以帮助您将客源信息快速批量导入到客源线索中</p>

        <div className="lcbi-step">
          <div className="lcbi-step-head"><span className="lcbi-step-dot" />第一步</div>
          <div className="lcbi-step-desc">下载我们提供的模版</div>
          <button type="button" className="lcbi-btn-primary" onClick={downloadTemplate}>下载Excel模版</button>
        </div>

        <div className="lcbi-step">
          <div className="lcbi-step-head"><span className="lcbi-step-dot" />第二步</div>
          <div className="lcbi-step-desc">将您需要导入的资料按照要求复制到模版中,并按照模版中的数据格式规范进行编辑调整</div>
          <div className="lcbi-notice">
            <div className="lcbi-notice-title">❗ 特别提醒</div>
            <ol>
              <li>导入的数据中每个资料的<strong>手机号</strong>和<strong>微信</strong>必须唯一性的，系统中已存在将无法被导入；</li>
              <li>每行一条数据，列顺序：<strong>姓名、手机号、微信号、来源、意向等级(1-3)、备注</strong>；</li>
              <li>手机号和微信号至少填写一项，否则该行将导入失败；</li>
              <li>导入的客源资料注册时间统一显示为导入的时间，来源为表格中填写的内容（留空则用下方默认来源）。</li>
            </ol>
          </div>
        </div>

        <div className="lcbi-step">
          <div className="lcbi-step-head"><span className="lcbi-step-dot" />第三步</div>
          <div className="lcbi-step-desc">粘贴 Excel 数据（在 Excel 中复制后直接粘贴到下方文本框，支持 Tab / 逗号分隔）</div>
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={8}
            placeholder={"张三\t13800000001\twx_zhangsan\t抖音\t2\t备注内容\n李四\t13800000002\t\t朋友介绍\t1\t"}
            className="w-full rounded-md border border-[#d9d9d9] px-3 py-2 text-sm font-mono"
          />
          {pasted && (
            <div className="lcbi-tip mt-2">已识别 {parsedRows.length} 行有效数据</div>
          )}
        </div>

        <div className="lcbi-step">
          <div className="lcbi-step-head"><span className="lcbi-step-dot" />第四步</div>
          <div className="lcbi-step-desc">导入设置</div>

          <div className="lcbi-row lcbi-row-block">
            <div>1、当导入数据中的<strong>来源留空</strong>时，默认使用下面设置的来源</div>
            <div className="lcbi-grid">
              <div className="lcbi-field">
                <div className="lcbi-field-label">默认来源</div>
                <select value={defaultSource} onChange={(e) => setDefaultSource(e.target.value)}>
                  <option value="">批量导入</option>
                  {["抖音","微信群","朋友圈","朋友介绍","落地页"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="lcbi-row lcbi-row-block">
            <div>2、联系方式与系统中已有客源重复时处理方案：</div>
            <div className="lcbi-radio-group">
              <label className="lcbi-radio"><input type="radio" name="lcbi-dup" checked={dupMode === "skip"} onChange={() => setDupMode("skip")} />不导入</label>
              <label className="lcbi-radio"><input type="radio" name="lcbi-dup" checked={dupMode === "append"} onChange={() => setDupMode("append")} />仍然导入</label>
            </div>
          </div>

          <div className="lcbi-action">
            <button type="button" className="lcbi-btn-primary" disabled={importing} onClick={runImport}>
              {importing ? "导入中…" : `执行导入${parsedRows.length ? `（${parsedRows.length} 条）` : ""}`}
            </button>
          </div>

          {result && (
            <div className="lcbi-notice mt-3">
              <div className="lcbi-notice-title">导入结果</div>
              <p>新增 {result.created} 条，跳过重复 {result.skipped} 条，失败 {result.failed} 条。</p>
              {result.errors.length > 0 && (
                <ol>{result.errors.map((err, i) => <li key={i}>{err}</li>)}</ol>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
