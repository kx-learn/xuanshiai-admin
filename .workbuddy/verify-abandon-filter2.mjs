// Focused re-check of the abandon tab's 客户来源 / 客源状态 filters with valid dictionary values.
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);

await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);
await s.goto(`${ORIGIN}/love-customer-list?tab=abandon`, 9000);

const VISIBLE = `(el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)`;
const ROWS = `[...document.querySelectorAll("tbody tr")].map(r => r.textContent.replace(/\\s+/g, " ").trim().slice(0, 24))`;
const SET_SELECT = `
  (sel, value) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
    setter.call(sel, value);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }`;

const pick = (labelFragment) => `
  [...document.querySelectorAll("select")].filter(${VISIBLE}).find(s => [...s.options].some(o => o.textContent.includes(${JSON.stringify(labelFragment)})))`;

const report = {};
report.baseline = await s.eval(ROWS);

// 客户来源 = 抖音 (a valid dictionary value that neither seeded lead uses) → expect 0 rows
report.sourceDict = await s.eval(`(() => { const sel = ${pick("客户来源")}; if (!sel) return "NOT_FOUND"; return [...sel.options].map(o => o.value); })()`);
report.setDouyin = await s.eval(`(() => { const sel = ${pick("客户来源")}; if (!sel) return "NOT_FOUND"; (${SET_SELECT})(sel, "抖音"); return "set"; })()`);
await sleep(2200);
report.rowsAfterDouyin = await s.eval(ROWS);

// back to 不限
await s.eval(`(() => { const sel = ${pick("客户来源")}; if (sel) (${SET_SELECT})(sel, ""); return "ok"; })()`);
await sleep(2200);
report.rowsAfterSourceReset = await s.eval(ROWS);

// 客源状态 = NEW (neither abandoned lead is NEW) → expect 0 rows
report.setNew = await s.eval(`(() => { const sel = ${pick("客源状态")}; if (!sel) return "NOT_FOUND"; (${SET_SELECT})(sel, "NEW"); return "set"; })()`);
await sleep(2200);
report.rowsAfterStatusNew = await s.eval(ROWS);

// 客源状态 = LOST (both abandoned leads) → expect 2 rows
report.setLost = await s.eval(`(() => { const sel = ${pick("客源状态")}; if (!sel) return "NOT_FOUND"; (${SET_SELECT})(sel, "LOST"); return "set"; })()`);
await sleep(2200);
report.rowsAfterStatusLost = await s.eval(ROWS);

console.log(JSON.stringify(report, null, 2));
process.exit(0);
