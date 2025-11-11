import Navbar from "@/components/Navbar";
import { loadTalentProfiles } from "@/lib/dataSources";

export const metadata = {
  title: "Talent Network • Documotion",
  description: "Discover founders, operators, and advisors available through Documotion’s curated network.",
};

export default async function TalentPage() {
  const profiles = await loadTalentProfiles();
  const featured = profiles.slice(0, 36);

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold" style={{ color: "var(--label)" }}>
            Talent Network
          </h1>
          <p className="text-base" style={{ color: "var(--secondary-label)" }}>
            Filter warm intros to founders, growth leaders, and specialists aligned to Indian startup needs.
            The concierge team can share full profiles and availability on request.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(profile => (
            <article key={`${profile.email}-${profile.full_name}`} className="glass rounded-2xl p-6 border border-white/10 space-y-2">
              <h2 className="text-lg font-semibold" style={{ color: "var(--label)" }}>
                {profile.full_name || profile.name || "Talent profile"}
              </h2>
              <div className="text-sm" style={{ color: "var(--secondary-label)" }}>
                {profile.designation || profile.role || "Operator"}
              </div>
              {profile.industry && (
                <div className="text-xs uppercase tracking-wide" style={{ color: "var(--tertiary-label)" }}>
                  {profile.industry}
                </div>
              )}
              {profile.location && (
                <div className="text-sm" style={{ color: "var(--secondary-label)" }}>
                  📍 {profile.location}
                </div>
              )}
              {profile.skills && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {profile.skills.split(",").slice(0, 4).map(skill => (
                    <span key={skill} className="px-3 py-1 text-xs rounded-full bg-white/10" style={{ color: "var(--secondary-label)" }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

