import Navbar from "@/components/Navbar";
import { loadChallenges } from "@/lib/dataSources";

export const metadata = {
  title: "Challenges & Programs • Documotion",
  description: "Apply to awards, grants, incubators, and challenges curated for Indian startups.",
};

function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.valueOf())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ChallengesPage() {
  const challenges = await loadChallenges();

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold" style={{ color: "var(--label)" }}>
            Challenges & Growth Programs
          </h1>
          <p className="text-base" style={{ color: "var(--secondary-label)" }}>
            Track the latest government and ecosystem opportunities—awards, grants, accelerators, and national
            challenges. Documotion highlights deadlines, benefits, and organisers so you can prioritise the
            right programmes for your startup.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map(challenge => {
            const deadline = formatDate(challenge.deadline);
            const eventDate = formatDate(challenge.event_date);

            return (
              <article key={challenge.id} className="glass rounded-2xl p-6 border border-white/10 space-y-3">
                <header className="space-y-1">
                  <h2 className="text-lg font-semibold" style={{ color: "var(--label)" }}>
                    {challenge.title}
                  </h2>
                  <div className="text-sm" style={{ color: "var(--secondary-label)" }}>
                    {challenge.organization}
                  </div>
                </header>

                <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                  <span className="px-2 py-1 rounded-full bg-white/10" style={{ color: "var(--tertiary-label)" }}>
                    {challenge.category}
                  </span>
                  <span style={{ color: "var(--system-blue)" }}>{challenge.status}</span>
                </div>

                <p className="text-sm" style={{ color: "var(--secondary-label)" }}>
                  {challenge.description}
                </p>

                {challenge.benefits && (
                  <div className="text-xs" style={{ color: "var(--tertiary-label)" }}>
                    Benefits: {challenge.benefits}
                  </div>
                )}

                <div className="flex flex-col gap-1 text-xs" style={{ color: "var(--secondary-label)" }}>
                  {deadline && <span>Deadline: {deadline}</span>}
                  {eventDate && <span>Event: {eventDate}</span>}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

