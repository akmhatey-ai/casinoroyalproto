export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(base: string, existing: (slug: string) => Promise<boolean>): Promise<string> {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  let n = 0;
  return (async function next(): Promise<string> {
    const taken = await existing(slug);
    if (!taken) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
    return next();
  })();
}
