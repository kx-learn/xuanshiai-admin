# 后端只读接口核对报告

核对日期：2026-08-11

## 1. 核对范围

- 前端项目：`E:\HTML\xuanshiai-admin`
- 后端项目：`E:\houduan\xuanshiai`
- 后端 API 前缀：`/api/v1`
- 后端入口：`app/main.py`
- 后端路由：`app/api/routes`
- 后端数据契约：`app/schemas`

本次只读取后端源码、路由、Schema 和测试文件，没有修改 `E:\houduan\xuanshiai` 下任何文件。

## 2. 鉴权结论

### 2.1 当前前端应该使用的鉴权

红娘后台使用独立账号体系：

```text
POST /api/v1/admin/matchmaker/auth/login
POST /api/v1/admin/matchmaker/auth/refresh
GET  /api/v1/admin/matchmaker/auth/me
POST /api/v1/admin/matchmaker/auth/logout
```

请求头：

```text
Authorization: Bearer {access_token}
```

账号字段：

```json
{
  "id": 1,
  "username": "admin",
  "display_name": "后台账号",
  "matchmaker_user_id": null,
  "status": 1,
  "last_login_at": "2026-08-11T10:00:00Z"
}
```

登录请求：

```json
{
  "username": "admin",
  "password": "至少 8 位"
}
```

登录返回 `access_token`、`refresh_token`、`token_type`、`expires_in` 和 `account`。

### 2.2 不要混用的鉴权

`app/api/dependencies.py` 中同时存在普通用户/普通管理员和独立红娘后台两套依赖：

- `get_current_user`：普通用户 Token
- `get_current_admin`：普通用户 Token 加 `user_role.role_code = admin`
- `get_current_matchmaker_admin`：红娘后台独立 Token

以下已存在接口仍使用普通管理员体系，不能直接用红娘后台登录 Token：

```text
PATCH /api/v1/admin/community/moderation-items/{task_id}/review
GET   /api/v1/admin/reports
GET   /api/v1/admin/reports/{report_id}
PATCH /api/v1/admin/reports/{report_id}/review
GET   /api/v1/admin/report-appeals
PATCH /api/v1/admin/report-appeals/{appeal_id}/review
PATCH /api/v1/admin/media/{media_id}/review
PATCH /api/v1/admin/users/{user_id}/certifications/{kind}/review
POST  /api/v1/admin/users/grant
```

建议后端最终统一为红娘后台权限模型，或在接口文档中明确哪些页面必须使用哪套 Token。

## 3. 已确认可以直接接入的接口

### 3.1 首页

```text
GET /api/v1/admin/dashboard/stats
```

返回字段：

```json
{
  "member_count": 0,
  "vip_count": 0,
  "matchmaker_count": 0,
  "pending_service_count": 0,
  "active_service_count": 0,
  "pending_certification_count": 0,
  "today_new_member_count": 0
}
```

当前前端页面：`src/app/(admin)/home/page.tsx`

### 3.2 会员 CRM

```text
GET   /api/v1/admin/matchmaker/members
GET   /api/v1/admin/matchmaker/members/{member_id}
PATCH /api/v1/admin/matchmaker/members/{member_id}/status
GET   /api/v1/admin/matchmaker/members/statistics
GET   /api/v1/admin/members/vip
PATCH /api/v1/admin/members/{member_id}/vip
GET   /api/v1/admin/members/{member_id}/behavior/login-logs
GET   /api/v1/admin/members/{member_id}/follow-ups
POST  /api/v1/admin/members/{member_id}/follow-ups
GET   /api/v1/admin/members/{member_id}/behavior
```

会员列表参数：

```text
page: int，默认 1
page_size: int，1-100，默认 20
gender: 1/2，可选
status: 1/2/3，可选
vip: true/false，可选
search: 昵称或手机号，可选
```

会员列表返回：

```json
{
  "items": [
    {
      "id": 1,
      "nickname": "昵称",
      "phone": "手机号",
      "gender": 1,
      "status": 1,
      "is_vip": true,
      "vip_end_at": "2026-09-01T00:00:00Z",
      "matchmaker_id": 2,
      "created_at": "2026-08-11T00:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1,
  "has_more": false
}
```

会员状态修改请求：

```json
{
  "status": 1,
  "reason": "处理原因"
}
```

