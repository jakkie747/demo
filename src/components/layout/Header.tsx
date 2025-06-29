
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
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useFcmToken } from "@/hooks/useFcmToken";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const { permission, requestPermission, isRequesting } = useFcmToken();

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

  const NotificationStatus = () => {
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
            <Badge variant="destructive" className="hidden md:flex items-center gap-2">
                <BellOff className="h-4 w-4"/>
                <span>{t('notificationsDenied')}</span>
            </Badge>
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
                
                {permission === 'default' && (
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
                )}
                
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
