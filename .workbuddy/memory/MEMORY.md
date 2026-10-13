# 项目长期记忆 — xuanshiai-admin（玄爱红娘后台）

## 环境

- 前端：Next.js 16 App Router + TS。工作区 `C:\Users\ysc02\Desktop\xuanshiai-admin`（另有 `E:\HTML\xuanshiai-admin`）。
- 后端：FastAPI + SQLAlchemy + MySQL，`E:\houduan\xuanshiai`（副本 `xuanshiai/`）。`.venv`（`./.venv/Scripts/python.exe main.py`，8000）。
- 前端走 `/api/backend` 代理 → `.env` 的 `ADMIN_API_BASE_URL`。dev 模式改 `src/` 热加载。
- **本地连库/跑脚本只用 `E:\houduan\xuanshiai\.venv\Scripts\python.exe`**（唯一有 pymysql/aiomysql）。
- 线上真实契约快照：`.workbuddy/refsite/live_openapi.json`（663 路由 / admin 296）。刷新：`curl -s https://xhztest.xyz/openapi.json -o <路径>`。

## 硬规范

- **改长文件只用 Edit 精确替换，绝不用 Write 覆盖**（曾把 2914 行 `admin-endpoints.ts` 冲成 10 行）。Write 仅用于新建。
- 子 Tab（弃海客源/弃海记录/约会管理/合同管理等）**一律单页内 Tab 切换，禁止跨页 Link 或 dynamic 页间嵌套**。显隐（须知/统计卡/按钮组）逐 Tab 对照原站截图确认。
- 表格密集对齐 + 勾选列 + `au-page-btn`/`au-page-num` 分页 + CSS 绘制箭头（禁 Unicode 箭头）。见 `AGENTS.md`。
- 写弹层/下拉样式前**先全局搜带 `!important` 的宽泛规则**——高特异性会静默污染子元素（白底白字看不见）。覆盖时特异性须 ≥ 原规则且带 `!important`。悬浮下拉加 `::after` 桥接块防闪烁。
  - 实例：`.lead-tabs > div > button` 曾把右侧 3 个操作按钮染成白底白字；修法是收窄为 `> div:first-child > button`。
- `admin-endpoints.ts`：`adminEndpoints` + `list()/create()/update()`。`AdminListQuery` **不支持数组值**；多选筛选用 `AdminListQueryMulti` + `listMulti()`。
- 报错必须人性化：`admin-api.ts` 的 `toFriendlyError()` 把 422 翻中文；`page_size>100` 在请求层自动钳制。

## 后端通用配置接口（重要）

`GET|PATCH /api/v1/admin/configs/{namespace}`，body `AdminConfigUpdate{version, config(dict), change_summary}`，另有 `GET /{namespace}/audit-logs`。
→ platform-*、system-setting-*、finance-config、power-config、tool-theme、xixun-menu、group-menu 等 **22 个静态配置页可直接接它，后端零改动**。菜单树另有 `GET /admin/menus/tree`。
**新增装修/开关类页面时，先考虑走这个接口，不要一上来就要求后端加接口。**

## 后端路由遮蔽坑

FastAPI **先注册先命中**。`member_records_admin`（136 行）早于 `member_media_admin`（141 行），后者 `/{id}/xxx` 被遮蔽。已重命名让位：`recommendations→recommend-history`、`media→media-records`、`private-info→private-info-records`。
- **实测判别（最可靠）**：无 token 请求静态路径 —— **401 = 命中正确路由，422 = 被 `/{id}` 截获**。只看 openapi 不够（它列出被遮蔽的路由）。
- 「静态段 vs {参数}」静态筛选会大量误报，不要据此乱调顺序。

## 会员详情页（MemberDetailWorkspace.tsx，~3300 行）

- 各 Tab 筛选下拉**必须复用基础资料页共享常量**（`OCCUPATION`/`TAG_OPTIONS`/星座/购房/婚况等）。
- 需「服务端分页 + 前端二次切分」的 Tab 写成**自持分页组件**（只接 `memberId`，内部 `load(page)`）。已改：`LineTab`、`DatingTab`、`BehaviorTab`。⚠️ 改写时渲染体变量名须同步替换。
- **SuperTab** 只有两个写入接口：`PATCH /admin/members/{id}/profile`（`reason` 必填 + 至少一个业务字段）、`PATCH /admin/members/{id}/match-quota`（**直接设置次数，非增减**）。
  可接 6 项：`auth_status`/`real_name`/`house_verified`/`education_verified`/`is_single_pledge`(布尔)/`available_count`。
  **其余全占位，不要编接口**：账号绑定、置顶/新人推荐、线上/线下VIP、隐私显示头像、显示排序、推广红娘、牵线有效期。
  ⚠️ `CERT_STATUS_OPTIONS = ["未认证","待审核","已认证","认证失败"]`，**下标即枚举值**。认证类走 diff 提交。配额表真名 `matchmaker_service_quota`。

## 接口数据口径

