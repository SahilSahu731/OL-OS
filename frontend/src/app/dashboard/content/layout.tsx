import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Studio | OL-OS',
  description: 'Manage your creative pipeline from idea to publish.',
};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
