/**
 * Map View Component
 * Harita görünümü bileşeni
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Layers,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { Coordinates, MapBounds } from '@/types';
import { useUnifiedLocation } from '@/hooks';
import { MapUtils } from '@/lib/shared/utils/map-utils';

interface MapMarker {
  id: string;
  coordinates: Coordinates;
  title: string;
  description?: string;
  type?: 'job' | 'service' | 'freelancer' | 'location';
  icon?: React.ReactNode;
  color?: string;
}

interface MapViewProps {
  markers?: MapMarker[];
  center?: Coordinates;
  zoom?: number;
  showCurrentLocation?: boolean;
  showZoomControls?: boolean;
  showLayerControls?: boolean;
  interactive?: boolean;
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (coordinates: Coordinates) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  markers = [],
  center,
  zoom = 10,
  showCurrentLocation = true,
  showZoomControls = true,
  showLayerControls = false,
  interactive = true,
  height = '400px',
  onMarkerClick,
  onMapClick,
  onBoundsChange,
  className = '',
}) => {
  const [mapCenter, setMapCenter] = useState<Coordinates>(
    center || {
      latitude: 39.9334,
      longitude: 32.8597,
      lat: 39.9334,
      lng: 32.8597,
    }
  ); // Default: Ankara
  const [mapZoom, setMapZoom] = useState(zoom);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapLayer, setMapLayer] = useState<'roadmap' | 'satellite' | 'hybrid'>(
    'roadmap'
  );
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const unifiedLocation = useUnifiedLocation();
  const { getCurrentPosition, isLoadingPosition: geoLoading } = unifiedLocation;

  // TODO: Replace mock map functions with real map library integration
  // Suggested libraries: Google Maps API, Mapbox GL JS, or Leaflet
  // These should integrate with unifiedLocation context for proper map controls
  const fitToCoordinates = useCallback((coordinates: unknown) => {
    console.log('Fitting to coordinates:', coordinates);
  }, []);

  const setBounds = useCallback((bounds: unknown) => {
    console.log('Setting bounds:', bounds);
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (marker: MapMarker) => {
      setSelectedMarker(marker);
      if (onMarkerClick) {
        onMarkerClick(marker);
      }
    },
    [onMarkerClick]
  );

  // Handle map click
  const handleMapClick = useCallback(
    (coordinates: Coordinates) => {
      setSelectedMarker(null);
      if (onMapClick && interactive) {
        onMapClick(coordinates);
      }
    },
    [onMapClick, interactive]
  );

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(mapZoom + 1, 18);
    setMapZoom(newZoom);
  }, [mapZoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(mapZoom - 1, 1);
    setMapZoom(newZoom);
  }, [mapZoom]);

  // Handle reset view
  const handleResetView = useCallback(() => {
    if (markers.length > 0) {
      const coordinates = markers.map((m) => m.coordinates);
      if (fitToCoordinates) {
        fitToCoordinates(coordinates);
      }

      const center = MapUtils.calculateCenter(coordinates);
      if (center) {
        setMapCenter(center);
      }

      const newZoom = MapUtils.getZoomLevel(50); // Default radius for fit
      setMapZoom(newZoom);
    } else {
      setMapCenter({
        latitude: 39.9334,
        longitude: 32.8597,
        lat: 39.9334,
        lng: 32.8597,
      });
      setMapZoom(10);
    }
  }, [markers, fitToCoordinates]);

  // Handle current location
  const handleCurrentLocation = useCallback(async () => {
    try {
      if (!getCurrentPosition) {
        console.warn('getCurrentPosition not available');
        return;
      }

      await getCurrentPosition();
      const currentPos = unifiedLocation.currentPosition;
      if (currentPos) {
        const coordinates = {
          lat: currentPos.latitude,
          lng: currentPos.longitude,
          latitude: currentPos.latitude,
          longitude: currentPos.longitude,
        };
        setUserLocation(coordinates);
        setMapCenter(coordinates);
        setMapZoom(15);
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
    }
  }, [getCurrentPosition, unifiedLocation.currentPosition]);

  // Fit to markers when they change
  useEffect(() => {
    if (markers.length > 0) {
      const coordinates = markers.map((m) => m.coordinates);
      const bounds = MapUtils.getBounds(coordinates);
      if (setBounds) {
        setBounds(bounds);
      }

      if (onBoundsChange && bounds) {
        onBoundsChange(bounds);
      }
    }
  }, [markers, setBounds, onBoundsChange]);

  // Get marker color based on type
  const getMarkerColor = useCallback((marker: MapMarker) => {
    if (marker.color) return marker.color;

    switch (marker.type) {
      case 'job':
        return '#3B82F6'; // blue
      case 'service':
        return '#10B981'; // green
      case 'freelancer':
        return '#8B5CF6'; // purple
      default:
        return '#EF4444'; // red
    }
  }, []);

  // Render marker icon
  const renderMarkerIcon = useCallback(
    (marker: MapMarker) => {
      const color = getMarkerColor(marker);

      if (marker.icon) {
        return marker.icon;
      }

      return (
        <div className="relative" style={{ color }}>
          <MapPin className="h-6 w-6 drop-shadow-lg" fill="currentColor" />
          {marker.type && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 transform">
              <div className="h-2 w-2 rounded-full bg-white"></div>
            </div>
          )}
        </div>
      );
    },
    [getMarkerColor]
  );

  return (
    <div className={`map-view relative ${className}`} style={{ height }}>
      {/* TODO: Replace mock map container with real map library component
          Suggested: <MapboxGL /> or <GoogleMap /> or <LeafletMap />
          This entire mock rendering should be replaced with proper map tiles and interactions */}
      <div className="absolute inset-0 overflow-hidden rounded-lg bg-gray-100">
        {/* Map Background */}
        <div
          className={`absolute inset-0 ${mapLayer === 'satellite' ? 'bg-green-100' : 'bg-blue-50'}`}
        >
          {/* Grid pattern to simulate map */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid h-full grid-cols-12 grid-rows-8">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border border-gray-300"></div>
              ))}
            </div>
          </div>

          {/* Roads simulation */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 transform bg-gray-400"></div>
            <div className="absolute top-0 left-1/2 h-full w-1 -translate-x-1/2 transform bg-gray-400"></div>
            <div className="absolute top-1/4 left-1/4 h-1 w-1/2 rotate-45 transform bg-gray-300"></div>
            <div className="absolute top-3/4 left-1/4 h-1 w-1/2 -rotate-45 transform bg-gray-300"></div>
          </div>
        </div>

        {/* Map clickable area */}
        {interactive && (
          <div
            className="absolute inset-0 cursor-crosshair"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;

              // TODO: Replace mock coordinate calculation with real map projection
              // Real map libraries handle this automatically with proper lat/lng conversion
              const lat =
                mapCenter.latitude +
                (0.5 - y / rect.height) * 0.01 * Math.pow(2, 15 - mapZoom);
              const lng =
                mapCenter.longitude +
                (x / rect.width - 0.5) * 0.01 * Math.pow(2, 15 - mapZoom);

              handleMapClick({
                latitude: lat,
                longitude: lng,
                lat: lat,
                lng: lng,
              });
            }}
          />
        )}

        {/* Markers */}
        {markers.map((marker) => {
          // Calculate marker position (mock positioning)
          const offsetX =
            ((marker.coordinates.longitude - mapCenter.longitude) * 500) /
            Math.pow(2, 15 - mapZoom);
          const offsetY =
            (-(marker.coordinates.latitude - mapCenter.latitude) * 500) /
            Math.pow(2, 15 - mapZoom);

          return (
            <div
              key={marker.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-full transform cursor-pointer transition-transform hover:scale-110"
              style={{
                left: `calc(50% + ${offsetX}px)`,
                top: `calc(50% + ${offsetY}px)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleMarkerClick(marker);
              }}
              title={marker.title}
            >
              {renderMarkerIcon(marker)}
            </div>
          );
        })}

        {/* Current location marker */}
        {showCurrentLocation && userLocation && (
          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transform"
            style={{
              left: `calc(50% + ${((userLocation.longitude - mapCenter.longitude) * 500) / Math.pow(2, 15 - mapZoom)}px)`,
              top: `calc(50% - ${((userLocation.latitude - mapCenter.latitude) * 500) / Math.pow(2, 15 - mapZoom)}px)`,
            }}
          >
            <div className="relative">
              <div className="h-4 w-4 animate-pulse rounded-full border-2 border-white bg-blue-500 shadow-lg"></div>
              <div className="absolute inset-0 h-4 w-4 animate-ping rounded-full bg-blue-500 opacity-30"></div>
            </div>
          </div>
        )}

        {/* Center crosshair */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          <div className="h-4 w-4 rounded-full border-2 border-gray-600 bg-white opacity-50"></div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        {/* Zoom Controls */}
        {showZoomControls && (
          <div className="flex flex-col overflow-hidden rounded-lg bg-white shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-10 w-10 rounded-none border-b p-0"
              disabled={mapZoom >= 18}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-10 w-10 rounded-none p-0"
              disabled={mapZoom <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Layer Controls */}
        {showLayerControls && (
          <div className="overflow-hidden rounded-lg bg-white shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setMapLayer(mapLayer === 'roadmap' ? 'satellite' : 'roadmap')
              }
              className="h-10 w-10 p-0"
              title="Katman değiştir"
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Current Location */}
        {showCurrentLocation && (
          <div className="overflow-hidden rounded-lg bg-white shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCurrentLocation}
              disabled={geoLoading}
              className="h-10 w-10 p-0"
              title="Mevcut konumuma git"
            >
              <Navigation
                className={`h-4 w-4 ${geoLoading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        )}

        {/* Reset View */}
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetView}
            className="h-10 w-10 p-0"
            title="Görünümü sıfırla"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map Info */}
      <div className="bg-opacity-90 absolute bottom-4 left-4 z-20 rounded-lg bg-white p-2 text-xs text-gray-600">
        <div>Zoom: {mapZoom}</div>
        <div>
          Center: {mapCenter.latitude.toFixed(4)},{' '}
          {mapCenter.longitude.toFixed(4)}
        </div>
        {markers.length > 0 && <div>Markers: {markers.length}</div>}
      </div>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <div className="absolute right-4 bottom-4 z-20">
          <Card className="max-w-xs p-3">
            <div className="flex items-start gap-2">
              <div className="mt-1 flex-shrink-0">
                {renderMarkerIcon(selectedMarker)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium text-gray-900">
                  {selectedMarker.title}
                </h4>
                {selectedMarker.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                    {selectedMarker.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {selectedMarker.coordinates.latitude.toFixed(4)},{' '}
                  {selectedMarker.coordinates.longitude.toFixed(4)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMarker(null)}
                className="h-6 w-6 flex-shrink-0 p-0"
              >
                ×
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
