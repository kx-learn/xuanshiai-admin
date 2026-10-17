// Verify the dead-button fix on the four config pages that gated on `ready`.
// Expectation before the fix: submit disabled forever, inputs stuck on defaults.
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(
  process.env.TEMP + "\\admin_token.txt",
  "utf8",
).trim();
const ORIGIN = "http://127.0.0.1:3000";

const PAGES = [
  { path: "/love-customer-config", label: "客源线索-功能配置" },
  { path: "/active-config", label: "活动配置" },
  { path: "/branch-config", label: "分站配置" },
  { path: "/love-partner-config", label: "红娘牵线配置" },
  { path: "/group-menu", label: "搭子栏目" },
];

const s = await connect(9222);

// Seed the token once for the origin, then every navigation is authenticated.
await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);

const report = [];
for (const p of PAGES) {
  const apiCalls = [];
  s.events.length = 0;
  await s.goto(`${ORIGIN}${p.path}`, 4000);

  const cfgReqs = s.events.filter(
    (e) =>
      e.method === "Network.requestWillBeSent" &&
      typeof e.params?.request?.url === "string" &&
      e.params.request.url.includes("/configs/"),
  );
  for (const e of cfgReqs) apiCalls.push(`${e.params.request.method} ${new URL(e.params.request.url).pathname}`);

  const state = await s.eval(`(() => {
    const btns = [...document.querySelectorAll("button")].filter((b) =>
      /确定提交|保存|提交/.test(b.textContent || ""),
    );
    return {
      title: document.title,
      bodyHasLogin: /正在验证管理员身份/.test(document.body.innerText),
      hasConfigText: !/正在验证管理员身份|登录/.test(document.body.innerText.slice(0, 200)),
      submitButtons: btns.map((b) => ({
        text: (b.textContent || "").trim().slice(0, 12),
        disabled: b.disabled,
        cls: b.className.slice(0, 60),
      })),
      errorText: (document.body.innerText.match(/[^\\n]*(加载失败|保存失败|失败)[^\\n]*/g) || []).slice(0, 3),
      inputs: [...document.querySelectorAll("input[type=text],input:not([type]),textarea")]
        .slice(0, 4)
        .map((i) => ({ tag: i.tagName, value: (i.value || "").slice(0, 40) })),
    };
  })()`);

  report.push({ ...p, apiCalls, ...state });
}

console.log(JSON.stringify(report, null, 2));
process.exit(0);
