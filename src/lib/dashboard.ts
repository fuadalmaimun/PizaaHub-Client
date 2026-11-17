/** Dashboard route per role. Used by navbar and post-login redirects. */
export const DASHBOARD_BY_ROLE: Record<string, string> = {
  customer: "/dashboard/customer",
  vendor: "/dashboard/vendor",
  admin: "/dashboard/admin",
};

export const dashboardPath = (role?: string | null): string =>
  (role && DASHBOARD_BY_ROLE[role]) || "/";

export const profileSettingsPath = (role?: string | null): string =>
  role ? `/dashboard/${role}/profile` : "/";
