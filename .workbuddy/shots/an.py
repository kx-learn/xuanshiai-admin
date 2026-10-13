from PIL import Image
im = Image.open(r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\shots\captcha.png").convert("RGB")
W,H = im.size
print("size", W, H)
px = im.load()
x0,x1,y0,y1 = 390, 695, 150, 320
def is_dark(p):
    r,g,b = p
    return r<80 and g<80 and b<80
runs=[]; cur=None
for x in range(x0,x1):
    c = sum(1 for y in range(y0,y1) if is_dark(px[x,y]))
    if c>12:
        if cur is None: cur=[x,x]
        else: cur[1]=x
    else:
        if cur: runs.append(tuple(cur)); cur=None
if cur: runs.append(tuple(cur))
for a,b in runs:
    print("run", a, b, "center", (a+b)/2)
