# 寻爱管理后台启动与部署文档

本文档适用于 `xuanshiai-admin` 管理后台。项目是 Next.js 16 应用，生产构建使用 `standalone` 输出。

## 一、部署前准备

### 1. 软件要求

- Node.js 20.9 或更高版本，建议使用 Node.js 22 LTS
- npm 10 或更高版本
- 可访问的后台业务 API 服务
- 生产环境建议使用 Nginx 或其他 HTTPS 反向代理

检查版本：

```bash
node -v
npm -v
```

Windows PowerShell 如果 `npm` 被执行策略拦截，可以使用 `npm.cmd` 代替 `npm`。

### 2. 后端服务要求

管理后台前端不是完整后端，不包含数据库、ORM 或管理员账号数据。部署前必须先启动后台业务 API，并手动在后端数据库中创建启用的管理员账号。

至少需要提供：

```text
POST /api/v1/admin/auth/login
GET  /api/v1/admin/auth/me
POST /api/v1/admin/auth/logout
```

管理员登录不提供注册接口。账号密码必须由后端使用 Argon2id 或 bcrypt 哈希保存，不能保存明文密码。

## 二、本地开发

### 1. 安装依赖

在项目根目录执行：

```bash
npm ci
```

如果没有 `package-lock.json`，才使用：

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env.local
```

`.env.local` 示例：

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_API_BASE_URL=http://127.0.0.1:8000
```

`ADMIN_API_BASE_URL` 填后端主机地址，不要写 `/api` 或 `/api/v1`。前端代理会自动将：

```text
/api/backend/admin/users
```

转发为：

```text
${ADMIN_API_BASE_URL}/api/v1/admin/users
```

### 3. 启动开发服务器

```bash
npm run dev
```

Windows PowerShell 执行策略受限时：

```powershell
npm.cmd run dev
```

浏览器打开：

```text
http://localhost:3000/login
```

开发服务器默认监听 `3000` 端口。如果端口被占用，可以指定端口：

```bash
npm run dev -- -p 3001
```

## 三、生产构建

### 1. 构建前检查

```bash
npm run typecheck
npm run build
```

Windows PowerShell：

```powershell
npm.cmd run typecheck
npm.cmd run build
```

`npm run build` 会生成：

```text
.next/standalone/server.js
.next/static/
```

### 2. 直接启动生产服务

项目已配置：

```json
{
  "start": "node .next/standalone/server.js"
}
```

启动命令：

```bash
npm run start
```

注意：Next.js standalone 输出要求静态资源目录位于 standalone 目录下。完整准备方式如下：

```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

如果项目没有 `public` 目录，可以跳过第二条命令。Windows PowerShell：

```powershell
Copy-Item .next/static .next/standalone/.next/static -Recurse -Force
if (Test-Path public) { Copy-Item public .next/standalone/public -Recurse -Force }
```

生产环境也必须配置 `ADMIN_API_BASE_URL`，例如：

```bash
ADMIN_API_BASE_URL=http://127.0.0.1:8000 npm run start
```

Windows PowerShell：

```powershell
$env:ADMIN_API_BASE_URL="http://127.0.0.1:8000"
npm.cmd run start
```

更推荐把变量写入生产环境的进程管理器或服务配置，不要写死在代码中。

## 四、Linux 服务器部署

### 1. 发布文件

可以在服务器构建，也可以将以下文件复制到服务器：

```text
.next/standalone/
.next/static/          已复制到 .next/standalone/.next/static
public/                如果存在
```

生产服务器不需要提交 `.env.local` 到 Git，使用服务器环境变量或单独的环境文件。

### 2. 使用 systemd

创建 `/etc/systemd/system/xuanshiai-admin.service`：

```ini
[Unit]
Description=Xuanshiai Admin
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/srv/xuanshiai-admin
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
Environment=ADMIN_API_BASE_URL=http://127.0.0.1:8000
ExecStart=/usr/bin/node /srv/xuanshiai-admin/.next/standalone/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

加载并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now xuanshiai-admin
sudo systemctl status xuanshiai-admin
```

查看日志：

```bash
sudo journalctl -u xuanshiai-admin -f
```

## 五、Nginx 反向代理

示例配置：

```nginx
server {
    listen 80;
    server_name admin.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

配置检查并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

生产环境应使用 HTTPS。登录 token 当前由前端保存并通过同源的 Next.js `/api/backend/*` 代理发送，反向代理不要把 `/api/backend/` 转发到后端业务 API，否则会绕过 Next.js 代理。

## 六、验证部署

### 1. 页面检查

打开：

```text
https://admin.example.com/login
```

检查：

1. 未登录访问任意后台页面会跳转到 `/login`。
2. 正确管理员账号可以登录。
3. 错误账号或密码不能进入后台。
4. 登录后浏览器请求包含 `/api/backend/*`，而不是直接请求后端地址。
5. 退出登录后再次访问后台会回到登录页。
6. 后端返回 `401` 后，前端会清理 token 并要求重新登录。

### 2. 接口检查

后端直接检查：

```bash
curl -i http://127.0.0.1:8000/api/v1/admin/auth/me
```

未携带 token 应返回 `401`。通过管理后台登录后，再使用有效的 `Authorization: Bearer ...` 请求应返回 `200`。

### 3. 健康检查建议

当前前端没有单独的 `/health` 路由。生产环境可以使用：

```text
GET /login
```

作为页面进程存活检查，并使用后端自己的健康检查接口检查数据库和业务 API。

## 七、常见问题

### 页面提示未配置 `ADMIN_API_BASE_URL`

检查运行进程的环境变量。生产环境变量必须配置在 systemd、Docker、PM2 或启动命令中，单独修改本地 `.env.local` 不会影响服务器。

### 请求变成 `/api/api/v1/...`

这是因为 `ADMIN_API_BASE_URL` 配置成了 `http://host/api`。正确配置为：

```dotenv
ADMIN_API_BASE_URL=http://host
```

### 后端返回 401

检查管理员账号是否启用、登录接口是否返回 `access_token`、浏览器是否已经保存 token，以及后端是否接受 `Authorization: Bearer <token>`。

### 后端返回 403

token 有效但账号不是启用的管理员，或管理员角色没有对应权限。权限校验必须由后端完成，不能只依赖前端隐藏菜单。

### 页面可以打开但样式或静态资源 404

确认已将 `.next/static` 复制到 `.next/standalone/.next/static`，并确认 Nginx 的 `proxy_pass` 指向 Next.js 服务。

### 生产环境仍显示 mock 数据

当前部分管理页面仍未接入后端契约。对应缺失接口见：

- `docs/missing-interfaces.md`
- `docs/admin-contract.md`

启动成功不代表所有页面都已经完成真实数据接入。

## 八、上线检查清单

- [ ] 后端 API 已启动并可从管理后台服务器访问
- [ ] 管理员账号已手动写入数据库，且密码已哈希
- [ ] 未提供管理员注册接口
- [ ] `ADMIN_API_BASE_URL` 未包含 `/api` 后缀
- [ ] `npm run typecheck` 通过
- [ ] `npm run build` 通过
- [ ] standalone 静态资源已复制
- [ ] Node 服务已配置自动重启
- [ ] Nginx 已配置 HTTPS
- [ ] 登录、退出、401、403 和无权限页面已验证
- [ ] 后端写操作已配置幂等键和管理员审计日志
