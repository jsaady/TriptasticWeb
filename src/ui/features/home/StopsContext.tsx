import { LatLng, LatLngTuple } from 'leaflet';
import { ComponentType, PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAsync, useAsyncHttp } from '../../utils/useAsync.js';
import type { Stop as StopEntity } from '../../../api/features/stops/entities/stop.entity.js';
import { useLocalStorage } from '../../utils/useLocalStorage.js';
import { useGeolocation } from '../../utils/useGeolocation.js';
export interface Stop {
  id: number;
  name: string;
  location: LatLng;
  photos: string[];
  notes: string;
  createdAt: number;
}

export interface StopDTO {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  latitude: number;
  longitude: number;
  creator: number;
  trip: number;
}

export type NewStop = Omit<Stop, 'id'>;

export interface StopsState {
  stops: Stop[];
  filteredStops: Stop[];
  addStop: (stop: Stop) => void;
  removeStop: (id: number) => void;
  updateStop: (id: number, stop: Stop) => void;
  getStop: (id: number) => Stop | undefined;
  searchByBounds: (bounds: LatLng[]) => void;
  searchByLatLngAndZoom: (latlng: LatLng, zoom: number) => void;
  fetchStops: () => () => void;
}

const StopsContext = createContext<StopsState>(null as any);
const London = [51.505, -0.09] as [number, number];

export const withStopsProvider = <T extends JSX.IntrinsicAttributes,>(Component: ComponentType<T>) => (props: T) => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [filteredStops, setFilteredStops] = useState<Stop[]>([]);
  const { lastLocation, currentLocation } = useGeolocation();

  const [fetchStops] = useAsyncHttp(async ({ get }) => {
    const response: StopEntity[] = await get('/api/stops/trip/1');

    setStops(response.map(stopEnt => ({
      id: stopEnt.id,
      name: stopEnt.name,
      location: new LatLng(stopEnt.latitude, stopEnt.longitude),
      photos: [] as string[],
      notes: '',
      createdAt: stopEnt.createdAt as any,
    })));

    return response;
  }, [setStops]);

  const [persistStop, { result }] = useAsyncHttp(async ({ post }, body: Pick<StopEntity, 'latitude'|'longitude'|'name'>) => {
    return post<StopDTO>('/api/stops', body);
  }, []);

  const [deleteStop] = useAsyncHttp(async ({ del }, id: number) => {
    return del('/api/stops/' + id);
  }, []);


  const addStop = useCallback((stop: Stop) => {
    persistStop({
      name: stop.name,
      latitude: stop.location.lat,
      longitude: stop.location.lng
    });
  }, []);

  useEffect(() => {
    if (result) {
      setStops(stops => [...stops, {
        id: result.id,
        name: result.name,
        createdAt: Date.parse(result.createdAt),
        location: new LatLng(result.latitude, result.longitude),
        photos: [] as string[],
        notes: ''
      }]);
    }
  }, [result])

  const removeStop = useCallback((id: number) => {
    setStops(stops => stops.filter((s) => s.id !== id));
    deleteStop(id);
  }, []);

  const updateStop = useCallback((id: number, stop: Stop) => {
    setStops(stops => stops.map((s) => s.id === id ? stop : s));
  }, []);

  const getStop = useCallback((id: number) => {
    return stops.find((s) => s.id === id);
  }, []);

  const searchByBounds = useCallback((bounds: LatLng[]) => {
    setFilteredStops(stops.filter((s) => bounds[0].lat < s.location.lat && s.location.lat < bounds[1].lat && bounds[0].lng < s.location.lng && s.location.lng < bounds[1].lng));
  }, []);

  const searchByLatLngAndZoom = useCallback((latlng: LatLng, zoom: number) => {
    setFilteredStops(stops.filter((s) => {
      const latDiff = Math.abs(latlng.lat - s.location.lat);
      const lngDiff = Math.abs(latlng.lng - s.location.lng);
      return latDiff < 0.01 * zoom && lngDiff < 0.01 * zoom;
    }));
  }, []);

  return <StopsContext.Provider value={{
    stops,
    filteredStops,
    addStop,
    removeStop,
    updateStop,
    getStop,
    searchByBounds,
    searchByLatLngAndZoom,
    fetchStops,
  }}>
    <Component {...props} />
  </StopsContext.Provider>;
};

export const useStops = () => useContext(StopsContext);
