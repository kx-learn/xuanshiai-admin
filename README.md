# xuanshiai-admin

**来源：** https://xuanshiai.com/admin
**模式：** URL克隆
**生成日期：** 2026-07-02

## 概述

寻爱网婚恋SaaS管理后台的像素级克隆版本。原版为Vue 3 + Ant Design Vue应用，现以Next.js 16 + React 19 + Tailwind v4重建，并使用匹配Ant Design视觉风格的自定义UI组件。

## 技术栈

- **框架：** Next.js 16（App Router）
- **UI：** 自定义shadcn/ui原语，样式匹配Ant Design
- **样式：** Tailwind CSS v4，使用oklch设计令牌
- **图标：** Lucide React
- **图表：** Recharts

## 数据统计

- **页面：** 105条路由
- **组件：** 12个共享组件
- **颜色：** 主色 `#3658f7`，背景色 `#f4f5f9`

## 页面包含

- 仪表盘（统计、图表、待审核）
- 会员CRM（用户列表、VIP、跟进、统计）
- 红娘管理（分配、列表、分派）
- 活动与营销（活动列表、报名、配置）
- 短视频模块（列表、评论、红包、打赏）
- 电子合同系统（模板、签署、印章配置）
- 财务（订单、统计、配置）
- 平台设置（基础信息、管理员、权限、日志）
- 微信集成（粉丝、菜单、自动回复、模板）
- 短信系统（通知、记录、签名、群组）
- 分站/经销商管理
- 礼物及合伙人奖励系统

## 生成方式

使用AI网站克隆工具配合`/clone-website`技能运行生成。

## 部署

完整的本地启动、生产构建、Linux/systemd、Nginx和故障排查说明见[docs/deployment.md](docs/deployment.md)。

使用`npm install`安装依赖，然后运行`npm run build`和`npm run start`。`start`脚本用于运行独立服务器。部署`.next/standalone`，将`.next/static`复制到`.next/standalone/.next/static`，并将`public`复制到`.next/standalone/public`（当这些目录存在时）。
部署前运行`npm run lint`或`npm run typecheck`以验证TypeScript。

将`ADMIN_API_BASE_URL`设置为后端主机地址，例如`http://127.0.0.1:8000`。浏览器对`/api/backend/*`的请求会被代理到`${ADMIN_API_BASE_URL}/api/v1/*`，并保留当前登录的Cookie/Authorization请求头。该值不包含`/api`后缀；当后端挂载在某个前缀路径下时，基础URL可包含其他网关路径。

列表组件接受可选的`endpoint`属性，用于将页面模拟数据替换为真实API响应。支持纯数组和`{ items: [] }`/`{ data: [] }`两种响应格式。现有管理页面仍需要的后端接口见`docs/missing-interfaces.md`。