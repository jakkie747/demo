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

const events = [
  {
    title: "Annual Sports Day",
    date: "October 26, 2024",
    description:
      "Get ready for a day of fun, games, and friendly competition! Parents are welcome to cheer on our little athletes.",
    image: "https://placehold.co/600x400.png",
    aiHint: "children sports day",
  },
  {
    title: "Pajama & Movie Day",
    date: "November 15, 2024",
    description:
      "A cozy day at school! Children can come in their favorite pajamas as we watch a fun animated movie and enjoy popcorn.",
    image: "https://placehold.co/600x400.png",
    aiHint: "children watching movie",
  },
  {
    title: "End-of-Year Concert",
    date: "December 5, 2024",
    description:
      "Our little stars will be showcasing their talents in our annual concert. A performance you won't want to miss!",
    image: "https://placehold.co/600x400.png",
    aiHint: "children stage performance",
  },
  {
    title: "Science Fair",
    date: "January 20, 2025",
    description:
      "Explore the wonders of science with amazing projects from our budding scientists. It's going to be electrifying!",
    image: "https://placehold.co/600x400.png",
    aiHint: "kids science fair",
  },
];

export default function EventsPage() {
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
        {events.map((event, index) => (
          <Card
            key={index}
            className="flex flex-col overflow-hidden transition-all hover:shadow-xl"
          >
            <CardHeader className="p-0">
              <Image
                src={event.image}
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
                <span>{event.date}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
