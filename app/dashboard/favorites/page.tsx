'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Loading } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { useFavorites } from '@/hooks/infrastructure/data/useFavorites';
import { Freelancer, Job, ServicePackage } from '@/types';
import { logger } from '@/lib/shared/utils/logger';
import {
  Heart,
  Folder,
  Grid,
  List,
  Search,
  Filter,
  Star,
  MapPin,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Favorites Page - Sprint 2
 * User's saved favorites (freelancers, jobs, packages)
 * Features:
 * - Folder organization
 * - Filter by type (all, freelancers, jobs, packages)
 * - Grid/List view toggle
 * - Search functionality
 * - Add/Remove favorites
 */
export default function FavoritesPage() {
  const {
    favoriteFreelancers,
    favoriteJobs,
    favoriteServices,
    favoriteFolders,
    isLoading,
    error,
    stats,
    toggleFreelancerFavorite,
    toggleJobFavorite,
    toggleServiceFavorite,
    createFolder,
    deleteFolder,
    setSelectedFolder,
    selectedFolderId,
  } = useFavorites();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<
    'all' | 'freelancers' | 'jobs' | 'packages'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    logger.info('Favorites page mounted', { stats });
  }, [stats]);

  // Filter favorites based on type and search
  const filteredFreelancers =
    filterType === 'all' || filterType === 'freelancers'
      ? favoriteFreelancers.filter(
          (f) =>
            searchQuery === '' ||
            `${f.firstName} ${f.lastName}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            f.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  const filteredJobs =
    filterType === 'all' || filterType === 'jobs'
      ? favoriteJobs.filter(
          (j) =>
            searchQuery === '' ||
            j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  const filteredPackages =
    filterType === 'all' || filterType === 'packages'
      ? favoriteServices.filter(
          (p) =>
            searchQuery === '' ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  const totalFiltered =
    filteredFreelancers.length + filteredJobs.length + filteredPackages.length;

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder({
        name: newFolderName,
        color: '#3B82F6',
        isDefault: false,
      });
      setNewFolderName('');
      setShowCreateFolder(false);
      logger.info('Folder created successfully');
    } catch (error) {
      logger.error('Failed to create folder', error);
    }
  };

  if (isLoading && stats.totalFavorites === 0) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loading />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <Heart className="h-6 w-6 text-red-500" />
                  Favorilerim
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {stats.totalFavorites} kayıtlı favori
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                label="Freelancerlar"
                value={stats.freelancersCount}
                icon={<Star className="h-5 w-5 text-yellow-500" />}
                active={filterType === 'freelancers'}
                onClick={() =>
                  setFilterType(
                    filterType === 'freelancers' ? 'all' : 'freelancers'
                  )
                }
              />
              <StatCard
                label="İşler"
                value={stats.jobsCount}
                icon={<MapPin className="h-5 w-5 text-green-500" />}
                active={filterType === 'jobs'}
                onClick={() =>
                  setFilterType(filterType === 'jobs' ? 'all' : 'jobs')
                }
              />
              <StatCard
                label="Paketler"
                value={stats.servicesCount}
                icon={<DollarSign className="h-5 w-5 text-blue-500" />}
                active={filterType === 'packages'}
                onClick={() =>
                  setFilterType(filterType === 'packages' ? 'all' : 'packages')
                }
              />
              <StatCard
                label="Klasörler"
                value={stats.foldersCount}
                icon={<Folder className="h-5 w-5 text-purple-500" />}
                active={false}
                onClick={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative max-w-md flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Favorilerde ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Filter Type */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value as
                        | 'all'
                        | 'freelancers'
                        | 'jobs'
                        | 'packages'
                    )
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">Tüm Favoriler</option>
                  <option value="freelancers">Freelancerlar</option>
                  <option value="jobs">İşler</option>
                  <option value="packages">Paketler</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateFolder(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Klasör Oluştur
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50 p-4 text-center">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {/* Folders Section */}
          {favoriteFolders.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FolderOpen className="h-5 w-5" />
                Klasörler
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {favoriteFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    isSelected={selectedFolderId === folder.id}
                    onSelect={() => setSelectedFolder(folder.id)}
                    onDelete={() => deleteFolder(folder.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Favorites List */}
          {totalFiltered === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {searchQuery ? 'Sonuç bulunamadı' : 'Henüz favori eklenmemiş'}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'Beğendiğiniz freelancer, iş veya paketleri favorilere ekleyin'}
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Freelancers */}
              {filteredFreelancers.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Freelancerlar ({filteredFreelancers.length})
                  </h2>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
                        : 'space-y-4'
                    }
                  >
                    {filteredFreelancers.map((freelancer) => (
                      <FreelancerCard
                        key={freelancer.id}
                        freelancer={freelancer}
                        viewMode={viewMode}
                        onToggleFavorite={() =>
                          toggleFreelancerFavorite(freelancer)
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Jobs */}
              {filteredJobs.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    İşler ({filteredJobs.length})
                  </h2>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
                        : 'space-y-4'
                    }
                  >
                    {filteredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        viewMode={viewMode}
                        onToggleFavorite={() => toggleJobFavorite(job)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Packages */}
              {filteredPackages.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Paketler ({filteredPackages.length})
                  </h2>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
                        : 'space-y-4'
                    }
                  >
                    {filteredPackages.map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        package={pkg}
                        viewMode={viewMode}
                        onToggleFavorite={() => toggleServiceFavorite(pkg)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Create Folder Modal */}
        {showCreateFolder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCreateFolder(false)}
          >
            <Card
              className="w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Yeni Klasör Oluştur
              </h3>
              <input
                type="text"
                placeholder="Klasör adı"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateFolder(false)}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                >
                  Oluştur
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ================================================
// SUB-COMPONENTS
// ================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function StatCard({ label, value, icon, active, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition-all ${
        active
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-600">{label}</p>
        </div>
        {icon}
      </div>
    </button>
  );
}

interface FolderCardProps {
  folder: { id: string; name: string; itemCount?: number; color?: string };
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function FolderCard({
  folder,
  isSelected,
  onSelect,
  onDelete,
}: FolderCardProps) {
  return (
    <Card
      className={`group relative cursor-pointer p-4 transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-col items-center text-center">
        <Folder
          className="mb-2 h-12 w-12"
          style={{ color: folder.color || '#3B82F6' }}
        />
        <p className="text-sm font-medium text-gray-900">{folder.name}</p>
        <p className="text-xs text-gray-500">{folder.itemCount || 0} öğe</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </Card>
  );
}

