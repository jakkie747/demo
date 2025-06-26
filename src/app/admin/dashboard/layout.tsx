"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminNav } from "@/components/admin/AdminNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center group p-2"
          >
            <svg
              className="h-14 w-auto group-data-[collapsible=icon]:h-8"
              viewBox="0 0 24 24"
              fill="hsl(var(--sidebar-foreground))"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Blinkogies Logo"
            >
              <circle cx="12" cy="12" r="12" />
              <text
                x="12"
                y="17.5"
                fontFamily="Lilita One, sans-serif"
                fontSize="16"
                fill="hsl(var(--sidebar-background))"
                textAnchor="middle"
              >
                B
              </text>
            </svg>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <AdminNav />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t('logout')}>
                <Link href="/admin">
                  <LogOut />
                  <span>{t('logout')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">{t('adminDashboard')}</h1>
        </header>
        <main className="p-4 sm:px-6 sm:py-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
