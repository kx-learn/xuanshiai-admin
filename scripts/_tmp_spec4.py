import json, urllib.request, io

out = []
try:
    raw = urllib.request.urlopen("https://xhztest.xyz/openapi.json", timeout=60).read().decode("utf-8")
    spec = json.loads(raw)
    for p, methods in sorted(spec.get("paths", {}).items()):
        low = p.lower()
        if any(k in low for k in ["impersonat", "login-as", "switch"]):
            out.append(p)
    out.append("--- admin accounts delete exists: %s" % str("delete" in [m.lower() for m in (spec["paths"].get("/api/v1/admin/matchmaker/accounts/{account_id}") or {})]))
except Exception as e:
    out.append("ERR " + str(e))
io.open(r"E:\HTML\xuanshiai-admin\scripts\_tmp_api4.txt", "w", encoding="utf-8").write("\n".join(out))