interface FreelancerCardProps {
  freelancer: Freelancer;
  viewMode: 'grid' | 'list';
  onToggleFavorite: () => void;
}

function FreelancerCard({
  freelancer,
  viewMode,
  onToggleFavorite,
}: FreelancerCardProps) {
  return (
    <Card className={`overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}>
      <Link href={`/profile/${freelancer.id}`} className="block">
        <div
          className={`relative bg-gray-200 ${
            viewMode === 'grid' ? 'aspect-square' : 'h-32 w-32 flex-shrink-0'
          }`}
        >
          {freelancer.avatar ? (
            <Image
              src={freelancer.avatar}
              alt={`${freelancer.firstName} ${freelancer.lastName}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-blue-100">
              <span className="text-2xl font-bold text-blue-600">
                {freelancer.firstName?.[0] || 'F'}
                {freelancer.lastName?.[0] || 'L'}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 p-4">
        <div className="mb-2 flex items-start justify-between">
          <Link href={`/profile/${freelancer.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600">
              {freelancer.firstName} {freelancer.lastName}
            </h3>
          </Link>
          <button
            onClick={onToggleFavorite}
            className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-50"
          >
            <Heart className="h-5 w-5 fill-current" />
          </button>
        </div>

        {freelancer.title && (
          <p className="mb-2 text-sm text-gray-600">{freelancer.title}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500">
          {freelancer.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {freelancer.rating.toFixed(1)}
            </span>
          )}
          {freelancer.hourlyRate && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {freelancer.hourlyRate}₺/saat
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

interface JobCardProps {
  job: Job;
  viewMode: 'grid' | 'list';
  onToggleFavorite: () => void;
}

function JobCard({ job, viewMode: _viewMode, onToggleFavorite }: JobCardProps) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-start justify-between">
        <Link href={`/jobs/${job.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600">
            {job.title}
          </h3>
        </Link>
        <button
          onClick={onToggleFavorite}
          className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-50"
        >
          <Heart className="h-5 w-5 fill-current" />
        </button>
      </div>

      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
        {job.description}
      </p>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        {job.budget &&
          typeof job.budget === 'object' &&
          'amount' in job.budget && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {job.budget.amount}₺
              {job.budget.maxAmount && ` - ${job.budget.maxAmount}₺`}
            </span>
          )}
        {job.duration && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {job.duration}
          </span>
        )}
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {job.skills.slice(0, 3).map((skill, idx) => (
            <Badge key={idx} variant="secondary">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 3 && (
            <Badge variant="outline">+{job.skills.length - 3}</Badge>
          )}
        </div>
      )}
    </Card>
  );
}

interface PackageCardProps {
  package: ServicePackage;
  viewMode: 'grid' | 'list';
  onToggleFavorite: () => void;
}

function PackageCard({
  package: pkg,
  viewMode,
  onToggleFavorite,
}: PackageCardProps) {
  return (
    <Card className={`overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}>
      <Link href={`/marketplace/${pkg.id}`} className="block">
        <div
          className={`relative bg-gray-200 ${
            viewMode === 'grid' ? 'aspect-video' : 'h-32 w-32 flex-shrink-0'
          }`}
        >
          {pkg.images && pkg.images.length > 0 ? (
            <Image
              src={
                typeof pkg.images[0] === 'string'
                  ? pkg.images[0]
                  : pkg.images[0].url
              }
              alt={pkg.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 p-4">
        <div className="mb-2 flex items-start justify-between">
          <Link href={`/marketplace/${pkg.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600">
              {pkg.title}
            </h3>
          </Link>
          <button
            onClick={onToggleFavorite}
            className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-50"
          >
            <Heart className="h-5 w-5 fill-current" />
          </button>
        </div>

        <p className="mb-3 line-clamp-2 text-sm text-gray-600">
          {pkg.description}
        </p>

        <div className="flex items-center justify-between">
          {pkg.rating && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {pkg.rating.toFixed(1)}
            </span>
          )}
          {pkg.price && (
            <span className="font-semibold text-blue-600">
              {pkg.price}₺&apos;den başlayan
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
