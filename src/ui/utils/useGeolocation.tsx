import { ComponentType, createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

export enum GeoLocationStatus {
  SEARCHING = 'SEARCHING',
  UNAVAILABLE = 'UNAVAILABLE',
  AVAILABLE = 'AVAILABLE',
}

export interface GeolocationState {
  currentLocation: [number, number];
  lastLocation: [number, number];
  geolocationState: GeoLocationStatus | null;
  getLocation: () => void;
}

const GeoLocationContext = createContext<GeolocationState>(null as any);

export const denver = [39.742043, -104.991531] as [number, number];
export const withGeolocation = <T extends JSX.IntrinsicAttributes,>(Component: ComponentType<T>) => (props: T) => {
  const [lastLocation, setLastLocation] = useLocalStorage<[number, number]>('last-location', denver);
  const [currentLocation, setCurrentLocation] = useState(lastLocation);
  const [geolocationState, setGeolocationState] = useState<GeoLocationStatus | null>(null);
  const isFetching = useRef(false);

  const getLocation = useCallback(() => {
    if (!geolocationState && navigator.geolocation && !isFetching.current) {
      isFetching.current = true;
      setGeolocationState(GeoLocationStatus.SEARCHING);

      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
          navigator.geolocation.getCurrentPosition((position) => {
            setGeolocationState(GeoLocationStatus.AVAILABLE);
            setLastLocation([position.coords.latitude, position.coords.longitude]);
            setCurrentLocation([position.coords.latitude, position.coords.longitude]);
          });
        } else {
          setGeolocationState(GeoLocationStatus.UNAVAILABLE);
        }
      });
    }
  }, [geolocationState]);

  return <GeoLocationContext.Provider value={{ currentLocation, lastLocation, geolocationState, getLocation }}>
    <Component {...props} />
  </GeoLocationContext.Provider>;
};

export const useGeolocation = () => {
  return useContext(GeoLocationContext);
};
