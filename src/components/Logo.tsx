import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const logoImage = (
    <Image
      src="/logo.png"
      alt="Blinkogies Logo"
      width={140}
      height={32}
      className={cn("h-8 w-auto", className)}
      priority
    />
  );

  const content = (
    <div className="flex items-center gap-3">
      {logoImage}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center group text-primary"
        prefetch={false}
      >
        {content}
      </Link>
    );
  }

  return content;
}
