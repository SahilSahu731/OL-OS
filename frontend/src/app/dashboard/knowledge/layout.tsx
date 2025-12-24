import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Second Brain | OL-OS',
  description: 'Your personal knowledge vault and note-taking system.',
};

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
