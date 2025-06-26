"use client";

import Link from "next/link";
import Image from "next/image";
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
            <Image
              src="https://storage.googleapis.com/source-www-uploads-prod/images/655883216.png"
              alt="Logo"
              width={176}
              height={174}
              className="h-14 w-auto group-data-[collapsible=icon]:h-8"
              unoptimized
            />
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
