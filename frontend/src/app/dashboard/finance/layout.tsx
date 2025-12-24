import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finance Hub | OL-OS',
  description: 'Track income, expenses, and financial goals.',
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
