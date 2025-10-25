/**
 * ================================================
 * BLOG COMMENTS WRAPPER
 * ================================================
 * Server-side wrapper for blog post comments
 * Fetches initial comments and renders CommentList
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

'use client';

import { CommentList } from '@/components/blog';

export default function BlogComments({ postId }: { postId: string }) {
  return <CommentList postId={Number(postId)} autoRefresh />;
}
