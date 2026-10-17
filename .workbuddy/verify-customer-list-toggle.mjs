// Toggle both dropdowns to a *different* value so the change handlers actually fire,
// proving the request path and the round-trip still work after the backend fixes.
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);

const reqs = [];
s.ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === "Network.requestWillBeSent" && m.params.request.url.includes("/api/backend/")) {
    reqs.push({
      method: m.params.request.method,
      path: new URL(m.params.request.url).pathname.replace("/api/backend", "/api/v1"),
      body: m.params.request.postData ?? null,
    });
  }
});

await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);

const report = {};
reqs.length = 0;
await s.goto(`${ORIGIN}/love-customer-list`, 7000);

report.before = await s.eval(`({
  audit: document.querySelector('select[aria-label="审核状态"]')?.value ?? null,
  assign: document.querySelector('select[aria-label="分派跟进"]')?.value ?? null,
})`);

// audit: pending -> active (a real change)
reqs.length = 0;
await s.eval(`(() => {
  const sel = document.querySelector('select[aria-label="审核状态"]');
  const target = [...sel.options].find(o => o.value !== sel.value);
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  setter.call(sel, target.value);
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return "set:" + target.value;
})()`);
await sleep(3000);
report.auditRequests = reqs.filter((r) => r.method === "PATCH").map((r) => `${r.method} ${r.path} ${r.body}`);

// assign: 3 -> unassigned is rejected client-side, so pick 待分派 and confirm no PATCH
reqs.length = 0;
await s.eval(`(() => {
  const sel = document.querySelector('select[aria-label="分派跟进"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  setter.call(sel, "");
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return "ok";
})()`);
await sleep(2500);
report.clearAssignRequests = reqs.filter((r) => r.method === "PATCH").map((r) => `${r.method} ${r.path} ${r.body}`);

// hard reload: confirm both values came from the server
await s.goto(`${ORIGIN}/love-customer-list`, 7000);
report.afterReload = await s.eval(`({
  audit: document.querySelector('select[aria-label="审核状态"]')?.value ?? null,
  assign: document.querySelector('select[aria-label="分派跟进"]')?.value ?? null,
})`);

console.log(JSON.stringify(report, null, 2));
process.exit(0);
