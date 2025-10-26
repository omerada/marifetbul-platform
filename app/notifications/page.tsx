import { Metadata } from 'next';
import { NotificationListClient } from './NotificationListClient';

export const metadata: Metadata = {
  title: 'Bildirimler | MarifetBul',
  description: 'Tüm bildirimlerinizi görüntüleyin ve yönetin',
};

export default function NotificationsPage() {
  return <NotificationListClient />;
}
