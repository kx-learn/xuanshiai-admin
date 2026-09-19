import io

path = r"E:\HTML\xuanshiai-admin\src\app\(admin)\reg-user-all\page.tsx"
lines = io.open(path, encoding="utf-8").read().splitlines()
out = []
for i in (118, 119):
    if i < len(lines):
        out.append("=== line %d (len %d)" % (i + 1, len(lines[i])))
        out.append(lines[i])
io.open(r"E:\HTML\xuanshiai-admin\scripts\_tmp_modal.txt", "w", encoding="utf-8").write("\n".join(out))
