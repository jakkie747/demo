
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import type { Activity } from "@/lib/types";
import { getActivities } from "@/services/activityService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Camera, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function GalleryPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(isFirebaseConfigured());

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedItems = await getActivities();
      setItems(fetchedItems);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not fetch gallery items from the database."
      });
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isConfigured) {
      loadItems();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, loadItems]);

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>Cannot display the gallery because the application is not connected to the database.</p>
            <p className="mt-2 font-bold">Please open the file <code>src/lib/firebase.ts</code> and follow the instructions to add your Firebase credentials.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">
          {t("galleryTitle")}
        </h1>
        <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          {t("gallerySub")}
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({length: 8}).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="w-full h-auto aspect-square" />
                </CardContent>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
            <Camera className="w-16 h-16" />
            <p className="text-xl">{t('noGalleryItems')}</p>
            <p>{t('noGalleryItemsDesc')}</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col overflow-hidden transition-all hover:shadow-xl"
            >
              <CardContent className="p-0">
                <Image
                  src={item.image || "https://placehold.co/400x400.png"}
                  data-ai-hint={item.aiHint || 'children school'}
                  alt={item.title}
                  width={400}
                  height={400}
                  className="w-full h-auto aspect-square object-cover"
                />
              </CardContent>
              <CardHeader className="flex-1 p-4">
                <CardTitle className="font-headline text-xl text-primary/90 leading-tight">
                  {item.title}
                </CardTitle>
                <CardDescription className="mt-1 text-sm">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
