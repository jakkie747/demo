import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center group" prefetch={false}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://storage.googleapis.com/source-www-uploads-prod/images/18314358.png"
        alt="Blinkogies Logo"
        width={176}
        height={174}
        className="h-12 w-auto"
      />
    </Link>
  );
}
