# 项目长期记忆 — xuanshiai-admin（玄爱红娘后台）

## 技术栈与环境

- 前端：Next.js 16.2.12 App Router + TypeScript + React。目录 `E:\HTML\xuanshiai-admin`。
- 后端：FastAPI + SQLAlchemy AsyncSession + MySQL，目录 `E:\houduan\xuanshiai`。虚拟环境 `.venv`（`./.venv/Scripts/python.exe main.py` 启动，端口 8000）。
- 接口基地址：前端统一走 `/api/backend` 代理，代理目标由 `.env` 的 `ADMIN_API_BASE_URL` 决定（当前 `http://localhost:8000`）。代理实现 `src/app/api/backend/[...path]/route.ts`。
- 3000 端口通常是 `npm run dev`（Turbopack），**改 `src/` 代码热加载生效，无需 build**。改前先确认是不是 dev 模式。

## 规范（必须遵守）

- **改长文件只用 Edit 精确替换，绝不用 Write 整文件覆盖。** Write 仅用于新建文件。曾因 Write 覆盖把 2914 行的 `admin-endpoints.ts` 冲成 10 行。
- 表格密集对齐、必须有勾选列、分页用 `au-page-btn`/`au-page-num` 紧凑样式、箭头一律 CSS 绘制（禁用 `⌄` `›` 等 Unicode 字形）。详见 `AGENTS.md`。

## 接口封装约定

- `src/lib/admin-endpoints.ts`：所有接口集中在 `adminEndpoints` 对象内，配 `list()` / `create()`（POST）/ `update()`（PATCH）三个内部辅助函数。
- `list()` 的 query 类型是 `AdminListQuery = PageQuery & Record<string, string | number | undefined>`，**不支持数组值**。
- 多选筛选（重复 query key）必须用 `AdminListQueryMulti` + `listMulti()`（值允许 `string[]`）。

## 后端路由遮蔽坑（重要）

FastAPI **先注册先命中**。`app/api/routes/router.py` 中 `member_records_admin`（136 行）注册早于 `member_media_admin`（141 行），因此后者的 `/{id}/xxx` 形态接口会被前者的同名通用查询接口遮蔽，**筛选参数被静默忽略**。

已做的重命名（`member_records_admin.py` 让位）：

| 原路径 | 新路径 |
|---|---|
| `/{member_id}/recommendations` | `/{member_id}/recommend-history` |
| `/{member_id}/media` | `/{member_id}/media-records` |
| `/{member_id}/private-info` | `/{member_id}/private-info-records` |

- 静态段路径（`/profile-ext/{id}`、`/private-info/{id}`、`/preference/{id}`）天然安全，不受遮蔽。
- 排查手法：`curl http://localhost:8000/openapi.json`，比对每个 path 暴露的 `parameters` 列表——比读代码可靠。新增 `/{id}/xxx` 形态接口前，务必跨文件搜同名 path。

## 会员详情页（MemberDetailWorkspace.tsx）

- 单文件承载全部 Tab（基础资料/自我介绍/择偶要求/私密信息/跟进/推荐匹配/牵线记录等），体量大（~3300 行），改动集中在此文件。
- 各 Tab 的筛选下拉**必须复用基础资料页的共享常量**（`OCCUPATION`、`TAG_OPTIONS`、星座/购房/吸烟/喝酒/婚况字面值），保持一致。
- 需要「服务端分页 + 前端二次切分」的 Tab（如牵线记录）写成**自持分页组件**：只接 `memberId`，内部 `load(page)`；父组件不再传 `data/loading/error`。⚠️ 改写时渲染体里的变量名必须同步替换，否则编译不过。

## 接口数据口径备忘

