import {
  Bell,
  BookText,
  LayoutDashboard,
  ListTodo,
  MessageCircle,
  Settings,
  Sparkles,
  Trophy,
  UserRound,
  UsersRound,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/rewards', label: 'Rewards', icon: Trophy },
  { href: '/people', label: 'People', icon: UsersRound },
  { href: '/quizzes', label: 'Quizzes', icon: Sparkles },
  { href: '/requests', label: 'Requests', icon: UserRound },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/instructions', label: 'Instructions', icon: BookText },
  { href: '/settings', label: 'Settings', icon: Settings },
];
