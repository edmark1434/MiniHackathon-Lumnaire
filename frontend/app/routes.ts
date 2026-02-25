import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Public layout routes
  layout("components/PublicLayout.tsx", [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("catalogue", "routes/catalogue.tsx"),
    route("store/:storeId", "routes/store.$storeId.tsx"),
  ]),

  // App layout routes (authenticated)
  layout("components/AppLayout.tsx", [
    // Owner routes
    route("owner/dashboard", "routes/owner/dashboard.tsx"),
    route("owner/products", "routes/owner/products.tsx"),
    route("owner/debts", "routes/owner/debts.tsx"),

    // Admin routes
    route("admin/dashboard", "routes/admin/dashboard.tsx"),
  ]),
] satisfies RouteConfig;
