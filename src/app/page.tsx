import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Paintbrush, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  Welcome to Blinkogies Family Hub!
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  Your one-stop place for all school-related updates, events, and your child's journey with us. Let's make learning fun, together!
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="font-semibold">
                  <Link href="/register">Register Your Child</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="font-semibold">
                  <Link href="/events">View Upcoming Events</Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              data-ai-hint="children playing preschool"
              alt="Hero"
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">Recent Fun Activities</h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Check out what our little explorers have been up to! We believe in learning through play.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="grid gap-1">
                  <CardTitle>Art Day!</CardTitle>
                </div>
                <div className="ml-auto rounded-full bg-accent/20 p-2">
                    <Paintbrush className="h-6 w-6 text-accent-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <Image 
                  src="https://placehold.co/400x300.png"
                  data-ai-hint="child painting"
                  alt="Art Day"
                  width={400}
                  height={300}
                  className="rounded-lg mb-4"
                />
                <p className="text-sm text-muted-foreground">Our little Picassos created masterpieces. So much color and creativity!</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="grid gap-1">
                  <CardTitle>Story Time</CardTitle>
                </div>
                <div className="ml-auto rounded-full bg-accent/20 p-2">
                    <BookOpen className="h-6 w-6 text-accent-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <Image 
                  src="https://placehold.co/400x300.png"
                  data-ai-hint="teacher reading children"
                  alt="Story Time"
                  width={400}
                  height={300}
                  className="rounded-lg mb-4"
                />
                <p className="text-sm text-muted-foreground">We traveled to magical lands through the pages of a book.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="grid gap-1">
                  <CardTitle>Garden Day</CardTitle>
                </div>
                 <div className="ml-auto rounded-full bg-accent/20 p-2">
                    <Calendar className="h-6 w-6 text-accent-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <Image 
                  src="https://placehold.co/400x300.png"
                  data-ai-hint="children gardening"
                  alt="Garden Day"
                  width={400}
                  height={300}
                  className="rounded-lg mb-4"
                />
                <p className="text-sm text-muted-foreground">Learning about nature by getting our hands dirty in the school garden.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
