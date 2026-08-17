import { adminApi } from "@/lib/admin-api";

export type PageQuery = { page?: number; page_size?: number; status?: number | string; keyword?: string };
export type ReviewPayload = { status?: number; reason?: string; action?: string; hide_content?: boolean; restore_content?: boolean };
export type AdminListQuery = PageQuery & Record<string, string | number | undefined>;
export type JsonBody = Record<string, unknown>;
export type DashboardQuery = { from?: string; to?: string };

const list = (path: string, query: AdminListQuery = {}) => adminApi(path, { method: "GET", query });
const create = (path: string, body: JsonBody) => adminApi(path, { method: "POST", body });
const update = (path: string, body: JsonBody) => adminApi(path, { method: "PATCH", body });

export interface AdminAccountItem {
  id: number;
  username: string;
  display_name: string;
  matchmaker_user_id: number | null;
  data_scope: "SELF" | "STORE" | "ORGANIZATION" | "ALL";
  organization_id: number | null;
  status: 1 | 2 | 3;
  failed_count: number;
  locked_until: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface CertificationDetail {
  user_id: number;
  kind: "education" | "house" | "marriage";
  status: 0 | 1 | 2 | 3;
  submitted_at: string | null;
  reviewed_at: string | null;
  fail_reason: string | null;
  value: string | null;
  material_urls: { id: number; url: string; thumbnail_url: string | null; expires_at: string | null }[];
  reviewer_id: number | null;
  audit_history: Record<string, unknown>[];
}

export const adminEndpoints = {
  login: (body: { username: string; password: string }) => adminApi<{ access_token: string; refresh_token: string; token_type: "bearer"; expires_in: number; account: Record<string, unknown> }>("admin/matchmaker/auth/login", { method: "POST", body }),
  me: () => adminApi<{ account: Record<string, unknown>; permissions: string[] }>("admin/matchmaker/auth/me"),
  refresh: (body: { refresh_token: string }) => adminApi<{ access_token: string; refresh_token: string; token_type: "bearer"; expires_in: number; account: Record<string, unknown> }>("admin/matchmaker/auth/refresh", { method: "POST", body }),
  logout: () => adminApi<void>("admin/matchmaker/auth/logout", { method: "POST" }),
  bootstrap: () => adminApi<Record<string, unknown>>("admin/bootstrap"),
  dashboard: (query: DashboardQuery = {}) => adminApi<Record<string, unknown>>("admin/dashboard", { method: "GET", query }),
  dashboardStats: () => adminApi<Record<string, unknown>>("admin/dashboard/stats"),
  adminAccounts: (query: AdminListQuery = {}) => adminApi<{ items: AdminAccountItem[]; page: number; page_size: number; total: number; has_more: boolean }>("admin/matchmaker/accounts", { method: "GET", query }),
  adminAccount: (id: number | string) => adminApi<AdminAccountItem>(`admin/matchmaker/accounts/${id}`),
  createAdminAccount: (body: JsonBody) => create("admin/matchmaker/accounts", body),
  updateAdminAccount: (id: number | string, body: JsonBody) => update(`admin/matchmaker/accounts/${id}`, body),
  updateAdminAccountStatus: (id: number | string, body: JsonBody) => update(`admin/matchmaker/accounts/${id}/status`, body),
  resetAdminAccountPassword: (id: number | string, body: JsonBody) => create(`admin/matchmaker/accounts/${id}/reset-password`, body),
  adminAccountSessions: (id: number | string, query: AdminListQuery = {}) => list(`admin/matchmaker/accounts/${id}/sessions`, query),
  revokeAdminAccountSessions: (id: number | string) => adminApi<void>(`admin/matchmaker/accounts/${id}/sessions/revoke-all`, { method: "POST" }),
  adminLoginLogs: (query: AdminListQuery = {}) => list("admin/matchmaker/accounts/login-logs", query),
  users: (query: AdminListQuery = {}) => list("admin/matchmaker/members", query),
  user: (id: number | string) => adminApi(`admin/matchmaker/members/${id}`),
  loginLogs: (id: number | string, query: AdminListQuery = {}) => list(`admin/members/${id}/behavior/login-logs`, query),
  customerLeads: (query: AdminListQuery = {}) => list("admin/customer-leads", query),
  createCustomerLead: (body: JsonBody) => create("admin/customer-leads", body),
  updateCustomerLead: (id: number | string, body: JsonBody) => update(`admin/customer-leads/${id}`, body),
  customerLead: (id: number | string) => adminApi(`admin/customer-leads/${id}`),
  customerLeadFollowUps: (id: number | string, query: AdminListQuery = {}) => list(`admin/customer-leads/${id}/follow-ups`, query),
  createCustomerLeadFollowUp: (id: number | string, body: JsonBody) => create(`admin/customer-leads/${id}/follow-ups`, body),
  assignCustomerLead: (id: number | string, body: JsonBody) => update(`admin/customer-leads/${id}/assignment`, body),
  customerLeadStatistics: () => adminApi("admin/customer-leads/statistics"),
  abandonedCustomerLeads: () => adminApi("admin/customer-leads/abandoned"),
  customerLeadAbandonments: () => adminApi("admin/customer-leads/abandonments"),
  abandonCustomerLead: (id: number | string, reason: string) => create(`admin/customer-leads/${id}/abandon`, { reason }),
  restoreCustomerLead: (id: number | string, reason: string) => create(`admin/customer-leads/${id}/restore`, { reason }),
  members: (query: AdminListQuery = {}) => list("admin/matchmaker/members", query),
  member: (id: number | string) => adminApi(`admin/matchmaker/members/${id}`),
  createMember: (body: JsonBody) => create("admin/matchmaker/members", body),
  updateMember: (id: number | string, body: JsonBody) => update(`admin/matchmaker/members/${id}`, body),
  memberCertifications: (id: number | string) => adminApi<{ education: CertificationDetail; house: CertificationDetail; marriage: CertificationDetail }>(`admin/matchmaker/members/${id}/certifications`),
  memberCertification: (id: number | string, kind: "education" | "house" | "marriage") => adminApi<CertificationDetail>(`admin/matchmaker/members/${id}/certifications/${kind}`),
  memberAuditLogs: (id: number | string) => adminApi<Record<string, unknown>[]>(`admin/matchmaker/members/${id}/audit-logs`),
  updateMemberStatus: (id: number | string, body: JsonBody) => update(`admin/matchmaker/members/${id}/status`, body),
  matchmakers: (query: AdminListQuery = {}) => list("admin/matchmaker/matchmakers", query),
  matchmaker: (id: number | string) => adminApi(`admin/matchmaker/matchmakers/${id}`),
  updateMatchmakerStatus: (id: number | string, body: JsonBody) => update(`admin/matchmaker/matchmakers/${id}/status`, body),
  branches: (query: AdminListQuery = {}) => list("admin/matchmaker/branches", query),
  branch: (id: number | string) => adminApi(`admin/matchmaker/branches/${id}`),
  store: (id: number | string) => adminApi(`admin/matchmaker/stores/${id}`),
  updateStore: (id: number | string, body: JsonBody) => update(`admin/matchmaker/stores/${id}`, body),
  updateStoreStatus: (id: number | string, body: JsonBody) => update(`admin/matchmaker/stores/${id}/status`, body),
  storeMembers: (id: number | string, query: AdminListQuery = {}) => list(`admin/matchmaker/stores/${id}/members`, query),
  removeStoreMember: (id: number | string, reason: string) => adminApi(`admin/matchmaker/store-members/${id}`, { method: "DELETE", query: { reason } }),
  storeReport: (id: number | string) => adminApi<Record<string, unknown>>(`admin/matchmaker/stores/${id}/report`),
  createBranch: (body: JsonBody) => create("admin/matchmaker/branches", body),
  createBranchMember: (id: number | string, body: JsonBody) => create(`admin/matchmaker/branches/${id}/members`, body),
  assignments: (query: AdminListQuery = {}) => list("admin/matchmaker/assignments", query),
  createAssignment: (body: JsonBody) => create("admin/matchmaker/assignments", body),
  endAssignment: (id: number | string, reason: string) => adminApi(`admin/matchmaker/assignments/${id}/end`, { method: "POST", query: { reason } }),
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
  meetingRequests: (query: AdminListQuery = {}) => list("admin/matchmaker/meetings/requests", query),
  meetings: (query: AdminListQuery = {}) => list("admin/matchmaker/meetings", query),
  meeting: (id: number | string) => adminApi(`admin/matchmaker/meetings/${id}`),
  updateMeeting: (id: number | string, body: JsonBody) => update(`admin/matchmaker/meetings/${id}`, body),
  meetingFeedback: (id: number | string) => adminApi<Record<string, unknown>[]>(`admin/matchmaker/meetings/${id}/feedback`),
  financeCommissionRules: (query: PageQuery = {}) => adminApi("admin/finance/commission-rules", { method: "GET", query }),
  createFinanceCommissionRule: (body: Record<string, unknown>) => adminApi("admin/finance/commission-rules", { method: "POST", body }),
  financeReport: (query: PageQuery = {}) => adminApi("admin/finance/report", { method: "GET", query }),
  financeOrders: (query: AdminListQuery = {}) => list("admin/finance/orders", query),
  financeWithdrawals: (query: AdminListQuery = {}) => list("admin/finance/withdrawals", query),
  financeLedger: (query: AdminListQuery = {}) => list("admin/finance/ledger", query),
  vipMembers: (query: AdminListQuery = {}) => list("admin/members/vip", query),
  updateProductCommissionRule: (productId: number | string, body: Record<string, unknown>) => adminApi(`admin/finance/product-commission-rules/${productId}`, { method: "POST", body }),
  settleFinanceOrder: (orderId: number | string, body: Record<string, unknown> = {}) => adminApi(`admin/finance/orders/${orderId}/settle`, { method: "POST", body }),
  refundFinanceOrder: (orderId: number | string, body: Record<string, unknown>) => adminApi(`admin/finance/orders/${orderId}/refund`, { method: "POST", body }),
  releaseCommissionEntry: (entryId: number | string, body: Record<string, unknown> = {}) => adminApi(`admin/finance/commission-entries/${entryId}/release`, { method: "POST", body }),
  reviewWithdrawal: (withdrawalId: number | string, body: Record<string, unknown>) => adminApi(`admin/finance/withdrawals/${withdrawalId}`, { method: "PATCH", body }),
};