- 牵线记录 `GET /admin/members/{id}/match-records` **按会员返回「发起 + 收到」双向记录**，`total` 是两者合计。子 Tab 切分只能前端做，条数按切分后统计（直接显示 `total` 会翻倍）。
- `GET /admin/members/{id}/match-quota` 无账户时返回全 0 而非 404，前端不必区分「未开通」与「0 次」。
- `match_apply.status`：0 待处理 / 1 已接受 / 2 已拒绝 / 3 已失效。
- **约见申请**（`meeting_request.status`）：SUBMITTED 待处理 → CONTACTED 已联系 → ACCEPTED 已接受；三者可分别转 DECLINED/CLOSED。Admin 不能写 SUBMITTED。`DECLINED/CLOSED` **必须带 reason（否则 422）**且退还次数。**只有 ACCEPTED 能排期**（`POST .../schedule`，非 PATCH status）。
- **约会记录**（`meeting_record.status`）：SCHEDULED/REMINDED/CHECKED_IN/COMPLETED/CANCELLED/NO_SHOW。`CHECKED_IN|COMPLETED` 计入「成功见面」。列表 `met=wait` → SCHEDULED/REMINDED（**不含取消/爽约**）；`met=met` → CHECKED_IN/COMPLETED。
- `GET /admin/matchmaker/meetings/options` 是唯一的下拉字典来源，键为 `matchmakers` / `candidates` / `request_status` / `record_status`。注意其 `record_status` 文案（已签到/未到场）与前端页面文案（已见面/未见面）不一致，**前端以自己页面的文案为准**。
- `matchmaker_admin_account` 表为空 → 本地无法真登录；**管理端登录接口是 `POST /api/v1/admin/matchmaker/auth/login`**（`/admin/login` 是 404）。
- ⚠️ 本地库 `matchmaker_admin_account`（0 行）与 `match_apply`（0 行）都无数据，因此牵线记录页在本地只能看到空态；无法跑真实登录的端到端验证，只能用 `openapi.json` + 直接执行 SQL 做静态核验。不要擅自往库里插测试账号。
- **本地连库/跑脚本必须用 `E:\houduan\xuanshiai\.venv\Scripts\python.exe`**（只有它有 `pymysql`/`aiomysql`）。conda 的 `yolo`/`XuanSA`/`Qjh`/`base` 均无 MySQL 驱动。pip 直连 tsinghua 镜像装包会失败。

## 后端「代码已改但服务未生效」的排查套路（重要）

- 改完后端接口后，**必须重启服务并用 `openapi.json` 复核**，否则极易误判成前端问题。
- 现象：源码写了 `response_model=Xxx`，但 `/openapi.json` 里该接口 200 响应是 `type: object, additionalProperties: true`（即旧 `-> dict` 签名）。
- 排查：`Get-NetTCPConnection -LocalPort 8000 -State Listen` 取 PID，核对该进程启动时间是否早于本次改动。不要只看源码就断定已生效。
- 处理：`taskkill /PID <pid> /F` → `./.venv/Scripts/python.exe main.py`。启动含数据库自动初始化（225 张表），约 20~30 秒 ready，**轮询 `/openapi.json` 判断就绪，别用固定 sleep**。
- 注：`config.py` 里 `debug=True` 理论上启用 uvicorn `reload`，但实测有未触发的情况，不能依赖。

## 数据库

- 连接串在 `E:\houduan\xuanshiai\.env` 的 `DATABASE_URL`（本地 root / 127.0.0.1:3306 / 库名 xuanshiai）。
- 后台账号表 `matchmaker_admin_account`；会员表 `users`；推荐名单表 `user_match_recommend`
  （`user_id` 接收方 / `recommend_user_id` 被推荐方 / `recommend_date` / `match_score` decimal(5,2) / `match_reason` varchar(255) / `recommend_source` 默认 system / `is_viewed`·`is_liked`·`is_passed` tinyint）。
- ⚠️ 本地库 `matchmaker_admin_account` 目前**无任何账号**，`user_match_recommend` 也**无数据**，因此无法跑真实登录的端到端验证；只能用 `openapi.json` + 直接执行 SQL 做静态核验。不要擅自往库里插测试账号。

## 复用组件

- 后台「搜索已注册用户并绑定」统一用 `@/components/UserCandidatePicker`（输入即搜 + 300ms 防抖 + 加载/空/失败三态 + `unavailable` 置灰）。
  需要传 `search(keyword) => Promise<UserCandidate[]>`。会员搜索可直接用 `adminEndpoints.members({ search })`（会员 CRM 列表，支持编号/昵称/手机号），把 items 映射为 `UserCandidate`。

## 事故恢复经验

- 覆盖丢失源码时，**Turbopack dev 缓存的 source map 是最佳救星**：`.next/dev/static/chunks/src_*.js.map` 的 `sections[].map.sourcesContent` 存有完整原始源码，用 Python 按文件名匹配即可原样导出。
- `git checkout -- <file>` 只回 HEAD，**丢工作树未提交改动**；`git fsck --lost-found` 的悬空 blob 多半不是目标文件，别盲试。
