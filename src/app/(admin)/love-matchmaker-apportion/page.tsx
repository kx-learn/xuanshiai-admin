"use client";

// 本页为旧入口，功能与 /love-matchmaker-apportion2 一致，统一复用同一组接口
// （apportionConfigs / upsertApportionAssign / upsertApportionAbandon 等），直接跳转新页面避免重复实现。
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoveMatchmakerApportionPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/love-matchmaker-apportion2");
  }, [router]);
  return (
    <div className="admin-card p-8 text-center text-[#999]">
      正在跳转至「分派配置」新页面...
    </div>
  );
}