import { redirect } from 'next/navigation';

export default function FundingIndexPage() {
  redirect('/funding/apply');
  return null;
}
