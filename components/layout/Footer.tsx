'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/icons/icon-48x48.png"
                alt="MarifetBul"
                width={32}
                height={32}
                className="rounded-lg"
                onError={(e) => {
                  // Fallback to M letter if icon fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                      <span class="text-sm font-bold text-white">M</span>
                    </div>
                  `;
                }}
              />
              <span className="text-xl font-bold">MarifetBul</span>
            </div>
            <p className="leading-relaxed text-gray-300">
              Türkiye&apos;nin en büyük freelancer ve işveren buluşma platformu.
              Projeleriniz için en uygun uzmanları bulun veya yeteneklerinizi
              sergileyerek gelir elde edin.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  İş & Hizmet
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace/categories"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Kategoriler
                </Link>
              </li>
              <li>
                <Link
                  href="/info/how-it-works"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Nasıl Çalışır?
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Destek</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/support/help"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Yardım Merkezi
                </Link>
              </li>
              <li>
                <Link
                  href="/info/contact"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  İletişim
                </Link>
              </li>
              <li>
                <Link
                  href="/info/faq"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Sık Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/safety"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Güvenlik
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">İletişim</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">info@marifetbul.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">+90 (212) 123 45 67</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="mt-1 h-4 w-4 text-gray-400" />
                <span className="text-gray-300">
                  Levent Mahallesi, Büyükdere Caddesi
                  <br />
                  No: 123, Şişli, İstanbul
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2024 MarifetBul. Tüm hakları saklıdır.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/legal/privacy"
                className="text-gray-400 transition-colors hover:text-white"
              >
                Gizlilik Politikası
              </Link>
              <Link
                href="/legal/terms"
                className="text-gray-400 transition-colors hover:text-white"
              >
                Kullanım Şartları
              </Link>
              <Link
                href="/legal/cookies"
                className="text-gray-400 transition-colors hover:text-white"
              >
                Çerez Politikası
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
