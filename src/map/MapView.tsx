import { GeolocateControl, Map, Marker, NavigationControl } from 'react-map-gl/maplibre';
import styles from './MapView.module.css';
import MarkerDetailModal, { type MarkerDetail } from './MarkerDetailModal';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import type { MapRef } from 'react-map-gl/maplibre';

const geojson: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [12.591225, 55.679548],
      },
      properties: {
        title: 'Karezs at Nyhavn Canal Bridge, Copenhagen',
        imgUrl: 'https://cdn.9oblin.com/s3/karezs-map/coppenhagen.png',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [20.153584, 46.252203],
      },
      properties: {
        title: 'Karezs at Szabadság Úszóház, Szeged',
        imgUrl: 'https://cdn.9oblin.com/s3/karezs-map/uszohaz.png',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [13.732043, 45.546639],
      },
      properties: {
        title: 'Karezs at Koper',
        imgUrl: 'https://cdn.9oblin.com/s3/karezs-map/koper.jpg',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [13.769957, 45.650581],
      },
      properties: {
        title: 'Karezs at Triest',
        imgUrl: 'https://cdn.9oblin.com/s3/karezs-map/triest.jpg',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [13.390219, 52.507636],
      },
      properties: {
        title: 'Karezs at Checkpoint Charlie, Berlin',
        imgUrl: 'https://cdn.9oblin.com/s3/karezs-map/berlin.jpg',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-113.825001, 36.032896],
      },
      properties: {
        title: 'Karezs at Grand Canyon',
        imgUrl: 'https://cdn.9oblin.com/s3/karezs-map/grand_canyon.jpg',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [14.507619, 46.047119],
      },
      properties: {
        title: 'Karezs at Ljubljana',
        imgUrl: 'https://cdn.9oblin.com/s3/karezs-map/ljubljana.jpg',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [20.20821872791017, 46.46176457622422],
      },
      properties: {
        title: 'Karezs at Mártély',
        imgUrl: 'https://cdn.9oblin.com/s3/karezs-map/martely.jpg',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [19.039044017577424, 47.48962389295302],
      },
      properties: {
        title: 'Karezs at Budapest',
        imgUrl: 'https://cdn.9oblin.com/s3/karezs-map/budapest_oszlop.jpg',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [19.049675645997198, 47.48628300490831],
      },
      properties: {
        title: 'Karezs at Gellért-hegy, Budapest',
        imgUrl: 'https://cdn.9oblin.com/s3/karezs-map/budapest_bench.jpg',
      },
    },
  ],
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
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);
      },
      () => setIsLoading(false),
    );
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingSpinner} aria-hidden="true" />
        <p className={styles.loadingText}>Locating you on the map...</p>
      </div>
    );
  }

  return (
    <div className={styles.map}>
      <div className={styles.mapCanvas}>
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
