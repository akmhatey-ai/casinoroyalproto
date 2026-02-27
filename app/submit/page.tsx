import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SubmitForm } from "@/components/submit/SubmitForm";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display mb-2 text-4xl font-extrabold tracking-tight text-white">
          Submit
        </h1>
        <p className="mb-8 text-sm text-[#A0A0A0]">
          Submit a prompt or a SKILL.md skill. Submissions go to moderation and will appear after approval.
        </p>
        <SubmitForm />
      </div>
    </AppShell>
  );
}