会员状态枚举：`1/2/3`。具体中文含义建议后端在 OpenAPI 中补充枚举说明。

VIP 请求：

```json
{
  "action": "OPEN",
  "package_type": "monthly",
  "order_no": "ORDER202608110001",
  "reason": null
}
```

`action` 支持：

- `OPEN`：开通，必须提供 `package_type` 和 `order_no`
- `RENEW`：续期，必须提供 `package_type` 和 `order_no`
- `CANCEL`：取消，必须提供 `reason`

当前前端建议接入页面：

- `love-user-list`
- `love-user-statistics`
- `love-user-vip`
- `love-user-vip-underline`
- `love-user-behavior`
- `love-user-follow-up`
- `love-user-auth`

其中 `love-user-auth` 的认证详情查询接口后端没有提供，只能继续使用审核动作接口或等待补充详情接口。

### 3.3 客源线索

```text
GET   /api/v1/admin/customer-leads
POST  /api/v1/admin/customer-leads
GET   /api/v1/admin/customer-leads/{lead_id}
PATCH /api/v1/admin/customer-leads/{lead_id}
GET   /api/v1/admin/customer-leads/{lead_id}/follow-ups
POST  /api/v1/admin/customer-leads/{lead_id}/follow-ups
PATCH /api/v1/admin/customer-leads/{lead_id}/assignment
GET   /api/v1/admin/customer-leads/statistics
```

列表参数：

```text
page、page_size、status、source、matchmaker_id、search
```

状态枚举：

```text
NEW、CONTACTED、INTENDED、CONVERTED、LOST、CLOSED
```

新增请求：

```json
{
  "name": "客户姓名",
  "phone": "13800000000",
  "wechat": "wechat_id",
  "source": "线上咨询",
  "intention_level": 1,
  "remark": "备注"
}
```

`phone` 和 `wechat` 至少提供一个。

跟进新增请求：

```json
{
  "method": "PHONE",
  "content": "已电话沟通",
  "intention_level": 2,
  "next_follow_at": "2026-08-12T10:00:00Z"
}
```

`method` 支持：`PHONE`、`WECHAT`、`VISIT`、`OTHER`。

分配请求：

```json
{
  "matchmaker_id": 2,
  "organization_id": 3
}
```

至少提供红娘或门店之一。

### 3.4 红娘、服务商品和服务申请

```text
GET   /api/v1/admin/matchmaker/matchmakers
GET   /api/v1/admin/matchmaker/matchmakers/{matchmaker_id}
PATCH /api/v1/admin/matchmaker/matchmakers/{matchmaker_id}/status
GET   /api/v1/admin/matchmaker/service-products
POST  /api/v1/admin/matchmaker/service-products
GET   /api/v1/admin/matchmaker/service-products/{product_id}
PATCH /api/v1/admin/matchmaker/service-products/{product_id}
GET   /api/v1/admin/matchmaker/service-requests
PATCH /api/v1/admin/matchmaker/service-requests/{service_id}
GET   /api/v1/admin/matchmaker/statistics
```

红娘列表目前只支持：

```text
page、page_size
```

红娘状态修改：

```json
{
  "status": 1,
  "reason": "恢复接单"
}
```

状态为 `1/2`。

服务申请列表支持：

```text
status: 0/1/2/3
page
page_size
```

当前前端可以接入：

- `love-matchmaker-list`
- `love-matchmaker-apportion`
- `love-interview`
- `love-appointment`
- 服务商品相关弹窗和详情

### 3.5 门店、成员和资源分配

```text
GET  /api/v1/admin/matchmaker/branches
POST /api/v1/admin/matchmaker/branches
GET  /api/v1/admin/matchmaker/branches/{branch_id}
POST /api/v1/admin/matchmaker/branches/{branch_id}/members
POST /api/v1/admin/matchmaker/assignments
GET  /api/v1/admin/matchmaker/assignments
POST /api/v1/admin/matchmaker/meetings/requests/{request_id}/schedule
```

门店新增请求：

```json
{
  "code": "BJ001",
  "name": "北京门店",
  "display_name": "北京旗舰店",
  "region_code": "110100",
  "auto_redirect": false
}
```

门店列表返回 `list[StoreResponse]`，不是分页对象。前端不能按 `items/total` 读取。

资源分配请求：

```json
{
  "user_id": 10,
  "organization_id": 3,
  "matchmaker_id": 2,
  "source": "manual"
}
```

