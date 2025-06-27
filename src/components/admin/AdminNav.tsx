"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, Sparkles } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/context/LanguageContext";

export function AdminNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const menuItems = [
    { href: "/admin/dashboard", label: t('dashboard'), icon: LayoutDashboard },
    {
      href: "/admin/dashboard/children",
      label: t('childrenProfiles'),
      icon: Users,
    },
    {
      href: "/admin/dashboard/events",
      label: t('manageEvents'),
      icon: CalendarDays,
    },
    {
      href: "/admin/dashboard/activities",
      label: t('manageActivities'),
      icon: Sparkles,
    },
  ];

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
