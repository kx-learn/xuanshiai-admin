from PIL import Image
im = Image.open(r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\shots\after_drag.png").convert("RGB")
px = im.load()
# 只扫拼图块的 y 带（265-315），检测白色描边
runs=[]; cur=None
for x in range(455, 810):
    c = sum(1 for y in range(260, 320) if all(v>200 for v in px[x,y]))
    if c>=3:
        if cur is None: cur=[x,x,c]
        else: cur[1]=x; cur[2]+=c
    else:
        if cur: runs.append(tuple(cur)); cur=None
if cur: runs.append(tuple(cur))
for a,b,c in runs: print("run", a, b, "w", b-a+1, "px", c, "center", (a+b)/2)
