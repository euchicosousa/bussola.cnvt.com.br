import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard.tsx", [
    index("./routes/dashboard.home.tsx"),
    route("late", "routes/dashboard.late.tsx"),
    route("day", "routes/dashboard.day.tsx"),
    route("create", "routes/dashboard.create.tsx"),
    route("cnvt6", "routes/dashboard.cnvt6.tsx"),
    route(":partner", "routes/dashboard.partner.tsx"),
    route(":partner/archived", "routes/dashboard.partner.archived.tsx"),

    route("action/:id/:slug", "routes/dashboard.action.id.slug.tsx"),

    route("admin/users", "routes/dashboard.admin.users.tsx"),
    route("admin/user/:id/actions", "routes/dashboard.admin.user.actions.tsx"),
    route("admin/user/:id", "routes/dashboard.admin.user.tsx"),
    route("admin/user/new", "routes/dashboard.admin.user.new.tsx"),

    route("admin/partners", "routes/dashboard.admin.partners.tsx"),
    route("admin/partner/:slug", "routes/dashboard.admin.partner.slug.tsx"),
    route("admin/partner/new", "routes/dashboard.admin.partner.new.tsx"),

    route(
      "admin/celebration/new",
      "routes/dashboard.admin.celebration.new.tsx",
    ),

    route("me", "routes/dashboard.me.tsx"),
    route("help", "routes/dashboard.help.tsx"),
  ]),

  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),

  route("handle-openai", "routes/handle-openai.tsx"),
  route("handle-actions", "routes/handle-actions.tsx"),

  route("ui", "routes/ui.tsx"),
  route("set-theme", "routes/set-theme.tsx"),
  route("report/:partner", "routes/report.partner.tsx"),

  route("upper", "routes/upper.tsx"),
] satisfies RouteConfig;
