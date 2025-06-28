
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/context/LanguageContext";
import { getTeacherByEmail, addTeacher } from "@/services/teacherService";
import type { Teacher } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // On first load, check if the admin user exists. If not, create it.
    // This is a one-time setup for the prototype.
    const setupAdmin = async () => {
      const adminEmail = 'admin@blinkogies.co.za';
      const adminExists = await getTeacherByEmail(adminEmail);
      if (!adminExists) {
        const adminUser: Omit<Teacher, 'id'> = {
          name: 'Admin',
          email: adminEmail,
          password_insecure: 'password', // Default password
          role: 'admin',
        };
        try {
          await addTeacher(adminUser);
          console.log('Default admin user created.');
        } catch (error) {
          console.error('Failed to create default admin user:', error);
        }
      }
    };
    setupAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // This is a prototype login system.
    // In a real application, never store or compare passwords in plaintext.
    // Use a secure authentication provider like Firebase Authentication.
    try {
      const teacher = await getTeacherByEmail(email);

      if (teacher && teacher.password_insecure === password) {
         toast({
          title: t('loginSuccess'),
          description: t('loginRedirecting'),
        });
        // Store login state (insecure, for prototype only)
        sessionStorage.setItem('isLoggedIn', 'true');
        router.push("/admin/dashboard");
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-dvh px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">
              {t('adminLogin')}
            </CardTitle>
            <CardDescription>
              {t('adminLoginSub')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Prototype Login</AlertTitle>
                <AlertDescription>
                  This login is for demonstration only. Use email <strong>admin@blinkogies.co.za</strong> and password <strong>password</strong> to log in.
                </AlertDescription>
            </Alert>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailAddress')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('egEmail')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <div className="flex items-center justify-end">
                <Link href="/admin/forgot-password" passHref>
                  <Button variant="link" className="p-0 h-auto text-sm">
                    {t('forgotPassword')}
                  </Button>
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={isLoading}
              >
                {isLoading ? t('loggingIn') : t('login')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
