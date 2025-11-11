import BrandingSettings from "@/components/BrandingSettings";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Branding Studio • Documotion",
  description: "Customize logos, colors, and white-label options for your Documotion workspace.",
};

export default function BrandingStudioPage() {
  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <BrandingSettings />
      </main>
    </div>
  );
}

