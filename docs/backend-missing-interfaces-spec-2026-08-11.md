# 红娘后台缺失接口详细规格

版本：2026-08-11

## 1. 文档目的

本文件专门记录前端已有页面需要、但后端 `E:\houduan\xuanshiai` 当前没有完整实现的接口和功能。

接口建议不是凭页面名称猜测，而是基于后端现有代码中的以下内容整理：

- `app/api/routes`
- `app/schemas`
- `app/services`
- `app/api/dependencies.py`
- `database_setup_marriage.py`

本文件中的接口均为**建议新增接口**，不是已经存在的接口。后端开发时应先确认数据库表、状态流转和权限后再实现。

后端项目本次只读，没有修改任何后端代码。

## 2. 统一前提

### 2.1 API 前缀

所有接口完整地址默认：

```text
https://xhztest.xyz/api/v1
```

例如：

```text
GET https://xhztest.xyz/api/v1/admin/matchmaker/accounts
```

### 2.2 鉴权

建议所有新增后台接口使用现有独立红娘后台鉴权：

```text
Authorization: Bearer {matchmaker_admin_access_token}
```

对应依赖：

```python
get_current_matchmaker_admin
```

不要把独立红娘后台 Token 和 `get_current_admin` 使用的普通用户管理员 Token 混用。

当前已存在的红娘后台登录接口：

```text
POST /api/v1/admin/matchmaker/auth/login
POST /api/v1/admin/matchmaker/auth/refresh
GET  /api/v1/admin/matchmaker/auth/me
POST /api/v1/admin/matchmaker/auth/logout
```

### 2.3 统一分页

所有新增列表接口统一使用：

```text
page: int = 1
page_size: int = 20
```

限制建议：

```text
page >= 1
1 <= page_size <= 100
```

