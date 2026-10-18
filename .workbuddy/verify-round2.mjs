// 验证本轮修复：客户统计三个报表 + 线下VIP统计卡点击 + 表头排序
import { connect, sleep } from "./cdp.mjs";

const s = await connect("9222");
await s.goto("http://localhost:3000/login", 2500);
await s.eval(`(async () => {
  const r = await fetch("/api/backend/admin/matchmaker/auth/login", {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({username:"localtest", password:"Localtest@123"})
  });
  const d = await r.json();
  localStorage.setItem("xuanshiai_admin_access_token", d.access_token);
  return "ok";
})()`);

// ---- 客户统计三个报表 ----
await s.goto("http://localhost:3000/love-customer-statistics", 6000);
const tabs = await s.eval(`[...document.querySelectorAll(".statistics-tabs button")].map(b => b.textContent.trim())`);
console.log("tabs:", tabs.join(" | "));

for (const [index, label] of [[3, "客户增量统计"], [4, "客源分派统计"], [5, "推广红娘获客统计"]]) {
  await s.eval(`document.querySelectorAll(".statistics-tabs button")[${index}]?.click()`);
  await sleep(700);
  const info = await s.eval(`(() => {
    const body = document.querySelector("tbody");
    const empty = document.body.innerText.includes("暂无数据");
    return {
      rowCount: body ? body.querySelectorAll("tr").length : 0,
      headers: [...document.querySelectorAll("thead th")].map(t => t.textContent.trim()).slice(0,8),
      empty,
    };
  })()`);
  console.log(label, "->", JSON.stringify(info));
}

// ---- 线下VIP：统计卡点击 + 表头排序 ----
await s.goto("http://localhost:3000/love-user-vip-underline", 6000);
s.events.length = 0;

const clickableCards = await s.eval(`[...document.querySelectorAll(".lvip-stat")].map(el => ({
  label: el.querySelector(".lvip-stat-label")?.textContent?.trim(),
  clickable: el.getAttribute("role") === "button",
}))`);
console.log("stat cards:", JSON.stringify(clickableCards));

const sortHeaders = await s.eval(`[...document.querySelectorAll("thead button")].map(b => b.textContent.trim())`);
console.log("sortable headers:", JSON.stringify(sortHeaders));

// 点「服务中」卡片，看是否发出筛选请求
await s.eval(`[...document.querySelectorAll(".lvip-stat")].find(el => el.querySelector(".lvip-stat-label")?.textContent?.trim() === "服务中")?.click()`);
await sleep(2500);
const reqs = s.events
  .filter((e) => e.method === "Network.requestWillBeSent")
  .map((e) => e.params.request.url)
  .filter((u) => u.includes("offline-vips") && !u.includes("statistics") && !u.includes("options"));
console.log("card click request:", JSON.stringify(reqs.map(u => decodeURIComponent(u.split("?")[1] || "")), null, 1));

// 点表头「合同金额」
s.events.length = 0;
await s.eval(`[...document.querySelectorAll("thead button")].find(b => b.textContent.includes("合同金额"))?.click()`);
await sleep(2500);
const sortReqs = s.events
  .filter((e) => e.method === "Network.requestWillBeSent")
  .map((e) => e.params.request.url)
  .filter((u) => u.includes("offline-vips") && !u.includes("statistics") && !u.includes("options"));
console.log("header sort request:", JSON.stringify(sortReqs.map(u => decodeURIComponent(u.split("?")[1] || "")), null, 1));

process.exit(0);
