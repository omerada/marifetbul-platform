import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
