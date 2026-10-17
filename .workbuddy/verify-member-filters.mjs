// 用 CDP Network 事件（而非 JS fetch 钩子）观察真实请求。
import { connect, sleep } from "./cdp.mjs";

const session = await connect("9222");
const ADMIN = "http://localhost:3000";

const urls = [];
const drain = () => {
  const out = urls.splice(0);
  return out.filter((u) => u.includes("matchmaker/members"));
};

await session.goto(`${ADMIN}/login`, 2500);
await session.eval(`(async () => {
  const r = await fetch("/api/backend/admin/matchmaker/auth/login", {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({username:"localtest", password:"Localtest@123"})
  });
  const d = await r.json();
  if (d.access_token) localStorage.setItem("xuanshiai_admin_access_token", d.access_token);
  return "ok";
})()`);

await session.goto(`${ADMIN}/love-user-list`, 6000);
drain();

await session.eval(`(() => {
  const btn = [...document.querySelectorAll("button")].find(b => b.textContent.includes("更多选项"));
  btn?.click();
  return "ok";
})()`);
await sleep(1000);

const set = await session.eval(`(() => {
  function setSel(sel, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
    setter.call(sel, value);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const out = {};
  const intent = [...document.querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "高意向"));
  if (intent) { setSel(intent, "高意向"); out.intent = 1; }
  const real = [...document.querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "已实名"));
  if (real) { setSel(real, "已实名"); out.real = 1; }
  const st = document.querySelector('select[aria-label="搜索方式"]');
  if (st) { setSel(st, "按手机搜"); out.searchType = 1; }
  const cons = [...document.querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "天秤座"));
  if (cons) { setSel(cons, "天秤座"); out.cons = 1; }
  return out;
})()`);
console.log("set:", set);
await sleep(600);

// 监听 Network.requestWillBeSent
session.events.length = 0;
await session.eval(`[...document.querySelectorAll("button")].find(b => b.textContent.trim() === "搜索")?.click()`);
await sleep(3500);

const reqs = session.events
  .filter((e) => e.method === "Network.requestWillBeSent")
  .map((e) => e.params.request.url)
  .filter((u) => u.includes("matchmaker/members"));
console.log("REQ:", JSON.stringify(reqs, null, 1));

// 多选测试
const multi = await session.eval(`(() => {
  const target = [...document.querySelectorAll("select[multiple]")].find(s =>
    (s.getAttribute("aria-label") || "").startsWith("婚况"));
  if (!target) return "missing";
  for (const opt of target.options) if (opt.value === "未婚" || opt.value === "离异") opt.selected = true;
  target.dispatchEvent(new Event("change", { bubbles: true }));
  return [...target.selectedOptions].map(o => o.value).join(",");
})()`);
console.log("multi:", multi);
await sleep(600);

session.events.length = 0;
await session.eval(`[...document.querySelectorAll("button")].find(b => b.textContent.trim() === "搜索")?.click()`);
await sleep(3500);
const reqs2 = session.events
  .filter((e) => e.method === "Network.requestWillBeSent")
  .map((e) => e.params.request.url)
  .filter((u) => u.includes("matchmaker/members"));
console.log("REQ2:", JSON.stringify(reqs2, null, 1));

process.exit(0);
