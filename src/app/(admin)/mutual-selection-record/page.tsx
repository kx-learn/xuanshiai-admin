"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 旧地址重定向（功能已迁移至 mutual-selection-activities-record）。 */
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/mutual-selection-activities-record");
  }, [router]);
  return null;
}
