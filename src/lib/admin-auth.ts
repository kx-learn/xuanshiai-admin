"use client";

import { adminEndpoints } from "@/lib/admin-endpoints";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/admin-api";

export async function loginAdmin(username: string, password: string) {
  const result = await adminEndpoints.login({ username, password });
  setAdminToken(result.access_token);
  return result.account;
}

export async function logoutAdmin() {
  if (getAdminToken() === "local-demo-token") {
    clearAdminToken();
    return;
  }
  try {
    if (getAdminToken()) await adminEndpoints.logout();
  } finally {
    clearAdminToken();
  }
}
