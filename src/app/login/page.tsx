"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react";
import { clearAdminToken, setAdminToken } from "@/lib/admin-api";
import { loginAdmin } from "@/lib/admin-auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderTouched, setSliderTouched] = useState(false);
  const verified = sliderValue === 100 && sliderTouched;

  useEffect(() => { clearAdminToken(); }, []);

  function resetVerification() {
    setSliderValue(0);
    setSliderTouched(false);
  }

  function debugLogin() {
    setAdminToken("local-demo-token");
    router.replace("/home");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!verified) {
      setError("请先完成滑动验证");
      return;
    }
    setLoading(true);
    try {
      await loginAdmin(username.trim(), password);
      router.replace("/home");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "登录失败，请检查账号和密码");
    } finally {
      setLoading(false);
    }
  }

  return <main className="login-shell">
    <div className="login-art">
      <div className="login-orbit login-orbit-one" />
      <div className="login-orbit login-orbit-two" />
      <div className="login-ribbon login-ribbon-one" />
      <div className="login-ribbon login-ribbon-two" />
      <div className="login-tags">
        <span className="tag tag-yellow tag-member">会员<br />管理</span>
        <span className="tag tag-cyan tag-store">门店<br />管理</span>
        <span className="tag tag-yellow tag-service">服务<br />跟进</span>
        <span className="tag tag-green tag-match">牵线<br />匹配</span>
        <span className="tag tag-cyan tag-activity">活动<br />报名</span>
      </div>
      <div className="login-couple"><span>♂</span><span>♀</span><i>♥</i></div>
      <div className="login-slogan">成就天下美好姻缘</div>
    </div>
    <form onSubmit={submit} className="login-panel">
      <div className="mb-7 text-center">
        <h1 className="text-[20px] font-semibold text-[#1f2b3d]">婚恋运营管理系统</h1>
        <p className="mt-3 text-xs tracking-[0.35em] text-[#a1a9b6]">为婚恋行业发展提供科技赋能</p>
      </div>
      <div className="login-tabs"><button type="button">扫码登录</button><button type="button" className="active">账号登录</button><button type="button" disabled>手机登录</button></div>
      <label className="login-field"><UserRound className="h-4 w-4" /><input required value={username} onChange={(event) => { setUsername(event.target.value); resetVerification(); }} autoComplete="username" placeholder="请输入账号" /></label>
      <label className="login-field"><LockKeyhole className="h-4 w-4" /><input required type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); resetVerification(); }} autoComplete="current-password" placeholder="请输入密码" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "隐藏密码" : "显示密码"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></label>
      <div className={`login-slider ${verified ? "is-verified" : ""}`}>
        <span className="login-slider-label">{verified ? "验证通过" : "拖动滑块完成验证"}</span>
        <input
          aria-label="滑动验证"
          className="login-slider-input"
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          disabled={verified || loading}
          onPointerDown={() => setSliderTouched(true)}
          onChange={(event) => setSliderValue(Number(event.target.value))}
          onPointerUp={() => { if (sliderValue < 100) setSliderValue(0); }}
        />
        <span className="login-slider-handle" aria-hidden="true" style={{ left: `calc(${sliderValue}% - ${sliderValue * 0.4}px)` }}>{verified ? <Check className="h-4 w-4" /> : ">"}</span>
      </div>
      {error && <p className="mb-4 text-sm text-[#d4380d]">{error}</p>}
      <button disabled={loading || !verified} className="flex h-10 w-full items-center justify-center gap-2 rounded bg-[#3658f7] text-sm font-medium text-white hover:bg-[#2f4cdb] disabled:opacity-60"><LogIn className="h-4 w-4" />{loading ? "登录中..." : "登录"}</button>
      <button type="button" onClick={debugLogin} className="mt-3 flex h-9 w-full items-center justify-center rounded border border-[#3658f7] bg-white text-sm text-[#3658f7] hover:bg-[#f1f4ff]">调试登录（直接进入首页）</button>
      <p className="mt-5 text-center text-xs text-[#a1a9b6]">授权给 宣誓爱 正版使用</p>
    </form>
  </main>;
}
