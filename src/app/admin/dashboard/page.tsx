
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, PlusCircle, AlertTriangle, FileText, GalleryHorizontal, Lightbulb, Mail, Briefcase } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getChildren } from "@/services/childrenService";
import { getEvents } from "@/services/eventsService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [childrenCount, setChildrenCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isConfigured] = useState(isFirebaseConfigured());
  const { teacher, loading: authLoading } = useAdminAuth();
  const userRole = teacher?.role;

  useEffect(() => {
    if (authLoading) return; // Wait until auth state is resolved

    if (!isConfigured) {
      setIsLoadingData(false);
      return;
    }
    
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [children, events] = await Promise.all([
          getChildren(),
          getEvents(),
        ]);
        setChildrenCount(children.length);
        setEventsCount(events.length);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch dashboard data." });
        setChildrenCount(0);
        setEventsCount(0);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, [isConfigured, toast, authLoading]);

  const isLoading = authLoading || isLoadingData;

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>The dashboard cannot be displayed because the application is not connected to Firebase.</p>
            <p className="mt-2 font-bold">Please open the file <code>src/lib/firebase.ts</code> and follow the instructions to add your Firebase credentials.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("registeredChildren")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{childrenCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {/* This can be made dynamic later */}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("upcomingEventsCard")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <Skeleton className="h-8 w-10" />
            ) : (
              <div className="text-2xl font-bold">{eventsCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
               {/* This can be made dynamic later */}
            </p>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-center items-center bg-accent/20 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">{t("createNewEvent")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/dashboard/events">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("newEvent")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4">{t("quickLinks")}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("viewAllChildren")}</CardTitle>
              <CardDescription>{t("viewAllChildrenDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/admin/dashboard/children">
                  {t("manageChildren")}
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("manageEventsCard")}</CardTitle>
              <CardDescription>{t("manageEventsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/admin/dashboard/events">{t("manageEvents")}</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("manageGallery")}</CardTitle>
              <CardDescription>{t("manageGalleryDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/admin/dashboard/activities">
                  {t("manageGallery")}
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>{t("manageDocuments")}</CardTitle>
                <CardDescription>{t("manageDocumentsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild variant="secondary">
                    <Link href="/admin/dashboard/documents">{t("manageDocuments")}</Link>
                </Button>
            </CardContent>
          </Card>
           {userRole === 'admin' && (
            <Card>
                <CardHeader>
                <CardTitle>{t("manageTeachers")}</CardTitle>
                <CardDescription>{t("manageTeachersDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                <Button asChild variant="secondary">
                    <Link href="/admin/dashboard/teachers">
                    <Briefcase className="mr-2 h-4 w-4" />
                    {t("manageTeachers")}
                    </Link>
                </Button>
                </CardContent>
            </Card>
           )}
           <Card>
            <CardHeader>
              <CardTitle>{t("composeMessage")}</CardTitle>
              <CardDescription>{t("composeMessageDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/admin/dashboard/notifications">
                  {t("composeMessage")}
                </Link>
              </Button>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
                <CardTitle>{t("aiAssistant")}</CardTitle>
                <CardDescription>{t("aiAssistantDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild variant="secondary">
                    <Link href="/admin/dashboard/ai-assistant">{t("aiAssistant")}</Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
