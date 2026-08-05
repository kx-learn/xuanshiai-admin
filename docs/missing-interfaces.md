# 后台接口清单

## 接入方式

前端统一通过 `/api/backend/*` 代理到 `ADMIN_API_BASE_URL/api/v1/*`，代理支持 `GET`、`POST`、`PUT`、`PATCH`、`DELETE`，并透传登录 Cookie、Authorization 和请求体。`api/` 文档中的接口可直接按文档路径接入。

## 页面需要但文档未覆盖

以下后台页面目前仍使用 mock 数据，后端文档没有对应管理端契约：

- `GET /api/v1/admin/dashboard/stats`：首页统计卡片、趋势图和待处理数量。
- `GET /api/v1/admin/users`、`GET /api/v1/admin/users/{user_id}`、`GET /api/v1/admin/users/login-logs`：账号和登录日志。
- `GET|POST|PATCH /api/v1/admin/customer-leads`：客源线索、跟进记录、线索配置。
- `GET|POST|PATCH /api/v1/admin/members`：会员 CRM、VIP、行为和统计。
- `GET|POST|PATCH /api/v1/admin/matchmakers`、`/branches`：红娘、分店、分成和分配。
- `GET|POST|PATCH /api/v1/admin/activities`：活动、报名、互选和配置。
- `GET|POST|PATCH /api/v1/admin/merchants`、`/merchant-products`、`/merchant-orders`：商家、商品和订单。
- `GET|POST|PATCH /api/v1/admin/videos`、`/video-comments`、`/video-tips`：短视频后台。
- `GET|POST|PATCH /api/v1/admin/finance/*`：财务和电子合同。
- `GET|POST|PATCH /api/v1/admin/wechat/*`、`/sms/*`：公众号和短信后台。
- `GET|POST|PATCH /api/v1/admin/system/*`、`/platform/*`：系统与平台配置。

补齐这些接口时还需要明确分页格式、筛选字段、写操作幂等性、响应字段和管理员权限校验。
