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
- **实测判别遮蔽（最可靠，优于读代码）**：无 token 请求静态路径，看状态码——
  **401 = 命中正确路由**（走到了鉴权依赖）；**422 = 被 `/{id}` 路由截获**（路径参数 int 解析失败）。
  openapi 会列出所有路由（含被遮蔽的），所以**不能只看 openapi 就断定没遮蔽**，必须发请求。
  2026-09-22 用此法实测 32 个静态接口（`/meetings/requests`、`/activities/options`、`/promoters/teams` 等）全部 401，确认无遮蔽。
- ⚠️ 「静态段 vs {参数}」的**静态筛选会大量误报**：如 `/admin/members/{member_id}/behavior` 与
  `/admin/members/profile-ext/{user_id}` 理论上有冲突 URL `/admin/members/profile-ext/behavior`，
  但那不是真实业务 URL，**实践中无害**。不要据此乱调路由顺序。

## 会员详情页（MemberDetailWorkspace.tsx）

- 单文件承载全部 Tab（基础资料/自我介绍/择偶要求/私密信息/跟进/推荐匹配/牵线记录等），体量大（~3300 行），改动集中在此文件。
- 各 Tab 的筛选下拉**必须复用基础资料页的共享常量**（`OCCUPATION`、`TAG_OPTIONS`、星座/购房/吸烟/喝酒/婚况字面值），保持一致。
- 需要「服务端分页 + 前端二次切分」的 Tab（如牵线记录）写成**自持分页组件**：只接 `memberId`，内部 `load(page)`；父组件不再传 `data/loading/error`。⚠️ 改写时渲染体里的变量名必须同步替换，否则编译不过。已改为自持分页的：`LineTab`（牵线记录）、`DatingTab`（约会记录）、`BehaviorTab`（线上行为，8 个子 Tab 各调一个方向化接口）。

## 超级管理 Tab（SuperTab，key = `super`）

会员详情页最右侧的 Tab，**原先整页是写死的 mock**，现已接两个写入接口。

写入接口只有两个：
- `PATCH /admin/members/{id}/profile` → `MemberProfileUpdate`（业务字段可选，`reason` 必填且至少要有一个业务字段，否则 422）
- `PATCH /admin/members/{id}/match-quota` → `MemberMatchQuotaUpdate`（`available_count` 0-1000000 + `reason`，**直接设置次数，不是增减**）

**页面控件 ↔ 接口字段映射**（能接的只有 6 个，其余全是占位）：

| 控件 | 字段 | 预填来源 |
|---|---|---|
| 实名认证 | `auth_status` | `MemberDetail.auth_status` |
| 姓名 | `real_name` | `RealnameReviewItem.real_name` |
| 实名信息（身份证） | 无 | 只读展示 `id_card_masked` |
| 房产认证 | `house_verified` | `memberCertifications().house.status` |
| 学历认证 | `education_verified` | `memberCertifications().education.status` |
| 单身承诺 | `is_single_pledge`（布尔） | ❌ 无来源，留空 |
| 牵线剩余 | `available_count` | `memberMatchQuota()` |

**无接口字段（保留占位，不要给它们编接口）**：账号绑定、置顶推荐、新人推荐、线上VIP、线下VIP、
隐私设置「对非相亲会员显示头像」、显示排序、推广红娘、牵线有效期。

- ⚠️ **认证枚举**：`CERT_STATUS_OPTIONS = ["未认证","待审核","已认证","认证失败"]`，
  **下标即枚举值**（0 未提交/1 审核中/2 已通过/3 未通过）。该页原有 mock 的顺序是
  「未认证/已认证/待审核/认证失败」，直接当索引会错位，必须用这个常量。
- 「单身承诺」因接口是布尔，UI 用「否 / 是」两档（原为 4 档 mock）。
- 「牵线剩余」按用户决定用**「设为 N 次」**（不是「增加」），旁显示「当前 X 次」参照。
- 认证类字段走 **diff 提交**：`initial` 快照对比，只提交改动过的字段；界面值为空 = 不修改。
- 配额表真名 **`matchmaker_service_quota`**（不是 `matchmaker_match_quota`）。
- `memberSuperInfo`（`GET /{id}/super-info`，返回未结构化 dict）在本次改动后**已无调用方**。

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

### 线上行为（8 个方向化接口）

`/admin/members/` 下 8 个：`browse-history`、`visitors`、`favorites`、`favorites/received`、`superlikes`、`superlikes/received`、`gifts`、`gifts/received`，统一返回 `MemberBehaviorPage`。

- **「发出 / 收到」只在传了 `member_id` 时才有区别**：`service/_build()` 里 `direction` 仅决定 member_id 过滤 `u.id`（发起人）还是 `t.id`（被查人）。**不传 member_id 时两种方向返回完全相同的全平台记录**，所以独立「线上行为」页不做方向切换（做了也是假开关），方向只对会员详情有意义。
- 「收到」类接口返回的 `user_id` 是**行为发起人**，`target_user_id` 才是被查会员；「发出」类反之。渲染「对方是谁」必须按方向取字段。
- 可选参数**按类别精确暴露**（2026-09-22 收紧，此前 favorites 也暴露了无意义的 min_times/pay_status）：
  browse 类 = `search` + `min_times`；favorite 类 = 仅 `search`；superlike / gift 类 = `search` + `pay_status`。
  聚合接口 `/behavior-events`（含 `/{member_id}/behavior-events`）因 `category` 运行时才定，仍暴露全部可选参数。
  未声明的 query 参数被 FastAPI 直接丢弃，所以**收紧了也不会让旧调用方报错**。`page_size` 上限 100。
- 网友举报**没有专用接口**，只能走聚合的 `/behavior-events?category=report`（也是唯一支持举报状态筛选的入口）。
- 删除走 `DELETE /admin/members/behavior-events/{category}/{event_id}`，白名单仅 `superlike|gift|report`。
- ⚠️ 已修的既有 bug：browse 分支 count SQL 的派生表原本没暴露 `browse_times` 别名，导致 `min_times`（「3次/5次以上浏览」筛选）一开就 MySQL 1054 → 500。派生表需补 `COUNT(*) AS browse_times`。
- **遗留重复接口（未删，避免破坏未知调用方）**：
  - `GET /admin/members/behavior/all`（`member_follow_up_admin.py`）→ 早期版，200 返回**未结构化的 `dict`**，已被 `/behavior-events` 取代。
  - `GET /admin/members/{member_id}/behavior` → 返回 `member_follow_up_admin.MemberBehaviorItem`（字段少，仅 page/page_size），已被 `/{member_id}/behavior-events` 取代。
  - 前端 `admin-endpoints.ts` 的 `memberBehavior` 封装已无任何调用方（死代码）。
- 同模块另有 `PATCH /admin/members/{member_id}/profile`（统一改基础/认证/隐私字段，body `MemberProfileUpdate` required 仅 `reason`，200 `MemberProfileUpdateResponse`），定义在 `member_records_admin.py`，**不属于这 8 个行为接口**。

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
