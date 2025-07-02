
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
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getTeacherByUid } from "@/services/teacherService";

export function AdminNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [userRole, setUserRole] = useState<'teacher' | 'admin' | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const teacherProfile = await getTeacherByUid(user.uid);
        if (teacherProfile) {
          setUserRole(teacherProfile.role);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const menuItems = [
    { href: "/admin/dashboard", label: t('dashboard'), icon: LayoutDashboard, roles: ['admin', 'teacher'] },
    {
      href: "/admin/dashboard/children",
      label: t('childrenProfiles'),
      icon: Users,
      roles: ['admin', 'teacher']
    },
    {
      href: "/admin/dashboard/events",
      label: t('manageEvents'),
      icon: CalendarDays,
      roles: ['admin', 'teacher']
    },
    {
      href: "/admin/dashboard/activities",
      label: t('manageGallery'),
      icon: GalleryHorizontal,
      roles: ['admin', 'teacher']
    },
    {
        href: "/admin/dashboard/documents",
        label: t('manageDocuments'),
        icon: FileText,
        roles: ['admin', 'teacher']
    },
    {
      href: "/admin/dashboard/teachers",
      label: t('manageTeachers'),
      icon: Briefcase,
      roles: ['admin'] // Only visible to admins
    },
    {
      href: "/admin/dashboard/notifications",
      label: t('composeMessage'),
      icon: Mail,
      roles: ['admin', 'teacher']
    },
    {
      href: "/admin/dashboard/ai-assistant",
      label: t('aiAssistant'),
      icon: Lightbulb,
      roles: ['admin', 'teacher']
    },
    {
      href: "/admin/dashboard/settings",
      label: t('settings'),
      icon: Settings,
      roles: ['admin', 'teacher']
    },
  ];

  return (
    <SidebarMenu>
      {menuItems.map((item) => 
        (userRole && item.roles.includes(userRole)) && (
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
        )
      )}
    </SidebarMenu>
  );
}