`source` 支持：`manual`、`promotion`、`default`、`self_created`。

分配记录查询支持 `page`、`page_size`、`user_id`、`matchmaker_id`。

### 3.6 活动与报名

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

活动列表参数：

```text
page、page_size、status、city、search
```

活动新增/编辑核心字段：

```text
title、cover、type、city、address、start_time、end_time、
signup_deadline、max_people、price、description
```

活动状态支持 `1/2/3/4/5`，报名状态支持 `0/1/2/3`。后端建议补充中文枚举和状态流转说明。

报名审核请求：

```json
{
  "status": 1,
  "reason": "审核通过"
}
```

当前没有发现批量报名审核接口、活动配置接口或独立封面上传接口。

### 3.7 财务分成

```text
GET   /api/v1/admin/finance/commission-rules
POST  /api/v1/admin/finance/commission-rules
POST  /api/v1/admin/finance/product-commission-rules/{product_id}
GET   /api/v1/admin/finance/report
POST  /api/v1/admin/finance/orders/{order_id}/settle
POST  /api/v1/admin/finance/orders/{order_id}/refund
POST  /api/v1/admin/finance/commission-entries/{entry_id}/release
PATCH /api/v1/admin/finance/withdrawals/{withdrawal_id}
```

分成规则新增请求：

```json
{
  "beneficiary_type": "service_matchmaker",
  "name": "红娘服务分成",
  "mode": "rate",
  "fixed_amount": null,
  "rate_percent": 20,
  "priority": 10
}
```

`beneficiary_type` 支持：`service_matchmaker`、`store`、`promoter`、`partner`。

`mode` 支持：

- `fixed`：必须提供 `fixed_amount`
- `rate`：必须提供 `rate_percent`

金额字段使用 Decimal，前端展示时按“元”处理，但需要后端确认数据库和支付渠道是否使用分为单位。

目前只有提现审核 PATCH，没有提现列表；只有结算、退款动作，没有后台财务订单列表和详情。

## 4. 明确缺失的后台功能和建议接口

以下不是后端现有接口，而是根据现有前端页面和业务需要整理的补充建议。

### P0：影响后台基本可运营

#### 4.1 平台账号和登录日志

页面：`reg-user-all`、`reg-user-log`

建议：

```text
GET   /api/v1/admin/matchmaker/accounts
GET   /api/v1/admin/matchmaker/accounts/{account_id}
POST  /api/v1/admin/matchmaker/accounts
PATCH /api/v1/admin/matchmaker/accounts/{account_id}
PATCH /api/v1/admin/matchmaker/accounts/{account_id}/status
GET   /api/v1/admin/matchmaker/accounts/login-logs
```

列表参数建议：

```text
page、page_size、username、display_name、status、created_from、created_to
```

新增请求建议：

```json
{
  "username": "operator01",
  "password": "至少 8 位",
  "display_name": "运营人员",
  "permissions": ["member:read", "lead:write"]
}
```

登录日志字段建议：

```text
id、account_id、username、login_status、ip、user_agent、device_id、
failure_reason、created_at
```

#### 4.2 会员创建、编辑和认证详情

页面：`love-user-list`、`love-user-auth`

建议：

```text
POST  /api/v1/admin/matchmaker/members
PATCH /api/v1/admin/matchmaker/members/{member_id}
GET   /api/v1/admin/matchmaker/members/{member_id}/certifications
GET   /api/v1/admin/matchmaker/members/{member_id}/certifications/{kind}
```

会员编辑字段建议：

```text
nickname、phone、gender、birthday、avatar、is_married、
residence_city_code、remark
```

认证详情字段建议：

```text
kind、status、real_name、submitted_at、reviewed_at、
media_urls、review_reason、reviewer_id
```

认证审核状态建议统一为：`PENDING`、`APPROVED`、`REJECTED`。

#### 4.3 红娘创建、编辑和筛选

页面：`love-matchmaker-list`、`branch-matchmaker-list`

建议：

```text
POST  /api/v1/admin/matchmaker/matchmakers
PATCH /api/v1/admin/matchmaker/matchmakers/{matchmaker_id}
```

列表补充参数：

```text
nickname、phone、status、is_available、branch_id、region_code、search
```

编辑字段建议：

```text
nickname、intro、avatar、service_level、branch_id、
is_available、sort、remark
```

