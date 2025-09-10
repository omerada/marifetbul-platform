'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Heart,
  Bookmark,
  Share2,
  Eye,
  ThumbsUp,
  Star,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface AnimatedInteractionProps {
  className?: string;
}

export function AnimatedInteractions({
  className = '',
}: AnimatedInteractionProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shared, setShared] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const heartRef = useRef<HTMLDivElement>(null);
  const bookmarkRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const createRipple = (
    event: React.MouseEvent,
    element: HTMLElement | null
  ) => {
    if (!element) return;

    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleLike = (event: React.MouseEvent) => {
    setLiked(!liked);
    createRipple(event, heartRef.current);

    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleBookmark = (event: React.MouseEvent) => {
    setBookmarked(!bookmarked);
    createRipple(event, bookmarkRef.current);
  };

  const handleShare = (event: React.MouseEvent) => {
    setShared(true);
    createRipple(event, shareRef.current);

    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple-animation 0.6s linear;
          pointer-events: none;
        }

        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        .heart-beat {
          animation: heart-beat 0.6s ease-in-out;
        }

        @keyframes heart-beat {
          0% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.3);
          }
          60% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .bookmark-flip {
          animation: bookmark-flip 0.4s ease-in-out;
        }

        @keyframes bookmark-flip {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }

        .share-bounce {
          animation: share-bounce 0.5s ease-in-out;
        }

        @keyframes share-bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-5px) scale(1.1);
          }
          75% {
            transform: translateY(2px);
          }
        }

        .star-sparkle {
          animation: star-sparkle 0.4s ease-in-out;
        }

        @keyframes star-sparkle {
          0% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
          }
        }

        .float-up {
          animation: float-up 2s ease-out forwards;
        }

        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px) scale(1.2);
          }
        }

        .pulse-glow {
          animation: pulse-glow 2s infinite;
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
      `}</style>

      {/* Animated Action Buttons */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Etkileşimli Butonlar
        </h3>

        <div className="flex gap-4">
          <div ref={heartRef} className="relative overflow-hidden rounded">
            <Button
              variant={liked ? 'danger' : 'outline'}
              size="sm"
              onClick={handleLike}
              className={`transition-all duration-300 ${
                liked ? 'heart-beat text-white' : 'hover:text-red-500'
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-all duration-300 ${
                  liked ? 'fill-current' : ''
                }`}
              />
              Beğen {liked && '❤️'}
            </Button>
          </div>

          <div ref={bookmarkRef} className="relative overflow-hidden rounded">
            <Button
              variant={bookmarked ? 'primary' : 'outline'}
              size="sm"
              onClick={handleBookmark}
              className={`transition-all duration-300 ${
                bookmarked ? 'bookmark-flip' : ''
              }`}
            >
              <Bookmark
                className={`h-4 w-4 transition-all duration-300 ${
                  bookmarked ? 'fill-current' : ''
                }`}
              />
              Kaydet
            </Button>
          </div>

          <div ref={shareRef} className="relative overflow-hidden rounded">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className={`transition-all duration-300 ${
                shared ? 'share-bounce bg-green-100 text-green-700' : ''
              }`}
            >
              <Share2 className="h-4 w-4" />
              {shared ? 'Paylaşıldı!' : 'Paylaş'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Animated Star Rating */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Animasyonlu Puanlama</h3>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              variant="ghost"
              size="sm"
              className={`p-1 transition-all duration-200 ${
                star <= (hoverRating || rating) ? 'star-sparkle' : ''
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`h-6 w-6 transition-colors duration-200 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </Button>
          ))}
        </div>

        {rating > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {rating} / 5 yıldız verdiniz
          </p>
        )}
      </Card>

      {/* Micro-interactions */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Mikro Etkileşimler</h3>

        <div className="grid grid-cols-2 gap-4">
          <InteractionCard
            icon={<Eye className="h-5 w-5" />}
            title="Görüntüleme"
            count={1247}
            color="blue"
          />
          <InteractionCard
            icon={<ThumbsUp className="h-5 w-5" />}
            title="Beğeni"
            count={89}
            color="green"
          />
          <InteractionCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Trend"
            count={156}
            color="purple"
          />
          <InteractionCard
            icon={<Share2 className="h-5 w-5" />}
            title="Paylaşım"
            count={23}
            color="orange"
          />
        </div>
      </Card>

      {/* Loading States */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Yükleme Animasyonları</h3>

        <div className="space-y-4">
          <LoadingButton />
          <ProgressBar />
          <PulseLoader />
        </div>
      </Card>
    </div>
  );
}

// Interactive Card Component
interface InteractionCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function InteractionCard({ icon, title, count, color }: InteractionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const colorClasses = {
    blue: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200',
    green: 'hover:bg-green-50 hover:text-green-600 hover:border-green-200',
    purple: 'hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200',
    orange: 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200',
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  return (
    <div
      className={`transform cursor-pointer rounded-lg border-2 border-gray-200 p-4 transition-all duration-300 hover:scale-105 hover:shadow-md ${colorClasses[color]} ${isClicked ? 'scale-95' : ''} `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={`transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p
            className={`text-lg font-bold transition-all duration-300 ${
              isHovered ? 'scale-110 transform' : ''
            }`}
          >
            {count.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading Button Component
function LoadingButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={`transition-all duration-300 ${isLoading ? 'cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          Yükleniyor...
        </div>
      ) : (
        'Yükle'
      )}
    </Button>
  );
}

// Progress Bar Component
function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startProgress = () => {
    setIsActive(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsActive(false);
            setProgress(0);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div>
      <Button size="sm" onClick={startProgress} disabled={isActive}>
        Progress Başlat
      </Button>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-sm text-gray-600">%{progress}</p>
    </div>
  );
}

// Pulse Loader Component
function PulseLoader() {
  return (
    <div className="flex gap-2">
      <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
      <div
        className="h-3 w-3 animate-pulse rounded-full bg-blue-500"
        style={{ animationDelay: '0.2s' }}
      ></div>
      <div
        className="h-3 w-3 animate-pulse rounded-full bg-blue-500"
        style={{ animationDelay: '0.4s' }}
      ></div>
    </div>
  );
}
