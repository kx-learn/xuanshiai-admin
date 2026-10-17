// Confirm xixun-list drawer backfills both feedback_name and partner_name (same class),
// then verify an edit round-trip preserves image_url and views.
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);

const net = [];
s.ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === "Network.requestWillBeSent" && /PATCH/.test(m.params.request.method)) {
    net.push({ url: new URL(m.params.request.url).pathname, body: (m.params.request.postData || "").slice(0, 600) });
  }
});

await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);
await s.goto(`${ORIGIN}/xixun-list`, 7000);

const drawerInputs = await s.eval(`(() => {
  const a = [...document.querySelectorAll("a")].find(x => /编辑\\/查看/.test(x.textContent||""));
  a.click();
  return "opened";
})()`);
await sleep(700);
const values = await s.eval(`(() => {
  const panel = document.querySelector(".tlc-panel");
  return [...panel.querySelectorAll("input")].map(i => ({ type: i.type, cls: i.className, value: i.value, checked: i.checked }));
})()`);

// edit the 赠语 then submit, to observe the PATCH payload
await s.eval(`(() => {
  const t = document.querySelector(".tlc-panel .xx-textarea");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  setter.call(t, "<p>hi-edited</p>");
  t.dispatchEvent(new Event("input", { bubbles: true }));
  return t.value;
})()`);
const clicked = await s.eval(`(() => {
  const btn = [...document.querySelectorAll("button")].find(b => /确定提交/.test(b.textContent||""));
  if (!btn) return "NO_BUTTON";
  btn.click();
  return "CLICKED";
})()`);
await sleep(4000);

console.log(JSON.stringify({ drawerInputs, values, clicked, net }, null, 2));
process.exit(0);
