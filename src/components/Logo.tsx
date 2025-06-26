import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center group" prefetch={false}>
      <img
        src="https://placehold.co/176x174.png"
        alt="Blinkogies Logo"
        className="h-12 w-auto"
      />
    </Link>
  );
}
