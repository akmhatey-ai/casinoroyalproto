"use client";

import { Icon } from "@iconify/react";

type SearchInputProps = {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  name = "q",
  defaultValue,
  placeholder = "Search prompts, skills, and AI tools",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative max-w-2xl group ${className}`}>
      <Icon
        icon="lucide:search"
        className="absolute left-6 top-1/2 text-xl text-[#A0A0A0] -translate-y-1/2 transition-colors group-focus-within:text-[#FF9500]"
      />
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="search-input w-full rounded-2xl border border-white/10 bg-white/[0.03] py-5 pl-16 pr-8 text-white placeholder:text-[#525252] focus:outline-none focus:border-[rgba(255,149,0,0.5)] focus:ring-4 focus:ring-[rgba(255,149,0,0.1)] transition-all"
      />
    </div>
  );
}
