import Link from "next/link";
import { Icon } from "@iconify/react";

type SectionHeaderProps = {
  title: string;
  viewAllHref?: string;
};

export function SectionHeader({ title, viewAllHref }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <h2 className="font-display text-3xl font-bold tracking-tight text-white">{title}</h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm font-bold text-[#FF9500] hover:underline"
        >
          VIEW ALL
          <Icon icon="lucide:chevron-right" className="text-lg" />
        </Link>
      )}
    </div>
  );
}
