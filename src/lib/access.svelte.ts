import { page } from "$app/state";

import { can } from "./permissions";
import type { Action } from "./permissions";

export const allowed = (action: Action) => can(page.data.user?.role, action);
