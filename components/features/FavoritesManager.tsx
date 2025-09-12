'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoriteItem, Freelancer, Job, ServicePackage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Heart,
  HeartOff,
  FolderPlus,
  Star,
  Eye,
  MapPin,
  DollarSign,
  User,
  Briefcase,
  Search,
} from 'lucide-react';

// Simple Favorite Item Card
interface FavoriteItemCardProps {
  favorite: FavoriteItem;
  onView: (item: Freelancer | Job | ServicePackage) => void;
  onRemove: (
    favoriteId: string,
    itemType: 'freelancer' | 'job' | 'service'
  ) => void;
  className?: string;
}

const FavoriteItemCard: React.FC<FavoriteItemCardProps> = ({
  favorite,
  onView,
  onRemove,
  className = '',
}) => {
  const getItemType = (): 'freelancer' | 'job' | 'service' => {
    if ('firstName' in favorite.item) return 'freelancer';
    if ('employerId' in favorite.item) return 'job';
    return 'service';
  };

  const getItemTitle = () => {
    const item = favorite.item;
    if ('firstName' in item) {
      return `${item.firstName} ${item.lastName}`;
    }
    return item.title;
  };

  const getItemDescription = () => {
    const item = favorite.item;
    if ('bio' in item) return item.bio;
    if ('description' in item) return item.description;
    return undefined;
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'freelancer':
        return <User className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'service':
        return <Star className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  const formatBudget = (budget: unknown) => {
    if (budget && typeof budget === 'object') {
      const budgetObj = budget as {
        min?: number;
        max?: number;
        amount?: number;
        currency?: string;
      };
      if (budgetObj.min && budgetObj.max) {
        return `${budgetObj.min} - ${budgetObj.max} ${budgetObj.currency || 'TL'}`;
      } else if (budgetObj.amount) {
        return `${budgetObj.amount} ${budgetObj.currency || 'TL'}`;
      }
    }
    return 'Bütçe belirtilmemiş';
  };

  const itemType = getItemType();

  return (
    <Card
      className={`favorite-item group relative transition-all duration-200 hover:shadow-md ${className}`}
    >
      {/* Action Menu */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(favorite.item)}
          className="h-6 w-6 p-0"
          title="Görüntüle"
        >
          <Eye className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(favorite.id, itemType)}
          className="text-destructive hover:text-destructive h-6 w-6 p-0"
          title="Favorilerden çıkar"
        >
          <HeartOff className="h-3 w-3" />
        </Button>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Item Type */}
          <Badge variant="outline" className="flex items-center gap-1">
            {getItemTypeIcon(itemType)}
            <span className="capitalize">{itemType}</span>
          </Badge>

          {/* Favorite Date */}
          {favorite.addedAt && (
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              {new Date(favorite.addedAt).toLocaleDateString('tr-TR')}
            </div>
          )}
        </div>

        <CardTitle className="text-base">{getItemTitle()}</CardTitle>

        {/* Description */}
        {getItemDescription() && (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {getItemDescription()}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Item Details */}
        <div className="mb-3 space-y-2">
          {/* Freelancer specific info */}
          {itemType === 'freelancer' && 'rating' in favorite.item && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  {favorite.item.rating || 'N/A'}
                </span>
              </div>
              {'hourlyRate' in favorite.item && favorite.item.hourlyRate && (
                <div className="text-sm font-medium">
                  {formatBudget(favorite.item.hourlyRate)}
                </div>
              )}
            </div>
          )}

          {/* Job specific info */}
          {itemType === 'job' && (
            <div className="space-y-1">
              {'budget' in favorite.item && favorite.item.budget && (
                <div className="flex items-center gap-2">
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">
                    {formatBudget(favorite.item.budget)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Service specific info */}
          {itemType === 'service' && (
            <div className="flex items-center justify-between">
              {'price' in favorite.item && favorite.item.price && (
                <div className="text-sm font-medium">
                  {formatBudget(favorite.item.price)}
                </div>
              )}
            </div>
          )}

          {/* Location */}
          {'location' in favorite.item && favorite.item.location && (
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">
                {typeof favorite.item.location === 'string'
                  ? favorite.item.location
                  : (favorite.item.location as { city?: string })?.city ||
                    'Konum belirtilmemiş'}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {favorite.tags && favorite.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {favorite.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {favorite.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{favorite.tags.length - 3} daha
              </Badge>
            )}
          </div>
        )}

        {/* Notes */}
        {favorite.note && (
          <div className="bg-muted/50 rounded p-2 text-sm">
            <div className="text-muted-foreground mb-1 text-xs font-medium">
              Not:
            </div>
            {favorite.note}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Favorites Manager Component
interface FavoritesManagerProps {
  className?: string;
  viewMode?: 'grid' | 'list';
  showFolders?: boolean;
}

export const FavoritesManager: React.FC<FavoritesManagerProps> = ({
  className = '',
  viewMode = 'grid',
  showFolders = true,
}) => {
  const { favoriteItems, isLoading, error, removeFromFavorites, clearError } =
    useFavorites();

  // Combine all favorites into single array for easier filtering
  const allFavorites = useMemo(() => {
    return favoriteItems || [];
  }, [favoriteItems]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'freelancer' | 'job' | 'service'
  >('all');

  // Filter favorites based on search and filters
  const filteredFavorites = useMemo(() => {
    let filtered = allFavorites;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((fav: FavoriteItem) => {
        if (filterType === 'freelancer') return 'firstName' in fav.item;
        if (filterType === 'job') return 'employerId' in fav.item;
        if (filterType === 'service') return 'providerId' in fav.item;
        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((fav: FavoriteItem) => {
        const item = fav.item;

        // Search in title/name
        const title =
          'firstName' in item
            ? `${item.firstName} ${item.lastName}`
            : item.title;
        if (title.toLowerCase().includes(query)) return true;

        // Search in description/bio
        let description = '';
        if ('bio' in item) {
          description = item.bio || '';
        } else if ('description' in item) {
          description = (item as Job | ServicePackage).description || '';
        }

        if (description && description.toLowerCase().includes(query))
          return true;

        // Search in tags
        if (
          fav.tags &&
          fav.tags.some((tag: string) => tag.toLowerCase().includes(query))
        )
          return true;

        // Search in notes
        if (fav.note && fav.note.toLowerCase().includes(query)) return true;

        return false;
      });
    }

    return filtered;
  }, [allFavorites, filterType, searchQuery]);

  // Event handlers
  const handleViewFavorite = useCallback(
    (item: Freelancer | Job | ServicePackage) => {
      console.log('Viewing favorite:', item);
    },
    []
  );

  const handleRemoveFavorite = useCallback(
    (favoriteId: string, itemType: 'freelancer' | 'job' | 'service') => {
      removeFromFavorites(favoriteId, itemType);
    },
    [removeFromFavorites]
  );

  if (isLoading && allFavorites.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-muted h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-2">
            Favoriler yüklenirken bir hata oluştu
          </div>
          <Button onClick={clearError} variant="outline" size="sm">
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`favorites-manager ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="text-primary h-6 w-6" />
            <h2 className="text-xl font-semibold">Favorilerim</h2>
            <Badge variant="secondary">{allFavorites.length}</Badge>
          </div>

          {showFolders && (
            <Button disabled>
              <FolderPlus className="mr-2 h-4 w-4" />
              Yeni Klasör
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Favorilerde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value as 'all' | 'freelancer' | 'job' | 'service'
                )
              }
              className="bg-background rounded-md border px-3 py-2"
            >
              <option value="all">Tüm Tipler</option>
              <option value="freelancer">Freelancer</option>
              <option value="job">İş İlanı</option>
              <option value="service">Hizmet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {allFavorites.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Henüz favori yok</h3>
            <p className="text-muted-foreground mb-4">
              Beğendiğiniz freelancer&apos;ları, iş ilanlarını ve hizmetleri
              favorilere ekleyin
            </p>
          </CardContent>
        </Card>
      ) : filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">
              Arama sonucu bulunamadı
            </h3>
            <p className="text-muted-foreground">
              Farklı anahtar kelimeler deneyin veya filtreleri değiştirin
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Favorites Grid */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Heart className="h-5 w-5" />
              Favoriler
              <Badge variant="secondary">{filteredFavorites.length}</Badge>
            </h3>

            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-4'
              }
            >
              {filteredFavorites.map((favorite: FavoriteItem) => (
                <FavoriteItemCard
                  key={favorite.id}
                  favorite={favorite}
                  onView={handleViewFavorite}
                  onRemove={handleRemoveFavorite}
                  className={viewMode === 'list' ? 'w-full' : ''}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesManager;
