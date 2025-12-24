import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Habit Lab | OL-OS',
  description: 'Track, build, and analyze your habits.',
};

export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
