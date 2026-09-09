# UI 配置项清单 · 逐项核对结果（财务管理及以后）

> 核对日期：2026-09-09。核对口径：①前端是否接接口（没接的已接、缺接口的已补）；②接口是否有用；③能否真实修改后端参数。
> 状态图例：✅ 已接真实数据源 · 🟦 已接配置域存储（改动落库+审计）· ⚪ 占位数据源（无业务消费点，原因如实标注）

## 一、财务管理

| 页面 | 接口状态 | 数据源 | 是否真实修改后端参数 |
|---|---|---|---|
| 1. 系统配置 | ✅ 已接 | `finance` 配置域（GET/PATCH /admin/configs/finance） | 🟦 存储真实落库；`withdrawal.enabled/min_amount` 已接运行时（创建提现时校验）；支付模式等其余键为管理端占位（支付走 settings） |
| 2. 收入明细 | ✅ 已接 | `payment_order` 真实订单表 | ✅ 搜索（订单号/状态/时间范围）真实生效 |
| 3. 积分明细（资金流水） | ✅ 已接 | `account_ledger` 真实账本 | ✅ 筛选真实生效 |
| 4. 余额提现 | ✅ 已接 | `withdrawal_request` 真实提现表 | ✅ Tab 状态筛选、审核流真实生效 |
| 5. 统计报表 | ✅ 已接 | `GET /admin/finance/daily-report`（按日聚合订单） | ✅ 真实聚合数据 |
| 6. 合同管理 | 🟦 本轮新接 | `econtract_records` 配置域 | ⚪ 占位数据源：后端无电子签服务商，"查看/下载"有合同文件链接时可用，否则诚实提示 |
| 7. 模板管理 | 🟦 本轮新接 | `econtract_templates` 配置域 | 🟦 新增/编辑/删除真实落库 |
| 8. 印章管理 | 🟦 本轮新接 | `econtract_seals` 配置域 + `/admin/common/upload` | 🟦 印章图真实上传、增删改真实落库 |
| 9. 合同配置 | 🟦 本轮新接 | `econtract_config` 配置域（含 4 条默认键值） | 🟦 行内编辑真实落库（⚠️ 后端合同签署流程未实现，值暂不驱动签署行为） |

## 二、系统管理

| 页面 | 接口状态 | 数据源 | 是否真实修改后端参数 |
|---|---|---|---|
| 1. 系统配置（7 Tab） | ✅ 已接 | `sys_site/access/storage/payment/watermark/posters/region` | 🟦 存储落库；`sys_access` 的浏览/注册开关已接运行时（推荐/搜索/看资料/新号注册 4 处实时生效）；存储/支付/水印等属第三方集成占位 |
| 2. 广告管理 | ✅ 已接 | `sys_ads` | 🟦 存储落库；广告下发需客户端读取（暂无用户端配置接口） |
| 3. 外呼平台 | ✅ 已接 | `sys_outbound` | 🟦 存储落库；外呼状态页顶部"服务商/账号"卡片实时读取该域 |
| 4. 外呼状态 | 🟦 本轮新接 | `outbound_seats` 配置域 | 🟦 添加/删除坐席真实落库；通话统计为占位（需外呼服务商） |
| 5. 呼叫记录 | 🟦 本轮新接 | `outbound_call_records` 配置域 | ⚪ 占位数据源：呼叫记录由外呼系统产生，需服务商接入后写入 |
| 6. 签名配置 | ✅ 已接 | `sys_sms.signature` | 🟦 存储落库（实际发送签名为服务商侧配置） |
| 7. 通知配置 | ✅ 已接 | `sys_sms.notices` | 🟦 60+ 场景开关真实落库 |
| 8. 短信群发 | 🟦 本轮新接 | `sms_broadcasts` 配置域 | 🟦 创建/删除任务真实落库；实际下发需短信服务商 |
| 9. 发送记录 | 🟦 本轮新接 | `sms_send_records` 配置域 | 🟦 余量/成功/失败统计从配置域真实读取；明细由服务商回执生成 |
| 10. 添加账号 | ✅ 本轮新接 | `POST /admin/matchmaker/accounts` 真实接口 | ✅ 真实创建后台账号；分组选择的权限集合作为新账号初始权限 |
| 11. 账号管理 | ✅ 本轮新接 | `GET/PATCH /admin/matchmaker/accounts` | ✅ 状态 Tab、编辑姓名、重置密码、停用（代替删除）全部真实生效 |
| 12. 权限分组 | 🟦 本轮新接 | `admin_groups` 配置域 | 🟦 组增删改与权限码真实落库；创建账号时该组权限注入账号（真实生效）；后端无独立分组表（权限实际挂账号） |
| 13. 系统日志 | ✅ 本轮新接 | 登录日志 `GET /admin/matchmaker/accounts/login-logs`；通用审计 `GET /admin/matchmaker/audit-logs`（本轮新增） | ✅ 登录日志、密码修改日志为真实记录；会员/客源删除等 Tab 按审计 action 前缀实时查询（后端暂无删除会员功能，故为空是真实状态） |

## 三、平台配置（前轮已接，消费点已核实）

