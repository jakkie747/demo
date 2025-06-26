import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center group text-primary"
      prefetch={false}
    >
      <svg
        className="h-12 w-12"
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo Placeholder"
      >
        <circle cx="50" cy="50" r="50" />
        <text
          x="50"
          y="60"
          fontFamily="Lilita One, sans-serif"
          fontSize="30"
          fill="hsl(var(--primary-foreground))"
          textAnchor="middle"
        >
          LOGO
        </text>
      </svg>
    </Link>
  );
}
