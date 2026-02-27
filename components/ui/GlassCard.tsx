"use client";

type GlassCardProps = {
  className?: string;
  as?: "div" | "a";
  href?: string;
  type?: "prompt" | "skill";
  title: string;
  description: string;
  creator?: string;
  price?: string | null;
  imageUrl?: string | null;
};

export function GlassCard({
  className = "",
  as: Component = "div",
  href,
  type,
  title,
  description,
  creator,
  price,
  imageUrl,
}: GlassCardProps) {
  const content = (
    <>
      {imageUrl ? (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {type && (
            <div className="absolute left-4 top-4 z-10">
              <span className="rounded-full bg-[#FF9500] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-black">
                {type === "prompt" ? "PROMPT" : "SKILL"}
              </span>
            </div>
          )}
        </div>
      ) : (
        type && (
          <div className="px-8 pt-8">
            <span className="inline-block rounded-full bg-[#FF9500] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-black">
              {type === "prompt" ? "PROMPT" : "SKILL"}
            </span>
          </div>
        )
      )}
      <div className="flex flex-1 flex-col p-8">
        <h3 className="font-display mb-2 text-2xl font-bold text-white">{title}</h3>
        <p className="mb-6 line-clamp-2 text-sm text-[#A0A0A0]">{description}</p>
        <div className="mt-auto flex items-center justify-between">
          {creator ? (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
              <span className="text-xs font-medium text-[#A0A0A0]">{creator}</span>
            </div>
          ) : (
            <div />
          )}
          {price != null && (
            <span className="font-bold text-[#FF9500]">{price === "Free" ? "Free" : price}</span>
          )}
        </div>
      </div>
    </>
  );

  const classes =
    "glass-card group flex cursor-pointer flex-col overflow-hidden rounded-[32px] " + className;

  if (Component === "a" && href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }
  return <div className={classes}>{content}</div>;
}
