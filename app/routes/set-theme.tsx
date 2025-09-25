import { createThemeAction } from "remix-themes";
import { themeSessionResolver } from "~/lib/auth/session.server";

export const action = createThemeAction(themeSessionResolver);
