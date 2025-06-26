import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center group text-primary" prefetch={false}>
      <svg
        className="h-12 w-12"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Blinkogies Logo"
      >
        <circle cx="12" cy="12" r="12" />
        <text
          x="12"
          y="17.5"
          fontFamily="Lilita One, sans-serif"
          fontSize="16"
          fill="hsl(var(--primary-foreground))"
          textAnchor="middle"
        >
          B
        </text>
      </svg>
    </Link>
  );
}
