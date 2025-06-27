
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
import { Users, Calendar, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getChildren } from "@/services/childrenService";
import { getEvents } from "@/services/eventsService";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [childrenCount, setChildrenCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [children, events] = await Promise.all([
          getChildren(),
          getEvents(),
        ]);
        setChildrenCount(children.length);
        setEventsCount(events.length);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <div className="grid gap-4 md:grid-cols-3">
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
              <CardTitle>{t("manageActivities")}</CardTitle>
              <CardDescription>{t("manageActivitiesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/admin/dashboard/activities">
                  {t("manageActivities")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
