# 会员 CRM 逆向对照与接口缺口

依据：`E:\virtual-c\www.xuanshiai.com.har`、当前管理后台前端，以及 `E:\houduan\xuanshiai` 后端代码。

## 已具备，可直接使用

后端已有对应实现，前端不需要照搬原站接口名称：

| 功能 | 当前接口 |
| --- | --- |
| 会员列表 | `GET /api/v1/admin/matchmaker/members` |
| 会员统计 | `GET /api/v1/admin/matchmaker/members/statistics` |
| 会员详情 | `GET /api/v1/admin/matchmaker/members/{id}` |
| 新增会员 | `POST /api/v1/admin/matchmaker/members` |
| 编辑基础资料 | `PATCH /api/v1/admin/matchmaker/members/{id}` |
| 会员状态 | `PATCH /api/v1/admin/matchmaker/members/{id}/status` |
| 认证汇总/详情 | `GET /api/v1/admin/matchmaker/members/{id}/certifications` |
| 审计记录 | `GET /api/v1/admin/matchmaker/members/{id}/audit-logs` |
| 服务跟进列表 | `GET /api/v1/admin/members/{id}/follow-ups` |
| 新增服务跟进 | `POST /api/v1/admin/members/{id}/follow-ups` |
| 线上行为 | `GET /api/v1/admin/members/{id}/behavior` |
| 牵线记录（双向） | `GET /api/v1/admin/members/{id}/match-records` |
| 约会记录 | `GET /api/v1/admin/members/{id}/dating-records` |
| 照片视频 | `GET /api/v1/admin/members/{id}/media` |
| 信息溯源（归属/推广） | `GET /api/v1/admin/members/{id}/source-records` |
| 推荐匹配 | `GET /api/v1/admin/members/{id}/recommendations` |
| 私密信息汇总 | `GET /api/v1/admin/members/{id}/private-info` |
| 活动报名 | `GET /api/v1/admin/members/{id}/activity-signups` |
| 超级管理汇总 | `GET /api/v1/admin/members/{id}/super-info` |
| 通话记录 | `GET /api/v1/admin/members/{id}/call-records`（当前稳定空分页） |
| VIP 列表和修改 | `GET /api/v1/admin/members/vip`、`PATCH /api/v1/admin/members/{id}/vip` |

## 前端目前可以先实现

这些功能可以基于现有接口做出接近原站的交互：

- 详情弹层头部、会员状态、基本资料表单。
- 认证信息标签，读取认证汇总接口。
- 服务跟进标签，读取跟进列表并复用新增跟进接口。
- 线上行为标签，读取行为流水。
- 超级管理标签，展示会员状态、VIP 状态、审计记录。
- 统计卡片和现有筛选条件。

## 仍需要补充后端接口

HAR 中原站详情工作区实际请求了以下能力，当前后端没有对应接口或数据契约：

| 原站功能 | HAR 参考请求 | 当前缺口 |
| --- | --- | --- |
| 照片视频 | `/commonadmin/api/image/getList?imageScene=LoveUser...` | 上传、删除、排序（列表读取已补） |
| 私密信息 | `/loveadmin/api/lovePrivateInfo/getPrivateInfoByLoveUserId` | 私密资料读取和权限控制 |
| 推荐匹配 | `/loveadmin/api/loveUserMatch/pageAutoMatchLoveUser` | 自动生成/刷新匹配；历史推荐读取已补 |
| 通话记录 | `/loveadmin/api/loveOutbound/getCallRecordsByLoveUserId` | 外呼/通话记录表和查询（当前无会员级通话表） |
| 牵线记录 | `/loveadmin/api/memberService/getLineRecordByLoveUserId` | 写入/业务状态流转（列表读取已补） |
| 被牵线记录 | `/loveadmin/api/memberService/getLineRecordByToLoveUserId` | 会员收到的牵线记录 |
| 约会记录 | `/loveadmin/api/loveDating/getDatingRecordList` | 反馈、编辑和状态流转（列表读取已补） |
| 活动报名 | `/commonadmin/api/active/pageMySelfActiveSignUp` | 读取已补；报名编辑/审核复用活动后台接口 |
| 信息溯源 | `/loveadmin/api/loveUser/getLoveCustomerUpdateRecords` | 专用资料修改历史表和写入审计（当前仅展示归属/推广历史） |
| 联系方式 | `/loveadmin/api/loveContact/getLoveUserContact` | 手机、微信展示权限和脱敏 |
| 超级管理详情 | `/loveadmin/api/loveUser/getLoveUserSuperInfo` | 汇总已补；置顶、合同等专用管理字段仍缺 |

## 列表差异

原站列表接口为 `pageLoveUser`，支持大量筛选参数；当前后端列表已支持性别、状态、VIP、认证、分派、搜索和跟进状态，但还缺：

- 多字段排序：注册时间、最后登录、最后跟进、下次跟进。
- 年龄、身高、体重区间。
- 婚况、学历、职业、收入、民族、标签多选。
- 家乡/现居地区级联筛选。
- 今日跟进、今日通话、今日登录、预约跟进等统计口径。
- 弃海会员和弃海记录。

当前前端会保留这些快捷卡片和筛选入口；后端补齐后再把字段接成真实查询。

## 建议补接口顺序

1. `GET /admin/members/{id}/detail` 聚合详情接口，减少弹层首次打开的多次请求。
2. `GET/POST /admin/members/{id}/match-records` 牵线记录。
3. `GET /admin/members/{id}/dating-records` 约会记录。
4. `GET /admin/members/{id}/media` 照片视频。
5. `GET /admin/members/{id}/source-records` 信息溯源。
6. 列表排序和高级筛选参数。

所有接口建议继续使用当前 `/api/v1/admin/...` 命名、独立红娘后台 Token 和现有分页格式，不必复刻原站 URL。
