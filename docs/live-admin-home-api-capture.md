# 甲方后台首页接口实测清单

> 来源：`https://www.xuanshiai.com/admin/home` 在已登录会话中的只读网络抓取，抓取日期：2026-08-17。
>
> 本文保留请求路径、方法、查询参数、HTTP 状态和返回字段类型；不保存真实姓名、手机号、账号、域名、租户标识、交易金额等实际数据。下面的 `string`、`number`、`boolean`、`null` 是实际响应中观察到的类型，不是演示数据。

## 通用约定

- 线上接口根域名：`https://www.xuanshiai.com`
- 已观察到的业务前缀：`/common/api`、`/commonadmin/api`、`/loveadmin/api`
- 访问需要已登录的管理端会话。鉴权 Header / Cookie 未记录到本文，也不应在新服务中复制或泄露。
- 所有本次成功响应的外层结构一致：

```ts
type ApiResponse<T> = {
  code: number;
  data: T;
  msg: string;
  success: boolean;
};
```

- 本次抓取的所有业务接口均为 `GET` 且返回 `HTTP 200`。`t`、`timer` 是前端防缓存随机参数，不是业务参数，重构接口可移除或由客户端统一添加。
- 分页对象为 MyBatis-Plus 风格：`current`、`size`、`total`、`pages`、`records`，另带 `countId`、`maxLimit`、`optimizeCountSql`、`orders`、`searchCount`。

## 首页初始化链路

|顺序|接口|请求参数|用途|
|---|---|---|---|
|1|`GET /common/api/image/getConfig`|`t=base`|图片上传、域名和水印配置|
|2|`GET /common/api/system/getTenantDetail`|`t=base`|租户基础信息|
|3|`GET /commonadmin/api/adminUser/info`|无|当前管理员与权限|
|4|`GET /commonadmin/api/mUpdRep/getFirstVersion`|无|更新公告初始版本|
|5|`GET /commonadmin/api/system/getTenantAuth`|无|租户授权、额度和服务状态|
|6|`GET /common/api/config/getSystemBaseConfig`|`t=1`|平台品牌及基础配置|
|7|`GET /commonadmin/api/feedback/checkFeedbackWhetherView`|无|工单反馈是否已查看|
|8|`GET /commonadmin/api/adv/getPlatformCategoryList`|`type=Guides`, `whetherOpen=true`|顶部“婚创学苑”栏目|
|9|`GET /commonadmin/api/recharge/getFinItems`|无|可充值的财务项目|
|10|`GET /commonadmin/api/sms/getStastics`|`t=<random>`|短信余额和发送统计|
|11|`GET /commonadmin/api/system/getIncomeRank`|无|收益占比图|
|12|`GET /commonadmin/api/system/getTenantData`|无|租户总览统计|
|13|`GET /commonadmin/api/system/getIndexTopStatistics`|无|顶部统计卡及待办|
|14|`GET /loveadmin/api/loveUser/getAdminIndexLoveUserStatisticByDay`|见下文|会员趋势图|
|15|`GET /commonadmin/api/finOrder/getOrderStatics`|见下文|收益趋势图|
|16|`GET /loveadmin/api/loveUser/getAdminIndexStatistic`|无|会员、红娘、待审核统计|
|17|`GET /commonadmin/api/mUpdRep/getWhetherNewReport`|无|是否有新公告|
|18|`GET /commonadmin/api/mUpdRep/getAllVersions`|无|公告版本列表|
|19|`GET /commonadmin/api/mUpdRep/getUnreadNum`|无|未读公告数量|
|20|`GET /commonadmin/api/mUpdRep/pageUpdReps`|`page=1`, `limit=100`, `category=`, `updRepTitleOrId=`|公告列表|

`/commonadmin/api/adminUser/info` 在初始化中出现两次，建议新实现中做请求去重。

## 接口返回契约

### 平台与当前账号

#### `GET /common/api/image/getConfig?t=base`

```ts
type ImageConfig = {
  accessKey: string; // 敏感：建议改为服务端签发临时上传凭证
  bucket: string;
  fileDomain: string;
  imageWmType: string;
  uploadDomain: string;
  videoPrivateQueue: string;
  wmContent: string;
  wmFont: string;
  wmFontColor: string;
  wmFontSize: number;
  wmGravity: string;
  wmOpen: boolean;
  wmResize: number;
  wmRotate: number;
  wmTransparency: number;
  wmUnitH: number;
  wmUnitW: number;
  wmXdistance: number;
  wmYdistance: number;
};
```

#### `GET /common/api/system/getTenantDetail?t=base`

```ts
type TenantDetail = {
  alias: string; bindingDomain: string; bindingDomainWithHttps: string;
  certificationLocked: boolean; concurrentNumLimit: number;
  customerName: string; dbName: string; faceProvider: string | null;
  grantAuthDeadline: string; grantPluginIds: string; h5UsingFaceId: boolean;
  id: number; maritalStatusLocked: boolean; maritalStatusProvider: string | null;
  name: string; phone: string; regionDataMode: string; signLocked: boolean;
  smsChannel: string; smsLocked: boolean; smsSignature: string; whetherLock: boolean;
};
```

#### `GET /commonadmin/api/adminUser/info`

```ts
type AdminUser = {
  account: string; groupId: number; id: number; name: string;
  permissions: string[]; pwd: string; whetherLock: boolean; whetherOrdinaryPage: boolean;
};
```

`pwd` 不应在重构后的任何响应中返回。前端仅需要 `id`、`name`、`account`、`permissions` 和状态字段。

#### `GET /common/api/config/getSystemBaseConfig?t=1`

```ts
type SystemBaseConfig = {
  adminLogo: string; areaId: number; areaName: string; bindingDomain: string;
  businessEntity: string | null; cityId: number; cityName: string; createTime: string;
  customerArea: string; customerLogo: string; customerServicePhone: string;
  customerServiceWechat: string; customerServiceWechatQrCode: string;
  customerWords: string; domainRecord: string; id: number; indexShowType: string;
  matchmakerPlatformLogo: string | null; mobileBottomContent: string; name: string;
  pcBottomContent: string; policeFiling: string | null; privacyTipContent: string;
  provinceId: number; provinceName: string; statisticsCode: string; topBackground: string;
  updateTime: string; userAgreement: string; whetherOpenLink: boolean;
};
```

#### `GET /commonadmin/api/system/getTenantAuth[?timer=<random>]`

```ts
type TenantAuth = {
  afterSaleTechnicalId: number; afterSaleTechnicalName: string; alias: string;
  areaId: number; areaName: string; authAgreement: string; bindingDomain: string;
  certificationLocked: boolean; cityId: number; cityName: string;
  concurrentNumLimit: number; createTime: string; customerArea: string;
  customerLogo: string; customerManagerId: number; customerManagerName: string;
  customerName: string; customerWords: string; dbName: string; faceProvider: string;
  grantAuthDeadline: string; grantPluginIds: string; h5UsingFaceId: boolean; id: number;
  indexShowType: string; maritalStatusSurplusNum: number; name: string; phone: string;
  protectDeadline: string | null; provinceId: number; provinceName: string;
  realNameSurplusNum: number; regionDataMode: string; serverType: string;
  signSurplusNum: number; smsChannel: string; smsLocked: boolean; smsSignature: string;
  smsSurplusNum: number; sslDomain: string; sslFromTime: string; sslToTime: string;
  sslUploadTime: string; versionType: string; whetherLock: boolean;
  whetherOpenLink: boolean; whetherProtect: boolean;
};
```

### 首页统计与图表

#### `GET /commonadmin/api/system/getTenantData`

```ts
type TenantData = {
  curMonthIncome: number; detailsViews: number; indexViews: number;
  lastLoginTime: string; lastMonthIncome: number; loveUserNums: number;
  regUserNums: number; tenantId: number; totalIncome: number; wechatFans: number;
};
```

#### `GET /commonadmin/api/system/getIndexTopStatistics`

```ts
type IndexTopStatistics = {
  activeSignUpAuditingNum: number; finCashoutAuditingNum: number;
  giftExchangeAuditingNum: number; onlineDays: number; onlineIncome: number;
  regUserNum: number; shortVideoAuditingNum: number; wechatFansNum: number;
};
```

#### `GET /loveadmin/api/loveUser/getAdminIndexStatistic`

```ts
type AdminIndexStatistic = {
  appointmentAuditingNum: number; commitmentAuditingNum: number;
  educationAuditingNum: number; femaleNums: number; houseAuditingNum: number;
  lineAuditingNum: number; loveCustomerNums: number; loveUserAuditingNum: number;
  maleNums: number; matchmakerNums: number; noSingleNums: number;
  offlineIncome: number; offlineVipNums: number; otherAuditingNum: number;
  popMatchmakerNums: number; popularizeAuditingNum: number; reportAuditingNum: number;
  total: number; vipNums: number;
};
```

