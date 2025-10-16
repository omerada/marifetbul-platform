import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Şifre Sıfırla | MarifetBul',
  description:
    'MarifetBul hesabınız için yeni bir şifre belirleyin. Güvenli şifre oluşturma talimatlarını takip edin.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
