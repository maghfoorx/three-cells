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
