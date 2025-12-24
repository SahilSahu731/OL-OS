import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Manager | OL-OS',
  description: 'Manage your active projects and tasks.',
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
