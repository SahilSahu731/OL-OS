import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instagram Studio | OL-OS',
  description: 'Plan and schedule your Instagram Reels and Posts.',
};

export default function InstagramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
