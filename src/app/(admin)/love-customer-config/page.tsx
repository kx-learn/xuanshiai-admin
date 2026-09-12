"use client";

import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { useConfigDomain, showConfigToast } from "@/lib/platform-config";

/* 配置域：客源线索-功能配置（后端 namespace tools_customer_leads） */
type CustomerLeadConfig = {
  name_prefix: string;
  link_promoter_on_convert: boolean;
  show_converted_in_lead: boolean;
} & Record<string, unknown>;

const DEFAULTS: CustomerLeadConfig = {
  name_prefix: "客源",
  link_promoter_on_convert: true,
  show_converted_in_lead: true,
};

export default function Page() {
  const { ready, loading, saving, snapshot, save } = useConfigDomain<CustomerLeadConfig>(
    "tools_customer_leads",
    DEFAULTS,
  );

  const [prefix, setPrefix] = useState(DEFAULTS.name_prefix);
  const [assoc, setAssoc] = useState(DEFAULTS.link_promoter_on_convert);
  const [showAfter, setShowAfter] = useState(DEFAULTS.show_converted_in_lead);
  const [error, setError] = useState("");

  // 读到服务端快照后回填表单（不改动 DOM 结构，仅同步受控值）
  useEffect(() => {
    const config = snapshot?.config;
    if (!config) return;
    if (typeof config.name_prefix === "string") setPrefix(config.name_prefix);
    if (typeof config.link_promoter_on_convert === "boolean") setAssoc(config.link_promoter_on_convert);
    if (typeof config.show_converted_in_lead === "boolean") setShowAfter(config.show_converted_in_lead);
  }, [snapshot]);

  const submit = async () => {
    const trimmed = prefix.trim();
    if (trimmed.length > 6) {
      setError("前缀不要超过6个字");
      return;
    }
    setError("");
    const ok = await save(
      {
        name_prefix: trimmed || DEFAULTS.name_prefix,
        link_promoter_on_convert: assoc,
        show_converted_in_lead: showAfter,
      },
      "客源线索功能配置更新",
    );
    showConfigToast(ok ? "配置已保存" : "配置未发生变化");
  };

  return (
    <div>
      <AdminBreadcrumb items={getBreadcrumb("客源线索", "功能配置")} />
      <h1 className="text-xl font-medium text-[#333] mb-4">功能配置</h1>
      <div className="admin-card">
        <div className="admin-card-body">
          <div className="space-y-8">

            <div className="flex flex-col sm:flex-row sm:gap-6">
              <label className="text-sm text-[#333] shrink-0 pt-1.5 sm:w-80 text-left sm:text-right">
                自动生成客源称呼的前缀
              </label>
              <div className="flex-1 mt-1 sm:mt-0">
                <input type="text" value={prefix} maxLength={6} disabled={!ready || loading}
                  onChange={e => setPrefix(e.target.value)}
                  className="h-8 px-3 text-sm border border-[#d9d9d9] rounded-[6px] outline-none focus:border-[#3658f7] focus:shadow-[0_0_0_2px_rgba(54,88,247,0.2)] w-40" />
                <p className="text-xs text-[#999] mt-1">不要超过6个字</p>
                <p className="text-xs text-[#999]">在录入客源的时候，若点击"自动生成"将自动生成"前缀_ID"，例如：客源_1998</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:gap-6">
              <label className="text-sm text-[#333] shrink-0 pt-1.5 sm:w-80 text-left sm:text-right">
                一键入库时是否将客源线索所属的推广红娘关联到会员CRM中
              </label>
              <div className="flex-1 mt-1 sm:mt-0">
                <div className="flex gap-6">
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm text-[#333]">
                    <input type="radio" name="assoc" checked={assoc} onChange={() => setAssoc(true)} className="accent-[#3658f7]" />关联
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm text-[#333]">
                    <input type="radio" name="assoc" checked={!assoc} onChange={() => setAssoc(false)} className="accent-[#3658f7]" />不关联
                  </label>
                </div>
                <p className="text-xs text-[#999] mt-1">若选择"关联"则该会员的推广红娘会一并带入到会员CRM中，并被视为"名下有效会员"，其在平台的线上消费则自动给予推广红娘相应的分成。若选择"不关联",入库后在会员CRM中则不关联推广红娘</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:gap-6">
              <label className="text-sm text-[#333] shrink-0 pt-1.5 sm:w-80 text-left sm:text-right">
                已入库到会员CRM的客源是否继续在客源线索中显示
              </label>
              <div className="flex-1 mt-1 sm:mt-0">
                <div className="flex gap-6">
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm text-[#333]">
                    <input type="radio" name="showAfter" checked={showAfter} onChange={() => setShowAfter(true)} className="accent-[#3658f7]" />显示
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm text-[#333]">
                    <input type="radio" name="showAfter" checked={!showAfter} onChange={() => setShowAfter(false)} className="accent-[#3658f7]" />不显示
                  </label>
                </div>
              </div>
            </div>

            <div className="flex sm:gap-6">
              <span className="hidden sm:block sm:w-80 shrink-0" />
              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm" className="h-8" disabled={!ready || loading || saving} onClick={() => void submit()}>
                  {saving ? "提交中…" : "确定提交"}
                </Button>
                {error && <span className="text-xs text-[#ff4d4f]">{error}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
