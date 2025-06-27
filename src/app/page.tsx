
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Paintbrush, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Logo } from "@/components/Logo";

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  {t("welcome")}
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  {t("welcomeSub")}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="font-semibold">
                  <Link href="/register">{t("registerYourChild")}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="font-semibold"
                >
                  <Link href="/events">{t("viewUpcomingEvents")}</Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://images.unsplash.com/photo-1517251211477-83151b667850"
              alt="Children playing with blocks"
              width={600}
              height={600}
              className="mx-auto aspect-square w-full rounded-full object-cover lg:order-last"
              data-ai-hint="children classroom"
              unoptimized
            />
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">
                {t("recentActivities")}
              </h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t("recentActivitiesSub")}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="grid gap-1">
                  <CardTitle>{t("artDay")}</CardTitle>
                </div>
                <div className="ml-auto rounded-full bg-accent/20 p-2">
                  <Paintbrush className="h-6 w-6 text-accent-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <Image
                  src="https://images.unsplash.com/photo-1596495758279-66445155a4e3"
                  alt="Child painting on a canvas"
                  width={400}
                  height={300}
                  className="rounded-lg mb-4 object-cover aspect-[4/3]"
                  data-ai-hint="child painting"
                  unoptimized
                />
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="grid gap-1">
                  <CardTitle>{t("storyTime")}</CardTitle>
                </div>
                <div className="ml-auto rounded-full bg-accent/20 p-2">
                  <BookOpen className="h-6 w-6 text-accent-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <Image
                  src="https://images.unsplash.com/photo-1491841550275-5b462bf9f505"
                  alt="An open story book with illustrations"
                  width={400}
                  height={300}
                  className="rounded-lg mb-4 object-cover aspect-[4/3]"
                  data-ai-hint="open book"
                  unoptimized
                />
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="grid gap-1">
                  <CardTitle>{t("gardenDay")}</CardTitle>
                </div>
                <div className="ml-auto rounded-full bg-accent/20 p-2">
                  <Calendar className="h-6 w-6 text-accent-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <Image
                  src="https://images.unsplash.com/photo-1620203534033-c11c1d8f8d64"
                  alt="Child watering plants in a garden"
                  width={400}
                  height={300}
                  className="rounded-lg mb-4 object-cover aspect-[4/3]"
                  data-ai-hint="child gardening"
                  unoptimized
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
