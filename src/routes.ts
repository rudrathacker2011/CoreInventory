export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export const publicRoutes = ["/", "/auth/new-verification"];

export const authRoutes = [
  "/auth/login",
  "/auth/signup",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

export const apiAuthPrefix = "/api/auth";

export const apiRoutes = ["/api/data"];

export const privateRoutes = [
  "/dashboard",
  "/products",
  "/receipts",
  "/delivery-orders",
  "/internal-transfers",
  "/stock-adjustments",
  "/stock",
  "/move-history",
  "/settings",
  "/profile",
];
