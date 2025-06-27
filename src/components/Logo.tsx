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
      className={cn("h-8 w-auto", className)}
      viewBox="0 0 459 460"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(-18.87 -17.37)">
        <path
          fill="hsl(var(--primary))"
          d="M222.7,214.28S233.56,91.4,324,85.12c75.24-5,116.15,64.25,121.23,87.83,5.6,25.93-30.85,73.49-30.85,73.49-74,74.6-200.72-23.77-200.72-23.77Z"
        />
        <path
          fill="hsl(var(--accent))"
          d="M254.43,269s-10.86,122.88-101.32,129.16c-75.24,5-116.15-64.25-121.23-87.83-5.6-25.93,30.85-73.49,30.85-73.49,74-74.6,200.72,23.77,200.72,23.77Z"
        />
      </g>
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
