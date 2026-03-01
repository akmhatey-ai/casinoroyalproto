"use client";

import { useState, useEffect } from "react";

type Profile = {
  username: string | null;
  name: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  profilePublic: boolean;
};

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    website: "",
    twitter: "",
    github: "",
    profilePublic: true,
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.username !== undefined) {
          setProfile(data);
          setForm({
            username: data.username ?? "",
            bio: data.bio ?? "",
            website: data.website ?? "",
            twitter: data.twitter ?? "",
            github: data.github ?? "",
            profilePublic: data.profilePublic ?? true,
          });
        }
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim() || undefined,
          bio: form.bio.trim() || undefined,
          website: form.website.trim() || undefined,
          twitter: form.twitter.trim() || undefined,
          github: form.github.trim() || undefined,
          profilePublic: form.profilePublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Failed to save");
      setStatus("error");
    }
  }

  if (profile === null) {
    return <div className="text-sm text-[#A0A0A0]">Loading profile…</div>;
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-[#D4D4D8]">Username (public profile URL)</label>
        <input
          type="text"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          placeholder="johndoe"
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[#D4D4D8] placeholder:text-zinc-500 focus:border-[#FF9500]/50 focus:outline-none"
        />
        <p className="mt-1 text-xs text-[#A0A0A0]">Only letters, numbers, underscore, hyphen. Your profile: /profile/username</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[#D4D4D8]">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder="Short bio (optional)"
          rows={3}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[#D4D4D8] placeholder:text-zinc-500 focus:border-[#FF9500]/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[#D4D4D8]">Website</label>
        <input
          type="url"
          value={form.website}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          placeholder="https://..."
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[#D4D4D8] placeholder:text-zinc-500 focus:border-[#FF9500]/50 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#D4D4D8]">X (Twitter) handle</label>
          <input
            type="text"
            value={form.twitter}
            onChange={(e) => setForm((f) => ({ ...f, twitter: e.target.value }))}
            placeholder="@username"
            className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[#D4D4D8] placeholder:text-zinc-500 focus:border-[#FF9500]/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#D4D4D8]">GitHub username</label>
          <input
            type="text"
            value={form.github}
            onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))}
            placeholder="username"
            className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[#D4D4D8] placeholder:text-zinc-500 focus:border-[#FF9500]/50 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="profilePublic"
          checked={form.profilePublic}
          onChange={(e) => setForm((f) => ({ ...f, profilePublic: e.target.checked }))}
          className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#FF9500] focus:ring-[#FF9500]"
        />
        <label htmlFor="profilePublic" className="text-sm text-[#D4D4D8]">
          Public profile — allow others to view your profile page at /profile/username
        </label>
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-[#FF9500] px-8 py-2.5 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Saving…" : "Save profile"}
      </button>
      {status === "success" && <p className="text-sm text-emerald-400">Profile saved.</p>}
      {status === "error" && error && <p className="text-sm text-amber-400">{error}</p>}
    </form>
  );
}
