
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
import { Calendar } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

type Event = {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
  aiHint?: string;
  titleKey?: TranslationKey;
  descriptionKey?: TranslationKey;
};

const initialEventsData: Omit<Event, "title" | "description">[] = [
  {
    id: "EVT001",
    titleKey: "sportsDayTitle",
    descriptionKey: "sportsDayDesc",
    date: "2024-10-26",
    image: "https://placehold.co/600x400.png",
    aiHint: "children sports day",
  },
  {
    id: "EVT002",
    titleKey: "pajamaDayTitle",
    descriptionKey: "pajamaDayDesc",
    date: "2024-11-15",
    image: "https://placehold.co/600x400.png",
    aiHint: "children watching movie",
  },
  {
    id: "EVT003",
    titleKey: "concertTitle",
    descriptionKey: "concertDesc",
    date: "2024-12-05",
    image: "https://placehold.co/600x400.png",
    aiHint: "children stage performance",
  },
];

export default function EventsPage() {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    let active = true;

    const loadEvents = () => {
      try {
        const storedEventsJSON = localStorage.getItem("events");
        if (storedEventsJSON) {
          const storedEvents = JSON.parse(storedEventsJSON);
          if (storedEvents.length > 0) {
            if (active) setEvents(storedEvents);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to load events from local storage", error);
      }

      const translatedInitialEvents = initialEventsData.map((e) => ({
        ...e,
        title: t(e.titleKey as TranslationKey),
        description: t(e.descriptionKey as TranslationKey),
      }));
      
      if (active) setEvents(translatedInitialEvents);
    };

    loadEvents();
    
    return () => { active = false; };
  }, [language, t]);

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
    </div>
  );
}
