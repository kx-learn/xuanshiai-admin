# 管理端接口契约

## 认证

管理端不提供注册接口。管理员账号由部署人员直接写入管理员表，密码必须保存为 Argon2id 或 bcrypt 哈希。

接口前缀为 `/api/v1`：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/admin/auth/login` | 账号密码登录，成功返回 `access_token`、`refresh_token`、`token_type` 和脱敏管理员信息 |
| `GET` | `/admin/auth/me` | 校验当前 token，并返回管理员角色与权限 |
| `POST` | `/admin/auth/refresh` | 刷新 access token，refresh token 只允许轮换一次 |
| `POST` | `/admin/auth/logout` | 撤销当前会话 |

登录请求：`{"username":"admin","password":"..."}`。所有 `/admin/*`（登录、刷新、登出除外）必须同时满足：token 有效、管理员账号启用、存在 `admin` 角色且角色启用。禁止相信请求体中的 `admin_id` 作为操作者身份。

## 统一约定

列表接口接受 `page`（默认 1）、`page_size`（默认 20，最大 100）、`keyword`、`status` 和资源专属筛选字段，返回：

```json
{"items":[],"page":1,"page_size":20,"total":0,"has_more":false}
```

成功的单项接口返回资源对象；删除或无内容操作返回 `204`。错误统一返回 `{"detail":"..."}`，使用 `401/403/404/409/422/500`，不得返回 SQL 或堆栈信息。

所有 POST/PATCH/PUT 的业务写操作都必须支持 `Idempotency-Key`（8~128 个字符），服务端按管理员、请求键和接口保存结果至少 24 小时。状态流转使用数据库事务和行锁，重复处理返回 `409`。每次写操作记录管理员、目标资源、旧值、新值、请求 ID 和时间到审计日志。

## 尚需实现的管理资源

以下资源是当前前端页面需要、现有 `api/` 文档没有覆盖的契约。资源详情接口、关联详情和操作动作应按同一 REST 规则补齐：

| 资源 | 只读 | 写操作 | 必须覆盖的业务内容 |
| --- | --- | --- | --- |
| `dashboard/stats` | `GET` | - | 卡片、趋势、待处理数量，支持 `from/to` |
| `users`、`users/login-logs` | `GET` | - | 账号详情、禁用/解禁、登录 IP、失败原因 |
| `customer-leads` | `GET` | `POST/PATCH` | 线索、跟进记录、分配、来源配置 |
| `members` | `GET` | `POST/PATCH` | CRM、VIP、行为、统计、认证状态 |
| `matchmakers`、`branches` | `GET` | `POST/PATCH` | 红娘、门店、分配和分成规则 |
| `activities` | `GET` | `POST/PATCH` | 活动、报名、互选、上下线配置 |
| `merchants`、`merchant-products`、`merchant-orders` | `GET` | `POST/PATCH` | 商家、商品、订单状态和退款 |
| `videos`、`video-comments`、`video-tips` | `GET` | `POST/PATCH` | 视频审核、评论处理、打赏/红包 |
| `finance/*` | `GET` | `POST/PATCH` | 对账、结算、提现、退款、电子合同 |
| `wechat/*`、`sms/*` | `GET` | `POST/PATCH` | 配置、模板、发送记录、失败重试 |
| `system/*`、`platform/*` | `GET` | `POST/PATCH` | 管理员权限、导航、基础配置、操作日志 |

## 目前仍缺的接口

从当前 105 个页面和现有 `api/` 文档对照，除上表资源外，还应明确以下接口，否则页面仍只能做 mock：

- `GET /admin/dashboard/stats` 的趋势粒度、时区和统计口径。
- 会员、商家、活动、视频的详情接口，以及报名、订单、评论等子资源的状态动作接口。
- 文件/图片上传与签名 URL 接口；后台不能把浏览器本地路径直接写入业务表。
- 批量审核、批量分配、批量导出接口的最大数量、异步任务状态和下载地址。
- 财务对账、提现审核、退款和电子合同签署/作废的状态机与权限矩阵。
- 管理员角色、权限、会话、操作日志的查询接口。管理员创建仍不开放注册，应只允许部署脚本或受控数据库迁移。
- 系统配置的版本、发布、回滚和敏感字段脱敏接口。

这些接口在后端正式实现前，前端 endpoint 封装只能作为调用入口，不能替代数据库、权限和业务状态校验。
