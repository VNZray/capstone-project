import React, { useState, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker as GoogleMarker, InfoWindow, OverlayView } from '@react-google-maps/api';
import { View, ActivityIndicator } from 'react-native';

const libraries: ("places" | "geometry" | "drawing" | "localContext" | "visualization")[] = ['places'];

export const PROVIDER_GOOGLE = 'google';

export const MapView = (props: any) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const center = useMemo(() => {
    if (props.initialRegion) {
      return {
        lat: props.initialRegion.latitude,
        lng: props.initialRegion.longitude,
      };
    }
    return { lat: 13.6217, lng: 123.1948 };
  }, [props.initialRegion]);

  // Rough conversion of latitudeDelta to zoom
  const zoom = useMemo(() => {
      if (props.initialRegion?.latitudeDelta) {
          return Math.round(Math.log(360 / props.initialRegion.latitudeDelta) / Math.LN2);
      }
      return 12;
  }, [props.initialRegion]);

  if (!isLoaded) return <ActivityIndicator size="large" />;

  return (
    <View style={props.style}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
        }}
      >
        {props.children}
      </GoogleMap>
    </View>
  );
};

export const Callout = (props: any) => {
    return (
        <View 
            // @ts-ignore
            onClick={(e) => {
                e.stopPropagation();
                props.onPress && props.onPress();
            }}
            style={{ 
                minWidth: 200,
                backgroundColor: 'transparent',
            }}
        >
            {props.children}
        </View>
    );
};
// Assign displayName for type checking
Callout.displayName = 'Callout';

export const Marker = (props: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const position = {
    lat: props.coordinate.latitude,
    lng: props.coordinate.longitude,
  };

  // Separate Callout from other children
  let calloutChild: any = null;
  let markerContent: any[] = [];

  React.Children.forEach(props.children, (child) => {
    if (React.isValidElement(child) && ((child.type as any) === Callout || (child.type as any)?.displayName === 'Callout')) {
        calloutChild = child;
    } else {
        markerContent.push(child);
    }
  });

  // If we have custom marker content, use OverlayView
  if (markerContent.length > 0) {
      return (
        <OverlayView
            position={position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={(width, height) => ({
                x: -(width / 2),
                y: -(height / 2),
            })}
        >
            <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <View 
                    // @ts-ignore - Web specific
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                        props.onPress && props.onPress();
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {markerContent}
                </View>
                {isOpen && calloutChild && (
                    <View style={{ position: 'absolute', bottom: '100%', marginBottom: 10, zIndex: 999 }}>
                         {calloutChild}
                    </View>
                )}
            </View>
        </OverlayView>
      );
  }

  // Standard Marker
  return (
    <GoogleMarker
      position={position}
      onClick={() => {
          setIsOpen(!isOpen);
          props.onPress && props.onPress();
      }}
      title={props.title}
      icon={props.pinColor ? {
          path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
          fillColor: props.pinColor,
          fillOpacity: 1,
          strokeColor: '#000',
          strokeWeight: 1,
          scale: 1,
      } : undefined}
    >
        {isOpen && calloutChild && (
            <InfoWindow onCloseClick={() => setIsOpen(false)}>
                <View>{calloutChild.props.children}</View>
            </InfoWindow>
        )}
    </GoogleMarker>
  );
};
