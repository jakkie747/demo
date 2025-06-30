
"use client";

import Link from "next/link";
import { Menu, Languages, Download, Phone } from "lucide-react";
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

export function Header() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
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
          
          <div className="hidden md:flex items-center gap-1">
            <Button asChild variant="ghost" size="icon">
              <Link href="https://web.facebook.com/groups/1596188941091215/" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2" className="h-7 w-7">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
                <Link href="https://www.instagram.com/blink.ogies?utm_source=qr&igsh=Yjh6cDNwd2xldzNv" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                      <defs>
                          <radialGradient id="instagram-gradient" cx="0.3" cy="1.2" r="1.2">
                              <stop offset="0" stopColor="#F58529" />
                              <stop offset="0.2" stopColor="#FEDA77" />
                              <stop offset="0.4" stopColor="#DD2A7B" />
                              <stop offset="0.7" stopColor="#8134AF" />
                              <stop offset="1" stopColor="#515BD4" />
                          </radialGradient>
                      </defs>
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="url(#instagram-gradient)"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="white" strokeWidth="2"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2"></line>
                  </svg>
                    <span className="sr-only">Instagram</span>
                </Link>
            </Button>
          </div>

          <div className="hidden md:flex">
             <Button asChild>
                <Link href="tel:+27725953421">
                  <Phone className="mr-2" />
                  {t("callUs")}
                </Link>
              </Button>
          </div>

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
                  href="https://web.facebook.com/groups/1596188941091215/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center text-lg font-medium transition-colors hover:text-primary text-foreground/60"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2" className="mr-4 h-6 w-6">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  <span>Facebook</span>
                </Link>

                <Link
                    href="https://www.instagram.com/blink.ogies?utm_source=qr&igsh=Yjh6cDNwd2xldzNv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                    "flex items-center text-lg font-medium transition-colors hover:text-primary text-foreground/60"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-4 h-6 w-6" fill="none">
                      <defs>
                          <radialGradient id="instagram-gradient-mobile" cx="0.3" cy="1.2" r="1.2">
                              <stop offset="0" stopColor="#F58529" />
                              <stop offset="0.2" stopColor="#FEDA77" />
                              <stop offset="0.4" stopColor="#DD2A7B" />
                              <stop offset="0.7" stopColor="#8134AF" />
                              <stop offset="1" stopColor="#515BD4" />
                          </radialGradient>
                      </defs>
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="url(#instagram-gradient-mobile)"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="white" strokeWidth="2"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2"></line>
                  </svg>
                  <span>Instagram</span>
                </Link>

                <Link
                  href="tel:+27725953421"
                  className={cn(
                    "flex items-center text-lg font-medium transition-colors hover:text-primary text-foreground/60"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Phone className="mr-4 h-5 w-5" />
                  <span>{t("callUs")}</span>
                </Link>

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
