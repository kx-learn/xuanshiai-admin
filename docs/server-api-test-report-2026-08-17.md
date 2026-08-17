# 服务器接口接入与测试报告

测试时间：2026-08-17  
后端地址：`https://xhztest.xyz`  
测试方式：只读 HTTP 探测、OpenAPI 比对、浏览器跨域预检、前端 TypeScript 编译。未使用账号密码、token 或任何写接口。

## 结论摘要

1. 服务可达：`/docs` 与 `/openapi.json` 均返回 `200`。
2. 跨域可用：从 `http://localhost:3000` 发往 `/api/v1/admin/dashboard` 的 OPTIONS 预检返回 `200`，允许 `authorization`、`content-type` 及 GET/POST/PATCH/DELETE 等方法。
3. 后台鉴权链路可达：概览、账号、线索、会员、红娘、门店、活动等已部署读接口在未登录下稳定返回 `401 {"detail":"请先登录红娘后台"}`。这表示路径已挂载且先经过鉴权，**不表示业务数据或字段已验收**。
4. 发现发布不一致：OpenAPI 记录了财务、商家、短视频、内容审核、顶部新接口等路由，但当前运行服务器对这些实际返回 `404 Not Found`。后端需检查“运行镜像/路由注册”与 OpenAPI 是否为同一版本。
5. 前端概览页已改接新 `GET /api/v1/admin/dashboard`；若该请求失败，保留旧 `GET /api/v1/admin/dashboard/stats` 回退。类型检查通过。

## 测试依据与状态定义

|状态|含义|
|---|---|
|`可达，待登录验收`|未带 token 返回 401；可确认路由与鉴权中间件已部署，必须使用管理员 token 再确认 200 数据结构|
|`未部署`|运行服务器返回 404；前端调用一定失败，后端需要部署/注册该路由|
|`未接入前端`|服务可能存在，但当前页面没有请求该接口或页面仍为静态空列表|
|`未测试`|当前没有合适的只读路径，或属于写操作；不能据此判断实现状态|

## 已完成的前端接入

### 概览页

- 新增 `adminEndpoints.dashboard({ from, to })`，请求：`GET /api/v1/admin/dashboard`。
- 首页按 `Asia/Shanghai` 计算最近 15 天的 `from/to`，映射服务器实际返回的 `metrics` 与 `trends`。
- 已映射真实字段：`member_count`、`lead_count`、`vip_count`、`matchmaker_count`、`online_income`、`offline_income`、`pending_withdrawal_count`、日会员/线索/净收入趋势。
- 服务器暂未返回的首页指标显示 `--`，不再用本地测试数字伪造数据。
- 回退：新接口网络失败或服务未部署时，调用旧 `GET /api/v1/admin/dashboard/stats`。

### 列表页请求通道

列表页原先的 `/api/backend/*` URL 已在浏览器中转换为直连 `https://xhztest.xyz/api/v1/*`，并携带 Bearer token。这样与首页使用同一条已通过 CORS 预检的通道，不依赖当前旧本地开发进程的服务端网络权限。

Next.js 代理仍保留为服务端可选通道，但本次旧 `localhost:3000` 进程实测对外请求报 `EACCES ...:443`，会返回 `502`；该进程不是当前环境启动，不能作为接口可用性依据。重启开发/生产进程后，应再单独验证代理。

## 按左侧菜单测试结果

