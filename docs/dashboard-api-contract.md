# 概览页接口契约

## `GET /api/v1/admin/dashboard/stats`

权限：已登录的后台管理员。

用于管理后台概览页的 14 项指标、待审工作、趋势图、男女会员占比和线上收益占比。建议一次返回，避免首页并发请求多个统计接口。

```json
{
  "online_days": 0,
  "platform_user_count": 0,
  "wechat_fan_count": 0,
  "customer_lead_count": 0,
  "member_count": 0,
  "male_member_count": 0,
  "female_member_count": 0,
  "online_vip_count": 0,
  "offline_vip_count": 0,
  "online_income": 0,
  "offline_income": 0,
  "service_matchmaker_count": 0,
  "promotion_matchmaker_count": 0,
  "successful_match_count": 0,
  "pending": {
    "member_review": 0,
    "match_request": 0,
    "meeting_request": 0,
    "activity_signup": 0,
    "promotion_application": 0,
    "withdrawal": 0,
    "report": 0,
    "video_review": 0,
    "gift_exchange": 0,
    "member_promise": 0,
    "house_certification": 0,
    "education_certification": 0,
    "other_certification": 0
  },
  "member_trends": [{ "date": "2026-08-01", "count": 0 }],
  "lead_trends": [{ "date": "2026-08-01", "count": 0 }],
  "online_income_trends": [{ "date": "2026-08-01", "amount": 0 }],
  "offline_income_trends": [{ "date": "2026-08-01", "amount": 0 }],
  "revenue_share": [{ "name": "VIP会员", "percent": 0, "color": "#5a72ef" }]
}
```

约束：

- `online_income`、`offline_income`、趋势 `amount` 使用元，最多两位小数。
- 所有计数必须是非负整数；没有数据返回 `0` 或空数组，不能省略字段。
- 趋势按日期升序，最多 15 条；收益占比最多返回 5 条，`percent` 是 0-100 的数值。
- `pending` 中的数量必须受当前管理员的数据范围权限约束。
