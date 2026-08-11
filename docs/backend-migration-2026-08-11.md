# 红娘后台前端迁移记录

## 已接入

| 页面/功能 | 方法 | 接口 | 关键参数/返回 |
| --- | --- | --- | --- |
| 登录 | POST | `/api/v1/admin/matchmaker/auth/login` | body: `username`、`password`; 返回 `access_token`、`refresh_token`、`account` |
| 当前账号 | GET | `/api/v1/admin/matchmaker/auth/me` | 返回 `account`、`permissions` |
| 退出 | POST | `/api/v1/admin/matchmaker/auth/logout` | Bearer Token |
| 首页统计 | GET | `/api/v1/admin/dashboard/stats` | `member_count`、`vip_count`、`matchmaker_count`、`pending_service_count`、`active_service_count`、`pending_certification_count`、`today_new_member_count` |
| 会员列表 | GET | `/api/v1/admin/matchmaker/members` | `page`、`page_size`、`gender`、`status`、`vip`、`search`; 返回 `items/page/page_size/total/has_more` |
| 会员详情 | GET | `/api/v1/admin/matchmaker/members/{member_id}` | 列表字段 + `avatar`、`birthday`、`is_married`、`residence_city_code` |
| 会员状态 | PATCH | `/api/v1/admin/matchmaker/members/{member_id}/status` | `status=1/2/3`、`reason` |
| 有效 VIP | GET | `/api/v1/admin/members/vip` | `page`、`page_size`、`expiring_within_days`、`search` |
| 客源线索 | GET/POST/PATCH | `/api/v1/admin/customer-leads` | 列表筛选 `status/source/matchmaker_id/search`; 新增至少 `name + phone/wechat + source + intention_level` |
| 客源统计 | GET | `/api/v1/admin/customer-leads/statistics` | `total/new_count/contacted_count/intended_count/converted_count/lost_count` |
| 客源跟进 | GET/POST | `/api/v1/admin/customer-leads/{lead_id}/follow-ups` | `method=PHONE/WECHAT/VISIT/OTHER`、`content`、`intention_level`、`next_follow_at` |
| 红娘列表 | GET | `/api/v1/admin/matchmaker/matchmakers` | `page`、`page_size`; 返回 `user_id/nickname/avatar/intro/certification_tags/success_count/rating_score/is_available` |
| 红娘详情 | GET | `/api/v1/admin/matchmaker/matchmakers/{matchmaker_id}` | 红娘列表单项完整对象 |
| 红娘接单状态 | PATCH | `/api/v1/admin/matchmaker/matchmakers/{matchmaker_id}/status` | `status=1/2`、`reason` |
| 门店列表 | GET | `/api/v1/admin/matchmaker/branches` | 需要后端补充明确的分页参数与返回包装 |
| 门店详情 | GET | `/api/v1/admin/matchmaker/branches/{branch_id}` | `id/code/name/display_name/region_code/status/auto_redirect/created_at` |
| 新建门店 | POST | `/api/v1/admin/matchmaker/branches` | `code`、`name`、`display_name`、`region_code`、`auto_redirect` |
| 活动列表 | GET | `/api/v1/admin/activities` | `page`、`page_size`、`status`、`city`、`search` |
| 活动新增/编辑 | POST/PATCH | `/api/v1/admin/activities`、`/activities/{activity_id}` | `title`、`start_time`、`end_time`、`city`、`address`、`max_people`、`price`、`description` |
| 活动报名 | GET | `/api/v1/admin/activities/{activity_id}/signups` | `page`、`page_size`、`status`; 返回报名人及审核字段 |
| 服务申请 | GET/PATCH | `/api/v1/admin/matchmaker/service-requests`、`/service-requests/{service_id}` | `status=0/1/2/3`、`matchmaker_id`、`feedback` |
| 预约安排 | POST | `/api/v1/admin/matchmaker/meetings/requests/{request_id}/schedule` | `organizer_id`、`scheduled_at`、`location`、可选 `organization_id` |
| 分成规则 | GET/POST | `/api/v1/admin/finance/commission-rules` | `beneficiary_type`、`name`、`mode`、`fixed_amount/rate_percent`、`priority` |
| 分成报表 | GET | `/api/v1/admin/finance/report` | `beneficiary_type/beneficiary_id/order_count/total_amount/pending_amount/available_amount` |

## 仍缺少后端契约

以下页面目前只能保留线上同款 UI，不能安全接入新后端：

1. 平台账号：`/admin/users`、`/admin/users/login-logs`、账号状态修改、账号删除/导出。
2. 会员 CRM：会员跟进记录、行为总览、VIP 开通/续期/取消、认证详情查询。
3. 红娘/门店：红娘创建与编辑、门店状态修改、门店报表、门店成员移除、分配配置、分配明细。
4. 活动：活动配置、互选列表、互选记录、报名批量审核、活动封面上传。
5. 商家：商家列表/详情/编辑、商品管理、订单详情、订单退款。
6. 短视频：视频增删改查、视频审核、评论处理、首页配置、打赏/红包记录。
7. 财务：财务订单、提现列表、财务配置、电子合同、合同模板、印章管理。
8. 微信与短信：公众号配置、粉丝详情、菜单发布、自动回复、模板消息、发送记录、短信签名与测试发送。
9. 系统与平台：管理员、角色组、权限树、审计日志、广告位、平台内容、导航、支付配置、小程序配置、插件启停。
10. 运营工具：内容单页、礼物、积分兑换、合伙人、外呼任务、录音下载。

## 后端补充接口时必须写清

- HTTP 方法与完整路径，是否带 `/api/v1` 前缀。
- Header 要求：Bearer Token、Content-Type、幂等键、文件上传格式。
- 分页包装是否统一为 `items/page/page_size/total/has_more`。
- 每个筛选项的类型、枚举值、是否支持模糊查询和排序。
- 新增、编辑、审核、退款、提现的请求体示例和字段校验。
- 状态流转、重复提交、并发冲突对应的 HTTP 状态码。
- 脱敏字段规则：手机号、微信号、身份证、IP、录音下载地址。
- 权限码、数据范围和审计日志字段。
