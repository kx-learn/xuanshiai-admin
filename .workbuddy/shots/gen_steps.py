import random
xs=[514]; x=514; v=2.0
while x < 746:
    v = min(13.0, v + random.uniform(0.6, 2.2))
    x += v
    if x > 748: x = 748
    xs.append(int(x))
xs += [752, 750, 749]
with open(r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\shots\steps.txt", "w") as f:
    for xx in xs:
        f.write(f"{xx} {393 + random.randint(-2, 2)} 0.05\n")
print(len(xs), "steps, end", xs[-1])
