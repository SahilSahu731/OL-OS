import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roadmap | OL-OS',
  description: 'Visual project roadmap and long-term planning.',
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
