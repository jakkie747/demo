
"use client";

import Link from "next/link";
import { Menu, Languages, Download } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the default browser install prompt
      event.preventDefault();
      // Stash the event so it can be triggered later.
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Languages className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">{t("language")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("af")}>
                Afrikaans
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
