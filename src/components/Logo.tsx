import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group" prefetch={false}>
      <Sparkles className="h-8 w-8 text-accent group-hover:animate-pulse" />
      <span className="font-headline text-3xl font-bold text-primary group-hover:text-primary/90 transition-colors">
        Blinkogies
      </span>
    </Link>
  );
}
