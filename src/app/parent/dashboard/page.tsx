
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getChildrenByParentEmail } from "@/services/childrenService";
import { getReportsByChildId } from "@/services/reportService";
import type { Child, DailyReport } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { Smile, Meh, Frown, Zap, Bed, Utensils, ToyBrick, Nap, NotebookPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const moodConfig = {
    happy: { icon: Smile, color: "text-green-500", label: "Happy" },
    calm: { icon: Meh, color: "text-blue-500", label: "Calm" },
    sad: { icon: Frown, color: "text-red-500", label: "Sad" },
    energetic: { icon: Zap, color: "text-yellow-500", label: "Energetic" },
    tired: { icon: Bed, color: "text-purple-500", label: "Tired" },
};

function DailyReportCard({ report }: { report: DailyReport }) {
    const { icon: MoodIcon, color, label } = moodConfig[report.mood];

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Report for {new Date(report.date).toLocaleDateString('en-ZA', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                           <Badge variant="outline" className={`gap-2 border-0 ${color} bg-opacity-10`}>
                            <MoodIcon className={`h-4 w-4 ${color}`} />
                            {label}
                           </Badge>
                        </CardDescription>
                    </div>
                    {report.photoUrl && <Avatar><AvatarImage src={report.photoUrl} /></Avatar>}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                    <ToyBrick className="h-5 w-5 mt-1 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Activities</h4>
                        <p className="text-muted-foreground">{report.activities}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Utensils className="h-5 w-5 mt-1 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Meals</h4>
                        <p className="text-muted-foreground">{report.meals}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Nap className="h-5 w-5 mt-1 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Naps</h4>
                        <p className="text-muted-foreground">{report.naps}</p>
                    </div>
                </div>
                {report.notes && (
                    <div className="flex items-start gap-4">
                        <NotebookPen className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <h4 className="font-semibold">Notes from Teacher</h4>
                            <p className="text-muted-foreground">{report.notes}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function ChildSection({ child }: { child: Child }) {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const fetchedReports = await getReportsByChildId(child.id);
        setReports(fetchedReports);
      } catch (error) {
        console.error(`Failed to fetch reports for ${child.name}`, error);
      } finally {
        setIsLoadingReports(false);
      }
    };
    fetchReports();
  }, [child.id, child.name]);

  return (
    <div key={child.id} className="space-y-6">
        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={child.photo} alt={child.name} />
                <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Daily Reports for {child.name}</h2>
                <p className="text-muted-foreground">Here are the latest updates from the classroom.</p>
            </div>
        </div>

      {isLoadingReports ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      ) : reports.length === 0 ? (
        <Alert>
          <AlertTitle>No Reports Yet</AlertTitle>
          <AlertDescription>There are no daily reports available for {child.name} at the moment. Please check back later.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {reports.map(report => <DailyReportCard key={report.id} report={report} />)}
        </div>
      )}
    </div>
  );
}


export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildrenData = async () => {
      if (user?.email) {
        try {
          const fetchedChildren = await getChildrenByParentEmail(user.email);
          setChildren(fetchedChildren);
        } catch (err) {
          setError("Could not load your child's information. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    if (user) {
        fetchChildrenData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }
  
  if (children && children.length === 0) {
    return (
        <Alert>
            <AlertTitle>No Child Profile Found</AlertTitle>
            <AlertDescription>
                We could not find a child profile linked to your email address ({user?.email}). 
                Please ensure you registered with the same email you provided to the school. 
                If the problem persists, please contact the school administration.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-12">
        {children?.map(child => <ChildSection key={child.id} child={child} />)}
    </div>
  );
}
