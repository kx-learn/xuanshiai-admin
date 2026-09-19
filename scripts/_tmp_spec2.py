import json, urllib.request, io, traceback

try:
    url = "https://xhztest.xyz/openapi.json"
    raw = urllib.request.urlopen(url, timeout=60).read().decode("utf-8")
    spec = json.loads(raw)
    paths = spec.get("paths", {})
    lines = []
    for p, methods in sorted(paths.items()):
        if not isinstance(methods, dict):
            continue
        low = p.lower()
        if any(k in low for k in ["cancel", "logoff", "deactivat"]):
            for m, op in methods.items():
                s = str(op.get("summary") or "") if isinstance(op, dict) else ""
                lines.append("%s %s :: %s" % (m.upper(), p, s))
    lines.append("--- text matches ---")
    for p, methods in sorted(paths.items()):
        if not isinstance(methods, dict):
            continue
        for m, op in methods.items():
            if not isinstance(op, dict):
                continue
            text = str(op.get("summary") or "") + " " + str(op.get("description") or "")
            if "删除账号" in text or "注销账号" in text or "账号注销" in text:
                lines.append("%s %s :: %s" % (m.upper(), p, text[:150].replace("\n", " ")))
    out = "\n".join(lines)
except Exception:
    out = traceback.format_exc()

io.open(r"E:\HTML\xuanshiai-admin\scripts\_tmp_api2.txt", "w", encoding="utf-8").write(out)
