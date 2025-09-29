import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - MarifetBul',
  description:
    'Freelance dünyası, teknoloji ve iş hayatı hakkında güncel blog yazıları.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
