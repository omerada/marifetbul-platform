/**
 * ================================================
 * ADMIN BLOG MANAGEMENT PAGE
 * ================================================
 * Complete blog post management interface for admins
 *
 * Route: /admin/blog
 * Access: Admin only (protected by middleware)
 *
 * Features:
 * - Blog post statistics overview
 * - Post list with filtering & search
 * - Create, edit, delete posts
 * - Publish, unpublish, schedule posts
 * - Category management
 * - Comment moderation
 *
 * @version 1.0.0
 * @created 2025-11-17
 * @sprint Sprint 3: Blog & Moderation Management
 * @author MarifetBul Development Team
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  FileText,
  Eye,
  MessageSquare,
  TrendingUp,
  PlusCircle,
  Edit,
  Trash2,
  Globe,
  EyeOff,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import {
  getAllPosts,
  deleteBlogPost,
  publishPost,
  unpublishPost,
  type BlogPostSummary,
  type BlogStatistics,
} from '@/lib/api/blog';
import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';

export const dynamic = 'force-dynamic';

/**
 * Stats Card Component - Reusable stat display
 */
function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color = 'blue',
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  subtitle?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * Admin Blog Management Page Component
 */
export default function AdminBlogPage() {
  const router = useRouter();

  // State
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [statistics, setStatistics] = useState<BlogStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch blog statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await apiClient.get<BlogStatistics>(
        '/blog/posts/admin/statistics'
      );
      setStatistics(stats);
    } catch (error) {
      logger.error(
        'Failed to fetch blog statistics',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'AdminBlogPage',
          action: 'fetchStatistics',
        }
      );
    }
  }, []);

  // Fetch blog posts
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        size: '20',
        sort: 'createdAt,desc',
      };

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await getAllPosts(params);
      setPosts(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      logger.error(
        'Failed to fetch blog posts',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'AdminBlogPage',
          action: 'fetchPosts',
          statusFilter,
          searchQuery,
        }
      );
      toast.error('Blog yazıları yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  // Initial load
  useEffect(() => {
    fetchStatistics();
    fetchPosts();
  }, [fetchStatistics, fetchPosts]);

  // Handle delete post
  const handleDelete = async (postId: number) => {
    if (!confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteBlogPost(postId);
      toast.success('Blog yazısı silindi');
      fetchPosts();
      fetchStatistics();
    } catch (error) {
      logger.error(
        'Failed to delete blog post',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'AdminBlogPage',
          action: 'handleDelete',
          postId,
        }
      );
      toast.error('Silme işlemi başarısız');
    }
  };

  // Handle publish/unpublish
  const handleTogglePublish = async (post: BlogPostSummary) => {
    try {
      if (post.status === 'PUBLISHED') {
        await unpublishPost(post.id);
        toast.success('Yazı yayından kaldırıldı');
      } else {
        await publishPost(post.id);
        toast.success('Yazı yayınlandı');
      }
      fetchPosts();
      fetchStatistics();
    } catch (error) {
      logger.error(
        'Failed to toggle publish status',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'AdminBlogPage',
          action: 'handleTogglePublish',
          postId: post.id,
          currentStatus: post.status,
        }
      );
      toast.error('İşlem başarısız');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchPosts();
    fetchStatistics();
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const badges = {
      PUBLISHED: 'bg-green-100 text-green-800',
      DRAFT: 'bg-orange-100 text-orange-800',
      ARCHIVED: 'bg-gray-100 text-gray-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PUBLISHED: 'Yayında',
      DRAFT: 'Taslak',
      ARCHIVED: 'Arşivlendi',
      SCHEDULED: 'Planlandı',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Blog Yönetimi
                  </h1>
                  <p className="mt-1 text-gray-600">
                    Blog yazılarını ve kategorilerini yönetin
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  Yenile
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/admin/blog/new')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Yeni Yazı
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-6 py-6">
          <div className="mx-auto max-w-7xl">
            {statistics && (
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Toplam Yazı"
                  value={statistics.totalPosts.toLocaleString('tr-TR')}
                  icon={FileText}
                  subtitle="Sistemdeki tüm yazılar"
                  color="blue"
                />
                <StatCard
                  title="Yayında"
                  value={statistics.publishedPosts.toLocaleString('tr-TR')}
                  icon={Globe}
                  subtitle={`${Math.round((statistics.publishedPosts / statistics.totalPosts) * 100) || 0}% yayın oranı`}
                  color="green"
                />
                <StatCard
                  title="Taslak"
                  value={statistics.draftPosts.toLocaleString('tr-TR')}
                  icon={Edit}
                  subtitle="Yayınlanmayı bekliyor"
                  color="orange"
                />
                <StatCard
                  title="Toplam Görüntülenme"
                  value={statistics.totalViews.toLocaleString('tr-TR')}
                  icon={Eye}
                  subtitle={`${statistics.totalComments} yorum`}
                  color="purple"
                />
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Yazı başlığı veya içeriği ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="ALL">Tüm Durumlar</option>
                  <option value="PUBLISHED">Yayında</option>
                  <option value="DRAFT">Taslak</option>
                  <option value="SCHEDULED">Planlandı</option>
                  <option value="ARCHIVED">Arşivlendi</option>
                </select>
              </div>
            </div>

            {/* Posts Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Başlık
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Durum
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Görüntülenme
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Yorum
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Tarih
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                        </td>
                      </tr>
                    ) : posts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <p className="text-gray-500">
                            {searchQuery || statusFilter !== 'ALL'
                              ? 'Arama kriterlerine uygun yazı bulunamadı'
                              : 'Henüz blog yazısı yok'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      posts.map((post) => (
                        <tr
                          key={post.id}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="px-4 py-4">
                            <div className="max-w-md">
                              <p className="font-medium text-gray-900">
                                {post.title}
                              </p>
                              <p className="truncate text-sm text-gray-600">
                                {post.excerpt}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">
                              {post.category?.name || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(post.status)}`}
                            >
                              {getStatusLabel(post.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Eye className="h-4 w-4" />
                              {post.viewCount.toLocaleString('tr-TR')}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MessageSquare className="h-4 w-4" />
                              {post.commentCount}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">
                              {new Date(post.createdAt).toLocaleDateString(
                                'tr-TR'
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/admin/blog/edit/${post.id}`)
                                }
                                title="Düzenle"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePublish(post)}
                                title={
                                  post.status === 'PUBLISHED'
                                    ? 'Yayından Kaldır'
                                    : 'Yayınla'
                                }
                              >
                                {post.status === 'PUBLISHED' ? (
                                  <EyeOff className="h-4 w-4 text-orange-600" />
                                ) : (
                                  <Globe className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(post.id)}
                                title="Sil"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  Önceki
                </Button>
                <span className="text-sm text-gray-600">
                  Sayfa {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </UnifiedErrorBoundary>
  );
}
