import type { LucideIcon } from "lucide-react";
import type { ReactElement } from "react";

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export type NavItem =
  | {
      title: string;
      href: string;
      icon?: LucideIcon | null;
      isActive?: boolean;
      customComponent?: never; // disallow
    }
  | {
      customComponent: ReactElement;
      href: string;
    };

export interface NavGroup {
  label: string;
  items: NavItem[];
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

export const SCORE_OPTIONS = [
  {
    value: -2,
    emoji: "😭",
    color: "bg-red-500 group-hover:bg-red-600 hover:bg-red-600",
    icon: "/mood-icons/terrible.webp",
  },
  {
    value: -1,
    emoji: "😞",
    color: "bg-orange-400 group-hover:bg-orange-500 hover:bg-orange-500",
    icon: "/mood-icons/bad.webp",
  },
  {
    value: 0,
    emoji: "😐",
    color: "bg-yellow-400 group-hover:bg-yellow-500 hover:bg-yellow-500",
    icon: "/mood-icons/okay.webp",
  },
  {
    value: 1,
    emoji: "😊",
    color: "bg-lime-400 group-hover:bg-lime-500 hover:bg-lime-500",
    icon: "/mood-icons/good.webp",
  },
  {
    value: 2,
    emoji: "😁",
    color: "bg-green-500 group-hover:bg-green-600 hover:bg-green-600",
    icon: "/mood-icons/amazing.webp",
  },
];

export const SCORE_IMAGES: { [key: string]: string } = {
  "-2": "/mood-icons/terrible.webp",
  "-1": "/mood-icons/bad.webp",
  "0": "/mood-icons/okay.webp",
  "1": "/mood-icons/good.webp",
  "2": "/mood-icons/amazing.webp",
};

export interface ThreeCellDailyFormType {
  summary: string;
  score: string;
}

export type ThreeCellModel = {
  id: string;
  user_id: string;
  date_for: string;
  summary: string;
  score: string;
};

export type ThreeCellLog = Omit<ThreeCellModel, "user_id">;

export type UserTask = {
  id: string;

  title: string;
  description: string;
  is_completed: boolean;
  completed_at: Date;
  category: string;
  category_colour: string;

  created_at: Date;
  updated_at: Date;
};