#### 4.4 门店完整管理

页面：`mendian-list`、`branch-config`、`branch-report-list`

建议：

```text
GET   /api/v1/admin/matchmaker/branches
PATCH /api/v1/admin/matchmaker/branches/{branch_id}
PATCH /api/v1/admin/matchmaker/branches/{branch_id}/status
DELETE /api/v1/admin/matchmaker/branches/{branch_id}
GET   /api/v1/admin/matchmaker/branches/{branch_id}/members
DELETE /api/v1/admin/matchmaker/branches/{branch_id}/members/{member_id}
GET   /api/v1/admin/matchmaker/branches/{branch_id}/report
```

门店列表必须统一为分页响应：

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 0,
  "has_more": false
}
```

#### 4.5 财务订单和提现列表

页面：`system-finance-order`、`system-cashout-history`

建议：

```text
GET /api/v1/admin/finance/orders
GET /api/v1/admin/finance/orders/{order_id}
GET /api/v1/admin/finance/withdrawals
GET /api/v1/admin/finance/withdrawals/{withdrawal_id}
```

订单查询参数建议：

```text
page、page_size、order_no、user_id、product_type、status、
created_from、created_to、pay_from、pay_to
```

提现查询参数建议：

```text
page、page_size、account_type、account_id、status、
created_from、created_to
```

## 5. P1：完整业务闭环所需功能

### 5.1 分配配置和撤销

页面：`love-matchmaker-apportion`、`love-matchmaker-distribution`、
`love-matchmaker-distribution-details`、`branch-distribution-list`

建议：

```text
GET   /api/v1/admin/matchmaker/assignment-config
PATCH /api/v1/admin/matchmaker/assignment-config
PATCH /api/v1/admin/matchmaker/assignments/{assignment_id}
POST  /api/v1/admin/matchmaker/assignments/{assignment_id}/end
GET   /api/v1/admin/matchmaker/assignments/{assignment_id}
```

配置字段建议：

```text
enabled、strategy、region_rules、gender_rules、max_load、
fallback_matchmaker_id、fallback_branch_id
```

修改或撤销必须记录原负责人、新负责人、操作原因和生效时间。

### 5.2 活动配置、互选和批量审核

页面：`active-config`、`mutual-selection-list`、
`mutual-selection-record`、`active-signupmanager`

建议：

```text
GET   /api/v1/admin/activities/config
PATCH /api/v1/admin/activities/config
GET   /api/v1/admin/mutual-selections
GET   /api/v1/admin/mutual-selections/{selection_id}
GET   /api/v1/admin/mutual-selections/{selection_id}/records
POST  /api/v1/admin/mutual-selections/{selection_id}/close
POST  /api/v1/admin/activity-signups/batch-review
POST  /api/v1/admin/activities/{activity_id}/cover
```

批量审核请求建议：

```json
{
  "signup_ids": [1, 2, 3],
  "status": 1,
  "reason": "统一审核通过"
}
```

批量操作建议限制单次最多 100 条，并返回每条成功/失败结果。

### 5.3 商家、商品和订单

页面：`merchant-management`、`merchant-product`、`merchant-order`、
`merchant-alliance-config`

建议：

```text
GET   /api/v1/admin/merchants
POST  /api/v1/admin/merchants
GET   /api/v1/admin/merchants/{merchant_id}
PATCH /api/v1/admin/merchants/{merchant_id}
PATCH /api/v1/admin/merchants/{merchant_id}/status
GET   /api/v1/admin/merchant-products
POST  /api/v1/admin/merchant-products
GET   /api/v1/admin/merchant-products/{product_id}
PATCH /api/v1/admin/merchant-products/{product_id}
PATCH /api/v1/admin/merchant-products/{product_id}/status
GET   /api/v1/admin/merchant-orders
GET   /api/v1/admin/merchant-orders/{order_id}
POST  /api/v1/admin/merchant-orders/{order_id}/refund
GET   /api/v1/admin/merchant-alliance/config
PATCH /api/v1/admin/merchant-alliance/config
```

商家和商品列表都应使用统一分页。退款请求必须包含 `reason`、`amount` 和幂等键。

### 5.4 短视频和内容审核

页面：`short-video-list`、`short-video-comment`、
`short-video-config`、`short-video-homepage`、
`short-video-red-packet`、`short-video-tip`

建议：

```text
GET   /api/v1/admin/short-videos
GET   /api/v1/admin/short-videos/{video_id}
PATCH /api/v1/admin/short-videos/{video_id}
PATCH /api/v1/admin/short-videos/{video_id}/status
PATCH /api/v1/admin/short-videos/{video_id}/review
GET   /api/v1/admin/short-video-comments
PATCH /api/v1/admin/short-video-comments/{comment_id}/status
GET   /api/v1/admin/short-video-tips
GET   /api/v1/admin/short-video-red-packets
GET   /api/v1/admin/short-video/config
PATCH /api/v1/admin/short-video/config
```

目前后端已有社区审核接口，但没有发现短视频专用后台路由。建议不要让前端把普通社区内容接口当成短视频接口使用。

## 6. P2：运营配置和辅助能力

以下页面当前没有发现对应后台路由，建议按业务优先级补充：

- 电子合同：合同列表、合同详情、模板、印章、下载、作废
- 微信公众号：配置、粉丝、菜单、自动回复、模板消息、发送记录
- 短信：签名、模板、群组、发送记录、测试发送
- 系统设置：管理员、角色组、权限树、审计日志、广告位
- 平台设置：基础信息、内容单页、导航、支付配置、小程序配置、插件中心
- 礼物和积分：礼物、兑换记录、补发/取消、库存
- 合伙人：合伙人列表、关系、奖励配置、奖励明细
- 外呼：外呼平台、任务、通话记录、录音下载
- 会员推广和 VIP 线下服务记录

这些模块建议先由后端确认数据模型和权限边界，再给前端提供正式 OpenAPI，不建议前端先按页面名称猜路径。

## 7. 统一接口契约建议

### 7.1 分页

所有后台列表统一返回：

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 0,
  "has_more": false
}
```

