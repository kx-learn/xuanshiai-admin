"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CloudUpload, Download } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

export default function LoveUserFollowUpImportPage() {
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (file) setFileName(file.name);
  };

  return (
    <div className="fimp-page">
      <AdminBreadcrumb items={getBreadcrumb("会员CRM", "导入历史跟进")} />

      <section className="fimp-notice">
        <div className="fimp-notice-title"><i className="fimp-notice-icon">!</i>须知</div>
        <p>系统是按照&ldquo;手机号&rdquo;来识别会员，将表格中的信息批量导入到其所在会员的手机号码的会员跟进信息中</p>
        <p>若表格中的手机在会员CRM中不存在对应记录，该表无法导入</p>
        <p>若表格中的&ldquo;跟进人&rdquo;与系统中的服务红娘的称呼无法对应或完全为空，则默认显示admin</p>
        <p>若表格中的&ldquo;跟进时间&rdquo;系统中的跟进时间格式无法匹配或完全为空，则默认显示导入时的时间</p>
      </section>

      <div className="fimp-heading">
        <h2>开始您的批量导入</h2>
        <Link href="/love-user-follow-up" className="fimp-back">返回上一页</Link>
      </div>

      <section className="fimp-step">
        <div className="fimp-step-title"><i className="fimp-step-dot" />第一步</div>
        <p className="fimp-step-desc">下载我们提供的EXCEL模板</p>
        <button type="button" className="fimp-btn"><Download size={15} />下载Excel模板</button>
      </section>

      <section className="fimp-step">
        <div className="fimp-step-title"><i className="fimp-step-dot" />第二步</div>
        <p className="fimp-step-desc">上传EXCEL文件</p>
        <button type="button" className="fimp-dropzone" onClick={() => inputRef.current?.click()}>
          <CloudUpload size={34} className="fimp-dropzone-icon" />
          <span>{fileName || "点击或拖拽上传EXCEL文件"}</span>
        </button>
        <input ref={inputRef} type="file" accept=".xls,.xlsx" hidden onChange={(event) => pick(event.target.files)} />
      </section>

      <div className="fimp-submit">
        <button type="button" className="fimp-btn primary">执行导入</button>
      </div>
    </div>
  );
}
