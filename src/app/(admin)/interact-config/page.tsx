"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 旧地址重定向（功能已迁移至 interactive-messages-function）。 */
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/interactive-messages-function");
  }, [router]);
  return null;
}
