import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center group" prefetch={false}>
      <img
        src="/logo.png"
        alt="Blinkogies Logo"
        className="h-12 w-auto"
      />
    </Link>
  );
}
