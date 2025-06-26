import Link from "next/link";
import Image from "next/image";

const LOGO_URL = "https://storage.googleapis.com/source-www-uploads-prod/images/655883216.png";

export function Logo() {
  return (
    <Link href="/" className="flex items-center group" prefetch={false}>
      <Image
        src={LOGO_URL}
        alt="Blinkogies Logo"
        width={176}
        height={174}
        className="h-12 w-auto"
        priority
      />
    </Link>
  );
}
