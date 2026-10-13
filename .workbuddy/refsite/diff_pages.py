# -*- coding: utf-8 -*-
"""把原站每页的控件文案（按钮/标签/占位符/表头/Tab/下拉）与本地页面源码比对，输出本地缺失项。"""
import json, os, re, sys, io

BASE = r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\refsite"
PAGES = os.path.join(BASE, "pages")
LOCAL = r"C:\Users\ysc02\Desktop\xuanshiai-admin\src\app"


# 本地是「跳转桩」的页面：解析 router.replace("/xxx") 目标，跟随到真实页面
REDIRECT_FIX = {
    "admin_love-matchmaker-apportion-wrap": "love-matchmaker-apportion2",
    "admin_vip-popularize-record": "poplove-matchmaker-distribution-details",
}

def _stub_target(dirname, depth=0):
    """本地页面若只是 router.replace 跳转桩，返回真实目标目录；否则返回原名。"""
    if depth > 3 or not dirname:
        return dirname
    fp = os.path.join(LOCAL, "(admin)", dirname, "page.tsx")
    if not os.path.isfile(fp):
        return dirname
    src = open(fp, encoding="utf-8", errors="ignore").read()
    if len(src) > 800:  # 有实际内容，不是桩
        return dirname
    m = re.search(r'router\.replace\(\s*["\']/([^"\']+)', src)
    if not m:
        return dirname
    tgt = m.group(1).split("/")[0]
    cand = os.path.join(LOCAL, "(admin)", tgt, "page.tsx")
    return _stub_target(tgt, depth + 1) if os.path.isfile(cand) else dirname