#### `GET /commonadmin/api/system/getIncomeRank`

```ts
type IncomeRankItem = {
  income: number; proportion: number; serviceType: string; serviceTypeCode: number;
};
// ApiResponse<IncomeRankItem[]>
```

#### `GET /loveadmin/api/loveUser/getAdminIndexLoveUserStatisticByDay`

实际请求：

```text
?limit=15&page=1
&createFromTime=2026-08-02+00:00:00
&createToTime=2026-08-17+23:59:59
```

|参数|类型|说明|
|---|---|---|
|`limit`|number|统计天数与分页大小，首页为 15|
|`page`|number|页码，首页为 1|
|`createFromTime`|`YYYY-MM-DD HH:mm:ss`|包含起始日 00:00:00|
|`createToTime`|`YYYY-MM-DD HH:mm:ss`|包含结束日 23:59:59|

本次会话在该日期范围内的 `data` 为空数组，无法从实际返回确定单日记录字段。后端需提供有数据日期范围的样本或 OpenAPI，再补齐此项；不可凭前端图表猜测字段。

#### `GET /commonadmin/api/finOrder/getOrderStatics`

实际请求：

```text
?dateStatisticType=Day&whetherDesc=false&limit=15&page=1
&fromTime=2026-08-02+00:00:00
&endTime=2026-08-17+23:59:59
```

|参数|类型|说明|
|---|---|---|
|`dateStatisticType`|string|聚合粒度，首页为 `Day`|
|`whetherDesc`|boolean|排序方向，首页为 `false`|
|`limit` / `page`|number|分页，首页为 `15` / `1`|
|`fromTime` / `endTime`|`YYYY-MM-DD HH:mm:ss`|统计闭区间|

```ts
type OrderStatisticRecord = {
  day: string; month: string; year: string;
  refundAmount: number | null; refundQty: number | null;
  refundedAmount: number | null; refundedQty: number | null;
  totalAmount: number | null; totalQty: number | null;
};
type Page<T> = {
  countId: string | null; current: number; maxLimit: number | null;
  optimizeCountSql: boolean; orders: unknown[]; pages: number; records: T[];
  searchCount: boolean; size: number; total: number;
};
// ApiResponse<Page<OrderStatisticRecord>>
```

### 顶部辅助菜单、消息与运营

#### `GET /commonadmin/api/adv/getPlatformCategoryList?type=Guides&whetherOpen=true`

```ts
type GuideCategory = {
  categoryType: string; desc: string | null; id: number; image: string | null;
  name: string; parentId: number; secondDicCategoryList: GuideCategory[];
  sort: number; whetherMatchmakerClassOpen: boolean; whetherOpen: boolean;
};
// ApiResponse<GuideCategory[]>
```

#### 其他顶部数据接口

|接口|参数|`data` 类型与字段|
|---|---|---|
|`GET /commonadmin/api/recharge/getFinItems`|无|`{ id:number; name:string; numTimes:number; price:number; type:string }[]`|
|`GET /commonadmin/api/sms/getStastics`|`t=<random>`|`{ sendFail:number; sendSucess:number; smsSurplusNum:number }`，线上字段拼写即为 `sendSucess`|
|`GET /commonadmin/api/feedback/checkFeedbackWhetherView`|无|`boolean`|
|`GET /commonadmin/api/mUpdRep/getFirstVersion`|无|`{ id:number; isFirst:boolean; name:string }`|
|`GET /commonadmin/api/mUpdRep/getWhetherNewReport`|无|`boolean`|
|`GET /commonadmin/api/mUpdRep/getAllVersions`|无|`{ id:number; isFirst:boolean; name:string }[]`|
|`GET /commonadmin/api/mUpdRep/getUnreadNum`|无|`number`|

#### `GET /commonadmin/api/mUpdRep/pageUpdReps`

实际请求：`?page=1&limit=100&category=&updRepTitleOrId=`。

|参数|类型|说明|
|---|---|---|
|`page` / `limit`|number|分页|
|`category`|string|公告类别，可为空|
|`updRepTitleOrId`|string|标题或 ID 搜索，可为空|

```ts
type UpdateReport = {
  category: string; createTime: string; id: number; intOrder: number; linkTo: string;
  title: string; titleBold: boolean; titleColor: string; top: boolean;
  versionId: number; whetherRead: boolean | null;
};
// ApiResponse<Page<UpdateReport>>
```

## 顶部菜单复刻清单

线上顶部深色栏从左到右包含：

1. 品牌/租户 Logo：来自 `SystemBaseConfig.adminLogo` 或 `customerLogo`。
2. 当前页面标签与可关闭的页签区：首页路径为 `/admin/home`。
3. 公告/消息入口：`getWhetherNewReport`、`getUnreadNum`、`pageUpdReps`。
4. 短信/充值状态入口：`getStastics`、`getFinItems`。
5. 租户授权、服务期限和余额类状态：`getTenantAuth`。
6. `婚创学苑`：路由 `/admin/operate-center`，菜单数据来自 `getPlatformCategoryList?type=Guides&whetherOpen=true`。
7. `应用中心`：路由 `/admin/plugin-center`。
8. `工单反馈`：路由 `/admin/system-feedback`，红点来自 `checkFeedbackWhetherView`。
9. `软件授权`：路由 `/admin/system-empower`。
10. 当前管理员用户菜单：显示 `AdminUser.name` / `account`，权限以 `permissions` 决定；重构时不返回 `pwd`。

## 后端重构待确认项

1. `/loveadmin/api/loveUser/getAdminIndexLoveUserStatisticByDay` 在本次日期范围为零条，需提供非空样例以确认 `records` 字段。
2. 各接口非 200 时的 `code` 枚举、`msg` 文案和会话过期语义未在本次成功流量中观察到。
3. 当前线上把上传 `accessKey` 和管理员 `pwd` 放入响应，属于不应继承的风险点；新服务应按最小返回字段设计。
4. 统计金额的单位、是否含退款、时区和范围边界需作为后端契约明确，尤其是 `getOrderStatics` 与 `getIncomeRank`。

---

# 后端开发说明书（首页和顶部导航）

本章是给重构后端直接排期和开发使用的规范。上一章记录的是甲方线上接口的观察结果；本章定义新服务需要保证的业务结果。若前端短期仍按甲方字段接入，请实现“原接口兼容层”。若由本项目的前端接入，请优先实现“推荐新接口”。

## 1. 实现范围与优先级

### P0：首页能完整打开

1. 当前管理员身份和权限。
2. 平台品牌、租户授权和额度数据。
3. 14 个统计卡片、13 个待办数量、四组图表数据。
4. 顶部的更新报告未读数、工单红点、短信余额和充值项目。

### P1：顶部菜单完整可用

1. 婚创学苑栏目树。
2. 应用中心、工单反馈、软件授权的访问权限和未读状态。
3. 当前管理员的显示名称、退出、权限控制。

### 不在本批范围内

充值下单、公告已读写入、工单创建、云端图库、手机版跳转的写操作。本批只需提供这些入口展示所需的读接口；写操作须另行定义状态机和支付/审计方案。

## 2. 推荐新接口

为了避免首页加载 20 多个接口，建议新后端提供聚合接口，同时保留旧路由别名供过渡。请求一律使用 `application/json; charset=utf-8`。

|优先级|方法与路径|说明|缓存建议|
|---|---|---|---|
|P0|`GET /api/v1/admin/bootstrap`|当前会话、品牌、授权、顶部状态|30 秒，按租户和管理员隔离|
|P0|`GET /api/v1/admin/dashboard`|概览卡、待办、趋势、性别、收益占比|30 至 60 秒，按数据权限隔离|
|P0|`GET /api/v1/admin/announcements`|更新报告分页列表|30 秒|
|P1|`GET /api/v1/admin/academy/categories`|婚创学苑树|5 分钟|
|P1|`GET /api/v1/admin/finance/recharge-items`|充值项和可用余额摘要|30 秒|

### 2.1 通用请求头与鉴权

```http
Authorization: Bearer <access_token>
Accept: application/json
X-Request-Id: <uuid>                  # 客户端建议传；后端也可生成
```

- `tenant_id`、管理员 ID、角色、数据范围必须从已验证的 token/session 中取得，不能由 query 或 body 传入。
- 管理员被锁定、租户被锁定或授权过期时，返回明确的业务错误；不得返回其他租户的数据。
- 用于图表和待办的查询必须走当前管理员的数据范围。超级管理员、门店管理员、红娘管理员看到的数值可以不同。
- 返回日期一律为 ISO 8601 带时区格式，例如 `2026-08-17T23:59:59+08:00`；前端显示时再格式化。兼容层可继续接受甲方的 `YYYY-MM-DD HH:mm:ss` 查询格式。

### 2.2 通用成功与失败结构

推荐新服务统一采用以下结构；旧接口兼容层可维持甲方的 `code/data/msg/success` 包装。

