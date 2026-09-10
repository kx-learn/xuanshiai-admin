"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 旧地址重定向（功能已迁移至 group-manage）。 */
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/group-manage");
  }, [router]);
  return null;
}
