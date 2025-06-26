import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center group" prefetch={false}>
      <svg
        viewBox="0 0 100 100"
        className="h-12 w-auto"
        aria-label="Blinkogies Logo"
      >
        <defs>
          <clipPath id="clip-path-logo">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
        </defs>
        <g clipPath="url(#clip-path-logo)">
          <rect width="100" height="100" fill="hsl(207 82% 64%)" />
          <circle cx="78" cy="32" r="30" fill="hsl(47 98% 70%)" />
        </g>
      </svg>
    </Link>
  );
}
