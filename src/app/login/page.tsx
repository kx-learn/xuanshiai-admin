"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogIn, UserRound } from "lucide-react";
import { loginAdmin } from "@/lib/admin-auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin(username.trim(), password);
      router.replace("/reg-user-all");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "登录失败，请检查账号和密码");
    } finally {
      setLoading(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#f4f5f9] px-4">
    <form onSubmit={submit} className="w-full max-w-[380px] rounded-lg border border-[#e6e8ef] bg-white p-8 shadow-sm">
      <div className="mb-8"><h1 className="text-2xl font-semibold text-[#1f2b3d]">寻爱管理后台</h1><p className="mt-2 text-sm text-[#8993a4]">管理员登录</p></div>
      <label className="mb-4 block"><span className="mb-1.5 block text-sm text-[#555]">账号</span><div className="relative"><UserRound className="absolute left-3 top-2.5 h-4 w-4 text-[#a4acba]" /><input required value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" className="h-10 w-full rounded border border-[#d9dfe8] pl-9 pr-3 text-sm outline-none focus:border-[#3658f7]" /></div></label>
      <label className="mb-5 block"><span className="mb-1.5 block text-sm text-[#555]">密码</span><div className="relative"><LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-[#a4acba]" /><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="h-10 w-full rounded border border-[#d9dfe8] pl-9 pr-3 text-sm outline-none focus:border-[#3658f7]" /></div></label>
      {error && <p className="mb-4 break-words text-sm text-[#d4380d]">{error}</p>}
      <button disabled={loading} className="flex h-10 w-full items-center justify-center gap-2 rounded bg-[#3658f7] text-sm font-medium text-white hover:bg-[#2f4cdb] disabled:cursor-not-allowed disabled:opacity-60"><LogIn className="h-4 w-4" />{loading ? "登录中..." : "登录"}</button>
    </form>
  </main>;
}
