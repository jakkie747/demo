
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, GalleryHorizontal, Briefcase, Mail, Settings, Lightbulb, FileText } from "lucide-react";
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
      label: t('manageGallery'),
      icon: GalleryHorizontal,
    },
    {
        href: "/admin/dashboard/documents",
        label: t('manageDocuments'),
        icon: FileText
    },
    {
      href: "/admin/dashboard/teachers",
      label: t('manageTeachers'),
      icon: Briefcase,
    },
    {
      href: "/admin/dashboard/notifications",
      label: t('composeMessage'),
      icon: Mail,
    },
    {
      href: "/admin/dashboard/ai-assistant",
      label: t('aiAssistant'),
      icon: Lightbulb
    },
    {
      href: "/admin/dashboard/settings",
      label: t('settings'),
      icon: Settings,
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
