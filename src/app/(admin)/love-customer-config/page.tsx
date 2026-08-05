"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [prefix, setPrefix] = useState("客源");
  const [assoc, setAssoc] = useState(true);
  const [showAfter, setShowAfter] = useState(true);

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
                <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)}
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
              <Button variant="primary" size="sm" className="h-8">确定提交</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
