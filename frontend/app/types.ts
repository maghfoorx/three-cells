import type { LucideIcon } from "lucide-react";

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon | null;
  isActive?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
  // created_at: string;
  // updated_at: string;
  [key: string]: unknown; // This allows for additional properties...
}

export const SCORE_COLORS: { [key: string]: string } = {
  "-2": "#ef4444", // red-500
  "-1": "#f97316", // orange-400
  "0": "#facc15", // yellow-400
  "1": "#a3e635", // lime-400
  "2": "#22c55e", // green-500
};

export interface ThreeCellDailyFormType {
  summary: string;
  focused_hours: string;
  score: string;
}

export type ThreeCellModel = {
  id: string;
  user_id: string;
  date_for: string;
  summary: string;
  focused_hours: string;
  score: string;
};

export type ThreeCellLog = Omit<ThreeCellModel, "id" | "user_id">;
