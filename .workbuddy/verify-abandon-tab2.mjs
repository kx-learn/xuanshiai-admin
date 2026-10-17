// Focused re-probe of the 弃海客源 tab with correct selectors.
// The create modal renders as a plain <form class="...max-w-[520px]...">, not .lead-modal.
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

const report = {};
await s.goto(`${ORIGIN}/love-customer-abandon`, 8000);
report.landedUrl = await s.eval(`location.pathname + location.search`);

// the create modal is a fixed-position overlay containing a form
const MODAL = `[...document.querySelectorAll("div.fixed.inset-0")].find(d => d.querySelector("form"))`;

// ── 添加客源 ────────────────────────────────────────────────
report.beforeAdd = await s.eval(`!!(${MODAL})`);
report.addLead = await s.eval(`(() => {
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const btn = [...document.querySelectorAll("button")].filter(visible).find(b => b.textContent.trim() === "添加客源");
  if (!btn) return "NOT_FOUND";
  btn.click();
  return "clicked";
})()`);
await sleep(2000);
report.afterAdd = await s.eval(`(() => {
  const m = ${MODAL};
  if (!m) return { present: false };
  const b = m.querySelector("b");
  return { present: true, title: b ? b.textContent.trim() : null, hasNameInput: !!m.querySelector("input") };
})()`);

// close it
await s.eval(`(() => { const m = ${MODAL}; if (m) { const btn = [...m.querySelectorAll("button")].find(b => b.textContent.trim() === "关闭"); if (btn) btn.click(); } return "ok"; })()`);
await sleep(1200);
report.afterClose = await s.eval(`!!(${MODAL})`);

// ── abandon-tab search: does the visible table filter? ──────
report.abandonRowsBefore = await s.eval(`document.querySelectorAll("tbody tr").length`);
report.sampleNames = await s.eval(`[...document.querySelectorAll("tbody tr")].map(r => r.cells[2]?.textContent?.trim() || r.textContent.slice(0,20))`);

reqs.length = 0;
report.searchResult = await s.eval(`(() => {
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const input = [...document.querySelectorAll("input")].filter(visible).find(i => i.placeholder === "请输入称呼/微信号/手机号/ID");
  if (!input) return "NOT_FOUND";
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, "zzz-no-such-lead-zzz");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  const btn = [...document.querySelectorAll("button")].filter(visible).find(b => b.textContent.trim() === "搜索");
  if (btn) btn.click();
  return btn ? "typed+clicked搜索" : "typed-only";
})()`);
await sleep(3000);
report.searchRequests = [...reqs];
report.abandonRowsAfterSearch = await s.eval(`document.querySelectorAll("tbody tr").length`);

console.log(JSON.stringify(report, null, 2));
process.exit(0);
