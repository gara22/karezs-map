import styles from './App.module.css';
import MapView from './map/MapView';
import { useMemo, useState } from 'react';

function App() {
  const [zoom, setZoom] = useState(4);

  const opacityLevel = useMemo(() => {
    const fadeStartZoom = 8;
    const fadeEndZoom = 12;
    const clampedZoom = Math.min(fadeEndZoom, Math.max(fadeStartZoom, zoom));
    const normalized = (fadeEndZoom - clampedZoom) / (fadeEndZoom - fadeStartZoom);
    return Math.max(0, Math.min(10, Math.round(normalized * 10)));
  }, [zoom]);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.header}>
        <img
          src="https://cdn.9oblin.com/s3/karezs-map/karezs_map_banner_v1.png"
          alt="karezs map"
          className={`${styles.headerImage} ${styles[`opacity${opacityLevel}`]}`}
        />
      </h1>
      <MapView onZoomChange={setZoom} />
    </div>
  );
}

export default App;
