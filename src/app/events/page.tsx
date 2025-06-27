
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Info } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import type { Event } from "@/lib/types";
import { getEvents } from "@/services/eventsService";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to load events from Firestore", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">
          {t("upcomingEvents")}
        </h1>
        <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          {t("upcomingEventsSub")}
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {Array.from({length: 2}).map((_, i) => (
                <Card key={i} className="flex flex-col overflow-hidden">
                    <Skeleton className="w-full h-[340px]" />
                    <CardContent className="flex-1 p-6">
                        <Skeleton className="h-8 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                        <Skeleton className="h-6 w-1/2" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
            <Info className="w-16 h-16" />
            <p className="text-xl">No upcoming events at the moment.</p>
            <p>Please check back later for new and exciting activities!</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {events.map((event) => (
            <Card
              key={event.id}
              className="flex flex-col overflow-hidden transition-all hover:shadow-xl"
            >
              <CardHeader className="p-0">
                <Image
                  src={event.image || "https://placehold.co/600x400.png"}
                  data-ai-hint={event.aiHint}
                  alt={event.title}
                  width={600}
                  height={400}
                  className="w-full aspect-video object-cover"
                  unoptimized
                />
              </CardHeader>
              <CardContent className="flex-1 p-6">
                <CardTitle className="font-headline text-2xl text-primary/90">
                  {event.title}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {event.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {new Date(event.date).toLocaleDateString(language, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
