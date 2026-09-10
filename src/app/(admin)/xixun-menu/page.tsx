"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 旧地址重定向（功能已迁移至 matchmaker-good-news-configuration）。 */
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/matchmaker-good-news-configuration");
  }, [router]);
  return null;
}
