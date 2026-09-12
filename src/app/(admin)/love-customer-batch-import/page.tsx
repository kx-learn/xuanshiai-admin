"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { CustomerLeadImportSummary, CustomerLeadOptions } from "@/lib/admin-endpoints";

export default function LoveCustomerBatchImportPage() {
  const router = useRouter();
  const [auditStatus, setAuditStatus] = useState<"active" | "pending">("active");
  const [dupMode, setDupMode] = useState<"skip" | "append">("skip");
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<CustomerLeadOptions | null>(null);
  const [defaultSource, setDefaultSource] = useState("");
  const [defaultMatchmaker, setDefaultMatchmaker] = useState("");
  const [defaultPromoter, setDefaultPromoter] = useState("");
  const [defaultTags, setDefaultTags] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CustomerLeadImportSummary | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const breadcrumb = getBreadcrumb("客源线索", "客源批量导入");

  const loadOptions = useCallback(async () => {
    try {
      setOptions((await adminEndpoints.customerLeadOptions()) as CustomerLeadOptions);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "下拉字典加载失败");
    }
  }, []);

  useEffect(() => { void loadOptions(); }, [loadOptions]);

  const downloadTemplate = async () => {
    try {
      await adminEndpoints.downloadCustomerLeadTemplate();
      setMessage("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "模板下载失败");
    }
  };

  const runImport = async () => {
    if (!file) { setMessage("请先选择要导入的 Excel 文件"); return; }
    setImporting(true);
    setMessage("");
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("audit_status", auditStatus);
      form.append("default_source", defaultSource || "批量导入");
      if (defaultMatchmaker) form.append("default_matchmaker_id", defaultMatchmaker);
      if (defaultPromoter) form.append("default_promoter_id", defaultPromoter);
      form.append("default_tags", defaultTags.join(","));
      form.append("dup_mode", dupMode);
      const summary = (await adminEndpoints.importCustomerLeads(form)) as CustomerLeadImportSummary;
      setResult(summary);
      if (summary.failed > 0) setMessage("部分数据导入失败，请查看下方失败明细");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "导入失败");
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
          <div className="lcbi-step-desc">下载我们提供的XCL模版</div>
          <button type="button" className="lcbi-btn-primary" onClick={() => void downloadTemplate()}>下载Excel模版</button>
        </div>

        <div className="lcbi-step">
          <div className="lcbi-step-head"><span className="lcbi-step-dot" />第二步</div>
          <div className="lcbi-step-desc">将您需要导入的资料按照要求复制到XCL模版中,并按照模版中的数据格式规范进行编辑调整</div>
          <div className="lcbi-notice">
            <div className="lcbi-notice-title">❗ 特别提醒</div>
            <ol>
              <li>导入的数据中每个资料的<strong>手机号</strong>和<strong>微信</strong>必须唯一性的，系统中已存在将无法被导入；</li>
              <li>表格中的<strong>数据资料填写的内容必须是在系统-平台配置-基础数据相对应的分类中</strong>，且需保持文字一致方可精准导入；</li>
              <li>导入的数据中如果遇到系统无法识别或精准对应的时候将自动以填充默认数据；</li>
              <li>导入的客源资料注册时间统一显示为导入的时间，注册来源显示为：批量导入。</li>
            </ol>
          </div>
        </div>

        <div className="lcbi-step">
          <div className="lcbi-step-head"><span className="lcbi-step-dot" />第三步</div>
          <div className="lcbi-step-desc">上传XCL文件</div>
          <div className="lcbi-upload" onClick={() => fileRef.current?.click()} style={{ cursor: "pointer" }}>
            <div className="lcbi-upload-icon">↑</div>
            <div className="lcbi-upload-text">{file ? `已选择：${file.name}` : "点击或拖拽上传XCL文件"}</div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx"
              hidden
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setMessage(""); }}
            />
          </div>
        </div>

        <div className="lcbi-step">
          <div className="lcbi-step-head"><span className="lcbi-step-dot" />第四步</div>
          <div className="lcbi-step-desc">导入设置</div>

          <div className="lcbi-row">
            <span>1、本次导入的客源审核状态默认为：</span>
            <label className="lcbi-radio"><input type="radio" name="lcbi-audit" checked={auditStatus === "active"} onChange={() => setAuditStatus("active")} />有效</label>
            <label className="lcbi-radio"><input type="radio" name="lcbi-audit" checked={auditStatus === "pending"} onChange={() => setAuditStatus("pending")} />待核</label>
          </div>

          <div className="lcbi-row lcbi-row-block">
            <div>2、当导入的数据中有<strong>留空项</strong>或<strong>无法与系统中数据匹配</strong>的时候，则默认为下面您设置的数据项</div>
            <div className="lcbi-grid">
              <div className="lcbi-field"><div className="lcbi-field-label">来源</div>
                <select value={defaultSource} onChange={(e) => setDefaultSource(e.target.value)}>
                  <option value="">请选择</option>
                  {(options?.sources ?? []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div className="lcbi-field"><div className="lcbi-field-label">分派红娘</div>
                <select value={defaultMatchmaker} onChange={(e) => setDefaultMatchmaker(e.target.value)}>
                  <option value="">请选择</option>
                  {(options?.matchmakers ?? []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div className="lcbi-field"><div className="lcbi-field-label">推广红娘</div>
                <select value={defaultPromoter} onChange={(e) => setDefaultPromoter(e.target.value)}>
                  <option value="">请选择</option>
                  {(options?.promoters ?? []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div className="lcbi-field"><div className="lcbi-field-label">标签</div>
                <select value={defaultTags[0] ?? ""} onChange={(e) => setDefaultTags(e.target.value ? [e.target.value] : [])}>
                  <option value="">不限（多选）</option>
                  {(options?.tags ?? []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="lcbi-row lcbi-row-block">
            <div>3、昵称（称呼）重复处理方案：</div>
            <div className="lcbi-radio-group">
              <label className="lcbi-radio"><input type="radio" name="lcbi-dup" checked={dupMode === "skip"} onChange={() => setDupMode("skip")} />不导入</label>
              <label className="lcbi-radio"><input type="radio" name="lcbi-dup" checked={dupMode === "append"} onChange={() => setDupMode("append")} />仍然导入</label>
            </div>
            <div className="lcbi-tip">重复昵称后系统自动加上序号，例如：爱笑小天使_2 爱笑小天使_3</div>
          </div>

          <div className="lcbi-action">
            <button type="button" className="lcbi-btn-primary" disabled={importing} onClick={() => void runImport()}>
              {importing ? "导入中…" : "执行导入"}
            </button>
          </div>

          {message && <p className="lcbi-tip" style={{ color: "#ff4d4f" }}>{message}</p>}

          {result && (
            <div className="lcbi-notice">
              <div className="lcbi-notice-title">导入结果</div>
              <p>
                共 {result.total} 行：成功 <strong>{result.created}</strong> 行，
                跳过 <strong>{result.skipped}</strong> 行，
                失败 <strong>{result.failed}</strong> 行。
              </p>
              {result.errors.length > 0 && (
                <ol>
                  {result.errors.map((error, index) => <li key={index}>{error}</li>)}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