```ts
type Success<T> = {
  request_id: string;
  data: T;
};

type Failure = {
  request_id: string;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>; // 参数校验错误，key 为请求字段名
  };
};
```

|HTTP|业务错误码|触发条件|前端处理|
|---:|---|---|---|
|400|`VALIDATION_ERROR`|日期、页码、枚举或时间范围不合法|显示字段错误，不重试|
|401|`UNAUTHENTICATED`|未登录、token 无效或会话过期|清除会话并跳转登录|
|403|`FORBIDDEN`|无菜单或数据范围权限|显示无权访问，不泄露统计值|
|404|`NOT_FOUND`|租户、公告或资源不存在|显示空态或资源不存在|
|409|`STATE_CONFLICT`|授权、配置或充值项目状态不允许当前操作|刷新状态后提示|
|429|`RATE_LIMITED`|短信、公告轮询或聚合接口过频|按 `Retry-After` 延迟|
|500|`INTERNAL_ERROR`|未预期异常|记录 `request_id`，前端可重试一次|

## 3. `GET /api/v1/admin/bootstrap`

### 目的

一次提供布局在任意后台页面都需要的数据。该接口替代旧系统中的管理员信息、租户详情、授权、基础配置、工单红点、短信统计和充值项目等初始化请求。

### 请求

无 query 参数。身份来自 `Authorization`。

### 成功响应

```json
{
  "request_id": "uuid",
  "data": {
    "operator": {
      "id": 42,
      "account": "admin@example.invalid",
      "display_name": "管理员",
      "role_ids": [1],
      "permissions": ["dashboard:read", "feedback:read"],
      "locked": false
    },
    "tenant": {
      "id": 8,
      "name": "平台名称",
      "alias": "tenant-alias",
      "logo_url": "https://cdn.example.invalid/logo.png",
      "region": { "province": "", "city": "", "area": "" },
      "site_url": "https://example.invalid",
      "locked": false
    },
    "authorization": {
      "plan": "standard",
      "expires_at": "2026-12-31T23:59:59+08:00",
      "locked": false,
      "features": ["sms", "e_contract"],
      "quotas": {
        "sms_remaining": 0,
        "real_name_remaining": 0,
        "e_contract_remaining": 0,
        "marital_status_remaining": 0
      }
    },
    "header": {
      "unread_announcement_count": 0,
      "has_new_announcement": false,
      "has_unread_feedback": false,
      "sms": { "success_count": 0, "failed_count": 0, "remaining_count": 0 },
      "links": {
        "academy": "/operate-center",
        "plugin_center": "/plugin-center",
        "feedback": "/system-feedback",
        "license": "/system-empower",
        "matchmaker_console": "/crm/home"
      }
    }
  }
}
```

### 字段和校验规则

|字段|必填|类型|规则|
|---|---|---|---|
|`operator.id`|是|integer|管理员主键，只能为当前会话本人|
|`operator.account`|是|string|账号展示值；不能包含密码或 token|
|`operator.permissions`|是|string[]|权限编码去重后返回；无权限返回空数组|
|`tenant.logo_url`|否|URL|无 Logo 返回 `null`，不能返回对象存储密钥|
|`authorization.expires_at`|否|datetime|永久授权可为 `null`|
|`authorization.quotas.*`|是|integer|非负整数；未知或未开通返回 `0`，不返回 `null`|
|`header.unread_announcement_count`|是|integer|非负整数；后端按当前管理员已读记录计算|
|`header.has_unread_feedback`|是|boolean|工单有未读回复为 `true`|

### 对甲方旧接口的映射

|`bootstrap` 字段|甲方线上来源|
|---|---|
|`operator`|`GET /commonadmin/api/adminUser/info`|
|`tenant`|`GET /common/api/system/getTenantDetail?t=base` + `GET /common/api/config/getSystemBaseConfig?t=1`|
|`authorization`|`GET /commonadmin/api/system/getTenantAuth`|
|`header.has_unread_feedback`|`GET /commonadmin/api/feedback/checkFeedbackWhetherView`|
|`header.sms`|`GET /commonadmin/api/sms/getStastics?t=<random>`|
|公告计数|`GET /commonadmin/api/mUpdRep/getWhetherNewReport` + `getUnreadNum`|

## 4. `GET /api/v1/admin/dashboard`

### 请求参数

|参数|位置|必填|类型|默认值|校验|
|---|---|---:|---|---|---|
|`from`|query|否|date|结束日期往前 14 天|`YYYY-MM-DD`，不能晚于 `to`|
|`to`|query|否|date|当天|`YYYY-MM-DD`，单次范围不超过 366 天|
|`timezone`|query|否|string|租户时区|IANA 时区；推荐 `Asia/Shanghai`|

首页调用示例：

```http
GET /api/v1/admin/dashboard?from=2026-08-02&to=2026-08-17&timezone=Asia%2FShanghai
```

### 成功响应

```json
{
  "request_id": "uuid",
  "data": {
    "metrics": {
      "online_days": 0,
      "platform_user_count": 0,
      "wechat_fan_count": 0,
      "customer_lead_count": 0,
      "member_count": 0,
      "male_member_count": 0,
      "female_member_count": 0,
      "online_vip_count": 0,
      "offline_vip_count": 0,
      "online_income": "0.00",
      "offline_income": "0.00",
      "service_matchmaker_count": 0,
      "promotion_matchmaker_count": 0,
      "successful_match_count": 0
    },
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
    "trends": {
      "members": [{ "date": "2026-08-02", "count": 0 }],
      "leads": [{ "date": "2026-08-02", "count": 0 }],
      "online_income": [{ "date": "2026-08-02", "amount": "0.00" }],
      "offline_income": [{ "date": "2026-08-02", "amount": "0.00" }]
    },
    "member_gender": { "male_count": 0, "female_count": 0, "total_count": 0 },
    "income_rank": [{ "service_type": "vip", "service_name": "VIP会员", "amount": "0.00", "percent": 0 }]
  }
}
```

### 统计口径（必须由后端固化）

|字段|口径|数据类型|
|---|---|---|
|`online_days`|租户上线日期至当前租户时区的自然日数，首日为 1|非负整数|
|`platform_user_count`|未删除的平台账号总数，是否含禁用账号需统一为“含”|非负整数|
|`customer_lead_count`|当前管理员数据范围内未删除的客源线索总数|非负整数|
|`member_count`|当前管理员数据范围内相亲会员总数|非负整数|
|`male_member_count` / `female_member_count`|性别为 male/female 的会员数；未知性别不计入两者|非负整数|
|`online_vip_count` / `offline_vip_count`|统计时刻处于有效期内的对应 VIP，不含过期/退款完成记录|非负整数|
|`online_income` / `offline_income`|有效已支付订单金额减已完成退款；货币为 CNY 元，字符串两位小数|decimal string|
|`successful_match_count`|当前数据范围内状态为成功脱单的会员数，需明确是否按人还是按关系计数|非负整数|
|`pending.*`|待办状态的实时数量；被当前管理员无权查看的资源不能计入|非负整数|

趋势数组必须从 `from` 到 `to` 逐日补零、按日期升序返回。即使某日没有数据也必须返回 `{ date, count: 0 }` 或 `{ date, amount: "0.00" }`。收入排行按 `amount` 降序，最多 5 条；`percent` 取值 0 至 100，全部条目之和允许因四舍五入产生不超过 `0.01` 的误差。

### 对甲方旧接口的映射

|新字段|甲方线上接口和字段|
|---|---|
|`metrics.online_days`、`platform_user_count`、`wechat_fan_count`、部分收入|`GET /commonadmin/api/system/getTenantData`|
|部分顶部卡与待办|`GET /commonadmin/api/system/getIndexTopStatistics`|
|会员、红娘、认证和待办数量|`GET /loveadmin/api/loveUser/getAdminIndexStatistic`|
|`trends.members` / `trends.leads`|`GET /loveadmin/api/loveUser/getAdminIndexLoveUserStatisticByDay`|
|`trends.online_income` / `trends.offline_income`|`GET /commonadmin/api/finOrder/getOrderStatics`|
|`income_rank`|`GET /commonadmin/api/system/getIncomeRank`|

## 5. 公告、学苑和充值接口

### 5.1 `GET /api/v1/admin/announcements`

|参数|必填|类型|默认|限制|
|---|---:|---|---|---|
|`page`|否|integer|1|最小 1|
|`page_size`|否|integer|20|1 至 100|
|`category`|否|string|空|枚举：`upgrade`、`improvement`、`feature`、`bugfix`、`other`|
|`keyword`|否|string|空|最大 100 字符，按标题和 ID 搜索|

```json
{
  "request_id": "uuid",
  "data": {
    "items": [{
      "id": 1,
      "category": "feature",
      "title": "更新标题",
      "title_color": "#333333",
      "title_bold": false,
      "pinned": false,
      "link_url": null,
      "version": "9.0",
      "published_at": "2026-08-17T12:00:00+08:00",
      "read": false
    }],
    "page": 1,
    "page_size": 20,
    "total": 0
  }
}
```

