import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fitness Tracker | OL-OS',
  description: 'Log workouts, nutrition, and body metrics.',
};

export default function FitnessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
