import { page } from "$app/state";

import { type Action, can } from "./permissions";

export const allowed = (action: Action) => can(page.data.user?.role, action);
