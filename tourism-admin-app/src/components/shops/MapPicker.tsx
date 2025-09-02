import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Box, Stack, Typography, Button } from '@mui/joy';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

interface MapPickerProps {
  latitude: string; // string form in parent state
  longitude: string;
  onChange: (lat: string, lng: string) => void;
  errorLat?: string;
  errorLng?: string;
  height?: number;
}

const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onChange,
  errorLat,
  errorLng,
  height = 320,
}) => {
  const numericLat = useMemo(() => parseFloat(latitude), [latitude]);
  const numericLng = useMemo(() => parseFloat(longitude), [longitude]);
  const hasCoords = !isNaN(numericLat) && !isNaN(numericLng);
  const center = useMemo(() => (
    hasCoords ? { lat: numericLat, lng: numericLng } : { lat: 14.5995, lng: 120.9842 }
  ), [hasCoords, numericLat, numericLng]);

  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  // Use explicit mapId for vector basemap (AdvancedMarkerElement compatible). Falls back to Google's public demo id.
  const mapId = metaEnv?.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: metaEnv?.VITE_GOOGLE_MAPS_API_KEY || '',
    id: 'shops-map-picker',
    version: 'weekly', // ensure latest for AdvancedMarkerElement
  });
  // Maintain map instance and advanced marker
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const advancedMarkerRef = useRef<any | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const legacyMarkerRef = useRef<google.maps.Marker | null>(null);
  const markerLibLoadedRef = useRef(false);

  // Create or update AdvancedMarkerElement
  useEffect(() => {
    if (!mapInstance) return;
    if (!hasCoords) {
      // Remove marker if clearing
      if (advancedMarkerRef.current) {
        try {
          if ('map' in advancedMarkerRef.current) advancedMarkerRef.current.map = null;
            } catch {
          // ignore cleanup error
        }
        advancedMarkerRef.current = null;
      }
      if (legacyMarkerRef.current) {
        legacyMarkerRef.current.setMap(null);
        legacyMarkerRef.current = null;
      }
      return;
    }
    (async () => {
      try {
        const gmaps: typeof google.maps & { importLibrary?: (name: string) => Promise<unknown> } = google.maps as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!markerLibLoadedRef.current && gmaps.importLibrary) {
          await gmaps.importLibrary('marker');
          markerLibLoadedRef.current = true;
        }
        const AdvancedMarkerElement = (gmaps as any).marker?.AdvancedMarkerElement; // eslint-disable-line @typescript-eslint/no-explicit-any
        let advancedOk = false;
        if (AdvancedMarkerElement) {
          try {
            if (!advancedMarkerRef.current) {
              advancedMarkerRef.current = new AdvancedMarkerElement({
                map: mapInstance,
                position: center,
                gmpDraggable: true,
                title: 'Selected location',
              });
              advancedMarkerRef.current.addListener('dragend', () => {
                try {
                  const p = advancedMarkerRef.current?.position;
                  if (p) {
                    onChange(p.lat.toString(), p.lng.toString());
                  }
                } catch {
                  // ignore drag error
                }
              });
            } else {
              advancedMarkerRef.current.position = center;
            }
            advancedOk = true;
      } catch {
            // If creation fails (older browser / experimental features disabled), fallback silently
            if (advancedMarkerRef.current) {
        try { if ('map' in advancedMarkerRef.current) advancedMarkerRef.current.map = null; } catch { /* ignore */ }
              advancedMarkerRef.current = null;
            }
          }
        }

        if (!advancedOk) {
          // Fallback to legacy Marker
          if (!legacyMarkerRef.current) {
            legacyMarkerRef.current = new google.maps.Marker({
              map: mapInstance,
              position: center,
              draggable: true,
              title: 'Selected location',
            });
            legacyMarkerRef.current.addListener('dragend', () => {
              const p = legacyMarkerRef.current?.getPosition();
              if (p) onChange(p.lat().toString(), p.lng().toString());
            });
          } else {
            legacyMarkerRef.current.setPosition(center);
          }
        } else if (legacyMarkerRef.current) {
          legacyMarkerRef.current.setMap(null);
          legacyMarkerRef.current = null;
        }
      } catch (e) {
        console.warn('Marker initialization failed completely.', e);
        // As last resort, try legacy marker once
        if (mapInstance && !legacyMarkerRef.current) {
          legacyMarkerRef.current = new google.maps.Marker({ map: mapInstance, position: center });
        }
      }
    })();
    return undefined;
  }, [mapInstance, hasCoords, center, onChange]);

  // Clean up on unmount
  useEffect(() => () => {
    if (advancedMarkerRef.current) {
      try { if ('map' in advancedMarkerRef.current) advancedMarkerRef.current.map = null; } catch { /* ignore */ }
      advancedMarkerRef.current = null;
    }
    if (legacyMarkerRef.current) {
      legacyMarkerRef.current.setMap(null);
      legacyMarkerRef.current = null;
    }
  }, []);

  // Defer actual <GoogleMap> render to avoid IntersectionObserver on missing element
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mountMap, setMountMap] = useState(false);
  useEffect(() => {
    if (!isLoaded) return;
    // Wait a frame so Box is laid out
    const raf = requestAnimationFrame(() => {
      if (containerRef.current) setMountMap(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [isLoaded]);

  return (
    <Box sx={{ position: 'relative' }}>
  <Box ref={containerRef} sx={{
          height,
          borderRadius: 2,
          border: '1px solid',
          borderColor: errorLat || errorLng ? 'danger.outlinedColor' : 'neutral.outlinedBorder',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'neutral.softBg',
        }}>
    {isLoaded && mountMap && !loadError ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={hasCoords ? 14 : 12}
            onClick={(e) => {
              if (e.latLng) {
                onChange(e.latLng.lat().toString(), e.latLng.lng().toString());
              }
            }}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              mapId: mapId || undefined,
            }}
      onLoad={m => setMapInstance(m)}
      onUnmount={() => setMapInstance(null)}
          >
      {/* AdvancedMarkerElement handled imperatively; no <Marker> to avoid deprecation warning */}
          </GoogleMap>
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0 }}>
            <Typography level="body-sm">
      {loadError ? 'Map failed to load' : (isLoaded && !mountMap ? 'Preparing map…' : 'Loading map…')}
            </Typography>
          </Stack>
        )}
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary', flex: 1 }}>
          Click anywhere on the map to place the pin (draggable).
        </Typography>
        {hasCoords && (
          <Typography level="body-xs" sx={{ fontFamily: 'monospace' }}>
            {numericLat.toFixed(5)}, {numericLng.toFixed(5)}
          </Typography>
        )}
        {hasCoords && (
          <Button size="sm" variant="soft" onClick={() => { onChange('', ''); }}>Clear</Button>
        )}
      </Stack>
      {(errorLat || errorLng) && (
        <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
          {errorLat || errorLng}
        </Typography>
      )}
    </Box>
  );
};

export default MapPicker;