统一返回：

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 0,
  "has_more": false
}
```

现有后端有一个例外：`GET /admin/matchmaker/branches` 当前返回 `list[StoreResponse]`，没有分页。建议补接口时直接改成分页，前端不要为旧返回格式增加特殊逻辑。

### 2.4 统一错误格式

建议新增后台接口统一返回：

```json
{
  "code": "RESOURCE_STATUS_CONFLICT",
  "message": "当前状态不允许执行该操作",
  "request_id": "req_20260811_xxx",
  "details": {}
}
```

建议状态码：

| 状态码 | 使用场景 |
|---:|---|
| 400 | 请求格式错误 |
| 401 | Token 缺失、无效、过期 |
| 403 | 没有接口权限或数据范围权限 |
| 404 | 资源不存在 |
| 409 | 状态冲突、重复创建、重复提交 |
| 422 | Pydantic 或业务参数校验失败 |
| 429 | 登录、发送消息、测试发送等频率超限 |

### 2.5 写操作幂等

以下接口建议要求请求头：

```text
Idempotency-Key: {client-generated-key}
```

适用范围：

- 创建后台账号
- 创建会员
- 创建红娘
- 创建活动
- 修改分配关系
- VIP 开通/续期/取消
- 退款
- 提现审核
- 批量审核
- 微信/短信发送
- 合同发布/作废

同一个幂等键重复请求时，应返回第一次请求的结果，不能重复写入业务数据。

## 3. P0：必须优先补齐

## 3.1 红娘后台账号管理

### 对应前端页面

- `reg-user-all`
- `reg-user-log`
- `system-setting-admin-user`

### 当前后端情况

后端已有 `matchmaker_admin_account` 和 `matchmaker_admin_session` 的登录、刷新、退出逻辑，但没有账号列表、新增、编辑、停用、重置密码、登录日志后台接口。

从 `app/services/matchmaker_admin_auth.py` 可以确认：

- 账号状态必须为 `1` 才能登录。
- 账号密码使用哈希校验。
- 登录失败会增加 `failed_count`。
- 连续失败达到 5 次会锁定 15 分钟。
- 登录会记录 `last_login_at` 和 `last_login_ip`。
- Session 有 `status`、`revoked_at`、`access_expire_at`、`refresh_expire_at`。

### 建议接口

```text
GET   /api/v1/admin/matchmaker/accounts
POST  /api/v1/admin/matchmaker/accounts
GET   /api/v1/admin/matchmaker/accounts/{account_id}
PATCH /api/v1/admin/matchmaker/accounts/{account_id}
PATCH /api/v1/admin/matchmaker/accounts/{account_id}/status
POST  /api/v1/admin/matchmaker/accounts/{account_id}/reset-password
GET   /api/v1/admin/matchmaker/accounts/{account_id}/sessions
POST  /api/v1/admin/matchmaker/accounts/{account_id}/sessions/revoke-all
GET   /api/v1/admin/matchmaker/accounts/login-logs
```

### 权限建议

建议至少拆分：

```text
admin_account:read
admin_account:write
admin_account:password_reset
admin_account:session_revoke
admin_log:read
```

只有超级管理员或具备 `admin_account:write` 的账号可以新增、停用、重置其他后台账号。

### 列表查询参数

```text
page: int
page_size: int
username: string，可模糊搜索
display_name: string，可模糊搜索
status: int，可选，1 启用，2 停用，3 锁定
matchmaker_user_id: int，可选
created_from: datetime，可选
created_to: datetime，可选
last_login_from: datetime，可选
last_login_to: datetime，可选
sort_by: created_at|last_login_at|username
sort_order: asc|desc
```

### 新增请求

```json
{
  "username": "operator01",
  "password": "AtLeast8Chars",
  "display_name": "运营人员",
  "matchmaker_user_id": null,
  "permissions": [
    "member:read",
    "lead:read",
    "lead:write"
  ]
}
```

校验规则：

- `username` 复用现有登录 Schema：`^[A-Za-z0-9_.-]+$`。
- 长度 3-64。
- 初始密码长度 8-128。
- 用户名唯一，冲突返回 `409`。
- 密码只能保存哈希，不能保存明文。
- `permissions` 最多 50 个。
- 不能把超级管理员权限授予普通账号，除非当前操作者拥有超级管理员权限。

### 账号列表返回

```json
{
  "items": [
    {
      "id": 1,
      "username": "operator01",
      "display_name": "运营人员",
      "matchmaker_user_id": null,
      "status": 1,
      "failed_count": 0,
      "locked_until": null,
      "last_login_at": "2026-08-11T10:00:00Z",
      "last_login_ip": "192.0.2.10",
      "permissions": ["member:read", "lead:read"],
      "created_at": "2026-08-01T10:00:00Z",
      "updated_at": "2026-08-11T10:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1,
  "has_more": false
}
```

返回中不要包含：

- `password_hash`
- `refresh_token_hash`
- `access_token_hash`

### 编辑请求

```json
{
  "display_name": "招商主管",
  "matchmaker_user_id": 12,
  "permissions": [
    "member:read",
    "member:write",
    "lead:read",
    "lead:write"
  ]
}
```

不建议允许通过普通编辑接口直接修改 `username`。如确需修改，应单独提供账号更名接口并记录审计。

### 状态修改请求

```json
{
  "status": 1,
  "reason": "恢复账号"
}
```

建议状态：

```text
1 ENABLED
2 DISABLED
3 LOCKED
```

停用账号时建议同时：

1. 设置账号状态为停用。
2. 撤销该账号所有有效 Session。
3. 写入审计日志。
4. 保留历史登录记录。

### 重置密码请求

```json
{
  "new_password": "NewPassword123",
  "reason": "管理员重置"
}
```

重置密码后应撤销全部旧 Session，避免旧 Token 继续使用。

### 登录日志返回

```json
{
  "id": 1001,
  "account_id": 1,
  "username": "operator01",
  "login_status": 1,
  "ip": "192.0.2.10",
  "user_agent": "Chrome/...",
  "device_id": null,
  "failure_reason": null,
  "created_at": "2026-08-11T10:00:00Z"
}
```

注意：当前用户登录日志表 `user_login_log` 已存在，但红娘后台账号登录使用独立账号表和 Session 表。建议新增独立后台登录日志表，不能直接把普通用户日志当后台账号日志。

## 3.2 会员新增、编辑和认证详情

### 对应前端页面

- `love-user-list`
- `love-user-auth`
- `love-user-statistics`
- `love-user-behavior`
- `love-user-follow-up`

### 当前后端情况

已有：

```text
GET   /api/v1/admin/matchmaker/members
GET   /api/v1/admin/matchmaker/members/{member_id}
PATCH /api/v1/admin/matchmaker/members/{member_id}/status
GET   /api/v1/admin/members/{member_id}/follow-ups
POST  /api/v1/admin/members/{member_id}/follow-ups
GET   /api/v1/admin/members/{member_id}/behavior
GET   /api/v1/admin/members/{member_id}/behavior/login-logs
GET   /api/v1/admin/members/vip
PATCH /api/v1/admin/members/{member_id}/vip
```

现有 `MemberDetail` 字段只有：

```text
id、nickname、phone、gender、status、is_vip、vip_end_at、
matchmaker_id、created_at、avatar、birthday、is_married、
residence_city_code
```

没有会员新增、编辑和认证详情接口。

### 建议接口

```text
POST  /api/v1/admin/matchmaker/members
PATCH /api/v1/admin/matchmaker/members/{member_id}
GET   /api/v1/admin/matchmaker/members/{member_id}/certifications
GET   /api/v1/admin/matchmaker/members/{member_id}/certifications/{kind}
GET   /api/v1/admin/matchmaker/members/{member_id}/audit-logs
```

### 新增会员请求

```json
{
  "phone": "13812345678",
  "nickname": "张三",
  "gender": 1,
  "birthday": "1995-03-10",
  "is_married": 1,
  "avatar": "https://cdn.example.com/avatar.jpg",
  "residence_province_code": "11",
  "residence_city_code": "110100",
  "residence_district_code": "110101",
  "remark": "线下录入会员"
}
```

建议规则：

- 手机号格式复用 `auth.py` 的大陆手机号规则。
- 手机号唯一，重复返回 `409`。
- `gender` 使用现有代码的 `1/2`。
- `is_married` 使用现有 `ProfileUpdateRequest` 的 `1/2/3`。
- 后台代录入会员必须记录 `created_by`。
- 如果没有真实登录密码，应明确账号只能短信登录，不能生成弱默认密码。
- 手机号返回列表时默认脱敏。

### 编辑会员请求

```json
{
  "nickname": "张三",
  "gender": 1,
  "birthday": "1995-03-10",
  "is_married": 1,
  "avatar": "https://cdn.example.com/avatar.jpg",
  "occupation": "产品经理",
  "industry": "互联网",
  "education_level": 6,
  "income": 20000,
  "residence_province_code": "11",
  "residence_city_code": "110100",
  "residence_district_code": "110101",
  "self_intro": "个人介绍",
  "remark": "后台备注"
}
```

建议拆分公共资料和后台备注：

```text
PATCH /members/{id}/profile
PATCH /members/{id}/admin-note
```

这样可以避免后台备注意外展示给普通用户。

### 认证类型

根据 `app/schemas/certifications.py` 和 `app/schemas/admin.py`，现有认证类型为：

```text
education
house
marriage
```

用户侧认证状态已明确：

```text
0 未提交
1 审核中
2 已通过
3 未通过
```

### 认证汇总返回

```json
{
  "user_id": 10,
  "education": {
    "kind": "education",
    "status": 1,
    "material_submitted": true,
    "submitted_at": "2026-08-11T09:00:00Z",
    "reviewed_at": null,
    "fail_reason": null,
    "next_action": "待审核"
  },
  "house": {
    "kind": "house",
    "status": 0,
    "material_submitted": false,
    "submitted_at": null,
    "reviewed_at": null,
    "fail_reason": null,
    "next_action": "待提交"
  },
  "marriage": {
    "kind": "marriage",
    "status": 2,
    "material_submitted": true,
    "submitted_at": "2026-08-01T09:00:00Z",
    "reviewed_at": "2026-08-02T09:00:00Z",
    "fail_reason": null,
    "next_action": "已通过"
  }
}
```

### 认证详情返回

```json
{
  "user_id": 10,
  "kind": "education",
  "status": 1,
  "submitted_at": "2026-08-11T09:00:00Z",
  "reviewed_at": null,
  "fail_reason": null,
  "education": "本科",
  "material_urls": [
    {
      "id": 99,
      "url": "https://signed.example.com/...",
      "thumbnail_url": "https://signed.example.com/thumb..."
    }
  ],
  "reviewer_id": null,
  "reviewer_name": null,
  "audit_history": []
}
```

身份证、房产证和婚姻材料必须使用短期签名 URL，并记录 URL 生成者和过期时间。

## 3.3 红娘创建、编辑和完整筛选

### 对应前端页面

- `love-matchmaker-list`
- `branch-matchmaker-list`
- `poplove-matchmaker-list`
- `love-matchmaker-distribution`

### 当前后端情况

已有红娘列表只有 `page` 和 `page_size`，没有昵称、手机号、门店、地区、接单状态筛选，也没有创建和编辑接口。

现有 `MatchmakerCard` 由红娘公开资料组成，不能完全满足后台编辑。

### 建议接口

```text
POST  /api/v1/admin/matchmaker/matchmakers
PATCH /api/v1/admin/matchmaker/matchmakers/{matchmaker_id}
GET   /api/v1/admin/matchmaker/matchmakers/{matchmaker_id}/statistics
GET   /api/v1/admin/matchmaker/matchmakers/{matchmaker_id}/services
GET   /api/v1/admin/matchmaker/matchmakers/{matchmaker_id}/audit-logs
```

### 列表参数

```text
page
page_size
search: 昵称、手机号、账号
nickname
phone
status: 1 接单，2 停用
application_status: 0 待审核，1 通过，2 驳回，3 暂停
branch_id
region_code
is_available: true/false
created_from
created_to
sort_by: created_at|success_count|rating_score
sort_order: asc|desc
```

### 列表返回

```json
{
  "id": 12,
  "user_id": 20,
  "nickname": "红娘小王",
  "phone_masked": "138****0000",
  "avatar": "https://cdn.example.com/avatar.jpg",
  "intro": "从业介绍",
  "certification_tags": ["service_matchmaker"],
  "application_status": 1,
  "status": 1,
  "is_available": true,
  "branch_id": 3,
  "branch_name": "北京门店",
  "success_count": 12,
  "rating_score": 4.8,
  "pending_service_count": 2,
  "active_service_count": 5,
  "created_at": "2026-08-01T00:00:00Z"
}
```

### 新增/编辑字段

```json
{
  "user_id": 20,
  "intro": "红娘介绍",
  "avatar": "https://cdn.example.com/avatar.jpg",
  "specialties": ["婚恋咨询", "线下约见"],
  "expected_price": 299,
  "branch_id": 3,
  "is_available": true,
  "sort": 10,
  "remark": "后台备注"
}
```

后端已有 `MatchmakerApplicationDetails`，其中包含：

```text
wechat
avatar
specialties
expected_price
success_cases
```

建议红娘编辑接口复用这些字段，但不要直接修改原始申请记录；应写入红娘运营资料表或版本记录。

### 状态规则

现有状态至少涉及两层：

1. `user_matchmaker_apply.status`：申请状态。
2. `user_role.status`：接单角色状态。

当前 `/matchmakers/{id}/status` 的代码会：

- 查询 `application_type = service_matchmaker` 且申请 `status = 1`。
- 更新 `user_role.role_code = service_matchmaker` 的 status。
- status 为 `2` 时写入 `suspended_at` 和 `suspension_reason`。

新增编辑接口不能把申请状态和接单状态混成一个字段。

## 3.4 门店完整管理

### 对应前端页面

- `mendian-list`
- `branch-config`
- `branch-matchmaker-list`
- `branch-report-list`

### 当前后端情况

已有组织服务：

```text
POST /api/v1/organizations/stores
GET  /api/v1/organizations/stores
GET  /api/v1/organizations/stores/{store_id}
POST /api/v1/organizations/stores/{store_id}/members
```

红娘后台兼容接口：

```text
GET  /api/v1/admin/matchmaker/branches
POST /api/v1/admin/matchmaker/branches
GET  /api/v1/admin/matchmaker/branches/{branch_id}
POST /api/v1/admin/matchmaker/branches/{branch_id}/members
```

现有 `organization.py` 已体现的规则：

- 门店 `code` 唯一。
- `org_type` 必须是 `store`。
- 一个门店只能有一个有效 `store_manager`。
- 同一用户不能重复成为同一门店同一角色的有效成员。
- 新增成员会写 `organization_member` 和审计日志。

### 建议接口

```text
GET    /api/v1/admin/matchmaker/branches
PATCH  /api/v1/admin/matchmaker/branches/{branch_id}
PATCH  /api/v1/admin/matchmaker/branches/{branch_id}/status
DELETE /api/v1/admin/matchmaker/branches/{branch_id}
GET    /api/v1/admin/matchmaker/branches/{branch_id}/members
POST   /api/v1/admin/matchmaker/branches/{branch_id}/members
PATCH  /api/v1/admin/matchmaker/branches/{branch_id}/members/{member_id}
DELETE /api/v1/admin/matchmaker/branches/{branch_id}/members/{member_id}
GET    /api/v1/admin/matchmaker/branches/{branch_id}/report
```

### 门店列表参数

```text
page
page_size
code
name
region_code
status: 1 正常，2 停用，3 注销
auto_redirect: true/false
search
```

### 编辑门店请求

```json
{
  "name": "北京旗舰店",
  "display_name": "北京旗舰店",
  "region_code": "110100",
  "auto_redirect": true,
  "remark": "门店说明"
}
```

`code` 建议创建后不可修改，避免影响历史分配和推广数据。

### 门店状态请求

```json
{
  "status": 2,
  "reason": "门店暂停营业",
  "effective_at": "2026-08-11T12:00:00Z"
}
```

停用门店时建议：

- 不允许新资源自动分配到该门店。
- 保留历史资源归属。
- 现有红娘和会员分配不自动删除。
- 返回当前有效成员数和有效分配数，供前端二次确认。

### 门店成员新增

现有 Schema 已明确：

```json
{
  "user_id": 20,
  "role_code": "store_matchmaker"
}
```

`role_code` 只允许：

```text
store_manager
store_matchmaker
```

### 门店报表返回建议

```json
{
  "branch_id": 3,
  "period": {
    "from": "2026-08-01",
    "to": "2026-08-11"
  },
  "member_count": 120,
  "active_assignment_count": 88,
  "new_assignment_count": 15,
  "service_order_count": 23,
  "completed_service_count": 12,
  "revenue": 6888.00,
  "commission_amount": 1377.60,
  "matchmaker_count": 8
}
```

金额字段建议使用 Decimal，并明确单位为元。

## 3.5 资源分配配置、修改和历史

### 对应前端页面

- `love-matchmaker-apportion`
- `love-matchmaker-distribution`
- `love-matchmaker-distribution-details`
- `branch-distribution-list`
- `branch-report-list`

### 当前后端情况

现有 `assign_resource` 已明确：

1. `matchmaker_id` 和 `organization_id` 至少一个。
2. 如果有 `matchmaker_id`，必须具备 `service_matchmaker` 有效角色。
3. 如果有 `organization_id`，必须是有效门店。
4. 同一会员已有有效分配时，先把旧记录设置为 `status = 2`，写入 `ended_at` 和 `end_reason = reassigned`。
5. 新记录写入 `resource_assignment`。
6. 写入 `business_audit_log`。

现有查询只支持：

```text
page、page_size、user_id、matchmaker_id
```

### 建议接口

```text
GET   /api/v1/admin/matchmaker/assignment-config
PATCH /api/v1/admin/matchmaker/assignment-config
GET   /api/v1/admin/matchmaker/assignments
GET   /api/v1/admin/matchmaker/assignments/{assignment_id}
POST  /api/v1/admin/matchmaker/assignments
PATCH /api/v1/admin/matchmaker/assignments/{assignment_id}
POST  /api/v1/admin/matchmaker/assignments/{assignment_id}/end
GET   /api/v1/admin/matchmaker/assignments/{assignment_id}/history
```

### 分配列表参数

```text
page
page_size
user_id
matchmaker_id
organization_id
status: 1 有效，2 已结束
source: manual|promotion|default|self_created
effective_from
effective_to
ended_from
ended_to
search: 会员昵称/手机号/红娘昵称/门店名称
```

### 分配详情返回

```json
{
  "id": 100,
  "user_id": 10,
  "user": {
    "id": 10,
    "nickname": "会员A",
    "phone_masked": "138****0000"
  },
  "organization_id": 3,
  "organization_name": "北京门店",
  "matchmaker_id": 20,
  "matchmaker_name": "红娘小王",
  "source": "manual",
  "status": 1,
  "assigned_by": 1,
  "effective_at": "2026-08-11T10:00:00Z",
  "ended_at": null,
  "end_reason": null
}
```

### 修改分配请求

```json
{
  "organization_id": 4,
  "matchmaker_id": 21,
  "reason": "按区域重新分配",
  "effective_at": "2026-08-12T00:00:00Z"
}
```

如果 `effective_at` 是未来时间，建议使用定时任务生效；如果只支持立即生效，则后端应明确返回实际生效时间。

### 自动分配配置

```json
{
  "enabled": true,
  "strategy": "ROUND_ROBIN",
  "region_rules": [
    {
      "region_code": "110100",
      "branch_id": 3,
      "matchmaker_ids": [20, 21]
    }
  ],
  "gender_rules": {
    "male": [20],
    "female": [21]
  },
  "max_active_load": 50,
  "fallback_branch_id": 3,
  "fallback_matchmaker_id": 20
}
```

建议 `strategy` 至少支持：

```text
ROUND_ROBIN
LEAST_LOAD
REGION_FIRST
MANUAL_ONLY
```

## 3.6 财务订单和提现列表

### 对应前端页面

- `system-finance-order`
- `finance-statistic`
- `system-cashout-history`
- `system-credit-history`
- `free-pay`
- `free-form`

### 当前后端情况

后端已有：

```text
POST  /api/v1/admin/finance/orders/{order_id}/settle
POST  /api/v1/admin/finance/orders/{order_id}/refund
GET   /api/v1/admin/finance/report
PATCH /api/v1/admin/finance/withdrawals/{withdrawal_id}
```

但没有后台订单列表、订单详情、提现列表和提现详情。

现有支付订单字段来自 `PaymentOrderResponse`：

```text
id、order_no、user_id、product_type、product_name、
amount、status、pay_time、created_at
```

结算代码还会使用：

```text
service_product_id
matchmaker_id
service_request_id
transaction_id
```

### 建议接口

```text
GET /api/v1/admin/finance/orders
GET /api/v1/admin/finance/orders/{order_id}
GET /api/v1/admin/finance/withdrawals
GET /api/v1/admin/finance/withdrawals/{withdrawal_id}
GET /api/v1/admin/finance/ledger
GET /api/v1/admin/finance/commission-entries
GET /api/v1/admin/finance/commission-entries/{entry_id}
```

### 订单列表参数

```text
page
page_size
order_no
user_id
user_search
product_type
product_name
status: 0 待支付，1 已支付，2 已关闭，3 已退款
service_product_id
matchmaker_id
created_from
created_to
pay_from
pay_to
sort_by: created_at|pay_time|amount
sort_order: asc|desc
```

### 订单详情返回

```json
{
  "id": 1000,
  "order_no": "XS202608110001",
  "user_id": 10,
  "user": {
    "id": 10,
    "nickname": "会员A",
    "phone_masked": "138****0000"
  },
  "product_type": 1,
  "product_name": "红娘牵线服务",
  "service_product_id": 5,
  "service_request_id": 8,
  "matchmaker_id": 20,
  "amount": "299.00",
  "status": 1,
  "transaction_id": "wx_xxx",
  "pay_time": "2026-08-11T10:00:00Z",
  "created_at": "2026-08-11T09:30:00Z",
  "commission_entries": []
}
```

### 结算规则

现有 `mark_order_paid_and_settle` 已明确：

- 只有测试环境允许通过后台模拟支付结算。
- 已退款订单不能结算。
- 待支付订单会在测试模式下改为已支付。
- 结算会按门店、服务红娘、推广人、合伙人计算分成。
- 分成总额不能超过订单金额。
- 使用 `commission:{order_id}:{beneficiary_type}:{beneficiary_id}` 作为幂等键。
- 会写 `account_ledger`。

因此正式环境的后台接口建议拆开：

```text
POST /api/v1/admin/finance/orders/{order_id}/settle
```

只能对真实支付回调确认的订单执行，不能由后台直接把待支付订单改成已支付。

### 提现列表参数

```text
page
page_size
account_type
account_id
account_search
status: PENDING_REVIEW|APPROVED|REJECTED|PROCESSING|SUCCEEDED|FAILED
created_from
created_to
reviewed_from
reviewed_to
```

### 提现详情返回

```json
{
  "id": 88,
  "account_type": "user",
  "account_id": 20,
  "account": {
    "id": 20,
    "nickname": "红娘小王",
    "phone_masked": "138****0000"
  },
  "amount": "500.00",
  "status": "PENDING_REVIEW",
  "payee_masked": "支付宝****1234",
  "failure_reason": null,
  "created_at": "2026-08-11T09:00:00Z",
  "updated_at": "2026-08-11T09:00:00Z",
  "reviewed_by": null,
  "reviewed_at": null
}
```

### 提现状态流转

现有服务代码已定义：

```text
PENDING_REVIEW -> APPROVED
PENDING_REVIEW -> REJECTED
APPROVED       -> PROCESSING
APPROVED       -> FAILED
APPROVED       -> REJECTED
PROCESSING     -> SUCCEEDED
PROCESSING     -> FAILED
```

`REJECTED` 或 `FAILED` 时，后端会向 `account_ledger` 写入退款/冲正记录。不能通过接口重复冲正。

### 提现审核请求

现有请求体：

```json
{
  "status": "APPROVED",
  "failure_reason": null
}
```

建议增加：

```json
{
  "status": "REJECTED",
  "failure_reason": "收款账户信息不完整",
  "review_note": "请补充账户信息"
}
```

## 4. P1：业务闭环功能

## 4.1 活动配置和报名批量审核

### 对应前端页面

- `active-list`
- `active-config`
- `active-signupmanager`
- `active-alliance`
- `mutual-selection-list`
- `mutual-selection-record`

### 当前后端情况

活动管理已经存在：

```text
GET   /api/v1/admin/activities
POST  /api/v1/admin/activities
GET   /api/v1/admin/activities/{activity_id}
PATCH /api/v1/admin/activities/{activity_id}
PATCH /api/v1/admin/activities/{activity_id}/status
GET   /api/v1/admin/activities/{activity_id}/signups
GET   /api/v1/admin/activity-signups/{signup_id}
PATCH /api/v1/admin/activity-signups/{signup_id}
```

`ActivityAdminCreate` 已明确字段：

```text
title
cover
type
city
address
start_time
end_time
signup_deadline
max_people
price
description
```

时间校验：

- `end_time > start_time`
- `signup_deadline <= start_time`

当前缺失：

- 活动默认配置。
- 活动封面上传。
- 互选列表和记录。
- 报名批量审核。

### 建议接口

```text
GET  /api/v1/admin/activities/config
PUT  /api/v1/admin/activities/config
POST /api/v1/admin/activities/{activity_id}/cover
GET  /api/v1/admin/mutual-selections
GET  /api/v1/admin/mutual-selections/{selection_id}
GET  /api/v1/admin/mutual-selections/{selection_id}/records
POST /api/v1/admin/mutual-selections/{selection_id}/close
POST /api/v1/admin/activity-signups/batch-review
```

### 活动配置返回

```json
{
  "default_max_people": 50,
  "default_price": "0.00",
  "default_signup_hours_before": 24,
  "default_signup_status": 1,
  "require_signup_review": true,
  "allow_cancel": true,
  "allow_mutual_selection": true,
  "cover_max_size_mb": 5,
  "cover_allowed_types": ["image/jpeg", "image/png"]
}
```

### 报名批量审核请求

```json
{
  "signup_ids": [101, 102, 103],
  "status": 1,
  "reason": "统一审核通过"
}
```

限制建议：

- 单次最多 100 条。
- 所有报名必须属于同一活动，或者返回逐条处理结果。
- 已是终态 `2/3` 的记录不能再次审核。
- `status = 3` 必须填写拒绝/取消原因。
- 通过报名时要再次检查活动人数上限。
- 如果涉及付费报名，拒绝或取消时明确是否触发退款。

### 互选列表返回建议

```json
{
  "items": [
    {
      "id": 1,
      "activity_id": 20,
      "activity_title": "周末单身派对",
      "user_a_id": 10,
      "user_a_nickname": "会员A",
      "user_b_id": 11,
      "user_b_nickname": "会员B",
      "status": "MATCHED",
      "selected_at": "2026-08-11T10:00:00Z",
      "created_at": "2026-08-11T09:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1,
  "has_more": false
}
```

建议互选状态：

```text
PENDING
ONE_SIDE_SELECTED
MATCHED
CONTACTED
CLOSED
CANCELLED
```

## 4.2 约见记录后台查询和状态管理

### 对应前端页面

- `love-appointment`
- `love-interview`

### 当前后端情况

已有：

```text
POST /api/v1/admin/matchmaker/meetings/requests/{request_id}/schedule
```

现有 Schema：

```text
MeetingScheduleCreate:
organizer_id
organization_id
scheduled_at
location
```

返回：

```text
MeetingRecordResponse:
id
request_id
organizer_id
organization_id
scheduled_at
location
status
cancel_reason
created_at
updated_at
```

缺少约见列表、详情、修改时间地点、取消、完成、反馈查询。

### 建议接口

```text
GET   /api/v1/admin/matchmaker/meetings
GET   /api/v1/admin/matchmaker/meetings/{meeting_id}
PATCH /api/v1/admin/matchmaker/meetings/{meeting_id}
PATCH /api/v1/admin/matchmaker/meetings/{meeting_id}/status
GET   /api/v1/admin/matchmaker/meetings/{meeting_id}/feedback
```

### 查询参数

```text
page
page_size
request_id
user_id
matchmaker_id
organization_id
status: SCHEDULED|REMINDED|CHECKED_IN|COMPLETED|CANCELLED|NO_SHOW
scheduled_from
scheduled_to
search
```

### 修改约见请求

```json
{
  "scheduled_at": "2026-08-12T14:00:00Z",
  "location": "北京朝阳区某咖啡馆",
  "organization_id": 3,
  "reason": "双方协商调整时间"
}
```

### 状态修改请求

```json
{
  "status": "COMPLETED",
  "reason": "双方已完成见面"
}
```

不能把已取消的记录直接改成完成；退款时现有财务服务会把关联 `meeting_record` 改为 `CANCELLED`，新增状态接口必须兼容这一规则。

## 4.3 服务申请完整处理

### 当前后端情况

已有：

```text
GET   /api/v1/admin/matchmaker/service-requests
PATCH /api/v1/admin/matchmaker/service-requests/{service_id}
```

列表目前只支持：

```text
status
page
page_size
```

缺少按会员、红娘、门店、商品、时间和订单筛选，也缺少服务详情和处理历史。

### 建议接口

```text
GET /api/v1/admin/matchmaker/service-requests/{service_id}
GET /api/v1/admin/matchmaker/service-requests/{service_id}/history
```

列表增加参数：

```text
user_id
matchmaker_id
organization_id
service_product_id
order_id
status: 0/1/2/3
created_from
created_to
search
```

详情建议返回：

```json
{
  "id": 8,
  "user_id": 10,
  "user_nickname": "会员A",
  "service_product_id": 5,
  "service_product_name": "红娘牵线服务",
  "order_id": 1000,
  "matchmaker_id": 20,
  "organization_id": 3,
  "status": 1,
  "feedback": null,
  "start_at": "2026-08-11T10:00:00Z",
  "end_at": null,
  "created_at": "2026-08-11T09:00:00Z",
  "updated_at": "2026-08-11T10:00:00Z"
}
```

## 5. P1：当前后端完全没有对应后台路由的模块

以下模块在前端有页面，但本次源码扫描没有发现对应的后台路由、Schema 和服务实现。下面给出的接口是完整开发建议，不能当成已存在接口。

## 5.1 商家、商品、订单和商家联盟

### 对应页面

- `merchant-management`
- `merchant-product`
- `merchant-order`
- `merchant-alliance-config`

### 建议路由

```text
GET    /api/v1/admin/merchants
POST   /api/v1/admin/merchants
GET    /api/v1/admin/merchants/{merchant_id}
PATCH  /api/v1/admin/merchants/{merchant_id}
PATCH  /api/v1/admin/merchants/{merchant_id}/status
DELETE /api/v1/admin/merchants/{merchant_id}

GET    /api/v1/admin/merchant-products
POST   /api/v1/admin/merchant-products
GET    /api/v1/admin/merchant-products/{product_id}
PATCH  /api/v1/admin/merchant-products/{product_id}
PATCH  /api/v1/admin/merchant-products/{product_id}/status
DELETE /api/v1/admin/merchant-products/{product_id}

GET    /api/v1/admin/merchant-orders
GET    /api/v1/admin/merchant-orders/{order_id}
PATCH  /api/v1/admin/merchant-orders/{order_id}/status
POST   /api/v1/admin/merchant-orders/{order_id}/refund

GET    /api/v1/admin/merchant-alliance/config
PATCH  /api/v1/admin/merchant-alliance/config
```

### 商家列表参数

```text
page
page_size
merchant_no
name
contact_phone
status: PENDING|ACTIVE|SUSPENDED|CLOSED
city_code
created_from
created_to
search
```

### 商家新增请求

```json
{
  "name": "某某婚恋服务商",
  "short_name": "某某",
  "contact_name": "李四",
  "contact_phone": "13812345678",
  "license_no": "统一社会信用代码",
  "license_media_id": 99,
  "address": "北京市朝阳区",
  "remark": "商家备注"
}
```

校验建议：

- 商家名称和统一社会信用代码唯一。
- 证照材料必须使用媒体资源 ID，不接收任意外部 URL。
- 审核通过前不能发布商品。
- 停用商家时商品不能继续接收新订单。

### 商品字段

```json
{
  "merchant_id": 1,
  "name": "线下相亲套餐",
  "type": "SERVICE",
  "cover_media_id": 100,
  "description": "套餐说明",
  "price": "299.00",
  "original_price": "399.00",
  "stock": 100,
  "commission_rule_id": 5,
  "sort": 10
}
```

商品状态建议：

```text
DRAFT
PENDING_REVIEW
ON_SALE
OFF_SALE
DELETED
```

### 商家订单字段

```json
{
  "id": 200,
  "order_no": "MO202608110001",
  "merchant_id": 1,
  "product_id": 10,
  "buyer_user_id": 20,
  "quantity": 1,
  "unit_price": "299.00",
  "total_amount": "299.00",
  "payment_status": "PAID",
  "fulfillment_status": "PENDING",
  "refund_status": "NONE",
  "created_at": "2026-08-11T10:00:00Z"
}
```

订单状态建议拆成三组，不能用一个整数覆盖全部业务：

```text
payment_status: UNPAID|PAID|CLOSED
fulfillment_status: PENDING|PROCESSING|COMPLETED|CANCELLED
refund_status: NONE|REQUESTED|PARTIAL|FULL|REJECTED
```

退款请求：

```json
{
  "amount": "299.00",
  "reason": "用户取消服务",
  "notify_merchant": true
}
```

退款必须校验：

- 订单支付成功。
- 可退款金额大于 0。
- 累计退款不能超过已支付金额。
- 同一个 `Idempotency-Key` 不能重复退款。
- 退款成功后联动财务分成冲正。

## 5.2 短视频、评论、打赏和红包

### 对应页面

- `short-video-list`
- `short-video-comment`
- `short-video-config`
- `short-video-homepage`
- `short-video-red-packet`
- `short-video-tip`

### 当前后端情况

后端有社区内容审核：

```text
GET   /api/v1/admin/community/moderation-items
PATCH /api/v1/admin/community/moderation-items/{task_id}/review
PATCH /api/v1/admin/media/{media_id}/review
```

但没有发现短视频专用表、Schema、后台列表和短视频配置路由。不能直接把社区帖子接口当短视频接口。

### 建议路由

```text
GET   /api/v1/admin/short-videos
GET   /api/v1/admin/short-videos/{video_id}
PATCH /api/v1/admin/short-videos/{video_id}
PATCH /api/v1/admin/short-videos/{video_id}/status
PATCH /api/v1/admin/short-videos/{video_id}/review
GET   /api/v1/admin/short-video-comments
GET   /api/v1/admin/short-video-comments/{comment_id}
PATCH /api/v1/admin/short-video-comments/{comment_id}/status
GET   /api/v1/admin/short-video-tips
GET   /api/v1/admin/short-video-red-packets
GET   /api/v1/admin/short-video/config
PATCH /api/v1/admin/short-video/config
```

### 短视频列表参数

```text
page
page_size
user_id
nickname
title
status: DRAFT|PENDING_REVIEW|PUBLISHED|HIDDEN|REJECTED|DELETED
review_status: PENDING|APPROVED|REJECTED
city_code
created_from
created_to
search
```

### 短视频返回

```json
{
  "id": 10,
  "user_id": 20,
  "nickname": "会员A",
  "title": "我的生活",
  "description": "视频描述",
  "cover_url": "https://signed.example.com/cover",
  "video_url": "https://signed.example.com/video",
  "duration_seconds": 30,
  "status": "PENDING_REVIEW",
  "review_status": "PENDING",
  "risk_level": 1,
  "matched_words": [],
  "view_count": 100,
  "like_count": 10,
  "comment_count": 3,
  "tip_amount": "0.00",
  "created_at": "2026-08-11T10:00:00Z"
}
```

### 审核请求

```json
{
  "status": "REJECTED",
  "reason": "包含不适宜内容",
  "display_content": null
}
```

审核状态建议：

```text
PENDING
APPROVED
REJECTED
REPLACED
HIDDEN
DELETED
```

评论状态建议：

```text
VISIBLE
HIDDEN
DELETED
RESTORED
```

评论删除优先采用软删除，保留审核记录。

### 短视频配置

```json
{
  "enabled": true,
  "require_review": true,
  "max_duration_seconds": 60,
  "max_file_size_mb": 100,
  "allow_tip": true,
  "allow_red_packet": true,
  "homepage_sort": "LATEST",
  "homepage_limit": 20
}
```

## 5.3 微信公众号管理

### 对应页面

- `wechat-config`
- `wechat-fans`
- `wechat-menu`
- `wechat-autoreply`
- `wechat-template`
- `wechat-send`

### 当前后端情况

用户登录服务中有微信登录 Provider，但没有发现公众号管理后台路由。微信登录和微信公众号运营不是同一套接口。

### 建议路由

```text
GET   /api/v1/admin/wechat/config
PATCH /api/v1/admin/wechat/config
POST  /api/v1/admin/wechat/config/test

GET   /api/v1/admin/wechat/fans
GET   /api/v1/admin/wechat/fans/{fan_id}
PATCH /api/v1/admin/wechat/fans/{fan_id}/tags

GET   /api/v1/admin/wechat/menu
PUT   /api/v1/admin/wechat/menu
POST  /api/v1/admin/wechat/menu/publish

GET   /api/v1/admin/wechat/auto-replies
POST  /api/v1/admin/wechat/auto-replies
PATCH /api/v1/admin/wechat/auto-replies/{reply_id}
DELETE /api/v1/admin/wechat/auto-replies/{reply_id}

GET   /api/v1/admin/wechat/templates
POST  /api/v1/admin/wechat/templates
PATCH /api/v1/admin/wechat/templates/{template_id}

GET   /api/v1/admin/wechat/send-records
GET   /api/v1/admin/wechat/send-records/{record_id}
POST  /api/v1/admin/wechat/send
```

### 配置返回

```json
{
  "app_id": "wx123456",
  "token_configured": true,
  "secret_configured": true,
  "encoding_aes_key_configured": true,
  "callback_url": "https://api.example.com/api/v1/wechat/callback",
  "status": "CONNECTED",
  "last_test_at": "2026-08-11T10:00:00Z"
}
```

不得返回：

- `app_secret`
- 明文 Token
- 明文 AES Key

### 菜单请求

```json
{
  "buttons": [
    {
      "name": "会员服务",
      "type": "view",
      "url": "https://www.example.com/member",
      "sub_buttons": []
    }
  ]
}
```

发布接口必须记录微信平台返回的 `publish_id` 或错误码。

### 消息发送请求

```json
{
  "template_id": "template_xxx",
  "fan_ids": [1, 2, 3],
  "data": {
    "first": "您好",
    "keyword1": "红娘服务"
  },
  "url": "https://www.example.com/order/1"
}
```

建议超过 100 个粉丝时创建异步任务：

```json
{
  "task_id": "wechat_task_001",
  "status": "QUEUED",
  "total": 1000,
  "success": 0,
  "failed": 0
}
```

## 5.4 短信签名、模板、群组和发送记录

### 对应页面

- `sms-group`
- `sms-notices`
- `sms-record`
- `sms-signature`

### 当前后端情况

后端有用户登录短信 Provider 和配置项：

```text
sms_provider
sms_code_expire_seconds
sms_send_interval_seconds
sms_daily_limit
sms_mock_code
```

但没有后台短信签名、模板、群组、记录和测试发送路由。

### 建议路由

```text
GET    /api/v1/admin/sms/config
PATCH  /api/v1/admin/sms/config

GET    /api/v1/admin/sms/signatures
POST   /api/v1/admin/sms/signatures
PATCH  /api/v1/admin/sms/signatures/{signature_id}
PATCH  /api/v1/admin/sms/signatures/{signature_id}/status

GET    /api/v1/admin/sms/templates
POST   /api/v1/admin/sms/templates
PATCH  /api/v1/admin/sms/templates/{template_id}
PATCH  /api/v1/admin/sms/templates/{template_id}/status

GET    /api/v1/admin/sms/groups
POST   /api/v1/admin/sms/groups
PATCH  /api/v1/admin/sms/groups/{group_id}
DELETE /api/v1/admin/sms/groups/{group_id}
POST   /api/v1/admin/sms/groups/{group_id}/members
DELETE /api/v1/admin/sms/groups/{group_id}/members/{member_id}

GET    /api/v1/admin/sms/records
GET    /api/v1/admin/sms/records/{record_id}
POST   /api/v1/admin/sms/test-send
```

### 短信模板请求

```json
{
  "signature_id": 1,
  "name": "会员审核通知",
  "provider_template_code": "SMS_123456",
  "content_preview": "您的认证已通过",
  "variables": ["nickname"],
  "purpose": "CERTIFICATION_REVIEW"
}
```

### 测试发送请求

```json
{
  "phone": "13812345678",
  "template_id": 1,
  "variables": {
    "nickname": "张三"
  }
}
```

安全要求：

- 只允许白名单手机号。
- 单账号每分钟最多 1 次。
- 每日最多 10 次，或复用当前 `sms_daily_limit`。
- 测试发送必须记录操作人、手机号掩码、模板、Provider 返回值。
- 生产环境禁止使用 `sms_provider = mock`。

## 5.5 电子合同

### 对应页面

- `e-contract-config`
- `e-contract-list`
- `e-contract-template`
- `e-contract-yinzhang`

### 建议路由

```text
GET    /api/v1/admin/e-contract/config
PATCH  /api/v1/admin/e-contract/config

GET    /api/v1/admin/e-contract/contracts
GET    /api/v1/admin/e-contract/contracts/{contract_id}
GET    /api/v1/admin/e-contract/contracts/{contract_id}/download
POST   /api/v1/admin/e-contract/contracts/{contract_id}/void

GET    /api/v1/admin/e-contract/templates
POST   /api/v1/admin/e-contract/templates
GET    /api/v1/admin/e-contract/templates/{template_id}
PATCH  /api/v1/admin/e-contract/templates/{template_id}
DELETE /api/v1/admin/e-contract/templates/{template_id}
POST   /api/v1/admin/e-contract/templates/{template_id}/publish

GET    /api/v1/admin/e-contract/seals
POST   /api/v1/admin/e-contract/seals
PATCH  /api/v1/admin/e-contract/seals/{seal_id}
PATCH  /api/v1/admin/e-contract/seals/{seal_id}/status
DELETE /api/v1/admin/e-contract/seals/{seal_id}
```

### 合同列表参数

```text
page
page_size
contract_no
template_id
user_id
status: DRAFT|WAITING_SIGN|PART_SIGNED|SIGNED|VOIDED|EXPIRED
created_from
created_to
signed_from
signed_to
search
```

### 合同返回

```json
{
  "id": 1,
  "contract_no": "CT202608110001",
  "template_id": 2,
  "template_name": "红娘服务合同",
  "user_id": 10,
  "user_nickname": "会员A",
  "status": "WAITING_SIGN",
  "file_status": "READY",
  "file_url": null,
  "sign_url": "https://signed.example.com/...",
  "created_at": "2026-08-11T10:00:00Z",
  "expires_at": "2026-08-18T10:00:00Z"
}
```

合同下载必须返回短期签名 URL，不能公开永久文件路径。

作废请求：

```json
{
  "reason": "服务方案变更"
}
```

已签署合同作废必须具备更高权限，并记录作废前状态、操作者和原因。

## 5.6 系统设置、角色、权限和审计日志

### 对应页面

- `system-setting-basic`
- `system-setting-admin-user`
- `system-setting-admin-group`
- `system-setting-admin-log`
- `system-setting-adconfig`
- `system-empower`
- `power-config`
- `platform-base`
- `platform-config-basic`
- `platform-content`
- `platform-navconfig`
- `platform-page`
- `platform-payconfig`
- `miniprogram-config`
- `plugin-center`

### 建议路由

```text
GET   /api/v1/admin/system/basic
PATCH /api/v1/admin/system/basic
GET   /api/v1/admin/system/ad-config
PATCH /api/v1/admin/system/ad-config

GET   /api/v1/admin/system/roles
POST  /api/v1/admin/system/roles
PATCH /api/v1/admin/system/roles/{role_id}
DELETE /api/v1/admin/system/roles/{role_id}
GET   /api/v1/admin/system/permissions
PUT   /api/v1/admin/system/roles/{role_id}/permissions

GET   /api/v1/admin/system/audit-logs
GET   /api/v1/admin/system/audit-logs/{log_id}

GET   /api/v1/admin/platform/base
PATCH /api/v1/admin/platform/base
GET   /api/v1/admin/platform/content
PATCH /api/v1/admin/platform/content
GET   /api/v1/admin/platform/navigation
PATCH /api/v1/admin/platform/navigation
GET   /api/v1/admin/platform/pages
POST  /api/v1/admin/platform/pages
GET   /api/v1/admin/platform/pages/{page_id}
PATCH /api/v1/admin/platform/pages/{page_id}
DELETE /api/v1/admin/platform/pages/{page_id}
POST  /api/v1/admin/platform/pages/{page_id}/publish
GET   /api/v1/admin/platform/pay-config
PATCH /api/v1/admin/platform/pay-config
GET   /api/v1/admin/platform/miniprogram-config
PATCH /api/v1/admin/platform/miniprogram-config
GET   /api/v1/admin/platform/plugins
PATCH /api/v1/admin/platform/plugins/{plugin_id}
```

### 权限对象建议

权限不要只做页面权限，至少拆到：

```text
resource:action
```

示例：

```text
member:read
member:write
member:status
member:certification:review
lead:read
lead:write
matchmaker:read
matchmaker:write
assignment:read
assignment:write
finance:read
finance:refund
finance:withdrawal:review
system:admin_account
system:role
system:audit_log
```

### 审计日志查询参数

```text
page
page_size
operator_account_id
action
resource_type
resource_id
result: SUCCESS|FAILED
created_from
created_to
ip
request_id
```

### 审计日志返回

```json
{
  "id": 100,
  "operator_account_id": 1,
  "operator_name": "运营人员",
  "action": "member.status.update",
  "resource_type": "user",
  "resource_id": 10,
  "before_json": {
    "status": 1
  },
  "after_json": {
    "status": 2
  },
  "reason": "违规账号",
  "result": "SUCCESS",
  "request_id": "req_xxx",
  "ip": "192.0.2.10",
  "created_at": "2026-08-11T10:00:00Z"
}
```

## 6. P2：运营工具

## 6.1 礼物、积分兑换和 VIP 记录

### 对应页面

- `gift-list`
- `gift-exchange`
- `love-gift-wrap`
- `system-credit-history`
- `vip-line-record`
- `vip-popularize-record`

### 建议路由

```text
GET    /api/v1/admin/gifts
POST   /api/v1/admin/gifts
GET    /api/v1/admin/gifts/{gift_id}
PATCH  /api/v1/admin/gifts/{gift_id}
PATCH  /api/v1/admin/gifts/{gift_id}/status
DELETE /api/v1/admin/gifts/{gift_id}

GET   /api/v1/admin/gift-exchanges
GET   /api/v1/admin/gift-exchanges/{exchange_id}
PATCH /api/v1/admin/gift-exchanges/{exchange_id}/status
POST  /api/v1/admin/gift-exchanges/{exchange_id}/补发

GET /api/v1/admin/points/ledger
GET /api/v1/admin/vip/line-records
GET /api/v1/admin/vip/popularize-records
```

礼物状态建议：

```text
1 ON_SALE
2 OFF_SALE
3 DELETED
```

兑换记录状态建议：

```text
PENDING
PROCESSING
COMPLETED
CANCELLED
FAILED
```

补发或取消必须提供原因，并且不能重复扣减或增加积分。

## 6.2 合伙人和推广关系

### 当前后端情况

后端已有面向业务用户的：

```text
POST /api/v1/partners/teams
POST /api/v1/partners/memberships
POST /api/v1/promotions/touches
POST /api/v1/promotions/attributions
```

但没有红娘后台的合伙人列表、关系、奖励配置和奖励明细接口。

### 建议路由

```text
GET   /api/v1/admin/partners
GET   /api/v1/admin/partners/{partner_id}
POST  /api/v1/admin/partners/{partner_id}/status
GET   /api/v1/admin/partners/{partner_id}/relations
GET   /api/v1/admin/partners/bonus-config
PATCH /api/v1/admin/partners/bonus-config
GET   /api/v1/admin/partners/bonus-details
```

### 合伙人列表参数

```text
page
page_size
owner_user_id
name
status: 1 ACTIVE|2 SUSPENDED|3 CLOSED
promoter_id
created_from
created_to
search
```

### 奖励明细返回

```json
{
  "id": 1,
  "partner_team_id": 3,
  "owner_user_id": 20,
  "source_type": "commission",
  "source_id": 100,
  "base_amount": "299.00",
  "bonus_amount": "29.90",
  "status": "PENDING",
  "created_at": "2026-08-11T10:00:00Z"
}
```

建议奖励状态与现有分成状态保持一致：

```text
PENDING
AVAILABLE
RELEASED
REVERSED
```

## 6.3 外呼平台、任务、记录和录音

### 对应页面

- `outbound-call-platform`
- `out-call-list`
- `out-call-record`

### 建议路由

```text
GET   /api/v1/admin/outbound-call-platform
PATCH /api/v1/admin/outbound-call-platform
POST  /api/v1/admin/outbound-call-platform/test

GET   /api/v1/admin/outbound-calls
POST  /api/v1/admin/outbound-calls
GET   /api/v1/admin/outbound-calls/{call_id}
PATCH /api/v1/admin/outbound-calls/{call_id}
POST  /api/v1/admin/outbound-calls/{call_id}/cancel
GET   /api/v1/admin/outbound-calls/{call_id}/recording
```

### 外呼任务请求

```json
{
  "lead_id": 100,
  "phone": "138****0000",
  "operator_id": 20,
  "scheduled_at": "2026-08-12T10:00:00Z",
  "remark": "首次回访"
}
```

手机号应支持明文只入库加密字段，列表和前端默认只返回掩码。

### 通话记录返回

```json
{
  "id": 1,
  "call_no": "CALL202608110001",
  "lead_id": 100,
  "operator_id": 20,
  "called_phone_masked": "138****0000",
  "status": "CONNECTED",
  "duration_seconds": 180,
  "result": "已接通",
  "recording_available": true,
  "created_at": "2026-08-11T10:00:00Z"
}
```

录音接口建议返回：

```json
{
  "download_url": "https://signed.example.com/recording",
  "expires_at": "2026-08-11T11:00:00Z"
}
```

## 7. 与现有后端代码的兼容要求

### 7.1 不要破坏现有状态值

现有代码已经使用以下状态：

```text
会员状态：1/2/3
认证状态：0/1/2/3
活动状态：1/2/3/4/5
报名状态：0/1/2/3
红娘接单状态：1/2
门店状态：1/2/3
资源分配状态：1/2
分成状态：PENDING/AVAILABLE/REVERSED
提现状态：PENDING_REVIEW/APPROVED/REJECTED/PROCESSING/SUCCEEDED/FAILED
```

如果后端想改成字符串枚举，建议提供兼容版本，不要让当前前端已经接入的接口同时改变返回类型。

### 7.2 不能绕过已有业务服务

新增后台接口应复用现有服务逻辑：

- 门店创建复用 `organization.create_store` 的 code 唯一和审计逻辑。
- 门店成员复用 `organization.add_store_member` 的单店店长唯一规则。
- 资源分配复用 `organization.assign_resource` 的旧分配结束逻辑。
- 财务退款复用 `finance.refund_order` 的分成冲正、服务关闭、联系方式隐藏、约见取消逻辑。
- 财务提现审核复用 `finance.review_withdrawal` 的余额冲正和状态机。
- 红娘登录复用 `matchmaker_admin_auth` 的密码哈希、失败锁定和 Session 撤销逻辑。

### 7.3 管理员身份字段

现有服务部分使用 `CurrentUser.id` 写入：

```text
business_audit_log.actor_user_id
```

独立红娘后台账号使用的是 `matchmaker_admin_account.id`，两者不是同一类 ID。建议新增审计表同时保存：

```text
actor_account_id
actor_user_id
actor_type: matchmaker_admin|user_admin
```

否则后续无法准确判断操作人是后台账号还是普通用户管理员。

### 7.4 数据范围权限

如果一个后台账号绑定了 `matchmaker_user_id`，建议支持数据范围：

```text
ALL
OWN_MATCHMAKER
OWN_BRANCH
SPECIFIED_BRANCHES
```

查询接口必须在 SQL 层限制数据范围，不能只在前端隐藏数据。

## 8. 推荐开发顺序

### 第一批

1. 红娘后台账号列表、权限和登录日志。
2. 会员创建、编辑、认证详情。
3. 红娘创建、编辑、筛选。
4. 门店编辑、状态、成员移除、分页。
5. 财务订单和提现列表。

### 第二批

1. 分配配置、修改、撤销、历史。
2. 活动配置、封面上传、批量审核。
3. 约见列表、详情、状态。
4. 服务申请详情和操作历史。
5. 商家、商品、订单。

### 第三批

1. 短视频和短视频审核。
2. 微信和短信运营。
3. 电子合同。
4. 系统设置、权限和审计日志。
5. 礼物、积分、合伙人、外呼。

## 9. 后端开发完成后的验收清单

- [ ] 每个列表接口都有统一分页返回。
- [ ] 每个写接口都有请求 Schema。
- [ ] 所有状态字段有枚举和状态流转说明。
- [ ] 所有敏感字段默认脱敏。
- [ ] 退款、结算、提现、VIP、批量操作具备幂等控制。
- [ ] 所有后台写操作都有审计记录。
- [ ] 独立红娘后台 Token 不再误用普通管理员依赖。
- [ ] 门店、分配和财务接口复用现有服务逻辑。
- [ ] OpenAPI `/openapi.json` 能正常生成。
- [ ] `pytest` 能在有权限的虚拟环境中运行。
- [ ] 前端可以根据 OpenAPI 直接生成或校验 TypeScript 类型。
