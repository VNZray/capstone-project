import type { ComponentType } from 'react';
import { Platform } from 'react-native';

let MapView: ComponentType<any>;
let Marker: ComponentType<any>;
let Callout: ComponentType<any>;
let PROVIDER_GOOGLE: any;

if (Platform.OS === 'web') {
  const WebMap: ComponentType<any> = () => null;
  const WebMarker: ComponentType<any> = () => null;
  const WebCallout: ComponentType<any> = () => null;

  MapView = WebMap;
  Marker = WebMarker;
  Callout = WebCallout;
  PROVIDER_GOOGLE = null;
}

if (Platform.OS === 'ios') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

if (Platform.OS === 'android') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

export { Callout, MapView, Marker, PROVIDER_GOOGLE };
