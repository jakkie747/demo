import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center group" prefetch={false}>
      <Image
        src="https://placehold.co/176x174.png"
        alt="Logo"
        width={176}
        height={174}
        className="h-12 w-auto"
        unoptimized
      />
    </Link>
  );
}
