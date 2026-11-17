import { HugeiconsIcon } from "@hugeicons/react";
import { PackageSearch01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { cn } from "cn";

export function BrandMark({
  href = "/",
  className,
  wordmarkClassName,
}: {
  href?: string;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm sm:size-9">
        <HugeiconsIcon
          icon={PackageSearch01Icon}
          size={18}
          strokeWidth={2}
          color="currentColor"
        />
      </span>
      <span
        className={cn(
          "text-sm font-semibold tracking-wide text-foreground uppercase sm:text-base",
          wordmarkClassName,
        )}
      >
        InventoryFinder
      </span>
    </Link>
  );
}
