import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center group" prefetch={false}>
      <Image
        src="https://storage.googleapis.com/source-www-uploads-prod/images/655883216.png"
        alt="Blinkogies Logo"
        width={176}
        height={174}
        className="h-12 w-auto"
        unoptimized
      />
    </Link>
  );
}