# 原站路径 -> 本地页面目录（None 表示本地没有该页）
MAPPING = {
    "admin_home": "home",
    "admin_reg-user-all": "reg-user-all",
    "admin_reg-user-log": "reg-user-log",
    "admin_love-customer-list-wrap": "love-customer-list",
    "admin_love-customer-statistics": "love-customer-statistics",
    "admin_customer-follow-up": "customer-follow-up",
    "admin_love-customer-config": "love-customer-config",
    "admin_love-user-list-wrap": "love-user-list",
    "admin_love-user-vip": "love-user-vip",
    "admin_love-user-vip-underline": "love-user-vip-underline",
    "admin_love-user-auth": "love-user-auth",
    "admin_content-verify": "content-verify",
    "admin_love-user-behavior": "love-user-behavior",
    "admin_love-user-statistics": "love-user-statistics",
    "admin_love-user-follow-up": "love-user-follow-up",
    "admin_vip-line-record": "vip-line-record",
    "admin_love-interview": "love-interview",
    "admin_love-appointment": "love-appointment",
    "admin_vip-popularize-record": "vip-popularize-record",
    "admin_love-matchmaker-list": "love-matchmaker-list",
    "admin_love-matchmaker-apportion-wrap": "love-matchmaker-apportion",
    "admin_love-matchmaker-distribution": "love-matchmaker-distribution",
    "admin_love-matchmaker-distribution-details": "love-matchmaker-distribution-details",
    "admin_branch-config": "branch-config",
    "admin_mendian-list": "mendian-list",
    "admin_branch-matchmaker-list": "branch-matchmaker-list",
    "admin_branch-report-list": "branch-report-list",
    "admin_branch-distribuion-list": "branch-distribution-list",
    "admin_poplove-matchmaker-list": "poplove-matchmaker-list",
    "admin_poplove-matchmaker-distribution": "poplove-matchmaker-distribution",
    "admin_poplove-matchmaker-distribution-details": "poplove-matchmaker-distribution-details",
    "admin_love-partner-config": "love-partner-config",
    "admin_love-partner-bonus-config": "love-partner-bonus-config",
    "admin_love-partner-list": "love-partner-list",
    "admin_love-partner-relation-manage": "love-partner-relation",
    "admin_love-partner-bonus-details": "love-partner-bonus-details",
    "admin_active-config": "active-config",
    "admin_active-list": "active-list",
    "admin_active-signupmanager": "active-signupmanager",
    "admin_mutual-selection-activities-list": "mutual-selection-list",
    "admin_mutual-selection-activities-record": "mutual-selection-record",
    "admin_active-alliance": "active-alliance",
    "admin_merchant-alliance-config": "merchant-alliance-config",
    "admin_merchant-management": "merchant-management",
    "admin_merchant-product": "merchant-product",
    "admin_merchant-order": "merchant-order",
    "admin_short-video-config": "short-video-config",
    "admin_short-video-list": "short-video-list",
    "admin_short-video-red-packet": "short-video-red-packet",
    "admin_short-video-comment": "short-video-comment",
    "admin_short-video-homepage": "short-video-homepage",
    "admin_short-video-tip": "short-video-tip",
    "admin_free-pay": "free-pay",
    "admin_matchmaker-good-news-configuration": None,
    "admin_matchmaker-good-news-manage": None,
    "admin_matchmaker-good-news-pennant-manage": None,
    "admin_column-configuration": None,
    "admin_group-manage": "group-list",
    "admin_sign-manage": "group-signup",
    "admin_interactive-messages-function": "interact-config",
    "admin_interactive-messages-content": "interact-content",
    "admin_interactive-messages-list": "interact-record",
    "admin_sales-library": "sales-match",
    "admin_single-page": "single-page",
    "admin_customer-landing": "customer-landing",
    "admin_free-form": "free-form",
    "admin_tool-lovecard": "tool-lovecard",
    "admin_tool-theme": "tool-theme",
    "admin_sms-group": "sms-group",
    "admin_love-gift-wrap": "love-gift-wrap",
    "admin_generate-tool": "generate-tool",
    "admin_qrcode-wrap": "qrcode-wrap",
    "admin_gift-list": "gift-list",
    "admin_gift-exchange": "gift-exchange",
    "admin_finance-config": "finance-config",
    "admin_system-finance-order": "system-finance-order",
    "admin_system-credit-history": "system-credit-history",
    "admin_system-cashout-history": "system-cashout-history",
    "admin_finance-statistic": "finance-statistic",
    "admin_e-contract-list": "e-contract-list",
    "admin_e-contract-template": "e-contract-template",
    "admin_e-contract-yinzhang": "e-contract-yinzhang",
    "admin_e-contract-config": "e-contract-config",
    "admin_system-setting-basic-wrap": "system-setting-basic",
    "admin_system-setting-adconfig-wrap": "system-setting-adconfig",
    "admin_outbound-call-platform": "outbound-call-platform",
    "admin_out-call-list": "out-call-list",
    "admin_out-call-record": "out-call-record",
    "admin_system-setting-sms-signature": "sms-signature",
    "admin_system-setting-sms-notices": "sms-notices",
    "admin_system-setting-sms-group": "sms-group",
    "admin_system-setting-sms-record": "sms-record",
    "admin_system-setting-admin-adduser": "system-setting-admin-user-add",
    "admin_system-setting-admin-user": "system-setting-admin-user",
    "admin_system-setting-admin-group": "system-setting-admin-group",
    "admin_system-setting-admin-log": "system-setting-admin-log",
    "admin_platform-config": "platform-config-basic",
    "admin_platform-navconfig": "platform-navconfig",
    "admin_platform-page": "platform-page",
    "admin_power-config": "power-config",
    "admin_platform-content": "platform-content",
    "admin_platform-base": "platform-base",
    "admin_platform-payconfig": "platform-payconfig",
    "admin_wechat-config": "wechat-config",
    "admin_wechat-fans": "wechat-fans",
    "admin_wechat-menu": "wechat-menu",
    "admin_wechat-autoreply-wrap": "wechat-autoreply",
    "admin_wechat-template": "wechat-template",
    "admin_wechat-send": "wechat-send",
    "admin_miniprogram-config": "miniprogram-config",
    "admin_plugin-center": "plugin-center",
    "admin_operate-center": "operate-center",
    "admin_system-feedback": "system-feedback",
    "admin_system-empower": "system-empower",
    "crm_home": None,
}

CN = re.compile(r"[\u4e00-\u9fa5]")
NOISE = re.compile(r"^\d+[\d,\.\s]*$|^(https?:|/)|^[\W_]+$")
WS = re.compile(r"\s+")


