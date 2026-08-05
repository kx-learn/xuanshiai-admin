import { adminApi } from "@/lib/admin-api";

export type PageQuery = { page?: number; page_size?: number; status?: number | string; keyword?: string };
export type ReviewPayload = { status?: number; reason?: string; action?: string; hide_content?: boolean; restore_content?: boolean };
export type AdminListQuery = PageQuery & Record<string, string | number | undefined>;
export type JsonBody = Record<string, unknown>;

const list = (path: string, query: AdminListQuery = {}) => adminApi(path, { method: "GET", query });
const create = (path: string, body: JsonBody) => adminApi(path, { method: "POST", body });
const update = (path: string, body: JsonBody) => adminApi(path, { method: "PATCH", body });

export const adminEndpoints = {
  login: (body: { username: string; password: string }) => adminApi<{ access_token: string; token_type: "bearer"; admin: Record<string, unknown> }>("admin/auth/login", { method: "POST", body }),
  me: () => adminApi<Record<string, unknown>>("admin/auth/me"),
  logout: () => adminApi<void>("admin/auth/logout", { method: "POST" }),
  dashboardStats: () => adminApi<Record<string, unknown>>("admin/dashboard/stats"),
  users: (query: AdminListQuery = {}) => list("admin/users", query),
  user: (id: number | string) => adminApi(`admin/users/${id}`),
  loginLogs: (query: AdminListQuery = {}) => list("admin/users/login-logs", query),
  customerLeads: (query: AdminListQuery = {}) => list("admin/customer-leads", query),
  createCustomerLead: (body: JsonBody) => create("admin/customer-leads", body),
  updateCustomerLead: (id: number | string, body: JsonBody) => update(`admin/customer-leads/${id}`, body),
  members: (query: AdminListQuery = {}) => list("admin/members", query),
  createMember: (body: JsonBody) => create("admin/members", body),
  updateMember: (id: number | string, body: JsonBody) => update(`admin/members/${id}`, body),
  matchmakers: (query: AdminListQuery = {}) => list("admin/matchmakers", query),
  createMatchmaker: (body: JsonBody) => create("admin/matchmakers", body),
  updateMatchmaker: (id: number | string, body: JsonBody) => update(`admin/matchmakers/${id}`, body),
  branches: (query: AdminListQuery = {}) => list("admin/branches", query),
  createBranch: (body: JsonBody) => create("admin/branches", body),
  updateBranch: (id: number | string, body: JsonBody) => update(`admin/branches/${id}`, body),
  activities: (query: AdminListQuery = {}) => list("admin/activities", query),
  createActivity: (body: JsonBody) => create("admin/activities", body),
  updateActivity: (id: number | string, body: JsonBody) => update(`admin/activities/${id}`, body),
  merchants: (query: AdminListQuery = {}) => list("admin/merchants", query),
  createMerchant: (body: JsonBody) => create("admin/merchants", body),
  updateMerchant: (id: number | string, body: JsonBody) => update(`admin/merchants/${id}`, body),
  merchantProducts: (query: AdminListQuery = {}) => list("admin/merchant-products", query),
  createMerchantProduct: (body: JsonBody) => create("admin/merchant-products", body),
  updateMerchantProduct: (id: number | string, body: JsonBody) => update(`admin/merchant-products/${id}`, body),
  merchantOrders: (query: AdminListQuery = {}) => list("admin/merchant-orders", query),
  updateMerchantOrder: (id: number | string, body: JsonBody) => update(`admin/merchant-orders/${id}`, body),
  videos: (query: AdminListQuery = {}) => list("admin/videos", query),
  createVideo: (body: JsonBody) => create("admin/videos", body),
  updateVideo: (id: number | string, body: JsonBody) => update(`admin/videos/${id}`, body),
  videoComments: (query: AdminListQuery = {}) => list("admin/video-comments", query),
  updateVideoComment: (id: number | string, body: JsonBody) => update(`admin/video-comments/${id}`, body),
  videoTips: (query: AdminListQuery = {}) => list("admin/video-tips", query),
  updateVideoTip: (id: number | string, body: JsonBody) => update(`admin/video-tips/${id}`, body),
  moderationItems: (query: PageQuery = {}) => adminApi("admin/community/moderation-items", { method: "GET", query }),
  reviewModerationItem: (taskId: number | string, body: ReviewPayload) => adminApi(`admin/community/moderation-items/${taskId}/review`, { method: "PATCH", body }),
  moderatePost: (postId: number | string, body: ReviewPayload) => adminApi(`admin/community/posts/${postId}/moderation`, { method: "PATCH", body }),
  moderateComment: (commentId: number | string, body: ReviewPayload) => adminApi(`admin/community/comments/${commentId}/moderation`, { method: "PATCH", body }),
  moderatePaperPlane: (planeId: number | string, body: ReviewPayload) => adminApi(`admin/community/paper-planes/${planeId}/moderation`, { method: "PATCH", body }),
  reports: (query: PageQuery = {}) => adminApi("admin/reports", { method: "GET", query }),
  report: (reportId: number | string) => adminApi(`admin/reports/${reportId}`),
  reviewReport: (reportId: number | string, body: ReviewPayload) => adminApi(`admin/reports/${reportId}/review`, { method: "PATCH", body }),
  reportAppeals: (query: PageQuery = {}) => adminApi("admin/report-appeals", { method: "GET", query }),
  reviewReportAppeal: (appealId: number | string, body: ReviewPayload) => adminApi(`admin/report-appeals/${appealId}/review`, { method: "PATCH", body }),
  reviewMedia: (mediaId: number | string, body: ReviewPayload) => adminApi(`admin/media/${mediaId}/review`, { method: "PATCH", body }),
  reviewCertification: (userId: number | string, kind: "education" | "house" | "marriage", body: { status: 2 | 3; reason?: string }) =>
    adminApi(`admin/users/${userId}/certifications/${kind}/review`, { method: "PATCH", body }),
  reviewMatchmakerApplication: (applicationId: number | string, body: Record<string, unknown>) =>
    adminApi(`admin/matchmaker/applications/${applicationId}`, { method: "PATCH", body }),
  grantAdmin: (body: { user_id: number; permissions: string[] }) => adminApi("admin/users/grant", { method: "POST", body }),
  serviceRequests: (query: PageQuery = {}) => adminApi("admin/matchmaker/service-requests", { method: "GET", query }),
  updateServiceRequest: (serviceId: number | string, body: Record<string, unknown>) => adminApi(`admin/matchmaker/service-requests/${serviceId}`, { method: "PATCH", body }),
  scheduleMeeting: (requestId: number | string, body: Record<string, unknown>) => adminApi(`admin/matchmaker/meetings/requests/${requestId}/schedule`, { method: "POST", body }),
  financeCommissionRules: (query: PageQuery = {}) => adminApi("admin/finance/commission-rules", { method: "GET", query }),
  createFinanceCommissionRule: (body: Record<string, unknown>) => adminApi("admin/finance/commission-rules", { method: "POST", body }),
  financeReport: (query: PageQuery = {}) => adminApi("admin/finance/report", { method: "GET", query }),
  updateProductCommissionRule: (productId: number | string, body: Record<string, unknown>) => adminApi(`admin/finance/product-commission-rules/${productId}`, { method: "POST", body }),
  settleFinanceOrder: (orderId: number | string, body: Record<string, unknown> = {}) => adminApi(`admin/finance/orders/${orderId}/settle`, { method: "POST", body }),
  refundFinanceOrder: (orderId: number | string, body: Record<string, unknown>) => adminApi(`admin/finance/orders/${orderId}/refund`, { method: "POST", body }),
  releaseCommissionEntry: (entryId: number | string, body: Record<string, unknown> = {}) => adminApi(`admin/finance/commission-entries/${entryId}/release`, { method: "POST", body }),
  reviewWithdrawal: (withdrawalId: number | string, body: Record<string, unknown>) => adminApi(`admin/finance/withdrawals/${withdrawalId}`, { method: "PATCH", body }),
};
