import { Metadata } from 'next';
import { NotificationPreferences } from './NotificationPreferencesClient';

export const metadata: Metadata = {
  title: 'Bildirim Ayarları | MarifetBul',
  description: 'Bildirim tercihlerinizi yönetin',
};

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <NotificationPreferences />
      </div>
    </div>
  );
}
