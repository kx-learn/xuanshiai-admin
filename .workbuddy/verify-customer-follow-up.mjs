// Verify the /customer-follow-up dead-button fixes end to end.
// Checks: export downloads a CSV, import navigates, 详情 opens the drawer,
// both selects fire filtered requests, the 通话记录 tab loads a real table.
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
    if (url.includes("/api/backend/") || url.includes("/api/v1/admin/")) {
      reqs.push(`${m.params.request.method} ${new URL(url).pathname}${new URL(url).search}`);
    }
  }
});

await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);

const report = {};

// ── 1. 跟进记录 tab: filters, selects, row content ─────────────
reqs.length = 0;
await s.goto(`${ORIGIN}/customer-follow-up`, 7000);

report.initialRequests = [...reqs];
report.rowCount = await s.eval(`document.querySelectorAll("tbody tr").length`);
report.firstRow = await s.eval(`(() => {
  const tr = document.querySelector("tbody tr");
  return tr ? [...tr.querySelectorAll("td")].map(td => td.innerText.replace(/\\n/g, " | ")) : null;
})()`);
report.metricCards = await s.eval(`[...document.querySelectorAll(".follow-metric")].map(b => b.innerText.replace(/\\n/g, " "))`);
report.selectOptions = await s.eval(`[...document.querySelectorAll(".follow-filters select")].map(sel => ({
  label: sel.getAttribute("aria-label"),
  value: sel.value,
  options: [...sel.options].map(o => o.value + ":" + o.textContent),
}))`);

// 客户意向 -> 意向较高 (3)
reqs.length = 0;
await s.eval(`(() => {
  const sel = document.querySelector('.follow-filters select[aria-label="客户意向"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  setter.call(sel, "3");
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return "ok";
})()`);
await sleep(2500);
report.intentRequests = [...reqs];
report.intentRowCount = await s.eval(`document.querySelectorAll("tbody tr").length`);

// back to 不限
await s.eval(`(() => {
  const sel = document.querySelector('.follow-filters select[aria-label="客户意向"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  setter.call(sel, "");
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return "ok";
})()`);
await sleep(2000);

// 加上了吗? -> 已加上 (1)
reqs.length = 0;
await s.eval(`(() => {
  const sel = document.querySelector('.follow-filters select[aria-label="加微信结果"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  setter.call(sel, "1");
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return "ok";
})()`);
await sleep(2500);
report.wechatRequests = [...reqs];
report.wechatRowCount = await s.eval(`document.querySelectorAll("tbody tr").length`);

// ── 2. 详情 opens the quick profile drawer ────────────────────
await s.eval(`(() => {
  const btn = [...document.querySelectorAll("tbody button")].find(b => /详情/.test(b.textContent || ""));
  if (!btn) return "NO_BUTTON";
  btn.click();
  return "CLICKED";
})()`);
await sleep(2500);
report.detailButtonClicked = "see above";
report.drawer = await s.eval(`(() => {
  const panel = document.querySelector(".tlc-panel, [class*=drawer]");
  if (!panel) return { found: false };
  return { found: true, cls: panel.className, text: (panel.innerText || "").slice(0, 300) };
})()`);
await s.eval(`(() => {
  const close = document.querySelector(".tlc-panel [class*=close], .tlc-close, button[aria-label*=关闭]");
  if (close) close.click();
  return "closed";
})()`);
await sleep(800);

// ── 3. 通话记录 tab loads its own table ───────────────────────
reqs.length = 0;
await s.eval(`(() => {
  const tab = [...document.querySelectorAll(".follow-tab")].find(b => /通话记录/.test(b.textContent || ""));
  if (!tab) return "NO_TAB";
  tab.click();
  return "CLICKED";
})()`);
await sleep(3000);
report.callTabRequests = [...reqs];
report.callHeaders = await s.eval(`[...document.querySelectorAll("thead th")].map(t => t.textContent)`);
report.callRows = await s.eval(`[...document.querySelectorAll("tbody tr")].map(tr => [...tr.querySelectorAll("td")].map(td => td.innerText.replace(/\\n/g, " | ")))`);

// ── 4. 导出EXCEL produces a download ──────────────────────────
await s.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: "C:\\\\Users\\\\21612\\\\AppData\\\\Local\\\\Temp\\\\probe-dl" });
await s.eval(`(() => {
  const btn = [...document.querySelectorAll(".follow-header button")].find(b => /导出EXCEL/.test(b.textContent || ""));
  if (!btn) return "NO_BUTTON";
  btn.click();
  return "CLICKED";
})()`);
await sleep(2000);
report.exportClicked = true;
report.toast = await s.eval(`(() => {
  const t = [...document.querySelectorAll("body *")].filter(e => /导出成功|没有可导出/.test(e.textContent || "") && e.children.length === 0);
  return t.length ? t[t.length - 1].textContent : "(no toast text found)";
})()`);

// ── 5. 导入历史跟进 navigates ────────────────────────────────
await s.eval(`(() => {
  const btn = [...document.querySelectorAll(".follow-header button")].find(b => /导入历史跟进/.test(b.textContent || ""));
  if (!btn) return "NO_BUTTON";
  btn.click();
  return "CLICKED";
})()`);
await sleep(3000);
report.importNavigatedTo = await s.eval(`location.pathname`);

console.log(JSON.stringify(report, null, 2));
process.exit(0);
