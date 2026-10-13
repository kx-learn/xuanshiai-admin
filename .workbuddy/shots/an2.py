from PIL import Image
im = Image.open(r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\shots\captcha.png").convert("RGB")
px = im.load()
def is_dark(p):
    r,g,b = p
    return r<100 and g<100 and b<100
# 打印 580-700 每列暗像素数
for x in range(580, 700):
    c = sum(1 for y in range(150, 320) if is_dark(px[x,y]))
    if c>0: print(x, c)
