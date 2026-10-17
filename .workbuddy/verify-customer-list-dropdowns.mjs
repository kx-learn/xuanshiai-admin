// Verify the /love-customer-list row dropdowns now talk to the backend:
//   审核状态  -> PATCH /admin/customer-leads/{id}  { audit_status }
//   分派跟进  -> PATCH /admin/customer-leads/{id}/assignment  { matchmaker_id }
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);

const reqs = [];
s.ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === "Network.requestWillBeSent") {
    const url = m.params.request.url;
    if (url.includes("/api/backend/")) {
      reqs.push({
        method: m.params.request.method,
        path: new URL(url).pathname.replace("/api/backend", "/api/v1"),
        body: m.params.request.postData ?? null,
      });
    }
  }
});

await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);

const report = {};

reqs.length = 0;
await s.goto(`${ORIGIN}/love-customer-list`, 7000);
report.initialRequests = reqs.map((r) => `${r.method} ${r.path}`);

report.assignSelect = await s.eval(`(() => {
  const sel = document.querySelector('select[aria-label="分派跟进"]');
  if (!sel) return { found: false };
  return { found: true, value: sel.value, options: [...sel.options].map(o => o.value + ":" + o.textContent) };
})()`);

report.auditSelect = await s.eval(`(() => {
  const sel = document.querySelector('select[aria-label="审核状态"]');
  if (!sel) return { found: false };
  return { found: true, value: sel.value, options: [...sel.options].map(o => o.value + ":" + o.textContent) };
})()`);

// ── 审核状态: active -> pending ─────────────────────────────
reqs.length = 0;
await s.eval(`(() => {
  const sel = document.querySelector('select[aria-label="审核状态"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  setter.call(sel, "pending");
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return "ok";
})()`);
await sleep(3000);
report.auditRequests = reqs.map((r) => `${r.method} ${r.path} ${r.body ?? ""}`);
report.auditValueAfterReload = await s.eval(`document.querySelector('select[aria-label="审核状态"]')?.value ?? null`);

// ── 分派跟进: current -> the other matchmaker ───────────────
reqs.length = 0;
await s.eval(`(() => {
  const sel = document.querySelector('select[aria-label="分派跟进"]');
  const target = [...sel.options].find(o => o.value && o.value !== sel.value);
  if (!target) return "NO_TARGET";
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  setter.call(sel, target.value);
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return "set:" + target.value;
})()`);
await sleep(3000);
report.assignRequests = reqs.map((r) => `${r.method} ${r.path} ${r.body ?? ""}`);
report.assignValueAfterReload = await s.eval(`document.querySelector('select[aria-label="分派跟进"]')?.value ?? null`);

// ── the simple view has its own copies ──────────────────────
await s.eval(`(() => {
  const btn = [...document.querySelectorAll(".lead-mode-switch button")].find(b => b.textContent.trim() === "简洁");
  btn.click();
  return "ok";
})()`);
await sleep(2500);
report.simpleViewSelects = await s.eval(`({
  assign: !!document.querySelector('select[aria-label="分派跟进"]'),
  audit: (() => { const s = document.querySelector('select[aria-label="审核状态"]'); return s ? { value: s.value, options: [...s.options].map(o => o.value + ":" + o.textContent) } : null; })(),
})`);

console.log(JSON.stringify(report, null, 2));
process.exit(0);
