export type RoleName =
  | "public"
  | "police"
  | "fire"
  | "medical"
  | "military"
  | "admin"
  | "super_admin";

export interface Role {
  id: number;
  name: RoleName;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  roles: Role[];
  is_active: boolean;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  incident_type: string;
  status: "open" | "acknowledged" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  latitude?: number | null;
  longitude?: number | null;
  severity_score?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  message: string;
  event_type: string;
  is_read: boolean;
  created_at: string;
}
