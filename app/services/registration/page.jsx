import Navbar from "@/components/Navbar";
import RegistrationWorkflow from "@/components/RegistrationWorkflow.jsx";

export const metadata = {
  title: "Business Registration • Documotion",
  description: "Launch your company with concierge filings, document vault, and payment tracking.",
};

export default function RegistrationServicesPage() {
  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-10 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold" style={{ color: "var(--label)" }}>
            Business Registration Concierge
          </h1>
          <p className="text-base" style={{ color: "var(--secondary-label)" }}>
            Select a structure, share your budget, and Documotion will generate timelines, collect documents,
            and track payments. The flow below uses a sandbox startup profile so you can test the experience.
          </p>
        </header>

        <RegistrationWorkflow />
      </main>
    </div>
  );
}

