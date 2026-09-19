import io

path = r"E:\HTML\xuanshiai-admin\src\app\(admin)\reg-user-all\page.tsx"
lines = io.open(path, encoding="utf-8").read().splitlines()
line = lines[118]
out = []
step = 1200
for start in range(2400, len(line), step):
    out.append("### %d-%d" % (start, min(len(line), start + step)))
    out.append(line[start:start + step])
io.open(r"E:\HTML\xuanshiai-admin\scripts\_tmp_tail.txt", "w", encoding="utf-8").write("\n".join(out))