|左侧菜单|已探测的服务器接口|运行结果|前端接入与下一步|
|---|---|---|---|
|概览|`/admin/bootstrap`、`/admin/dashboard`、`/admin/dashboard/stats`|均为 `401`，可达，待登录验收|首页已调用新 `/admin/dashboard`，旧 stats 仅回退；`bootstrap` 尚未绑定顶栏未读/授权状态|
|平台账号|`/admin/matchmaker/accounts`、`/accounts/login-logs`|均为 `401`，可达，待登录验收|账号管理、登录日志已有列表代理；需登录后核对分页和字段|
|客源线索|`/admin/customer-leads`、`/customer-leads/statistics`|均为 `401`，可达，待登录验收|线索列表已接代理；详情、分配、跟进、新增/编辑、配置页需逐项联调|
|会员 CRM|`/admin/matchmaker/members`、`/members/statistics`、`/admin/members/vip`|均为 `401`，可达，待登录验收|会员资料页已有列表代理；认证、行为、跟进、VIP、报表页需核对接口和页面字段|
|会员服务|`/admin/matchmaker/service-requests`、`/admin/matchmaker/meetings`|均为 `401`，可达，待登录验收|约见页面已有列表代理；牵线、预约处理、安排约会等写操作必须用管理员 token 测试状态机|
|总店红娘|`/admin/matchmaker/matchmakers`、`/assignments`|均为 `401`，可达，待登录验收|红娘列表已接代理；分派配置、分成配置/明细需要后端确认对应路由|
|分店管理|`/admin/matchmaker/branches`|`401`，可达，待登录验收|门店列表已接代理；门店成员、状态、报表可从 OpenAPI 看到，但未做登录验收|
|推广红娘|未发现专用推广红娘路由|未测试|当前 OpenAPI 没有该模块的专用资源；需后端明确是复用组织/红娘接口还是新增模块|
|合伙红娘|未发现专用合伙人、奖励、关系路由|未测试|当前 OpenAPI 未覆盖该菜单；后端需补接口或提供实际路径|
|活动报名|`/admin/activities`|`401`，可达，待登录验收|活动列表、详情、报名、状态等路由见 OpenAPI；活动配置、互选活动/记录尚未确认|
|商家联盟|`/admin/merchants`、`/merchant-products`、`/merchant-orders`|均为 `404`，未部署|OpenAPI 也未登记这三个管理端路径；当前前端页面不能接真实接口|
|短视频|`/admin/videos`、`/video-comments`、`/video-tips`|均为 `404`，未部署|当前前端页面不能接真实接口；需后端补视频、审核、评论、红包、打赏及配置接口|
|运营工具|未发现自由收款、单页、表单、礼物、二维码等路由|未测试/未接入前端|需按每项功能定义资源、写操作、导出和素材上传接口|
|财务管理|`/admin/finance/orders`、`/ledger`、`/withdrawals`、`/report`|均为 `404`，未部署|这些路径在 OpenAPI 中存在，但运行服务 404，属于发布不一致；收入、积分、提现页面当前会失败|
|系统管理|`/admin/system/basic`|`404`，未部署|系统配置、广告、外呼、短信、管理员、权限、日志路由均需要后端补齐或修复部署|
|平台配置|`/admin/platform/config`|`404`，未部署|平台基本、导航、页面、内容、收费、权限配置均未能使用|
|公众号|`/admin/wechat/config`|`404`，未部署|公众号配置、粉丝、菜单、自动回复、模板、群发接口未部署|
|小程序|`/admin/platform/miniprogram-config`|`404`，未部署|小程序参数配置接口未部署|
|应用中心|`/admin/plugins`|`404`，未部署|应用列表、启停、配置接口未部署|
|婚创学苑|`/admin/academy/categories`|`404`，未部署|该路径在 OpenAPI 中登记但运行 404；顶部“用好系统/婚创学苑”目前仅有路由外壳|
|工单反馈|内容审核 `/admin/community/moderation-items`、举报 `/admin/reports`|均为 `404`，未部署|OpenAPI 中已登记但运行 404；工单本身接口也尚未发现|
|软件授权/充值|`/admin/finance/recharge-items`|`404`，未部署|顶部授权/充值仍只有界面入口；需修复该接口部署并补真实支付写流程|

## OpenAPI 与运行服务不一致的接口

以下接口都在 `https://xhztest.xyz/openapi.json` 的 `paths` 中，但本次 GET 实测从运行服务得到 `404`：

```text
/api/v1/admin/academy/categories
/api/v1/admin/announcements
/api/v1/admin/finance/recharge-items
/api/v1/admin/finance/orders
/api/v1/admin/finance/ledger
/api/v1/admin/finance/withdrawals
/api/v1/admin/finance/report
/api/v1/admin/community/moderation-items
/api/v1/admin/reports
```

此外，商家、短视频、微信、平台配置、系统配置、小程序、应用中心在当前 OpenAPI 中没有对应的同名管理端 GET 路由，运行服务同样返回 404。

后端应优先核对：

1. `openapi.json` 是否由不同环境、不同容器或缓存版本提供。
2. 路由模块是否只导入了 schema、未注册到 FastAPI application。
3. 反向代理是否把部分 `/api/v1/admin/*` 路径转到了旧服务。
4. 服务发布后是否重启 worker，网关是否仍命中旧镜像。

## 登录后需要执行的验收

目前没有提供管理员测试账号，因此没有请求任何真实业务数据，也没有发起写操作。使用一个权限完整的测试管理员登录后，按以下顺序执行：

1. 登录：`POST /api/v1/admin/matchmaker/auth/login`，确认返回 `access_token`、`refresh_token`、`expires_in`、`account`。
2. 身份：`GET /api/v1/admin/matchmaker/auth/me`，确认账号名与权限数组。
3. 首页：`GET /api/v1/admin/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD`，确认 `metrics`、`trends` 均存在且趋势按日升序。
4. 账号、线索、会员、红娘、门店、活动：每个列表以 `page=1&page_size=1` 调用一次，确认响应为 `items/page/page_size/total/has_more` 并核对数据范围。
5. 使用最低权限账号重复第 3、4 步，确认无权限资源返回 403 或不在列表中。
6. 在测试环境对“新增线索、分配、活动状态、安排约会、审核提现”各执行一次，并确认审计日志、幂等和状态流转。

## 本次验证记录

- `npm run typecheck`：通过。
- `GET /docs`：HTTP 200。
- `GET /openapi.json`：HTTP 200，包含 372 个操作，其中 `/api/v1/admin/*` 为 115 个操作。
- 浏览器 CORS 预检：HTTP 200，允许本地前端直接携带 Bearer token 请求服务。
- 未登录读接口：可达模块均返回 401，而不是 404 或 5xx。
- 登录空请求体验证：`POST /api/v1/admin/matchmaker/auth/login` 携带 `{}` 返回 `422`，明确要求 `username` 与 `password`；未使用任何账号或密码。
- 空数据库无法在未登录状态直接验证：`GET /api/v1/admin/dashboard` 返回 `401`，不会返回空统计。必须使用甲方提供的测试管理员 token 后，才能确认空库应返回 `0`、空数组和完整分页结构。

本报告不包含真实账号、token、手机号、客户资料或财务数据。
