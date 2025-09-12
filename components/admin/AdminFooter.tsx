'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';

export function AdminFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white py-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row dark:text-gray-400">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <span>© 2025 Marifet Admin Panel</span>
            <span>v2.1.0</span>
          </div>

          {/* Center section */}
          <div className="mt-2 flex items-center space-x-4 sm:mt-0">
            <Link
              href="/admin/help"
              className="transition-colors hover:text-gray-700 dark:hover:text-gray-300"
            >
              Help
            </Link>
            <Link
              href="/admin/documentation"
              className="transition-colors hover:text-gray-700 dark:hover:text-gray-300"
            >
              Documentation
            </Link>
            <Link
              href="/admin/support"
              className="transition-colors hover:text-gray-700 dark:hover:text-gray-300"
            >
              Support
            </Link>
          </div>

          {/* Right section */}
          <div className="mt-2 flex items-center space-x-1 sm:mt-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>by Marifet Team</span>
          </div>
        </div>

        {/* System status */}
        <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span>All systems operational</span>
              </div>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>

            <div className="flex items-center space-x-4">
              <span>Response time: 145ms</span>
              <span>Uptime: 99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AdminFooter;