兼容甲方：`GET /commonadmin/api/mUpdRep/pageUpdReps?page=1&limit=100&category=&updRepTitleOrId=`。其中 `limit` 映射到 `page_size`，`updRepTitleOrId` 映射到 `keyword`。

### 5.2 `GET /api/v1/admin/academy/categories`

无参数。返回树结构，最多两层；同级按 `sort` 升序，`enabled=false` 的节点不返回。

```json
{
  "request_id": "uuid",
  "data": [{
    "id": 1,
    "name": "栏目名称",
    "type": "guides",
    "description": null,
    "image_url": null,
    "sort": 0,
    "enabled": true,
    "children": []
  }]
}
```

兼容甲方：`GET /commonadmin/api/adv/getPlatformCategoryList?type=Guides&whetherOpen=true`。`secondDicCategoryList` 映射为 `children`，`whetherOpen` 映射为 `enabled`。

### 5.3 `GET /api/v1/admin/finance/recharge-items`

无参数。金额使用十进制字符串，不得使用 JSON 浮点数保存货币。

```json
{
  "request_id": "uuid",
  "data": {
    "items": [{ "id": 1, "name": "短信1000条", "type": "sms", "quantity": 1000, "price": "51.00", "enabled": true }]
  }
}
```

兼容甲方：`GET /commonadmin/api/recharge/getFinItems`，字段 `numTimes` 对应 `quantity`，`price` 应转换为两位小数金额。

## 6. 原接口兼容层详细要求

如果甲方前端不修改请求地址，以下路由、HTTP 方法、参数名称和外层返回包装必须保持不变。所有接口均要求已登录管理端会话，成功时返回 `HTTP 200` + `{ code, data, msg, success }`。

|原接口|参数校验|兼容返回 `data`|开发要点|
|---|---|---|---|
|`GET /commonadmin/api/adminUser/info`|无|`AdminUser`|`pwd` 旧端如强依赖可返回固定空串；新端绝不返回密码散列或明文|
|`GET /common/api/system/getTenantDetail`|`t` 可忽略|`TenantDetail`|手机号、域名、数据库名仅超级管理员可见；其他角色返回脱敏或 `null`|
|`GET /common/api/config/getSystemBaseConfig`|`t` 可忽略|`SystemBaseConfig`|`customerServicePhone/Wechat` 按角色脱敏；Logo 必须为可访问 URL|
|`GET /commonadmin/api/system/getTenantAuth`|`timer` / `t` 可忽略|`TenantAuth`|配额、到期时间、功能开关由授权服务/配置表提供；禁止把 SSL 私钥等敏感内容放入响应|
|`GET /commonadmin/api/system/getTenantData`|无|`TenantData`|总量/收入按数据范围计算，金额返回 number 仅为旧端兼容；内部用 decimal|
|`GET /commonadmin/api/system/getIndexTopStatistics`|无|`IndexTopStatistics`|每个字段必须始终存在；无值为 `0`|
|`GET /loveadmin/api/loveUser/getAdminIndexStatistic`|无|`AdminIndexStatistic`|会员与审核数按权限过滤；无值为 `0`|
|`GET /commonadmin/api/system/getIncomeRank`|无|`IncomeRankItem[]`|按收益降序、最多 5 条，`proportion` 固定为 0-100|
|`GET /loveadmin/api/loveUser/getAdminIndexLoveUserStatisticByDay`|`page>=1`、`1<=limit<=366`、开始结束时间合法|数组|待甲方提供非空样本确认字段；新实现优先由聚合 dashboard 返回|
|`GET /commonadmin/api/finOrder/getOrderStatics`|`dateStatisticType` 枚举、`limit/page`、时间范围|`Page<OrderStatisticRecord>`|`Day` 时按自然日聚合；记录不存在时应补零|
|`GET /commonadmin/api/adv/getPlatformCategoryList`|`type=Guides`、`whetherOpen=true/false`|`GuideCategory[]`|按 `sort` 升序；只返回当前管理员可见栏目|
|`GET /commonadmin/api/recharge/getFinItems`|无|充值项数组|不可把“充值”实现为只读接口；真正扣款需独立创建订单接口|
|`GET /commonadmin/api/sms/getStastics`|`t` 可忽略|短信统计对象|旧字段 `sendSucess` 拼写保持兼容，同时新接口使用 `success_count`|
|`GET /commonadmin/api/feedback/checkFeedbackWhetherView`|无|boolean|`true` 表示顶部显示未读工单提示|
|`GET /commonadmin/api/mUpdRep/getFirstVersion`|无|版本对象|返回当前发布的首个/默认版本|
|`GET /commonadmin/api/mUpdRep/getWhetherNewReport`|无|boolean|当前管理员有未读版本时为 `true`|
|`GET /commonadmin/api/mUpdRep/getAllVersions`|无|版本数组|版本按发布顺序返回|
|`GET /commonadmin/api/mUpdRep/getUnreadNum`|无|integer|当前管理员的未读公告数量|
|`GET /commonadmin/api/mUpdRep/pageUpdReps`|`page>=1`、`1<=limit<=100`、搜索词最长 100|`Page<UpdateReport>`|空条件表示全量；数据库查询必须参数化，禁止字符串拼接|

## 7. 数据库/查询实现建议

1. 所有业务表至少带 `tenant_id`、`created_at`、`updated_at`、`deleted_at`；首页统计查询必须强制带 `tenant_id` 条件。
2. 统计接口的日期范围使用 `[from 00:00:00, to+1day 00:00:00)`，避免 `23:59:59` 精度问题。
3. 金额字段数据库使用 `DECIMAL(18,2)`，订单明细和退款明细单独建表；不要用 `float/double`。
4. 待办数建议从资源状态表聚合。状态字段应有枚举与索引，例如 `(tenant_id, review_status, deleted_at)`。
5. `dashboard` 可采用 30 至 60 秒租户级缓存；管理员数据范围不同则缓存 key 必须含权限范围哈希。
6. 公告已读关系使用 `announcement_reads(tenant_id, admin_user_id, announcement_id, read_at)`，不可通过全局公告状态判断“未读”。
7. 所有管理员读取、权限拒绝、充值写操作、工单写操作都应写入审计日志，至少记录 `request_id`、operator、tenant、动作、资源 ID、结果和时间。

## 8. 安全和验收条件

### 不得返回

- 管理员密码、密码散列、refresh token、session ID。
- 对象存储 `accessKey` / `secretKey`、支付商户密钥、SSL 私钥、微信 AppSecret。
- 无权限用户的手机号、身份证、微信号、合同、录音和客户资料。

### 联调验收

1. 管理员登录后，`bootstrap` 和 `dashboard` 均在 2 秒内可用；数据为空时返回完整结构和 0/空数组。
2. 修改租户授权、短信余额、公告已读状态后，缓存最长在 60 秒内失效，或通过事件主动失效。
3. 使用 A 租户 token 访问 B 租户资源时必须返回 403 或 404，绝不能返回数据。
4. 分店管理员和总店管理员访问同一 dashboard 时，成员数、待办数和收入数符合其数据范围。
5. 日期边界、无数据日期、退款订单、过期 VIP、禁用管理员、授权过期租户均有自动化测试。
6. 所有金额在响应里均保持两位小数；所有计数是非负整数；趋势没有断档。

---

# 逐接口功能说明（甲方首页原始接口）

本章逐条说明甲方首页实际发出的接口“做什么、什么时候调用、页面哪里使用、后端应该如何实现”。

标记说明：

- **实测**：请求路径、方法、参数、返回字段已经在甲方已登录首页流量中看到。
- **实现建议**：根据实测字段与页面组件推导出的后端职责，便于重构；如果甲方给出正式 OpenAPI，以甲方正式文档为准。
- 所有接口均是后台读接口，身份、租户和数据范围从会话取得，不能信任客户端传入的租户 ID。

## A. 公共初始化、品牌与权限

### A1. `GET /common/api/image/getConfig?t=base`

**功能：** 读取图片和视频上传的基础配置。甲方前端在后台首次加载时调用，用于后续上传头像、活动封面、短视频、合同图片等媒体时拼接访问地址、控制水印和选择视频处理队列。

**前端用途：** 不是首页统计卡片的直接数据源，而是全局媒体组件的初始化依赖。`fileDomain`、`uploadDomain` 决定文件 URL 和上传入口；`wm*` 字段控制图片水印样式；`videoPrivateQueue` 用于私密视频/转码队列。

**实测参数：**

|字段|值/类型|作用|
|---|---|---|
|`t`|`base`|甲方用于避免缓存或区分基础配置；重构后可忽略，不能用于鉴权|

**实测 `data` 字段说明：**

