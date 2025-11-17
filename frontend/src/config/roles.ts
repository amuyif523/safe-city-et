import type { RoleName } from "../types/user";

export const ROLE_LABELS: Record<RoleName, string> = {
  public: "Citizen",
  police: "Police",
  fire: "Fire Brigade",
  medical: "Medical",
  military: "Military",
  admin: "Admin",
  super_admin: "Super Admin",
};

export const PORTAL_ACCESS: Record<string, RoleName[]> = {
  public: ["public", "admin", "super_admin"],
  police: ["police", "admin", "super_admin"],
  fire: ["fire", "admin", "super_admin"],
  medical: ["medical", "admin", "super_admin"],
  military: ["military", "admin", "super_admin"],
  admin: ["admin", "super_admin"],
};
