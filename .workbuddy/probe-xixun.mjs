// Defect #2 probe: does the 喜讯/锦旗 edit drawer backfill existing DB values,
// and does submit wipe image_url / views?
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);

const net = [];
s.ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === "Network.requestWillBeSent" && /PATCH|POST/.test(m.params.request.method)) {
    net.push({
      method: m.params.request.method,
      url: new URL(m.params.request.url).pathname,
      body: (m.params.request.postData || "").slice(0, 400),
    });
  }
  if (m.method === "Network.responseReceived" && /admin\/content/.test(m.params.response.url)) {
    net.push({ resp: new URL(m.params.response.url).pathname, status: m.params.response.status });
  }
});

await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);

async function readDrawer(page, linkRe, inputSel) {
  net.length = 0;
  await s.goto(`${ORIGIN}${page}`, 7000);
  const before = await s.eval(`(() => {
    const tr = document.querySelector("tbody tr");
    return tr ? tr.innerText.replace(/\\s+/g," ").trim().slice(0,200) : "NO_ROW";
  })()`);
  const opened = await s.eval(`(() => {
    const a = [...document.querySelectorAll("a")].find(x => /编辑\\/查看/.test(x.textContent||""));
    if (!a) return "NO_LINK";
    a.click();
    return "CLICKED";
  })()`);
  await sleep(800);
  const fields = await s.eval(`(() => {
    const panel = document.querySelector(".tlc-panel");
    if (!panel) return "NO_PANEL";
    const out = { inputs: {}, radios: {}, textareas: {}, title: (panel.querySelector(".tlc-panel-title")||{}).textContent };
    panel.querySelectorAll("input").forEach((i) => {
      const k = i.className || i.type;
      if (i.type === "radio") out.radios[k + ":" + i.value] = i.checked;
      else out.inputs[k] = i.value;
    });
    panel.querySelectorAll("textarea").forEach((t) => { out.textareas[t.className] = t.value; });
    return out;
  })()`);
  return { before, opened, fields, net: [...net] };
}

console.log("=== /xixun-list ===");
console.log(JSON.stringify(await readDrawer("/xixun-list"), null, 2));

console.log("=== /xixun-banner ===");
console.log(JSON.stringify(await readDrawer("/xixun-banner"), null, 2));
process.exit(0);
