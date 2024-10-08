import { LatLng } from 'leaflet';
import { ComponentType, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAsyncHttp, useAsyncHttpWithAlert } from '@ui/utils/useAsync.js';
import { CreateStopDTO, StopDetailDTO, StopListDTO, UpdateStopDTO } from '@api/features/stops/dto/stop.dto.js';
import { StopStatus } from '@api/features/stops/entities/stopStatus.enum.js';
import { Serialized } from '../../../common/serialized.js';
import { AttachmentDTO } from '@api/features/stops/dto/attachment.dto.js';
import { useSpinnerProgress } from '@ui/utils/useSpinner.js';

export interface StopsState {
  stops: StopListDTO[];
  focusedStopId: number | null;
  filteredStops: StopListDTO[] | null;
  editStopDetail: StopDetailDTO | null;
  attachments: AttachmentDTO[] | null;
  setFocusedStopId: (stopId: number | null) => void;
  addStop: (stop: CreateStopDTO, attachments?: FileList) => void;
  checkIn: (id: number) => void;
  removeStop: (id: number) => void;
  updateStop: (id: number, stop: Partial<UpdateStopDTO>) => void;
  getStop: (id: number) => StopListDTO | undefined;
  notifyUsers: (id: number) => void;
  fetchAttachments: (stopId: number) => void;
  persistAttachments: (id: number, files: FileList) => void;
  removeAttachment: (stopId: number, attachmentId: number) => void;
  fetchStops: () => () => void;
  searchStops: (q: string, limit: number) => () => void;
  setEditStop: (stop: StopListDTO | null) => void;
}

const StopsContext = createContext<StopsState>(null as any);
const mapAPIResponse = (response: Serialized<StopListDTO>[]): StopListDTO[] => response.map((stopEnt) => ({
  id: stopEnt.id,
  name: stopEnt.name,
  location: new LatLng(stopEnt.latitude, stopEnt.longitude),
  attachments: [],
  createdAt: new Date(stopEnt.createdAt),
  updatedAt: new Date(stopEnt.updatedAt),
  type: stopEnt.type,
  desiredArrivalDate: new Date(stopEnt.desiredArrivalDate),
  actualArrivalDate: new Date(stopEnt.actualArrivalDate),
  status: stopEnt.status,
  latitude: stopEnt.latitude,
  longitude: stopEnt.longitude,
  sortOrder: stopEnt.sortOrder,
}));

