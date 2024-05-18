import { LocalSearchResult, SearchBox } from '@ui/components/SearchBox.js';
import { MapContainer, Polyline } from 'react-leaflet';
import { MapLibreTileLayer } from './MapLibreTileLayer.js';
import { MapBridge } from './MapBridge.js';
import { StopMarker } from '@ui/components/StopMarker.js';
import { useStops } from '../home/StopsContext.js';
import { useGeolocation } from '@ui/utils/useGeolocation.js';
import React, { MouseEvent, MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react';
import { UpdateStopDTO, CreateStopDTO } from '@api/features/stops/dto/stop.dto.js';
import { ConfirmModal } from '@ui/components/ConfirmModal.js';
import { LatLng } from 'leaflet';
import { BoundsTuple } from 'leaflet-geosearch/dist/providers/provider.js';
import { EditNoteStop } from '../home/EditNoteStop.js';
import { ViewStopDetails } from '../home/ViewStopDetails.js';
import { useFetchApiKey } from '../home/fetchApiKey.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { UserRole } from '@api/features/users/userRole.enum.js';
import { Button, SmallButton } from '@ui/components/Button.js';
import { Icon } from '@ui/components/Icon.js';
import { useLocalStorage } from '@ui/utils/useLocalStorage.js';
const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
}

interface ToggleRouteButtonProps {
  position?: keyof typeof POSITION_CLASSES;
  toggled: boolean;
  onClick: () => void;
}

const ToggleRouteButton = ({ position = 'topright', toggled, onClick }: ToggleRouteButtonProps) => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    onClick();
  }, [onClick]);

  return <div className={POSITION_CLASSES[position]}>
    <div className="leaflet-control leaflet-bar">
      <SmallButton className='px-1' onClick={handleClick}>
        <Icon icon='git-commit' />
        {toggled && <Icon className='mt-[-1.5rem]' icon='slash' fill='transparent' />}
      </SmallButton>
    </div>
  </div>
}

export const MapView = () => {
  const { result: stadiaApiKey, loading } = useFetchApiKey();
  const { me } = useAuthorization();

  const [routeToggled, setRouteToggled] = useLocalStorage('route-toggled', false);

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [checkInModalId, setCheckInModalId] = useState<number>();
  const [detailModalId, setDetailModalId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSearch, setIsSearch] = useState(false);
  const [newLocationLatLng, setNewLocationLatLng] = useState<LatLng | null>(null);
  const [searchResultBounds, setSearchResultBounds] = useState<BoundsTuple | null>(null);
  const [editStop, setEditStop] = useState<UpdateStopDTO | null>(null);


  const {
    currentLocation,
    lastLocation,
    getLocation
  } = useGeolocation();

  const {
    stops,
    addStop,
    updateStop,
    checkIn,
    removeStop
  } = useStops();

  const stopVectors = useMemo(() => {
    if (stops) {
      const sortedStops = [...stops].sort((a, b) => a.desiredArrivalDate.getTime() - b.desiredArrivalDate.getTime());
      let vectors: [[number, number], [number, number]][] = [];
      for (let i = 0; i < sortedStops.length - 1; i++) {
        let start = sortedStops[i];
        let end = sortedStops[i + 1];

        vectors.push([[start.latitude, start.longitude], [end.latitude, end.longitude]]);
      }

      return vectors;
    }
  }, [stops]);

  const handleNewStop = useCallback((stop: LatLng) => {
    if (isSearch) return;

    setNewModalOpen(true);
    setNewLocationLatLng(stop);
  }, [isSearch]);

  const handleAddStop = useCallback((stop: CreateStopDTO, attachments?: FileList) => {
    setNewLocationLatLng(null);
    addStop(stop, attachments);
  }, []);

  const handleUpdateStop = useCallback((stop: UpdateStopDTO) => {
    updateStop(stop.id, stop);
  }, []);


  const handleDeleteStop = useCallback(() => {
    if (deleteId) {
      removeStop(deleteId);
      setDeleteModalOpen(false);
    }
  }, [deleteId]);

  const closeModal = useCallback(() => {
    setNewModalOpen(false);
    setEditStop(null);
  }, []);

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  }, []);

  const handleCheckInClick = useCallback(() => {
    if (!checkInModalId) return;

    checkIn(checkInModalId);
  }, []);

  const handleSearchSelected = useCallback((result: LocalSearchResult) => {
    setSearchResultBounds(result.bounds);
  }, []);

  useEffect(() => {
    if (!currentLocation && me?.role === UserRole.ADMIN) {
      getLocation();
    }
  }, []);

  const handleRouteToggleClicked = useCallback(() => {
    setRouteToggled(!routeToggled);
  }, [routeToggled]);

  const darkMode = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)').matches, []);

  const stadiaTheme = useMemo(() => darkMode ? 'alidade_smooth_dark' : 'alidade_smooth', [darkMode]);

  return (
    <div className='flex flex-col items-center justify-center'>
      <SearchBox onSelected={handleSearchSelected} onFocusChange={setIsSearch} />
      <MapContainer
        className='h-[calc(100vh-72px)] text-black dark:text-black'
        center={currentLocation ?? lastLocation}
        zoom={11}
        style={{ width: '100%' }}>
        <MapLibreTileLayer
          attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url={`https://tiles.stadiamaps.com/styles/${stadiaTheme}.json?apiKey=${stadiaApiKey}`}
        />
        <ToggleRouteButton toggled={routeToggled} onClick={handleRouteToggleClicked} />
        <MapBridge onNewStop={handleNewStop} mapBounds={searchResultBounds} />
        {
          stops.map((stop) => (
            <StopMarker
              stop={stop}
              key={stop.id}
              onDeleteClicked={() => handleDeleteClick(stop.id)}
              onDetailClicked={() => setDetailModalId(stop.id)}
              onEditClicked={() => setEditStop(stop)}
              onCheckInClick={() => setCheckInModalId(stop.id)}
            />
          ))
        }
        {
          routeToggled && stopVectors?.map((vector, i) => (
            <Polyline key={i} positions={vector} fill fillColor='white' />
          ))
        }
      </MapContainer>

      {newModalOpen && newLocationLatLng && (
        <EditNoteStop latitude={newLocationLatLng.lat} longitude={newLocationLatLng.lng} close={closeModal} saveStop={handleAddStop} />
      )}

      {editStop && (
        <EditNoteStop latitude={editStop.latitude} longitude={editStop.longitude} existingStop={editStop} close={closeModal} saveStop={handleUpdateStop} />
      )}

      {deleteModalOpen && deleteId && (
        <ConfirmModal title='Delete stop' message='Are you sure you want to delete this stop?' onCancel={() => setDeleteModalOpen(false)} onConfirm={handleDeleteStop} />
      )}

      {checkInModalId && (
        <ConfirmModal title='Check in' message='Are you sure you want to check in to this stop?' onCancel={() => setCheckInModalId(undefined)} onConfirm={handleCheckInClick} />
      )}

      {detailModalId && (
        <ViewStopDetails onClose={() => setDetailModalId(null)} stopId={detailModalId} />
      )}
    </div>
  );
}