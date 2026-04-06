import { GeolocateControl, Map, Marker, NavigationControl } from 'react-map-gl/maplibre';
import styles from './MapView.module.css';
import MarkerDetailModal, { type MarkerDetail } from './MarkerDetailModal';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import type { MapRef } from 'react-map-gl/maplibre';

const emptyFeatureCollection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

const isFeatureCollection = (value: unknown): value is FeatureCollection => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybeCollection = value as { type?: unknown; features?: unknown };
  return maybeCollection.type === 'FeatureCollection' && Array.isArray(maybeCollection.features);
};

const Pin = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="red"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="#111"
    className={styles.pin}
    aria-label="map-marker"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
    />
  </svg>
);

interface MapViewProps {
  onZoomChange?: (zoom: number) => void;
}

const MapView = ({ onZoomChange }: MapViewProps) => {
  const mapRef = useRef<MapRef | null>(null);
  const clickTokenRef = useRef(0);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [isMarkersLoading, setIsMarkersLoading] = useState(true);
  const [markersLoadError, setMarkersLoadError] = useState<string | null>(null);
  const [geojson, setGeojson] = useState<FeatureCollection>(emptyFeatureCollection);
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerDetail | null>(null);

  const handleMarkerClick = (detail: MarkerDetail) => {
    const map = mapRef.current?.getMap();
    if (!map) {
      setSelectedMarker(detail);
      return;
    }

    clickTokenRef.current += 1;
    const clickToken = clickTokenRef.current;

    map.once('moveend', () => {
      if (clickToken === clickTokenRef.current) {
        setSelectedMarker(detail);
      }
    });

    map.flyTo({
      center: [detail.longitude, detail.latitude],
      zoom: 17,
      duration: 1200,
      essential: true,
    });
  };

  useEffect(() => {
    const loca = navigator.geolocation;
    loca.getCurrentPosition(
      (v) => {
        setCoords(v.coords);
        setIsLocationLoading(false);
      },
      () => setIsLocationLoading(false),
    );
  }, []);

  useEffect(() => {
    const markersUrl = `${import.meta.env.BASE_URL}markers.json`;

    const loadMarkers = async () => {
      try {
        const response = await fetch(markersUrl);
        if (!response.ok) {
          throw new Error(`Failed to load markers: ${response.status}`);
        }

        const data: unknown = await response.json();
        if (!isFeatureCollection(data)) {
          throw new Error('Invalid markers file format.');
        }

        setGeojson(data);
        setMarkersLoadError(null);
      } catch (error) {
        setMarkersLoadError(error instanceof Error ? error.message : 'Failed to load markers');
      } finally {
        setIsMarkersLoading(false);
      }
    };

    void loadMarkers();
  }, []);

  if (isLocationLoading || isMarkersLoading) {
    const loadingText = isMarkersLoading ? 'Loading map markers...' : 'Locating you on the map...';

    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingSpinner} aria-hidden="true" />
        <p className={styles.loadingText}>{loadingText}</p>
      </div>
    );
  }

  return (
    <div className={styles.map}>
      <div className={styles.mapCanvas}>
        {markersLoadError && (
          <div className={styles.errorBanner} role="status" aria-live="polite">
            {markersLoadError}
          </div>
        )}

        <Map
          ref={mapRef}
          onZoom={(event) => onZoomChange?.(event.viewState.zoom)}
          initialViewState={{
            longitude: coords?.longitude,
            latitude: coords?.latitude,
            zoom: 4,
          }}
          mapStyle="https://tiles.stadiamaps.com/styles/stamen_toner.json"
        >
          <GeolocateControl />
          <NavigationControl />

          {geojson.features.map((feature, index) => {
            if (feature.geometry.type !== 'Point') {
              return null;
            }

            const [longitude, latitude] = feature.geometry.coordinates;
            const title = (feature.properties?.title as string | undefined) ?? 'Marker';
            const imgUrl = feature.properties?.imgUrl as string | undefined;
            return (
              <Marker key={index} longitude={longitude} latitude={latitude} anchor="bottom">
                <button
                  type="button"
                  className={styles.markerButton}
                  onClick={() => handleMarkerClick({ title, longitude, latitude, imgUrl })}
                >
                  <Pin />
                </button>
              </Marker>
            );
          })}
        </Map>
      </div>

      <MarkerDetailModal detail={selectedMarker} onClose={() => setSelectedMarker(null)} />
    </div>
  );
};

export default MapView;
