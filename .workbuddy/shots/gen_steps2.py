import random
xs = [514]
x = 514.0; v = 1.5
while x < 660:
    v = min(11.0, v + random.uniform(0.5, 1.8))
    x += v
    if x > 662: x = 662
    xs.append(int(x))
xs += [669, 666, 665, 666]
with open(r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\shots\steps2.txt", "w", newline="\n") as f:
    for xx in xs:
        f.write(f"{xx} {393 + random.randint(-2, 2)} 0.06\n")
print(len(xs), "steps, end", xs[-1])
