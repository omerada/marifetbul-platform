'use client';

import Link from 'next/link';
import { Heart, Activity, Shield, Clock } from 'lucide-react';

export function AdminFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <span>© 2024 MarifetBul Admin Panel</span>
            <span className="rounded bg-gray-100 px-2 py-1 text-xs">
              v2.1.0
            </span>
          </div>

          {/* Center section */}
          <div className="mt-2 flex items-center space-x-4 sm:mt-0">
            <Link
              href="/admin/help"
              className="transition-colors hover:text-gray-700"
            >
              Yardım
            </Link>
            <Link
              href="/admin/documentation"
              className="transition-colors hover:text-gray-700"
            >
              Dokümantasyon
            </Link>
            <Link
              href="/admin/support"
              className="transition-colors hover:text-gray-700"
            >
              Destek
            </Link>
          </div>

          {/* Right section */}
          <div className="mt-2 flex items-center space-x-1 sm:mt-0">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500" />
            <span>by MarifetBul Team</span>
          </div>
        </div>

        {/* System status */}
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                <span>Tüm sistemler çalışıyor</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>
                  Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Activity className="h-3 w-3" />
                <span>Yanıt süresi: 145ms</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Uptime: 99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AdminFooter;
