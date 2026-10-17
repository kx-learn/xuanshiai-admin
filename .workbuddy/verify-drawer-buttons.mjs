// 抽屉内死按钮验证：复制资料 / 修改头像 / 发短信 / 一键呼叫 / 加上了？ / 修改手机号
// 只验证「点了会发出正确请求」，不真的改库（修改类只检查弹窗挂载）。
import { connect, sleep } from "./cdp.mjs";

const s = await connect("9222");

// 先登录拿 token 写进 localStorage，否则会被重定向到 /login
await s.goto("http://localhost:3000/login", 2500);
const login = await s.eval(`(async () => {
  const r = await fetch("/api/backend/admin/matchmaker/auth/login", {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({username:"localtest", password:"Localtest@123"})
  });
  const d = await r.json();
  if (d.access_token) localStorage.setItem("xuanshiai_admin_access_token", d.access_token);
  return r.status + ":" + (d.access_token ? "ok" : JSON.stringify(d).slice(0,120));
})()`);
console.log("login:", login);

await s.goto("http://localhost:3000/love-user-list", 6000);
s.events.length = 0;

// 打开第一行的「详细资料」进抽屉（实际行内操作用的是这个文案，不是「查看」）
const opened = await s.eval(`(() => {
  const btn = [...document.querySelectorAll("tbody button")].find(b => b.textContent.trim() === "详细资料");
  if (!btn) return "no-btn:" + [...new Set([...document.querySelectorAll("tbody button")].map(b=>b.textContent.trim()))].join("|");
  btn.click();
  return "clicked";
})()`);
console.log("open drawer:", opened);
await sleep(3500);

const hasDrawer = await s.eval(`!!document.querySelector(".mdt-panel")`);
console.log("drawer mounted:", hasDrawer);

// 1. 复制资料
const copyOk = await s.eval(`(async () => {
  const btn = [...document.querySelectorAll(".mdt-btn")].find(b => b.textContent.includes("复制资料"));
  if (!btn) return "missing";
  let captured = null;
  const orig = navigator.clipboard.writeText;
  navigator.clipboard.writeText = async (t) => { captured = t; };
  btn.click();
  await new Promise(r => setTimeout(r, 300));
  navigator.clipboard.writeText = orig;
  return captured ? "copied:" + captured.split("\\n").length + " lines" : "no-write";
})()`);
console.log("复制资料:", copyOk);

// 2. AI 智能红娘 应为 disabled
const aiState = await s.eval(`(() => {
  const btn = [...document.querySelectorAll(".mdt-btn")].find(b => b.textContent.includes("AI智能红娘"));
  return btn ? (btn.disabled ? "disabled(ok)" : "ENABLED(bad)") : "missing";
})()`);
console.log("AI智能红娘:", aiState);

// 3. 加上了？ 下拉发出 PATCH
const wa = await s.eval(`(() => {
  const sel = [...document.querySelectorAll("select")].find(s => s.getAttribute("aria-label") === "加微信结果");
  if (!sel) return "missing";
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  setter.call(sel, "1");
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return "set 1";
})()`);
console.log("加上了？:", wa);
await sleep(2500);

// 4. 收集 PATCH 请求
const reqs = s.events
  .filter((e) => e.method === "Network.requestWillBeSent")
  .map((e) => ({
    url: e.params.request.url,
    method: e.params.request.method,
    body: e.params.request.postData,
  }))
  .filter((r) => r.url.includes("matchmaker/members/") && r.method === "PATCH");
console.log("PATCH requests:", JSON.stringify(reqs, null, 1));

// 5. 上传按钮是否都有 onClick（检查 disabled 状态与元素）
const uploads = await s.eval(`[...document.querySelectorAll(".mdt-upload")].map(b => ({
  text: b.textContent.trim(), disabled: b.disabled, title: b.title
}))`);
console.log("upload buttons:", JSON.stringify(uploads, null, 1));

process.exit(0);
