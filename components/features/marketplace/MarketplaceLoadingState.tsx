'use client';'use client';



import { Loading } from '@/components/ui';import { Skeleton } from '@/components/ui';

import { Card } from '@/components/ui/Card';import { Card } from '@/components/ui/Card';



interface MarketplaceLoadingStateProps {interface MarketplaceLoadingStateProps {

  viewMode: 'grid' | 'list';  viewMode: 'grid' | 'list';

  itemCount?: number;  itemCount?: number;

}}



export function MarketplaceLoadingState({export function MarketplaceLoadingState({

  viewMode,  viewMode,

  itemCount = 8,  itemCount = 8,

}: MarketplaceLoadingStateProps) {}: MarketplaceLoadingStateProps) {

  const items = Array.from({ length: itemCount }, (_, i) => i);  const items = Array.from({ length: itemCount }, (_, i) => i);



  if (viewMode === 'list') {  if (viewMode === 'list') {

    return (    return (

      <div className="space-y-4" role="status" aria-label="İçerik yükleniyor">      <div className="space-y-4" role="status" aria-label="İçerik yükleniyor">

        {items.map((index) => (        {items.map((index) => (

          <Card key={index} className="p-6">          <Card key={index} className="p-6">

            <Loading variant="skeleton" size="lg" text="Marketplace öğeleri yükleniyor..." />            <div className="flex items-start gap-4">

          </Card>              <Skeleton variant="circular" width={64} height={64} />

        ))}              <div className="flex-1 space-y-3">

      </div>                <div className="flex items-center justify-between">

    );                  <Skeleton variant="text" className="h-6 w-3/4" />

  }                  <Skeleton variant="text" className="h-5 w-20" />

                </div>

  return (                <Skeleton variant="text" className="h-4 w-full" />

    <div                <Skeleton variant="text" className="h-4 w-2/3" />

      className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"                <div className="flex items-center justify-between pt-2">

      role="status"                  <div className="flex gap-2">

      aria-label="İçerik yükleniyor"                    <Skeleton variant="rectangular" className="h-6 w-16" />

    >                    <Skeleton variant="rectangular" className="h-6 w-20" />

      {items.map((index) => (                  </div>

        <Card key={index} className="group hover:shadow-lg transition-shadow">                  <Skeleton variant="text" className="h-6 w-24" />

          <Loading variant="skeleton" size="lg" text="Ürün bilgileri yükleniyor..." />                </div>

        </Card>              </div>

      ))}            </div>

    </div>          </Card>

  );        ))}

}      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="İçerik yükleniyor"
    >
      {items.map((index) => (
        <Card key={index} variant="elevated" className="overflow-hidden">
          <Skeleton variant="rectangular" className="h-48 w-full" />
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="h-4 w-2/3" />
                <Skeleton variant="text" className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton variant="text" className="h-5 w-full" />
            <Skeleton variant="text" className="h-4 w-4/5" />
            <Skeleton variant="text" className="h-4 w-3/5" />
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-1">
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" className="h-4 w-12" />
              </div>
              <Skeleton variant="text" className="h-5 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