def norm(s):
    """归一化：去掉所有空白与原站常见的按钮间隔空格（如「搜 索」→「搜索」）"""
    return WS.sub("", s or "")


def read_dir(d):
    buf = []
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith((".tsx", ".ts")):
                try:
                    buf.append(open(os.path.join(root, f), encoding="utf-8", errors="replace").read())
                except Exception:
                    pass
    return buf


for _k, _v in REDIRECT_FIX.items():
    MAPPING[_k] = _stub_target(_v)

def read_local(dirname):
    """本地页面源码 + 全局共享组件（顶栏/弹层等算作已具备）"""
    if not dirname:
        return None
    d = os.path.join(LOCAL, "(admin)", dirname)
    if not os.path.isdir(d):
        return None
    buf = read_dir(d)
    buf += read_dir(r"C:\Users\ysc02\Desktop\xuanshiai-admin\src\components")
    return "\n".join(buf) if buf else None


def split_selects(items):
    out = []
    for s in items:
        for part in re.split(r"\s*/\s*", s):
            part = part.strip()
            if part:
                out.append(part)
    return out


def main():
    rows = []
    for slug, local_dir in MAPPING.items():
        fp = os.path.join(PAGES, slug + ".json")
        if not os.path.exists(fp):
            continue
        data = None
        try:
            raw = open(fp, encoding="utf-8", errors="replace").read()
            # agent-browser 的 eval 输出是「被 JSON 编码过的字符串」，需解两次
            first = json.loads(raw)
            data = json.loads(first) if isinstance(first, str) else first
        except Exception:
            try:
                m = re.search(r"\{[\s\S]*\}\s*$", raw)
                if m:
                    data = json.loads(m.group(0))
            except Exception:
                data = None
        if not data:
            rows.append((slug, local_dir, "PARSE_FAIL", []))
            continue
        src = read_local(local_dir)
        if src is None:
            rows.append((slug, local_dir, "LOCAL_MISSING", []))
            continue
        cand = []
        for key in ("tabs", "buttons", "labels", "placeholders", "tableHeaders", "radios"):
            cand += [c.strip() for c in (data.get(key) or []) if isinstance(c, str)]
        cand += split_selects([c for c in (data.get("selects") or []) if isinstance(c, str)])
        src_norm = norm(src)
        missing = []
        seen = set()
        for c in cand:
            if not c or not CN.search(c) or NOISE.search(c) or len(c) > 20:
                continue
            key = norm(c)
            if not key or key in seen:
                continue
            seen.add(key)
            if key not in src_norm:
                missing.append(c)
        rows.append((slug, local_dir, "OK", missing))

    out = io.StringIO()
    out.write("# 原站页面 vs 本地页面 — 控件文案缺失比对\n\n")
    out.write("生成脚本：`.workbuddy/refsite/diff_pages.py`。"
              "「缺失文案」= 原站页面上出现、但本地页面源码里完全搜不到的中文控件名。\n\n")
    out.write("| 原站页面 | 本地页面 | 状态 | 缺失控件文案数 |\n|---|---|---|---|\n")
    for slug, local_dir, status, missing in rows:
        out.write(f"| {slug} | {local_dir or '—'} | {status} | {len(missing)} |\n")
    out.write("\n---\n\n## 明细\n\n")
    for slug, local_dir, status, missing in rows:
        if status != "OK":
            out.write(f"### {slug}\n状态：**{status}**（本地页面：{local_dir or '无'}）\n\n")
            continue
        out.write(f"### {slug}\n本地页面：`{local_dir}`\n\n")
        if missing:
            for item in missing:
                out.write(f"- {item}\n")
        else:
            out.write("- （无缺失）\n")
        out.write("\n")
    dst = os.path.join(BASE, "page_gap.md")
    open(dst, "w", encoding="utf-8").write(out.getvalue())
    print("written:", dst)
    print("pages:", len(rows))
    for slug, local_dir, status, missing in rows:
        if status != "OK" or len(missing) > 6:
            print(f"  {status:14s} {slug:50s} missing={len(missing)}")


if __name__ == "__main__":
    main()
