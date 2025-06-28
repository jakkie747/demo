
"use client";

import { useState } from "react";
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
      } else if (!teacher && email.toLowerCase() === 'admin@blinkogies.co.za') {
        // If the admin user doesn't exist, create it on the first login attempt.
        const adminUser: Omit<Teacher, 'id'> = {
          name: 'Admin',
          email: email.toLowerCase(),
          password_insecure: 'password', // Default password
          role: 'admin',
        };
        await addTeacher(adminUser);
        setError("Admin account created. Please try logging in again with the password 'password'.");
        toast({
          title: "Admin Account Created",
          description: "Please log in with the default password.",
        });
      }
      else {
        setError("Invalid email or password.");
      }
    } catch (err) {
       const errorMessage = (err as Error).message || "An error occurred during login.";
       if (errorMessage.includes("index")) {
           setError("A database index is required. Please check the browser console (F12) for a link to create it, then try logging in again.");
           console.error("Firebase Index Error: Please create the required Firestore index by clicking the link in the following error message:", err);
       } else {
           setError(errorMessage);
       }
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
                  Use email <strong>admin@blinkogies.co.za</strong> and password <strong>password</strong> to log in. The admin account will be created on your first login attempt.
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
