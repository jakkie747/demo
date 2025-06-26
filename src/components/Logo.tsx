import Link from "next/link";
import Image, { type ImageLoaderProps } from "next/image";

const imageLoader = ({ src }: ImageLoaderProps) => {
  return src;
};

export function Logo() {
  return (
    <Link href="/" className="flex items-center group" prefetch={false}>
      <Image
        loader={imageLoader}
        src="https://storage.googleapis.com/source-www-uploads-prod/images/655883216.png"
        alt="Blinkogies Logo"
        width={176}
        height={174}
        className="h-12 w-auto"
      />
    </Link>
  );
}
