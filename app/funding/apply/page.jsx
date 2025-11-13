import Navbar from '@/components/Navbar';
import FundingApplicationWizard from '@/components/funding/FundingApplicationWizard';

export const metadata = {
  title: 'Apply for Funding • Documotion',
  description:
    'Submit your startup funding application, share your traction, and connect with investors directly inside Documotion.',
};

export default function FundingApplicationPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_65%),#05070f] text-white">
      <Navbar />
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 md:px-8">
        <FundingApplicationWizard />
      </main>
    </div>
  );
}