|字段|含义|后端实现要求|
|---|---|---|
|`fileDomain`|已上传文件的公开访问域名|返回 HTTPS URL 前缀，不带鉴权密钥|
|`uploadDomain`|上传服务入口|推荐返回后端签发上传地址，而非客户端直连永久对象存储凭证|
|`bucket`|对象存储桶标识|只在旧端确有依赖时返回；新端不建议暴露|
|`accessKey`|甲方旧端对象存储访问 Key|**禁止新服务返回**；改为短时、单对象、最小权限的预签名 URL 或 STS 凭证|
|`imageWmType`|水印类型|枚举由租户配置定义，例如 text/image/none|
|`wmOpen`|是否开启水印|关闭时其余水印字段可保留默认值|
|`wmContent`|文字水印内容|不得包含敏感信息；建议限制最大长度|
|`wmFont`、`wmFontSize`、`wmFontColor`|文字字体、字号、颜色|用于生成水印；后端需做白名单校验|
|`wmGravity`|水印锚点位置|建议枚举，例如 northWest/center/southEast|
|`wmXdistance`、`wmYdistance`|水印偏移|非负整数，单位需明确为 px 或比例|
|`wmTransparency`、`wmRotate`、`wmResize`、`wmUnitW`、`wmUnitH`|透明度、旋转、缩放、平铺参数|属于媒体处理参数；无功能需求时返回默认值即可|
|`videoPrivateQueue`|私密视频处理队列|新端应改为内部任务队列 ID，不向浏览器暴露云服务敏感配置|

**实现边界：** 此接口只能下发展示和上传策略，不能下发 `secretKey`、永久 `accessKey`、存储控制台地址或跨租户 bucket。真实上传应另外提供 `POST /uploads/presign`，并记录媒体归属的 `tenant_id`、operator、用途和过期时间。

### A2. `GET /common/api/system/getTenantDetail?t=base`

**功能：** 返回租户/平台的基础登记信息。甲方用于判断当前系统归属、域名绑定、短信通道、认证能力和若干业务开关。

**触发时机：** 首页和其他管理页面初始化。返回内容在本次响应中是单个租户对象，不是租户列表。

**字段用途：**

|字段组|字段|功能解释|
|---|---|---|
|身份|`id`、`name`、`alias`、`customerName`|识别当前平台，显示品牌名或用于内部日志，不应用于客户端切租户|
|域名|`bindingDomain`、`bindingDomainWithHttps`|前台/后台绑定域名展示与跳转配置；应只允许平台管理员修改|
|并发与状态|`concurrentNumLimit`、`whetherLock`|管理员并发登录限制与租户锁定开关；锁定后只允许查看授权/联系支持页面|
|认证开关|`certificationLocked`、`maritalStatusLocked`、`signLocked`、`h5UsingFaceId`、`faceProvider`、`maritalStatusProvider`|控制实名认证、婚姻状态核验、电子签约等入口可用性|
|短信|`smsChannel`、`smsLocked`、`smsSignature`|决定短信服务商、是否禁发和签名展示；不应返回短信服务商密钥|
|区域和插件|`regionDataMode`、`grantPluginIds`|控制数据范围/区域行为及授权插件；建议新端拆为结构化区域与 feature flags|
|内部配置|`dbName`、`phone`|甲方返回但不适合普通后台用户。`dbName` 新服务不应返回，`phone` 至少脱敏并受权限控制|

**实现建议：** `whetherLock=true` 时，前端仍可以读取基础品牌和授权到期信息，但所有业务读写接口应返回 `403 TENANT_LOCKED`。`grantPluginIds` 不建议继续用逗号字符串，改为 `features: string[]`。

### A3. `GET /commonadmin/api/adminUser/info`

**功能：** 获取当前已登录后台管理员的身份、权限与账户状态。这是所有页面决定“能看到哪些菜单、能执行哪些按钮”的核心接口。

**前端用途：** 顶栏显示管理员名称；左侧菜单根据 `permissions` 过滤；被锁定管理员跳出后台；普通页面模式由 `whetherOrdinaryPage` 控制。

**字段说明：**

|字段|用途|实现要求|
|---|---|---|
|`id`|当前管理员唯一 ID|从 token/session 获取，不接收客户端传入|
|`account`|登录账号/展示账号|可展示；手机号或邮箱形式需要脱敏策略|
|`name`|管理员显示名|顶栏使用；为空时前端回退到 `account`|
|`groupId`|权限组/角色 ID|用于兼容旧端；新端建议同时返回 `role_ids`|
|`permissions`|权限编码数组|菜单与按钮必须以此服务端授权为准，前端隐藏不是安全措施|
|`whetherLock`|账号是否锁定|为 true 时登录或后续接口应拒绝|
|`whetherOrdinaryPage`|是否使用普通页面模式|兼容旧系统的页面呈现开关，需要甲方确认业务含义|
|`pwd`|甲方响应中的密码字段|**不可实现**。即使旧前端读该字段，也只允许返回空字符串；绝不能回传明文、哈希或可验证密码材料|

**权限实现要求：** 接口返回权限只是给前端渲染用。每一个后端资源接口还必须在服务端执行 `permission + tenant scope + data scope` 三层校验。

### A4. `GET /commonadmin/api/system/getTenantAuth[?timer=<random>]`

**功能：** 获取租户授权合同、套餐、功能开关、授权期限和资源余额。甲方首页顶部的“当前版本”“用好系统”“充值”及受限功能开关依赖它。

**为什么会调用多次：** 首次初始化、顶部状态刷新以及防缓存随机参数都会触发。`timer` 或 `t` 不是业务参数，服务端应忽略。

**字段分组：**

|字段组|主要字段|页面/业务用途|
|---|---|---|
|授权身份|`id`、`alias`、`name`、`versionType`、`serverType`|顶部显示版本或决定功能套餐|
|授权期限|`grantAuthDeadline`、`protectDeadline`、`whetherProtect`|提示服务到期、维护保护状态；到期规则必须由服务端执行|
|功能开关|`certificationLocked`、`h5UsingFaceId`、`faceProvider`、`whetherOpenLink`|显示/隐藏实名、外链等模块|
|资源余量|`smsSurplusNum`、`realNameSurplusNum`、`signSurplusNum`、`maritalStatusSurplusNum`|充值弹窗显示剩余短信、人脸核验、电子签、婚况查询次数|
|服务关系|`customerManagerId/Name`、`afterSaleTechnicalId/Name`|甲方用于售后服务展示；新端应按员工权限控制|
|站点品牌|`customerLogo`、`customerWords`、`bindingDomain`、`sslDomain`|顶部/品牌展示；SSL 信息只允许返回公开域名与有效期，不返回证书私密材料|
|地区|`provinceId/Name`、`cityId/Name`、`areaId/Name`、`customerArea`|区域化运营、门店/数据范围归属|
|锁定状态|`whetherLock`、`smsLocked`、`concurrentNumLimit`|控制租户访问、短信发送及并发会话|

**实现建议：** 额度递减必须由支付、短信、实名核验、电子签等写操作所在的事务/账本服务负责，不能由该读接口自行计算或扣减。所有 `*SurplusNum` 最低为 0。授权过期与资源为 0 是两个独立状态，错误码和前端提示不能混用。

### A5. `GET /common/api/config/getSystemBaseConfig?t=1`

**功能：** 获取平台品牌与公共内容配置。甲方在后台顶栏、登录后页面和前台跳转时使用其中的 Logo、文案、客服联系信息、协议和备案信息。

**字段用途：**

|字段组|主要字段|功能|
|---|---|---|
|品牌|`adminLogo`、`customerLogo`、`name`、`customerWords`、`topBackground`|后台 Logo、平台名、顶部背景/标语|
|客服|`customerServicePhone`、`customerServiceWechat`、`customerServiceWechatQrCode`|帮助与客服入口；仅对授权角色展示，并按需要脱敏|
|地区|`province*`、`city*`、`area*`、`customerArea`|前台地域默认值与运营展示|
|网站信息|`bindingDomain`、`domainRecord`、`policeFiling`、`statisticsCode`|域名、备案、统计脚本；`statisticsCode` 不应允许任意脚本注入|
|协议|`userAgreement`、`privacyTipContent`|用户协议与隐私提示内容；应走 CMS 版本控制|
|页脚|`mobileBottomContent`、`pcBottomContent`|移动端/PC 页脚内容|
|展示开关|`indexShowType`、`whetherOpenLink`、`matchmakerPlatformLogo`|首页样式、外链和红娘平台 Logo 开关|

**安全要求：** 任何富文本字段必须在后台保存和前端渲染时做 HTML 白名单净化。`statisticsCode` 建议只允许可信脚本 ID，不直接回传或执行任意 `<script>`。

## B. 首页统计与待审工作

### B1. `GET /commonadmin/api/system/getTenantData`

**功能：** 返回租户整体经营概况的一部分。甲方首页用它显示平台用户、公众号粉丝、相亲会员、累计/本月收入、页面访问量及最近登录时间等概览信息。

