// Verify the abandon tab's 搜索/筛选 now filters the visible rows.
// Pre-req: two abandoned leads seeded (韩女士 / 魏先生) via .workbuddy-seed-abandon.py.
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);

const reqs = [];
s.ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === "Network.requestWillBeSent" && m.params.request.url.includes("/api/backend/")) {
    reqs.push(`${m.params.request.method} ${new URL(m.params.request.url).pathname.replace("/api/backend", "/api/v1")}`);
  }
});

await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);
await s.goto(`${ORIGIN}/love-customer-list?tab=abandon`, 9000);

const VISIBLE = `(el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)`;
const SET_INPUT = `(input, value) => { const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set; setter.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); }`;
const ROWS = `[...document.querySelectorAll("tbody tr")].map(r => r.textContent.replace(/\\s+/g, " ").trim().slice(0, 40))`;

const report = {};
report.landedUrl = await s.eval(`location.pathname + location.search`);
report.rowsSeeded = await s.eval(ROWS);

// ── keyword: 韩 → expect only 韩女士 ─────────────────────────
reqs.length = 0;
report.typeHan = await s.eval(`(() => {
  const input = [...document.querySelectorAll("input")].filter(${VISIBLE}).find(i => i.placeholder === "请输入称呼/微信号/手机号/ID");
  if (!input) return "NOT_FOUND";
  (${SET_INPUT})(input, "韩");
  return "typed";
})()`);
await sleep(400);
await s.eval(`(() => { const b = [...document.querySelectorAll("button")].filter(${VISIBLE}).find(b => b.textContent.trim() === "搜索"); if (b) b.click(); return "ok"; })()`);
await sleep(2500);
report.rowsAfterHan = await s.eval(ROWS);
report.reqsAfterHan = [...reqs];

// ── keyword with no match → expect the empty state ──────────
report.typeZzz = await s.eval(`(() => {
  const input = [...document.querySelectorAll("input")].filter(${VISIBLE}).find(i => i.placeholder === "请输入称呼/微信号/手机号/ID");
  if (!input) return "NOT_FOUND";
  (${SET_INPUT})(input, "zzz-no-such-lead-zzz");
  return "typed";
})()`);
await sleep(400);
await s.eval(`(() => { const b = [...document.querySelectorAll("button")].filter(${VISIBLE}).find(b => b.textContent.trim() === "搜索"); if (b) b.click(); return "ok"; })()`);
await sleep(2500);
report.rowsAfterZzz = await s.eval(ROWS);

// ── client-side only: filtering must NOT need a new fetch ───
const reqsBeforeType = reqs.length;
report.typeWeiNoClick = await s.eval(`(() => {
  const input = [...document.querySelectorAll("input")].filter(${VISIBLE}).find(i => i.placeholder === "请输入称呼/微信号/手机号/ID");
  if (!input) return "NOT_FOUND";
  (${SET_INPUT})(input, "魏");
  return "typed";
})()`);
await sleep(1800);
report.rowsAfterWeiNoClick = await s.eval(ROWS);
report.newRequestsOnType = reqs.length - reqsBeforeType;

// ── 重置 ────────────────────────────────────────────────────
await s.eval(`(() => { const b = [...document.querySelectorAll("button")].filter(${VISIBLE}).find(b => b.textContent.trim() === "重置"); if (b) b.click(); return "ok"; })()`);
await sleep(2500);
report.rowsAfterReset = await s.eval(ROWS);

// ── 客户来源 select (native setter + change) ─────────────────
report.sourceSelect = await s.eval(`(() => {
  const sel = [...document.querySelectorAll("select")].filter(${VISIBLE}).find(s => [...s.options].some(o => o.textContent.includes("客户来源")));
  if (!sel) return "NOT_FOUND";
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  setter.call(sel, "社群报名");
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return "changed";
})()`);
await sleep(1800);
report.rowsAfterSourceFilter = await s.eval(ROWS);

console.log(JSON.stringify(report, null, 2));
process.exit(0);
