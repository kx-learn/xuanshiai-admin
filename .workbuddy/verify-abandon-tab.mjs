// Probe the 弃海客源 tab (reachable only via /love-customer-abandon redirect or the tab strip).
// Checklist claims three dead controls there: 添加客源 / 导出EXCEL / 搜索.
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

// land straight on the abandon tab via the redirect route
await s.goto(`${ORIGIN}/love-customer-abandon`, 8000);
report.landedUrl = await s.eval(`location.pathname + location.search`);

report.toolbar = await s.eval(`(() => {
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  return [...document.querySelectorAll("button")].filter(visible).map(b => b.textContent.trim()).filter(Boolean).slice(0, 40);
})()`);

report.searchInputs = await s.eval(`(() => {
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const inputs = [...document.querySelectorAll("input")].filter(visible);
  return inputs.map(i => ({ ph: i.placeholder || "", aria: i.getAttribute("aria-label") || "", name: i.name || "" }));
})()`);

report.rowCountBefore = await s.eval(`document.querySelectorAll("tbody tr").length`);

// ── 添加客源 ────────────────────────────────────────────────
reqs.length = 0;
report.addLead = await s.eval(`(() => {
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const btn = [...document.querySelectorAll("button")].filter(visible).find(b => b.textContent.trim() === "添加客源");
  if (!btn) return "NOT_FOUND";
  btn.click();
  return "clicked";
})()`);
await sleep(2000);
report.addLeadRequests = [...reqs];
report.addLeadModal = await s.eval(`(() => {
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const modal = document.querySelector(".lead-modal, [role=dialog]");
  return { present: !!modal, visible: modal ? visible(modal) : false, text: modal ? modal.textContent.slice(0, 80) : null };
})()`);
// close if it opened
await s.eval(`(() => { const b = document.querySelector(".lead-modal .close, [role=dialog] button"); if (b) b.click(); return "ok"; })()`);
await sleep(1000);

// ── 导出EXCEL ───────────────────────────────────────────────
await s.eval(`(() => { window.__blobs = []; const orig = URL.createObjectURL; URL.createObjectURL = (b) => { window.__blob = b; window.__blobs.push(b); return orig.call(URL, b); }; return "hooked"; })()`);
reqs.length = 0;
report.export = await s.eval(`(() => {
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const btn = [...document.querySelectorAll("button")].filter(visible).find(b => /导出/.test(b.textContent));
  if (!btn) return "NOT_FOUND";
  btn.click();
  return "clicked:" + btn.textContent.trim();
})()`);
await sleep(2500);
report.exportBlobs = await s.eval(`(window.__blobs || []).length`);
report.exportRequests = [...reqs];
report.exportToast = await s.eval(`(() => { const el = document.querySelector(".lead-message, .customer-notice"); return el ? el.textContent.trim().slice(0, 80) : null; })()`);

// ── 搜索 ────────────────────────────────────────────────────
report.rowCountAfterExport = await s.eval(`document.querySelectorAll("tbody tr").length`);
reqs.length = 0;
report.search = await s.eval(`(() => {
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const input = [...document.querySelectorAll("input")].filter(visible).find(i => /昵称|姓名|手机|关键词|搜索/.test(i.placeholder || ""));
  if (!input) return "NOT_FOUND";
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, "zzz-no-match-zzz");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return "typed:" + input.placeholder;
})()`);
await sleep(2500);
report.searchRequests = [...reqs];
report.rowCountAfterSearch = await s.eval(`document.querySelectorAll("tbody tr").length`);

console.log(JSON.stringify(report, null, 2));
process.exit(0);