**实测字段和解释：**

|字段|说明|建议数据来源|
|---|---|---|
|`tenantId`|当前租户 ID|会话上下文，仅用于内部关联；前端不应依此切换租户|
|`regUserNums`|平台注册用户数|用户表中未删除账号的聚合，明确是否包含禁用账号|
|`loveUserNums`|相亲会员数|会员表聚合，按管理员数据范围过滤|
|`wechatFans`|公众号粉丝数|公众号粉丝表中有效关注关系聚合|
|`indexViews`|首页访问量|访问日志/分析服务聚合；需定义统计周期|
|`detailsViews`|资料详情访问量|资料详情访问事件聚合；需处理匿名与重复访问口径|
|`curMonthIncome`|本月收入|本月已支付减完成退款，使用租户时区月边界|
|`lastMonthIncome`|上月收入|上一个完整自然月，口径必须与本月一致|
|`totalIncome`|累计收入|历史有效收入减历史完成退款；建议从财务汇总表读取|
|`lastLoginTime`|最近一次管理员登录时间|当前管理员还是租户任一管理员必须确认；推荐当前管理员|

**实现要求：** 甲方字段 `*Nums` 是 number，但新增服务的金额应使用两位小数 decimal string。数据不存在不返回 `null`，返回 `0`；`lastLoginTime` 没有记录时返回 `null`。

### B2. `GET /commonadmin/api/system/getIndexTopStatistics`

**功能：** 返回首页顶部统计卡和若干待办。与 `getTenantData` 互补，重点是上线天数、线上收益、注册用户、待审活动、短视频、提现、礼品兑换等。

**字段说明：**

|字段|业务含义|典型跳转目标|
|---|---|---|
|`onlineDays`|平台上线后的自然日数|概览页，仅展示|
|`regUserNum`|平台用户/注册用户统计|`/admin/reg-user-all`|
|`wechatFansNum`|公众号粉丝统计|`/admin/wechat-fans`|
|`onlineIncome`|线上业务收入统计|`/admin/system-finance-order`|
|`activeSignUpAuditingNum`|待处理活动报名数量|`/admin/active-signupmanager`|
|`shortVideoAuditingNum`|待审核短视频数量|`/admin/short-video-list`|
|`finCashoutAuditingNum`|待审核提现数量|`/admin/system-cashout-history`|
|`giftExchangeAuditingNum`|待处理积分/礼品兑换数量|`/admin/gift-exchange`|

**实现要求：** 待办统计必须按当前管理员可操作权限过滤。比如没有财务权限的管理员不应看到提现待审数量，也不应仅隐藏卡片而保留数值。`onlineIncome` 的完成、退款和取消状态需要与财务订单状态机共用同一个查询口径。

### B3. `GET /loveadmin/api/loveUser/getAdminIndexStatistic`

**功能：** 返回会员 CRM 相关的首页统计和剩余待审工作。甲方首页的相亲会员、男女会员、线上/线下 VIP、红娘数量、成功脱单以及会员资料/牵线/约见/认证/举报待办均来自此接口。

**字段说明：**

|字段|业务含义|页面用途|
|---|---|---|
|`total`|相亲会员总数|首页会员总数卡片与性别占比总数|
|`maleNums`、`femaleNums`|男/女会员数量|男女会员占比图|
|`vipNums`、`offlineVipNums`|线上 VIP / 线下 VIP 有效会员数|VIP 统计卡|
|`loveCustomerNums`|客源线索数量|线索统计卡|
|`matchmakerNums`、`popMatchmakerNums`|服务红娘 / 推广红娘数量|红娘统计卡|
|`noSingleNums`|成功脱单会员数|成功脱单统计卡|
|`offlineIncome`|线下收入|线下收益统计卡|
|`loveUserAuditingNum`|会员资料待审数量|待审工作“相亲会员”|
|`lineAuditingNum`|会员牵线待处理数|待审工作“会员牵线”|
|`appointmentAuditingNum`|约见申请待处理数|待审工作“约见申请”|
|`popularizeAuditingNum`|推广申请待处理数|待审工作“推广申请”|
|`reportAuditingNum`|网友举报待处理数|待审工作“网友举报”|
|`commitmentAuditingNum`|会员承诺待审数|待审工作“会员承诺”|
|`houseAuditingNum`|房产认证待审数|待审工作“房产认证”|
|`educationAuditingNum`|学历认证待审数|待审工作“学历认证”|
|`otherAuditingNum`|其他认证待审数|待审工作“其他认证”|

**实现要求：** 男女数之和可能小于 `total`，因为未知性别、未填写性别或非二元性别可能不在这两个统计中；后端不要强行篡改总数。所有待审数应以未删除、处于待审状态且管理员有处理权限的记录为准。

### B4. `GET /commonadmin/api/system/getIncomeRank`

**功能：** 返回线上收益按服务/商品类型的贡献排行。甲方首页右下角显示“线上收益占比（前 5）”。

**每条记录：**

|字段|含义|规则|
|---|---|---|
|`serviceTypeCode`|服务类型内部编码|稳定枚举；不以中文作为程序判断依据|
|`serviceType`|服务类型展示名|如 VIP、活动报名、积分充值、礼物等|
|`income`|该类型线上有效收入|当前统计周期需要明确；建议累计或本月二选一且文案一致|
|`proportion`|该类型收入占比|0 至 100，分母为全部线上有效收入，不只是前五总和|

**实现要求：** 排序按 `income desc`，最多 5 项；总收入为 0 时返回空数组或各项占比为 0，推荐空数组。退款和取消订单不得贡献收入。金额在数据库和新接口中按 decimal 计算，旧兼容接口才返回 number。

### B5. `GET /loveadmin/api/loveUser/getAdminIndexLoveUserStatisticByDay`

**功能：** 按日提供会员或客源的新增趋势数据。甲方首页的两个 Tab“近 15 日新增相亲会员”“近 15 日新增客源线索”使用该类数据绘制折线/柱状图。

**实测请求：** `limit=15&page=1&createFromTime=<起始日 00:00:00>&createToTime=<结束日 23:59:59>`。

**参数解释：**

|参数|功能|校验|
|---|---|---|
|`page`|统计分页页码|至少为 1；首页固定 1|
|`limit`|统计条数/天数|首页为 15，重构建议最大 366|
|`createFromTime`|创建时间下界|甲方格式为 `YYYY-MM-DD HH:mm:ss`；使用租户时区解释|
|`createToTime`|创建时间上界|不得早于开始时间；建议内部转换为半开区间|

**已知限制：** 本次实测日期范围返回 `data: []`，未获得非空记录的真实字段，因此不能声称甲方原记录字段已确认。

**后端实现建议：** 新聚合接口使用固定结构 `[{ date: "YYYY-MM-DD", count: integer }]`。若必须兼容旧路由，需要甲方提供非空样本，再将结果映射为旧字段；在得到样本之前，这个兼容接口可以按照空数组语义先上线，但不能靠猜测字段对接图表。

### B6. `GET /commonadmin/api/finOrder/getOrderStatics`

**功能：** 按时间粒度汇总财务订单，用于首页“近 15 日线上收入/线下收入”趋势。响应使用 MyBatis-Plus 分页对象，真正的趋势数据在 `data.records` 中。

**实测参数：**

|参数|实测值|功能|
|---|---|---|
|`dateStatisticType`|`Day`|聚合粒度；后端建议支持 `Day`/`Month`，严格枚举|
|`whetherDesc`|`false`|排序方向；false 为时间正序，适合图表|
|`page`、`limit`|`1`、`15`|分页与趋势点个数|
|`fromTime`、`endTime`|起始日 00:00:00 至结束日 23:59:59|订单支付/完成时间的统计区间；口径必须明确|

**`records` 记录字段：**

|字段|含义|
|---|---|
|`year`、`month`、`day`|当前聚合桶的年月日；`Day` 粒度下三者均应有值|
|`totalAmount`|订单总金额/收入金额；须明确是实收还是含退款前金额|
|`totalQty`|订单数量|
|`refundAmount`、`refundQty`|退款申请或退款金额/笔数；需明确是否“已申请”|
|`refundedAmount`、`refundedQty`|已完成退款金额/笔数|

**实现要求：** 新服务应额外返回 `net_amount = paid_amount - completed_refund_amount`，让首页不必猜测 `totalAmount` 是否扣除退款。金额字段为 null 的旧响应要兼容为 `0.00`；每个日期桶补零；按日期正序返回。统计必须排除待支付、已取消、测试订单和软删除订单。

## C. 顶部菜单、公告、短信与充值

### C1. `GET /commonadmin/api/adv/getPlatformCategoryList?type=Guides&whetherOpen=true`

**功能：** 读取“婚创学苑”栏目树，决定顶部/侧边的学苑入口展示哪些分类。页面当前路由为 `/admin/operate-center`。