- 牵线记录 `/{id}/match-records` 返回**发起+收到双向**，`total` 是合计；子 Tab 切分只能前端做。
- `/{id}/match-quota` 无账户返回全 0（非 404）。`match_apply.status`：0待处理/1已接受/2已拒绝/3已失效。
- **约见申请**：SUBMITTED→CONTACTED→ACCEPTED，各可转 DECLINED/CLOSED；Admin 不能写 SUBMITTED；`DECLINED/CLOSED` **必须带 reason（否则 422）**且退还次数；**只有 ACCEPTED 能排期**（`POST .../schedule`）。
- **约会记录**：SCHEDULED/REMINDED/CHECKED_IN/COMPLETED/CANCELLED/NO_SHOW；`CHECKED_IN|COMPLETED` 计「成功见面」。`met=wait`→SCHEDULED/REMINDED；`met=met`→CHECKED_IN/COMPLETED。
- `GET /admin/matchmaker/meetings/options` 是唯一下拉字典源；其 record_status 文案与前端不一致，**以前端页面文案为准**。
- 登录接口 `POST /api/v1/admin/matchmaker/auth/login`（`/admin/login` 是 404）。本地账号表无数据，**无法真登录端到端验证，不要擅自插测试账号**。
- **会员弃海口径**：弃海 = 来源客源 `status=LOST`。会员列表 `vip_filter` 枚举只有 `all/offline_vip/online_vip/store_verified/exclude_abandoned`——**能"排除"不能"只要"**，故「弃海会员(N)」计数取不到。最小修法：加 `only_abandoned` 枚举（否则新增 `/admin/members/abandoned|abandonments|{id}/abandon`）。客源侧弃海三条接口已存在。

### 线上行为（8 个方向化接口）

`/{member_id}` 下 `browse-history`/`visitors`/`favorites`(+`received`)/`superlikes`(+`received`)/`gifts`(+`received`) → `MemberBehaviorPage`。
- **「发出/收到」只在传 member_id 时才有区别**（direction 决定过滤 u.id 还是 t.id）；不传时两者完全相同 → 独立页不做方向切换。
- 「收到」类 `user_id` 是**发起人**，`target_user_id` 才是被查会员；「发出」类反之。
- 可选参数按类别暴露：browse=`search`+`min_times`；favorite=仅 `search`；superlike/gift=`search`+`pay_status`。`page_size` 上限 100。未声明 query 被 FastAPI 静默丢弃。
- 网友举报无专用接口，只能 `/behavior-events?category=report`。删除 `DELETE /behavior-events/{category}/{event_id}`，白名单 `superlike|gift|report`。
- 已修 bug：browse 分支 count SQL 派生表须 `COUNT(*) AS browse_times`，否则 `min_times` 触发 MySQL 1054。
- 遗留重复接口（未删）：`/behavior/all`（未结构化 dict）、`/{member_id}/behavior`（字段少）。

## 后端「代码改了但没生效」

改完**必须重启 + `openapi.json` 复核**。源码写了 `response_model` 但 openapi 仍是 `additionalProperties:true` = 旧 `-> dict` 签名 = 进程没重启。
- `Get-NetTCPConnection -LocalPort 8000 -State Listen` 取 PID 核对启动时间 → `taskkill /PID /F` → 重启。
- 启动含建表（225 张）约 20~30s，**轮询 `/openapi.json` 判断就绪，别用固定 sleep**。`debug=True` 的 reload 实测有未触发情况。

## 数据库

连接串在 `E:\houduan\xuanshiai\.env` 的 `DATABASE_URL`（root/127.0.0.1:3306/`xuanshiai`）。
表：账号 `matchmaker_admin_account`、会员 `users`、推荐 `user_match_recommend`（`user_id` 接收方 / `recommend_user_id` 被推荐方 / `match_score` decimal(5,2) / `recommend_source` 默认 system / `is_viewed`·`is_liked`·`is_passed`）；配额表 `matchmaker_service_quota`。

## 复用组件

「搜索已注册用户并绑定」统一用 `@/components/UserCandidatePicker`（输入即搜 + 300ms 防抖 + 加载/空/失败三态 + `unavailable` 置灰）。传 `search(keyword)`，配合 `adminEndpoints.members({search})`。

## 事故恢复

覆盖丢失源码时，**Turbopack dev 缓存的 source map 里有完整原始源码**：`.next/dev/static/chunks/src_*.js.map` 的 `sections[].map.sourcesContent`，用 Python 按文件名导出。`git checkout --` 只回 HEAD，会丢未提交改动。

## 缺口文档

- `docs/后端接口缺失清单.md` —— 已用线上 openapi 逐条复核的后端缺口（A 类 11 组需新增 / B 类 3 处字段缺 / C 类 42 页纯前端未接）。
- `docs/原站对比-功能缺口与后端清单.md` —— 与原站的功能比对。
- `.workbuddy/refsite/` —— 原站抓取产物（115 页 JSON、图片下载脚本、openapi 快照）。
