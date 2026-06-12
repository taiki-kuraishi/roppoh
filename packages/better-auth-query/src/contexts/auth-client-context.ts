import { createContext } from "react";

import type { AuthClient } from "../types";

export const AuthClientContext = createContext<AuthClient | null>(null);
