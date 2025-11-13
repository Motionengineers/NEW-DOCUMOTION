import Navbar from "@/components/Navbar";
import BrandingStudio from "@/components/branding-studio/BrandingStudio";

export const metadata = {
  title: "Branding Studio • Documotion",
  description: "Customize logos, colors, and white-label options for your Documotion workspace.",
};

export default function BrandingStudioPage() {
  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <BrandingStudio />
    </div>
  );
}

