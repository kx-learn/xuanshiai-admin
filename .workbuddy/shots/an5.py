from PIL import Image
im = Image.open(r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\shots\after_drag.png").convert("RGB")
px = im.load()
# 全宽扫描拼图区域内的暗色块
runs=[]; cur=None
for x in range(455, 810):
    c = sum(1 for y in range(150, 325) if all(v<85 for v in px[x,y]))
    if c>10:
        if cur is None: cur=[x,x]
        else: cur[1]=x
    else:
        if cur: runs.append(tuple(cur)); cur=None
if cur: runs.append(tuple(cur))
for a,b in runs: print("run", a, b, "w", b-a+1, "center", (a+b)/2)
