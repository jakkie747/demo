import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const svg = (
    <svg
      role="img"
      aria-label="Blinkogies Logo"
      className={cn("h-8 w-8", className)}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Shape 1 - Blue */}
        <path
          d="M10 10 H 20 V 30 H 10 C 5 30, 5 10, 10 10"
          stroke="hsl(var(--primary))"
        />
        {/* Shape 2 - Yellow */}
        <path
          d="M30 30 H 20 V 10 H 30 C 35 10, 35 30, 30 30"
          stroke="hsl(var(--accent))"
        />
      </g>
      <circle cx="13" cy="23" r="1.5" fill="hsl(var(--primary))" />
      <circle cx="27" cy="17" r="1.5" fill="hsl(var(--accent))" />
    </svg>
  );

  const content = (
    <div className="flex items-center gap-3">
      {svg}
      <span className="font-headline text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">
        Blinkogies
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center group text-primary"
        prefetch={false}
      >
        {content}
      </Link>
    );
  }

  return content;
}
