import { Metadata } from 'next';
import { SystemSettings } from '@/components/admin/SystemSettings';

export const metadata: Metadata = {
  title: 'Platform Settings - Admin Panel',
  description: 'Configure platform settings and system preferences',
};

export default function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="mt-1 text-gray-600">
          Configure platform settings, security, and system preferences
        </p>
      </div>

      <SystemSettings />
    </div>
  );
}
