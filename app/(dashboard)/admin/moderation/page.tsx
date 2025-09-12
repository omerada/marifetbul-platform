import { Metadata } from 'next';
import { ContentModerationQueue } from '@/components/admin/ContentModerationQueue';

export const metadata: Metadata = {
  title: 'Content Moderation - Admin Panel',
  description: 'Review and moderate platform content',
};

export default function ContentModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        <p className="mt-1 text-gray-600">
          Review flagged content and manage platform moderation
        </p>
      </div>

      <ContentModerationQueue />
    </div>
  );
}
