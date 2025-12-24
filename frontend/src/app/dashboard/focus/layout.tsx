import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deep Focus | OL-OS',
  description: 'Distraction-free focus sessions and task management.',
};

export default function FocusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