**参数：** `type=Guides` 表示只查指南/学苑类别；`whetherOpen=true` 表示只要启用栏目。后端必须将这两个参数视作枚举/布尔值，不能直接拼进 SQL。

**字段说明：**

|字段|含义|实现要求|
|---|---|---|
|`id`、`parentId`|栏目与父栏目 ID|只能返回当前租户可见的数据|
|`name`、`desc`、`image`|栏目展示名、描述、封面|`image` 为 URL 或 null|
|`categoryType`|栏目类型|用于区分 Guides 等内容来源|
|`sort`|同级排序值|升序；相同值再按 ID 排序保证稳定|
|`whetherOpen`|是否启用|`whetherOpen=true` 请求中只返回 true|
|`whetherMatchmakerClassOpen`|红娘课堂是否启用|决定是否对红娘工作台显示|
|`secondDicCategoryList`|二级栏目数组|建议新服务命名为 `children`；最大深度要限制，甲方实测为两层结构|

### C2. `GET /commonadmin/api/recharge/getFinItems`

**功能：** 获取顶部“充值”弹窗展示的可购买资源包，如短信、实名核验、电子合同、婚况查询等。该接口只提供商品目录和价格，不创建订单、不扣款。

**字段说明：**

|字段|含义|
|---|---|
|`id`|充值项 ID，后续创建充值订单时引用|
|`name`|套餐展示名，例如“短信 1000 条”|
|`type`|资源类型，后端使用稳定枚举，如 `sms`、`real_name`、`e_contract`|
|`numTimes`|购买后增加的次数/条数|
|`price`|标价，甲方为 number；新服务应为两位小数 decimal string|

**实现边界：** 真正充值必须有独立的 `POST /finance/recharge-orders`，使用幂等键、支付单、支付回调验签和资源账本。页面点击“充值”绝不能直接调用修改余额的接口。

### C3. `GET /commonadmin/api/sms/getStastics?t=<random>`

**功能：** 返回短信发送概况和余量，供顶栏/充值弹窗显示短信资源状态。

**字段说明：** `sendSucess` 是甲方原始拼写，表示发送成功数量；`sendFail` 是发送失败数量；`smsSurplusNum` 是当前可用短信条数。

**实现建议：** 明确统计周期，推荐当前自然月；`smsSurplusNum` 从短信资源账本计算而不是 `发送成功数` 反推。新接口字段改为 `success_count`、`failed_count`、`remaining_count`，兼容层仍保留 `sendSucess`。

### C4. `GET /commonadmin/api/feedback/checkFeedbackWhetherView`

**功能：** 判断当前管理员是否存在未查看的工单反馈或工单回复。返回 `data: boolean`，甲方顶栏根据该值显示工单反馈红点。

**实现规则：** 当工单中的最后一条消息来自客服/系统，且当前管理员没有已读记录时返回 `true`；没有未读工单时返回 `false`。此接口不返回工单内容，避免首页加载敏感文本。普通管理员只能统计自己所在租户可见的工单。

### C5. 更新报告接口组

这些接口共同驱动顶栏的“当前版本”“更新报告”和未读数字。

|接口|功能|数据处理要求|
|---|---|---|
|`GET /commonadmin/api/mUpdRep/getFirstVersion`|取得默认/首个系统版本|返回 `{ id, isFirst, name }`；无版本时 `data=null` 或由甲方确认|
|`GET /commonadmin/api/mUpdRep/getAllVersions`|取得所有可筛选版本|按发布时间或版本顺序稳定排序，不能泄露未发布版本|
|`GET /commonadmin/api/mUpdRep/getWhetherNewReport`|是否存在未读更新|按当前管理员的公告已读关系计算，返回 boolean|
|`GET /commonadmin/api/mUpdRep/getUnreadNum`|未读更新数量|返回非负整数，和前一接口保持一致：数量大于 0 时 boolean 必为 true|
|`GET /commonadmin/api/mUpdRep/pageUpdReps`|分页读取更新内容|供弹窗列表、搜索、按类别/版本浏览；详情内容若独立加载需另设详情接口|

`pageUpdReps` 的 `UpdateReport` 字段中，`category` 用于页签分类，`title`/`titleColor`/`titleBold` 决定列表样式，`top` 表示置顶，`intOrder` 为排序值，`linkTo` 是可选跳转地址，`whetherRead` 是“当前管理员”维度的已读状态，不能写在公告全局表中。

## D. 首页顶部/次级导航的页面功能

这些是甲方页面可见的顶栏项，不一定每一项都由首页单独请求数据，但后端应为对应模块提供权限和数据入口。

|顶部项|甲方可见行为|前端路由/动作|后端功能要求|
|---|---|---|---|
|云端图库|打开可选图片素材库|甲方页面为图库入口|需要媒体素材列表、分类、授权、可选中返回；不应开放其他租户素材|
|手机版|切换或打开移动端视图|`javascript:void(0)`，由前端处理|提供当前平台移动端访问 URL/二维码时，必须使用已验证域名|
|电脑版|跳回 PC 前台|甲方指向 `/`|仅是导航，无需额外接口；域名从租户公开配置读取|
|红娘工作台|进入 CRM 工作台|`/crm/home`|登录态与后台会话规则必须一致或通过短期 SSO ticket 交接|
|当前版本|显示软件版本|顶栏文本|版本由公告/部署配置读取，不能硬编码在前端|
|更新报告|打开更新记录与未读数|公告弹窗|使用 C5 接口组，读取后要有独立“标已读”写接口|
|工单反馈|显示红点并进入工单模块|`/admin/system-feedback`|用 C4 计算红点；工单列表和提交另行开发|
|用好系统|帮助、教程、学苑入口|甲方为菜单项|使用 C1 学苑树或独立帮助中心内容|
|充值|打开资源套餐与余额|充值弹窗|余额来自授权接口，套餐来自 C2；支付创建必须独立且有审计|
|用户菜单|显示当前管理员，提供退出|账号菜单|A3 提供身份；退出接口仅注销当前会话/refresh token|

## E. 建议后端测试用例（按接口功能）

1. 对 A3：锁定管理员请求 `adminUser/info` 后不得获得任何业务数据；普通管理员 `permissions` 不含财务权限时 dashboard 不返回提现待审数。
2. 对 A4：授权已过期但租户未锁定时，允许读取授权状态但业务写接口返回 `LICENSE_EXPIRED`；短信余额为 0 时只禁短信发送，不禁会员 CRM。
3. 对 B1-B3：同一租户中，总店与分店管理员数据范围不同，统计数必须不同且均不跨店；趋势范围跨月、跨年、无数据日期都连续补零。
4. 对 B4/B6：退款完成后收益排行和趋势净额正确减少；重复退款回调不重复扣减；金额始终精确到分。
5. 对 C1：`whetherOpen=true` 不返回关闭栏目，且 `children` 不包含跨租户子节点。
6. 对 C4/C5：管理员 A 读过公告/工单后，管理员 B 的未读状态不受影响；公告置顶排序稳定。
7. 对 C2/C3：并发支付或并发短信发送时，余额不出现负数，账本累计与返回余量一致。

---

# 复查结果、缺口与菜单路由清单

## 1. 首页实测覆盖结论

本次对 `https://www.xuanshiai.com/admin/home` 的刷新流量重新反查，得到 **23 次业务请求、20 个去重后的业务接口**：

- `/commonadmin/api/adminUser/info` 重复调用 2 次。
- `/commonadmin/api/system/getTenantAuth` 调用 3 次，其中 2 次携带防缓存参数 `timer` 或 `t`。
- 其余接口各调用 1 次。

本文已覆盖上述 20 个接口的请求地址、请求参数、返回外层、实测字段结构和功能说明。静态 JS、CSS、字体、图片、浏览器扩展请求未计入业务接口，也不应由新后端实现。

## 2. 仍未从首页流量确认的内容

以下不是遗漏，而是当前页面没有触发、没有非空样本，或不应收集的内容。后端开发前必须由甲方补充或单独确认。

