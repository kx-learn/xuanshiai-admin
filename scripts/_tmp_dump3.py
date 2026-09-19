import io

path = r"E:\HTML\xuanshiai-admin\src\app\(admin)\reg-user-all\page.tsx"
lines = io.open(path, encoding="utf-8").read().splitlines()
target = [i for i, l in enumerate(lines) if "即将删除账号" in l]
out = []
for i in target:
    line = lines[i]
    start = max(0, line.find('"password"') - 200)
    out.append("=== line %d" % (i + 1))
    out.append(line[max(0, start):start + 1800] if start > 0 else line[:1800])
io.open(r"E:\HTML\xuanshiai-admin\scripts\_tmp_check.txt", "w", encoding="utf-8").write("\n".join(out))
