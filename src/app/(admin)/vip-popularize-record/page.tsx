"use client";

// 本页与「推广红娘管理」菜单下的「分成明细」(poplove-matchmaker-distribution-details) 功能重复。
// 同一份数据源 adminEndpoints.poploverCommissionEntries（已在 M2 接通），
// 按「废弃→补全」口径，本页固定作为跳转壳避免双份维护。
// 若后续该页需独立功能，可移除 redirect 并接入专属端点。

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

export default function VipPopularizeRecordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/poplove-matchmaker-distribution-details");
  }, [router]);

  return (
    <div>
      <AdminBreadcrumb items={getBreadcrumb("会员服务", "推广管理")} />
      <div className="px-5 py-10 text-center text-sm text-[#666]">
        正在跳转到「推广红娘 → 分成明细」……
      </div>
    </div>
  );
}