建议统一限制：

```text
page >= 1
page_size 默认 20，最大 100
```

### 7.2 写操作

以下操作建议要求 `Idempotency-Key`：

- 新增订单
- 退款
- 结算
- 提现审核
- VIP 开通/续期/取消
- 批量审核
- 批量分配
- 消息发送

重复请求应返回原操作结果，而不是重复创建数据。

### 7.3 审计

所有后台写操作至少记录：

```text
operator_account_id
action
resource_type
resource_id
before_json
after_json
reason
request_id
ip
created_at
```

尤其是会员状态、红娘状态、分配、退款、提现、认证审核和配置修改。

### 7.4 脱敏

列表默认脱敏：

- 手机号：`138****0000`
- 身份证号：只返回前 3 位和后 4 位
- 微信号：按权限显示
- 支付账户：只返回掩码
- 录音地址：使用短期签名 URL，不返回永久公开地址

### 7.5 错误响应

建议统一：

```json
{
  "code": "MEMBER_STATUS_CONFLICT",
  "message": "当前状态不允许执行该操作",
  "request_id": "req_xxx",
  "details": {}
}
```

建议状态码：

- `400`：参数校验失败
- `401`：Token 无效或过期
- `403`：无权限
- `404`：资源不存在
- `409`：状态冲突或重复操作
- `422`：业务字段校验失败
- `429`：频率限制

## 8. 测试和环境核对结果

尝试运行：

```text
pytest -q tests/test_matchmaker_features.py tests/test_governance_contracts.py
```

结果未进入测试断言：

1. 系统 Python 环境缺少 `jose`，导入 `app.main` 失败。
2. 后端虚拟环境可以找到依赖，但导入时需要打开 `E:\houduan\xuanshiai\logs\app.log`，当前进程没有写权限。
3. pytest 还提示后端目录下 `.pytest_cache` 无写权限。

这不是后端业务断言失败，也没有因此修改后端代码。建议后端开发环境补齐依赖并修复日志目录权限后，再重新执行测试和 OpenAPI 生成检查。

## 9. 前端下一步接入顺序

1. 保持现有红娘后台登录和首页统计接入。
2. 完成会员 CRM、客源线索、红娘列表、门店、活动报名的真实列表和详情。
3. 补接 VIP、跟进、行为、服务申请、分配记录。
4. 等后端补齐账号、认证详情、门店编辑、财务订单/提现后，再接对应写操作。
5. 商家、短视频、微信、短信、合同、系统配置等页面暂时保留线上样式和交互骨架，接口未确认前不要伪造正式数据。