export const withStopsProvider = <T extends JSX.IntrinsicAttributes,>(Component: ComponentType<T>) => (props: T) => {
  const [,setProgress] = useSpinnerProgress();
  const [attachments, setAttachments] = useState<AttachmentDTO[]>([]);

  const [stops, setStops] = useState<StopListDTO[]>([]);

  const [pendingAttachments, setPendingAttachments] = useState<FileList>();
  const [editStopDetail, setEditStopDetail] = useState<StopDetailDTO | null>(null);

  const [focusedStopId, setFocusedStopId] = useState<number | null>(null);

  const [fetchStops] = useAsyncHttp(async ({ get }) => {
    const response: Serialized<StopListDTO>[] = await get('/api/stops/trip/1');

    const mappedStops = mapAPIResponse(response);

    setStops(mappedStops);

    return response;
  }, [setStops]);

  const [searchStops, { result: filteredStops }] = useAsyncHttp(async ({ get }, q: string, limit: number) => {
    const response: Serialized<StopListDTO>[] = await get('/api/stops/trip/1?q=' + q + '&limit=' + limit);

    return mapAPIResponse(response);
  }, [setStops]);

  const [persistStop, { result }] = useAsyncHttpWithAlert(async ({ post }, body: CreateStopDTO) => {
    return post<StopDetailDTO>('/api/stops', body);
  }, [], 'Stop created successfully', 'Error creating stop');

  const [persistStopChanges, { result: persistResult }] = useAsyncHttpWithAlert(async ({ put }, id: number, body: UpdateStopDTO) => {
    return put<StopDetailDTO>('/api/stops/' + id, body);
  }, [], 'Stop updated successfully', 'Error updating stop');

  const [persistAttachments] = useAsyncHttpWithAlert(async ({ post }, id: number, files: FileList) => {
    const len = files.length;
    setProgress(1);

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      await post(`/api/stops/${id}/attach`, formData);
      setProgress((prev) => prev + 100 / len);
    }
  }, [], 'Attachment uploaded successfully', 'Error uploading attachment');

  const [notifyUsers] = useAsyncHttpWithAlert(async ({ post }, id: number) => {
    await post(`/api/stops/${id}/notify`, {});
  }, [], 'Notification sent successfully', 'Error sending notification');

  const [fetchAttachments, { result: fetchedAttachments }] = useAsyncHttp(async ({ get }, stopId: number) => {
    setAttachments([]);
    return await get<Serialized<AttachmentDTO[]>>(`/api/stops/${stopId}/attachments`);
  }, []);

  const [removeAttachment] = useAsyncHttpWithAlert(async ({ del }, stopId: number, attachmentId: number) => {
    await del(`/api/stops/${stopId}/attach/${attachmentId}`);
    fetchAttachments(stopId);
  }, [], 'Attachment removed successfully', 'Error removing attachment');

  const [deleteStop] = useAsyncHttpWithAlert(async ({ del }, id: number) => {
    return del('/api/stops/' + id);
  }, [], 'Successfully removed stop', 'Error removing stop');

  const [doCheckIn, { result: checkInResult }] = useAsyncHttpWithAlert(async ({ put }, id: number) => {
    return put(`/api/stops/${id}/checkIn`, {});
  }, [], 'Successfully checked in', 'Error checking in');

  const addStop = useCallback((stop: CreateStopDTO, attachments?: FileList) => {
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
      desiredArrivalDate: stop.desiredArrivalDate,
      sortOrder: stop.sortOrder,
      status: StopStatus.UPCOMING,
    });
  }, []);

  const checkIn = useCallback((id: number) => {
    doCheckIn(id);
    setStops(stops => stops.map((s) => s.id === id ? {
      ...s,
      status: StopStatus.ACTIVE,
      updatedAt: new Date(),
    } : {
      ...s,
      status: s.status === StopStatus.ACTIVE ? StopStatus.COMPLETED : s.status
    }));
  }, []);

  const [setEditStop] = useAsyncHttp(async ({ get }, stop: StopListDTO | null) => {
    if (!stop) {
      setEditStopDetail(null);
      return;
    }

    const detail = await get<StopDetailDTO>(`/api/stops/${stop.id}`);

    setEditStopDetail(detail);
  }, []);

  const removeStop = useCallback((id: number) => {
    setStops(stops => stops.filter((s) => s.id !== id));
    deleteStop(id);
  }, []);

  const updateStop = useCallback((id: number, stop: Partial<UpdateStopDTO>) => {

    setStops(stops => stops.map((s) => {
      if (s.id === id) {
        const mappedStop = {
          ...s,
          ...stop,
          updatedAt: new Date(),
        };


        persistStopChanges(id, {
          id,
          name: mappedStop.name,
          latitude: mappedStop.latitude,
          longitude: mappedStop.longitude,
          notes: mappedStop.notes,
          type: mappedStop.type,
          actualArrivalDate: mappedStop.actualArrivalDate,
          status: mappedStop.status,
          desiredArrivalDate: mappedStop.desiredArrivalDate,
          sortOrder: mappedStop.sortOrder,
        });

        return mappedStop;
      }

      return s;
    }));

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
        status: StopStatus.UPCOMING,
        sortOrder: result.sortOrder,
        type: result.type
      }]);
    }
  }, [result, pendingAttachments]);

  useEffect(() => {
    if (persistResult || checkInResult) {
      fetchStops();
    }
  }, [persistResult, checkInResult]);

  useEffect(() => {
    if (fetchedAttachments) {
      setAttachments(fetchedAttachments);
    }
  }, [fetchedAttachments]);

  const getStop = useCallback((id: number) => {
    return stops.find((s) => s.id === id);
  }, []);

  return <StopsContext.Provider value={{
    stops: stops,
    focusedStopId,
    filteredStops,
    editStopDetail,
    attachments,
    setEditStop,
    setFocusedStopId,
    addStop,
    checkIn,
    removeStop,
    updateStop,
    getStop,
    notifyUsers,
    fetchStops,
    searchStops,
    persistAttachments,
    fetchAttachments,
    removeAttachment,
  }}>
    <Component {...props} />
  </StopsContext.Provider>;
};

export const useStops = () => useContext(StopsContext);
