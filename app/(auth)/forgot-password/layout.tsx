import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Şifremi Unuttum | MarifetBul',
  description:
    'MarifetBul şifrenizi mi unuttunuz? E-posta adresinizi girerek şifre sıfırlama bağlantısı alın.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
