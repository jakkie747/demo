import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const logoImage = (
    <img
      src="/logo.png"
      alt="Blinkogies Logo"
      className={cn("h-12 w-auto", className)}
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