|缺口|原因|需要甲方/产品提供什么|后端在确认前的处理|
|---|---|---|---|
|登录接口请求体、验证码校验、登录成功响应|本次从已登录首页开始，未发生登录请求；且当前项目登录接口不可修改|登录 OpenAPI、验证码供应商配置、失败码、token/refresh-token 生命周期|保持现有登录接口，不自行替换或猜测登录字段|
|Cookie/Authorization 的真实格式|属于会话敏感信息，未记录|鉴权方案：JWT、Cookie Session 或 SSO；续期与登出规则|使用推荐 `Authorization: Bearer` 或项目既有鉴权层；禁止硬编码甲方 cookie|
|非 200 的 `code`、`msg`、HTTP 映射|本次全部为 200 成功响应|会话过期、无权限、租户锁定、授权过期、参数错误的真实示例|按本文通用错误码实现，并在联调时做兼容映射|
|会员日趋势非空记录|实测时间范围的 `data` 为空数组|至少一个有数据日期范围的完整脱敏响应|新接口返回 `{ date, count }[]`；旧路由暂返回空数组，不能猜字段|
|公告详情正文接口|首页只读到公告列表，未点击单条公告以触发详情请求|公告详情 URL、正文格式、附件、已读写入接口|设计独立 `GET /announcements/{id}` 和 `POST /announcements/{id}/read`，但不要假定甲方路径|
|云端图库接口和路由|顶部仅出现“云端图库”入口，首页没有产生业务请求|图库打开后的请求瀑布、素材权限、上传/删除协议|将它作为独立媒体模块，不把对象存储配置塞进首页接口|
|手机版跳转规则和二维码数据|顶部链接为前端动作，未看到后端请求|移动端访问域名、短链/二维码生成规则|仅提供安全的公开 URL，不生成或暴露未绑定域名|
|充值创建订单、支付回调、退款账本|首页只请求套餐与余额，没有进行支付写操作|支付渠道、签名、订单状态机、退款策略、财务对账要求|不能用 `getFinItems` 或余额接口直接扣款/加余额|
|工单列表、创建、回复、附件上传|首页仅请求未读 boolean|工单字段、状态流转、客服角色、附件策略|先提供只读红点；写接口独立设计并加审计|
|左侧菜单权限的真实数据接口|菜单由已加载前端代码和 `adminUser.info.permissions` 控制，首页没有发现菜单 JSON 请求|权限编码到菜单/按钮的映射表|后端先提供权限编码与服务端鉴权；菜单树可先前端静态配置|
|侧栏“官方服务”分组的子菜单|当前 DOM 仅显示一级名称，未展开出子项与路由|展开后的菜单截图/DOM，及对应功能范围|不要凭名称创建路由或接口；先将该分组列为待采集|
|全站其他 100+ 页面接口的真实网络契约|本次仅抓首页；已有 `admin-api-inventory.md` 是项目规划，不是甲方实测|按页面逐页打开后的 HAR/OpenAPI/接口清单|不要把规划文档误当作甲方接口事实|

## 3. 左侧菜单与页面路由（已识别）

以下为甲方后台已识别的菜单页面路径。它们是路由/功能清单，不表示对应接口已经通过本次首页流量验证。后端应据此建立权限编码、模块边界和后续接口开发计划。

|一级菜单|页面名称与甲方路径|
|---|---|
|概览|`概览` `/admin/home`|
|平台账号|`账号管理` `/admin/reg-user-all`；`登录日志` `/admin/reg-user-log`|
|客源线索|`线索管理` `/admin/love-customer-list-wrap`；`数据报表` `/admin/love-customer-statistics`；`跟进全览` `/admin/customer-follow-up`；`功能配置` `/admin/love-customer-config`|
|会员 CRM|`资料管理` `/admin/love-user-list-wrap`；`线上 VIP` `/admin/love-user-vip`；`线下 VIP` `/admin/love-user-vip-underline`；`会员认证` `/admin/love-user-auth`；`内容核查` `/admin/content-verify`；`线上行为` `/admin/love-user-behavior`；`数据报表` `/admin/love-user-statistics`；`跟进全览` `/admin/love-user-follow-up`|
|会员服务|`红娘牵线` `/admin/vip-line-record`；`约见申请` `/admin/love-interview`；`约会管理` `/admin/love-appointment`；`推广记录` `/admin/vip-popularize-record`|
|总店红娘|`红娘管理` `/admin/love-matchmaker-list`；`分派配置` `/admin/love-matchmaker-apportion-wrap`；`分成配置` `/admin/love-matchmaker-distribution`；`分成明细` `/admin/love-matchmaker-distribution-details`|
|分店管理|`分站配置` `/admin/branch-config`；`门店管理` `/admin/mendian-list`；`分店红娘` `/admin/branch-matchmaker-list`；`分店报表` `/admin/branch-report-list`；`分成明细` `/admin/branch-distribuion-list`|
|推广红娘|`红娘管理` `/admin/poplove-matchmaker-list`；`分成配置` `/admin/poplove-matchmaker-distribution`；`分成明细` `/admin/poplove-matchmaker-distribution-details`|
|合伙红娘|`功能配置` `/admin/love-partner-config`；`分成配置` `/admin/love-partner-bonus-config`；`合伙人管理` `/admin/love-partner-list`；`团队关系` `/admin/love-partner-relation-manage`；`分成明细` `/admin/love-partner-bonus-details`|
|活动报名|`参数配置` `/admin/active-config`；`活动管理` `/admin/active-list`；`报名管理` `/admin/active-signupmanager`；`互选活动` `/admin/mutual-selection-activities-list`；`互选记录` `/admin/mutual-selection-activities-record`|
|商家联盟|`运营方案` `/admin/active-alliance`；`功能配置` `/admin/merchant-alliance-config`；`商家管理` `/admin/merchant-management`；`商品管理` `/admin/merchant-product`；`订单管理` `/admin/merchant-order`|
|短视频|`参数配置` `/admin/short-video-config`；`视频管理` `/admin/short-video-list`；`红包记录` `/admin/short-video-red-packet`；`评论管理` `/admin/short-video-comment`；`会员主页` `/admin/short-video-homepage`；`打赏管理` `/admin/short-video-tip`|
|运营工具|`自由收款` `/admin/free-pay`；`内容单页` `/admin/single-page`；`落地页` `/admin/customer-landing`；`自由表单` `/admin/free-form`；`批量资料卡` `/admin/tool-lovecard`；`会员分区` `/admin/tool-theme`；`短信群发` `/admin/sms-group`；`送礼物` `/admin/love-gift-wrap`；`推文助手` `/admin/generate-tool`；`吸粉二维码` `/admin/qrcode-wrap`；`礼品管理` `/admin/gift-list`；`兑换管理` `/admin/gift-exchange`|
|财务管理|`系统配置` `/admin/finance-config`；`收入明细` `/admin/system-finance-order`；`积分明细` `/admin/system-credit-history`；`余额提现` `/admin/system-cashout-history`；`统计报表` `/admin/finance-statistic`；`合同管理` `/admin/e-contract-list`；`模板管理` `/admin/e-contract-template`；`印章管理` `/admin/e-contract-yinzhang`；`合同配置` `/admin/e-contract-config`|
|系统管理|`系统配置` `/admin/system-setting-basic-wrap`；`广告管理` `/admin/system-setting-adconfig-wrap`；`外呼平台` `/admin/outbound-call-platform`；`外呼状态` `/admin/out-call-list`；`呼叫记录` `/admin/out-call-record`；`签名配置` `/admin/system-setting-sms-signature`；`通知配置` `/admin/system-setting-sms-notices`；`短信群发` `/admin/system-setting-sms-group`；`发送记录` `/admin/system-setting-sms-record`；`新增账号` `/admin/system-setting-admin-adduser`；`账号管理` `/admin/system-setting-admin-user`；`权限分组` `/admin/system-setting-admin-group`；`系统日志` `/admin/system-setting-admin-log`|
|平台配置|`基本配置` `/admin/platform-config`；`导航配置` `/admin/platform-navconfig`；`平台布局` `/admin/platform-page`；`权限配置` `/admin/power-config`；`内容配置` `/admin/platform-content`；`基础数据` `/admin/platform-base`；`收费配置` `/admin/platform-payconfig`|
|公众号|`参数配置` `/admin/wechat-config`；`关注粉丝` `/admin/wechat-fans`；`菜单配置` `/admin/wechat-menu`；`自动回复` `/admin/wechat-autoreply-wrap`；`模板消息` `/admin/wechat-template`；`消息群发` `/admin/wechat-send`|
|小程序|`参数配置` `/admin/miniprogram-config`|
|底部快捷入口|`应用中心` `/admin/plugin-center`；`婚创学苑` `/admin/operate-center`；`工单反馈` `/admin/system-feedback`；`软件授权` `/admin/system-empower`|

## 4. 后续实测顺序

要获得“全站可重构”的甲方接口事实，建议按下列顺序在已登录页面逐页采集并持续补本文档：

1. 平台账号、客源线索、会员 CRM：先确定用户、会员、线索、认证、跟进、导出和审核的真实接口与状态枚举。
2. 红娘、门店、活动、报名：重点采集分配、改派、审核、报名和互选操作的写接口与幂等规则。
3. 商家、订单、财务、合同：重点采集创建订单、支付回调、退款、提现、结算、合同签署/作废，不能只采集列表。
4. 短视频、公众号、短信、外呼：采集内容审核、群发、模板、上传、异步任务和回执。
5. 系统/平台配置：采集保存、发布、回滚、权限管理和审计日志接口。

每次采集都应记录：请求方法和路径、query/body 字段、成功结构、每种失败结构、权限前提、写操作状态变化、是否可重试和是否需要幂等键。真实手机号、姓名、身份证、cookie、token、支付密钥和上传密钥只可在本机调试中使用，不能写进文档或代码。
