
"use client";

import Link from "next/link";
import { Menu, Languages, Download, BellRing, Bell, BellOff } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useFcmToken } from "@/hooks/useFcmToken";
import { useFcmListener } from "@/hooks/useFcmListener";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const { permission, requestPermission, isRequesting } = useFcmToken();

  // Listen for foreground notifications
  useFcmListener();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      console.log("PWA: 'beforeinstallprompt' event fired.");
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    console.log("PWA: 'beforeinstallprompt' event listener added.");

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      console.log("PWA: 'beforeinstallprompt' event listener removed.");
    };
  }, []);

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'af' : 'en');
  };

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("PWA: User accepted the install prompt");
    } else {
      console.log("PWA: User dismissed the install prompt");
    }
    setInstallPrompt(null);
  };

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/register", label: t("registerChildNav") },
    { href: "/events", label: t("eventsNav") },
  ];
  
  const handleDeniedClick = () => {
    console.log("-----------------------------------------");
    console.log("NOTIFICATION PERMISSION IS BLOCKED");
    console.log("To fix this, you must manually reset the permission in your browser settings for this specific site.");
    console.log("1. Click the lock (🔒) icon in the address bar.");
    console.log("2. Go to 'Site settings' or 'Permissions'.");
    console.log("3. Find 'Notifications' and change the setting from 'Block' to 'Allow' or 'Ask'.");
    console.log("4. Reload the page.");
    console.log("-----------------------------------------");
    toast({
      variant: 'destructive',
      title: "Permission Blocked by Browser",
      description: "Instructions to fix this have been logged to the browser console (F12).",
      duration: 10000,
    })
  };

  const NotificationStatus = () => {
    if (permission === null) {
      return <Skeleton className="h-8 w-40 hidden md:block" />;
    }

    if (permission === 'granted') {
        return (
            <Badge variant="secondary" className="hidden md:flex items-center gap-2 border-green-500/50 text-green-700 dark:text-green-400">
                <Bell className="h-4 w-4"/>
                <span>{t('notificationsEnabled')}</span>
            </Badge>
        );
    }
    if (permission === 'denied') {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge onClick={handleDeniedClick} variant="destructive" className="hidden md:flex items-center gap-2 cursor-pointer hover:bg-destructive/80">
                    <BellOff className="h-4 w-4"/>
                    <span>{t('notificationsDenied')}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                  <p>Click for instructions to fix</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
    }
    if (permission === 'default') {
        return (
             <div className="hidden md:flex">
              <Button onClick={requestPermission} disabled={isRequesting} variant="outline">
                <BellRing className="mr-2" />
                {isRequesting ? t('enabling') : t('enableNotifications')}
              </Button>
            </div>
        )
    }
    return null;
  }
  
  const MobileNotificationStatus = () => {
     if (permission === null) {
      return <div className="flex items-center text-lg font-medium text-foreground/60"><Skeleton className="h-5 w-5 mr-4" /><Skeleton className="h-4 w-40" /></div>;
    }
    if (permission === 'granted') {
      return (
        <div className="flex items-center text-lg font-medium text-green-600 dark:text-green-500">
          <Bell className="mr-4 h-5 w-5" />
          <span>{t('notificationsEnabled')}</span>
        </div>
      );
    }
    if (permission === 'denied') {
      return (
        <button onClick={handleDeniedClick} className="flex items-center text-lg font-medium text-destructive">
          <BellOff className="mr-4 h-5 w-5" />
          <span>{t('notificationsDenied')} (tap for help)</span>
        </button>
      );
    }
    if (permission === 'default') {
      return (
        <button
          onClick={() => {
            requestPermission();
            setIsMobileMenuOpen(false);
          }}
          disabled={isRequesting}
          className={cn(
            "flex items-center text-lg font-medium transition-colors hover:text-primary text-foreground/60",
            isRequesting && "opacity-50"
          )}
        >
          <BellRing className="mr-4 h-5 w-5" />
          {isRequesting ? t('enabling') : t('enableNotifications')}
        </button>
      );
    }
    return null;
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="mr-4 flex">
            <Logo />
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-foreground/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          
          <NotificationStatus />

          <div className="hidden md:flex">
             <Button variant="outline" onClick={handleLanguageToggle}>
              {language === 'en' ? 'Afrikaans' : 'English'}
            </Button>
          </div>

          {!!installPrompt && (
            <div className="hidden md:flex">
              <Button onClick={handleInstallClick}>
                <Download className="mr-2" />
                {t("installApp")}
              </Button>
            </div>
          )}

          <div className="hidden md:flex">
            <Button asChild variant="outline">
              <Link href="/admin">{t("adminLoginNav")}</Link>
            </Button>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full max-w-xs bg-background p-6"
            >
              <SheetTitle>
                <div className="sr-only">Menu</div>
              </SheetTitle>
              <div className="mb-8">
                <Logo />
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === link.href
                        ? "text-primary"
                        : "text-foreground/60"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <MobileNotificationStatus />
                
                {!!installPrompt && (
                  <button
                    onClick={() => {
                      handleInstallClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center text-lg font-medium transition-colors hover:text-primary text-foreground/60"
                    )}
                  >
                    <Download className="mr-4 h-5 w-5" />
                    {t("installApp")}
                  </button>
                )}

                 <button
                  onClick={() => {
                    handleLanguageToggle();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                      "flex items-center text-lg font-medium transition-colors hover:text-primary text-foreground/60"
                  )}
                >
                  <Languages className="mr-4 h-5 w-5" />
                  <span>{language === 'en' ? 'Switch to Afrikaans' : 'Switch to English'}</span>
                </button>

                <Link
                  href="/admin"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    pathname.startsWith('/admin')
                      ? "text-primary"
                      : "text-foreground/60"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("adminLoginNav")}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
