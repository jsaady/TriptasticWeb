import { LatLng } from 'leaflet';
import { ComponentType, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAsyncHttp } from '@ui/utils/useAsync.js';
import { CreateStopDTO, StopDetailDTO, StopListDTO, UpdateStopDTO } from '@api/features/stops/dto/stop.dto.js';

export interface StopsState {
  stops: StopListDTO[];
  filteredStops: StopListDTO[];
  addStop: (stop: CreateStopDTO, attachments?: File[]) => void;
  removeStop: (id: number) => void;
  updateStop: (id: number, stop: UpdateStopDTO) => void;
  getStop: (id: number) => StopListDTO | undefined;
  searchByBounds: (bounds: LatLng[]) => void;
  searchByLatLngAndZoom: (latlng: LatLng, zoom: number) => void;
  persistAttachments: (id: number, files: FileList | File[]) => void;
  fetchStops: () => () => void;
}

const StopsContext = createContext<StopsState>(null as any);

export const withStopsProvider = <T extends JSX.IntrinsicAttributes,>(Component: ComponentType<T>) => (props: T) => {
  const [stops, setStops] = useState<StopListDTO[]>([]);
  const [filteredStops, setFilteredStops] = useState<StopListDTO[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<File[] | FileList>([]);

  const [fetchStops] = useAsyncHttp(async ({ get }) => {
    const response: StopListDTO[] = await get('/api/stops/trip/1');

    setStops(response.map(stopEnt => ({
      id: stopEnt.id,
      name: stopEnt.name,
      location: new LatLng(stopEnt.latitude, stopEnt.longitude),
      attachments: [],
      createdAt: stopEnt.createdAt,
      updatedAt: stopEnt.updatedAt,
      type: stopEnt.type,
      desiredArrivalDate: stopEnt.desiredArrivalDate,
      actualArrivalDate: stopEnt.actualArrivalDate,
      latitude: stopEnt.latitude,
      longitude: stopEnt.longitude,
    })));

    return response;
  }, [setStops]);

  const [persistStop, { result }] = useAsyncHttp(async ({ post }, body: CreateStopDTO) => {
    return post<StopDetailDTO>('/api/stops', body);
  }, []);

  const [persistStopChanges] = useAsyncHttp(async ({ put }, id: number, body: UpdateStopDTO) => {
    return put<StopDetailDTO>('/api/stops/' + id, body);
  }, []);

  const [persistAttachments] = useAsyncHttp(async ({ post }, id: number, files: FileList|File[]) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('file', file);
    }

    return post(`/api/stops/${id}/attach`, formData);
  }, []);

  const [deleteStop] = useAsyncHttp(async ({ del }, id: number) => {
    return del('/api/stops/' + id);
  }, []);

  const addStop = useCallback((stop: CreateStopDTO, attachments?: File[]) => {
    if (attachments?.length) {
      setPendingAttachments(attachments);
    }
    persistStop({
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      notes: stop.notes,
      type: stop.type,
      actualArrivalDate: stop.actualArrivalDate,
      desiredArrivalDate: stop.desiredArrivalDate
    });
  }, []);

  useEffect(() => {
    if (result) {
      if (pendingAttachments?.length) {
        persistAttachments(result.id, pendingAttachments);
      }

      setStops(stops => [...stops, {
        id: result.id,
        name: result.name,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        desiredArrivalDate: new Date(result.desiredArrivalDate),
        actualArrivalDate: new Date(result.actualArrivalDate),
        latitude: result.latitude,
        longitude: result.longitude,
        attachments: [] as File[],
        notes: result.notes,
        type: result.type
      }]);
    }
  }, [result, pendingAttachments])

  const removeStop = useCallback((id: number) => {
    setStops(stops => stops.filter((s) => s.id !== id));
    deleteStop(id);
  }, []);

  const updateStop = useCallback((id: number, stop: UpdateStopDTO) => {
    setStops(stops => stops.map((s) => s.id === id ? {
      ...s,
      ...stop,
      updatedAt: new Date(),
    } : s));

    persistStopChanges(id, {
      id,
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      notes: stop.notes,
      type: stop.type,
      actualArrivalDate: stop.actualArrivalDate,
      desiredArrivalDate: stop.desiredArrivalDate
    });
  }, []);

  const getStop = useCallback((id: number) => {
    return stops.find((s) => s.id === id);
  }, []);

  const searchByBounds = useCallback((bounds: LatLng[]) => {
    setFilteredStops(stops.filter((s) => bounds[0].lat < s.latitude && s.latitude < bounds[1].lat && bounds[0].lng < s.longitude && s.longitude < bounds[1].lng));
  }, []);

  const searchByLatLngAndZoom = useCallback((latlng: LatLng, zoom: number) => {
    setFilteredStops(stops.filter((s) => {
      const latDiff = Math.abs(latlng.lat - s.latitude);
      const lngDiff = Math.abs(latlng.lng - s.longitude);
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
    persistAttachments,
  }}>
    <Component {...props} />
  </StopsContext.Provider>;
};

export const useStops = () => useContext(StopsContext);
