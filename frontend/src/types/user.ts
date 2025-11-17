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
  incident_type_confidence?: number | null;
  status: "open" | "acknowledged" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  latitude?: number | null;
  longitude?: number | null;
  severity_score?: number | null;
  ai_metadata?: Record<string, unknown> | null;
  reported_by?: User | null;
  assigned_to?: User | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  channel: string;
  message: string;
  event_type: string;
  payload?: Record<string, unknown> | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}
