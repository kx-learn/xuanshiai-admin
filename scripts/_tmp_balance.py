import io, re

path = r"E:\HTML\xuanshiai-admin\src\app\(admin)\reg-user-all\page.tsx"
src = io.open(path, encoding="utf-8").read()
lines = src.splitlines()
i = [n for n, l in enumerate(lines) if "dialog && <div" in l][0]
seg = lines[i]
# crude brace balance check inside JSX expression
out = []
out.append("braces {}: %d %d" % (seg.count("{"), seg.count("}")))
out.append("parens (): %d %d" % (seg.count("("), seg.count(")")))
out.append("divs open/close: %d %d" % (len(re.findall(r"<div\b", seg)), seg.count("</div>")))
out.append("delete-block index: %d" % seg.find('dialog === "delete"'))
out.append("footer index: %d" % seg.find("mt-5 flex justify-end"))
out.append("segment: " + seg[seg.find('dialog === "password"'):seg.find('dialog === "delete"')][-260:])
io.open(r"E:\HTML\xuanshiai-admin\scripts\_tmp_balance.txt", "w", encoding="utf-8").write("\n".join(out))
