// Full control audit for active-config: every button's text + disabled state.
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);
await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);

const pages = process.argv.slice(2);
for (const p of pages) {
  s.events.length = 0;
  await s.goto(`${ORIGIN}${p}`, 6000);
  const r = await s.eval(`(() => {
    const btns = [...document.querySelectorAll("button")];
    return {
      page: location.pathname,
      total: btns.length,
      disabledBtns: btns.filter(b => b.disabled).map(b => ({
        text: (b.textContent||"").trim().slice(0,20), cls: b.className.slice(0,50),
      })),
      submitish: btns.filter(b => /确定提交|保存|提交|确定切换/.test(b.textContent||"")).map(b => ({
        text: (b.textContent||"").trim().slice(0,20), disabled: b.disabled, cls: b.className.slice(0,50),
      })),
    };
  })()`);
  const cfgReqs = s.events
    .filter(e => e.method === "Network.requestWillBeSent" && e.params.request.url.includes("/configs/"))
    .map(e => new URL(e.params.request.url).pathname);
  console.log(JSON.stringify({ ...r, cfgReqs }, null, 2));
}
process.exit(0);
