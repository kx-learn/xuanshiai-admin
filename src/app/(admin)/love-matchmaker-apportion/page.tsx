"use client";

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