
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

type Event = {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
  aiHint?: string;
};

const initialEvents: Event[] = [
  {
    id: "EVT001",
    title: "Annual Sports Day",
    date: "2024-10-26",
    description:
      "Get ready for a day of fun, games, and friendly competition! Parents are welcome to cheer on our little athletes.",
    image: "https://placehold.co/600x400.png",
    aiHint: "children sports day",
  },
  {
    id: "EVT002",
    title: "Pajama & Movie Day",
    date: "2024-11-15",
    description:
      "A cozy day at school! Children can come in their favorite pajamas as we watch a fun animated movie and enjoy popcorn.",
    image: "https://placehold.co/600x400.png",
    aiHint: "children watching movie",
  },
  {
    id: "EVT003",
    title: "End-of-Year Concert",
    date: "2024-12-05",
    description:
      "Our little stars will be showcasing their talents in our annual concert. A performance you won't want to miss!",
    image: "https://placehold.co/600x400.png",
    aiHint: "children stage performance",
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);

  useEffect(() => {
    try {
      const storedEventsJSON = localStorage.getItem("events");
      if (storedEventsJSON) {
        const storedEvents = JSON.parse(storedEventsJSON);
        if (storedEvents.length > 0) {
          setEvents(storedEvents);
        }
      }
    } catch (error) {
      console.error("Failed to load events from local storage", error);
    }
  }, []);

  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">
          Upcoming Events
        </h1>
        <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Stay updated with all the exciting activities we have planned at
          Blinkogies!
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
                  {new Date(event.date).toLocaleDateString("en-US", {
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

