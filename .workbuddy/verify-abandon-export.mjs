// Confirm 导出EXCEL on the abandon tab exports the abandon rows (filtered), not the list-tab rows.
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);

await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);
await s.goto(`${ORIGIN}/love-customer-list?tab=abandon`, 9000);

const VISIBLE = `(el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)`;
const SET_SELECT = `(sel, value) => { const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set; setter.call(sel, value); sel.dispatchEvent(new Event("change", { bubbles: true })); }`;
const SET_INPUT = `(input, value) => { const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set; setter.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); }`;

const report = {};

// hook the CSV text before it becomes a Blob
await s.eval(`(() => {
  window.__csv = [];
  const orig = Blob;
  window.Blob = function (parts, opts) { try { window.__csv.push(String(parts[0])); } catch (e) {} return new orig(parts, opts); };
  window.Blob.prototype = orig.prototype;
  return "hooked";
})()`);

const doExport = `(() => { const b = [...document.querySelectorAll("button")].filter(${VISIBLE}).find(b => /导出/.test(b.textContent)); if (!b) return "NOT_FOUND"; b.click(); return "clicked:" + b.textContent.trim(); })()`;

report.exportAll = await s.eval(doExport);
await sleep(1500);
report.csvAll = await s.eval(`(window.__csv || []).map(c => c.split("\\n").length - 1)`);

// now narrow to 韩 only and export again
await s.eval(`(() => { const i = [...document.querySelectorAll("input")].filter(${VISIBLE}).find(i => i.placeholder === "请输入称呼/微信号/手机号/ID"); if (i) (${SET_INPUT})(i, "韩"); return "ok"; })()`);
await sleep(1800);
await s.eval(`(() => { window.__csv = []; return "cleared"; })()`);
report.exportFiltered = await s.eval(doExport);
await sleep(1500);
report.csvFiltered = await s.eval(`(window.__csv || []).map(c => c.split("\\n").slice(0, 3))`);

console.log(JSON.stringify(report, null, 2));
process.exit(0);