| 页面 | 状态 | 真实生效的项 |
|---|---|---|
| 基本配置（6 Tab） | 🟦 已接 6 个配置域 | 注册开关/浏览开关/维护文案 → 注册与发现接口实时生效；其余品牌/引导/字段为客户端渲染类占位 |
| 导航配置 | 🟦 `platform_navigation` | 占位：需用户端公开配置接口下发 |
| 平台布局 | 🟦 `platform_layout` | 占位：同上 |
| 权限配置 | 🟦 `platform_permissions` | ✅ 牵线实名/被牵线实名/每日次数/一证多号已接运行时；卡片2/3 多数项后端无对应资料模型，占位 |
| 内容配置 | 🟦 3 个配置域 | 占位：客户端渲染类 |
| 基础数据 | 🟦 `platform_base_data` | ⚠️ 会员端下拉实际来自 `core/profile_tags.py` 常量，配置域未接管 |
| 收费配置 | 🟦 `platform_pay` | ⚠️ VIP 价格真实来源是 `config_membership_package` 表，配置域未接管 |

## 四、公众号

| 页面 | 接口状态 | 数据源 | 说明 |
|---|---|---|---|
| 1. 参数配置 | 🟦 本轮新接 | `wechat_mp` 配置域 | 全字段（微信号/appId/appSecret/token/加解密密钥/加密模式/二维码/安全验证文件）改动即存+提交落库，二维码与验证文件真实上传；⚠️ 后端微信 provider 为 mock，凭据未接入真实调用链 |
| 2. 关注粉丝 | 🟦 本轮新接 | `wechat_mp_fans` 配置域 | 搜索/分组过滤本地生效；"同步公众号粉丝"诚实提示（需公众号平台对接） |
| 3. 菜单配置 | 🟦 本轮新接 | `wechat_mp_menu` 配置域 | 菜单树增删改排序真实落库；「同步菜单」保存并记录发布时间（实际推送到微信需平台对接） |
| 4. 自动回复 | 🟦 本轮新接 | `wechat_mp_replies` 配置域 | 3 Tab 的内容增删改、回复方式真实落库 |
| 5. 模板消息 | 🟦 本轮新接 | `wechat_mp_templates` + `wechat_mp.platform_templates` | 行开关、选择平台模板、编辑配置（字段/颜色/链接）真实落库；平台模板清单可添加 |
| 6. 消息群发 | 🟦 本轮新接 | `wechat_mp_broadcasts` 配置域 | 新建群发（选模板）真实落库、可删除；实际发送需平台对接 |

## 五、小程序

| 页面 | 接口状态 | 数据源 | 说明 |
|---|---|---|---|
| 1. 参数配置 | 🟦 本轮新接 | `wechat_mini` 配置域 | 开关/凭据/状态栏颜色/小程序码/分享封面（真实上传）/实名认证功能开关，改动即存+提交落库；✅ `realname_enabled` 已接运行时——关闭后用户端提交实名认证返回 403「实名认证功能暂未开放」（默认开，行为不变） |
| 2. 小程序授权（页内卡片） | ⚪ | — | 「立即授权」诚实提示需第三方服务商，不伪造授权状态 |

## 六、本轮前后端改动清单

**后端 `E:\houduan\xuanshiai`**
- `services/admin_config.py`：新增 16 个配置域默认结构（econtract_config/records/templates/seals、outbound_seats、outbound_call_records、sms_broadcasts、sms_send_records、wechat_mp、wechat_mp_fans/menu/replies/templates/broadcasts、wechat_mini、admin_groups），复用 `/admin/configs/{namespace}` 读写+审计，无新增存储表。
- `schemas/matchmaker_admin_account.py` + `services/matchmaker_admin_account.py` + `routes/matchmaker_admin_account.py`：新增 `GET /admin/matchmaker/audit-logs`（business_audit_log 按 action 前缀/操作人/时间/关键词分页）。
- `services/runtime_config.py` + `services/auth.py`：`wechat_mini.realname_enabled` 接入 `submit_realname`（默认开，行为不变）。

**前端 `E:\HTML\xuanshiai-admin`**（16 页，UI 视觉零改动，tsc --noEmit 通过）
- 新接线 16 页：e-contract-list/template/yinzhang/config、out-call-list/record、sms-group/record、system-setting-admin-user、-user-add、-group、-log、wechat-config/fans/menu/autoreply/template/send、miniprogram-config。

## 七、遗留说明（为什么部分项"存了但暂不驱动行为"）

1. **第三方集成类**（外呼、短信下发、公众号平台、电子签、七牛、微信支付）：后端无真实服务商对接（provider=mock），配置域是唯一真实落库的数据源；接入服务商时把 provider 切换为读对应配置域即可，页面无需再改。
2. **客户端渲染类**（品牌/导航/布局/内容/字典/广告下发）：需要一个用户端公开配置下发接口（P0 建议 `GET /config/public`）。
3. **数据源分裂类**：会员字典（profile_tags 常量）与 VIP 价格（config_membership_package 表）有真实来源，配置域未接管；接管需迁移数据源。
