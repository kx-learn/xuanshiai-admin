// Focused re-probe: the quick-profile drawer (role="dialog") and the CSV payload itself.
// NOTE: the blob hook must be installed AFTER navigating, or the page context wipes it.
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);

const HOOK = `(() => {
  window.__blobs = [];
  const orig = URL.createObjectURL;
  URL.createObjectURL = function (blobOrMedia) {
    if (blobOrMedia instanceof Blob) {
      blobOrMedia.text().then((t) => window.__blobs.push(t));
    }
    return orig.call(URL, blobOrMedia);
  };
  return "hooked";
})()`;

await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);
await s.goto(`${ORIGIN}/customer-follow-up`, 7000);

const report = {};

// ── 详情 drawer ───────────────────────────────────────────────
await s.eval(`(() => {
  const btn = [...document.querySelectorAll("tbody button")].find(b => /详情/.test(b.textContent || ""));
  if (!btn) return "NO_BUTTON";
  btn.click();
  return "CLICKED";
})()`);
await sleep(3500);
report.dialog = await s.eval(`(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return { found: false };
  return {
    found: true,
    label: d.getAttribute("aria-label"),
    heading: d.querySelector("h2")?.textContent ?? null,
    text: (d.innerText || "").replace(/\\n+/g, " | ").slice(0, 350),
  };
})()`);

report.closed = await s.eval(`(() => {
  const btn = document.querySelector('[aria-label="关闭会员快捷资料"]');
  if (!btn) return "NO_CLOSE_BUTTON";
  btn.click();
  return "CLOSED";
})()`);
await sleep(1500);
report.dialogGone = await s.eval(`document.querySelector('[role="dialog"]') === null`);

// hook now, on the live page
await s.eval(HOOK);

// ── 导出EXCEL payload (跟进记录) ──────────────────────────────
await s.eval(`(() => {
  const btn = [...document.querySelectorAll(".follow-header button")].find(b => /导出EXCEL/.test(b.textContent || ""));
  btn.click();
  return "CLICKED";
})()`);
await sleep(2000);
report.followCsv = await s.eval(`window.__blobs[window.__blobs.length - 1] ?? null`);

// ── 导出EXCEL payload (通话记录) ─────────────────────────────
await s.eval(`(() => {
  const tab = [...document.querySelectorAll(".follow-tab")].find(b => /通话记录/.test(b.textContent || ""));
  tab.click();
  return "CLICKED";
})()`);
await sleep(3500);
await s.eval(HOOK);
await s.eval(`(() => {
  const btn = [...document.querySelectorAll(".follow-header button")].find(b => /导出EXCEL/.test(b.textContent || ""));
  btn.click();
  return "CLICKED";
})()`);
await sleep(2000);
report.callCsv = await s.eval(`window.__blobs[window.__blobs.length - 1] ?? null`);

console.log(JSON.stringify(report, null, 2));
process.exit(0);
