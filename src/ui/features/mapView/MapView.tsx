import { CreateStopDTO, UpdateStopDTO } from '@api/features/stops/dto/stop.dto.js';
import { StopStatus } from '@api/features/stops/entities/stopStatus.enum.js';
import { UserRole } from '@api/features/users/userRole.enum.js';
import { ConfirmModal } from '@ui/components/ConfirmModal.js';
import { LocalSearchResult, SearchBox } from '@ui/components/SearchBox.js';
import { StopMarker } from '@ui/components/StopMarker.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { denver } from '@ui/utils/useGeolocation.js';
import { useLocalStorage } from '@ui/utils/useLocalStorage.js';
import L, { LatLng } from 'leaflet';
import { BoundsTuple } from 'leaflet-geosearch/dist/providers/provider.js';
import { useCallback, useMemo, useState } from 'react';
import { MapContainer, Polyline } from 'react-leaflet';
import { EditNoteStop } from '../home/EditNoteStop.js';
import { useStops } from '../home/StopsContext.js';
import { ViewStopDetails } from '../home/ViewStopDetails.js';
import { useFetchApiKey } from '../home/fetchApiKey.js';
import { MapBridge } from './MapBridge.js';
import { MapLibreTileLayer } from './MapLibreTileLayer.js';
import { FloatingMapButton } from './ToggleRouteButton.js';
import { FeatherIcon } from '@ui/components/Icon.js';


delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export const DefaultZoom = 10;

export const MapView = () => {
  const { result: stadiaApiKey } = useFetchApiKey();
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
  const [isEditingLocation, setIsEditingLocation] = useState(false);


  const {
    stops,
    editStopDetail,
    addStop,
    updateStop,
    checkIn,
    removeStop,
    setEditStop,
    persistAttachments,
  } = useStops();

  const currentStop = useMemo(() => stops.find(stop => stop.status === StopStatus.ACTIVE), [stops]);

  const currentLocation = useMemo(() => {
    return currentStop ?
      [currentStop.latitude, currentStop.longitude] as [number, number] :
      denver;
  }, [currentStop]);

  const stopVectors = useMemo(() => {
    if (stops) {
      const sortedStops = [...stops].sort((a, b) => a.desiredArrivalDate.getTime() - b.desiredArrivalDate.getTime());
      let vectors: [boolean, [number, number], [number, number]][] = [];
      for (let i = 0; i < sortedStops.length - 1; i++) {
        let start = sortedStops[i];
        let end = sortedStops[i + 1];

        vectors.push([sortedStops[i].status === StopStatus.COMPLETED, [start.latitude, start.longitude], [end.latitude, end.longitude]]);
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

    setCheckInModalId(void 0);
    checkIn(checkInModalId);
  }, [checkInModalId]);

  const handleSearchSelected = useCallback((result: LocalSearchResult) => {
    setSearchResultBounds(result.bounds);
  }, []);

  const handleRouteToggleClicked = useCallback(() => {
    setRouteToggled(!routeToggled);
  }, [routeToggled]);

  const darkMode = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)').matches, []);

  const stadiaTheme = useMemo(() => darkMode ? 'alidade_smooth_dark' : 'alidade_smooth', [darkMode]);

  const handleCancelEditLocation = useCallback(() => {
    setIsEditingLocation(false);
    setEditStop(null);
  }, []);

  const handleMapClick = useCallback((latlng: LatLng) => {
    if (me?.role === UserRole.ADMIN) {
      if (!isEditingLocation) {
        handleNewStop(latlng);
      } else if (editStopDetail) {
        // update the location of stop
        updateStop(editStopDetail.id, {
          latitude: latlng.lat,
          longitude: latlng.lng,
        });
        handleCancelEditLocation();
      }
    }
  }, [me, editStopDetail, isEditingLocation]);

  const floatingButtonIcon: FeatherIcon = useMemo<FeatherIcon>(() => (
    isEditingLocation ?
      'x' : 'git-commit'
  ), [isEditingLocation]);

  const handleFloatingButtonClick = useCallback(() => {
    return isEditingLocation ?
      handleCancelEditLocation() :
      handleRouteToggleClicked();
  }, [isEditingLocation]);

  const handleFileUpload = useCallback((id: number) => {
      let input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';
      input.onchange = _ => {
        let files = input.files;

        if (files?.length) {
          persistAttachments(id, files);
        }
      };
      input.hidden = true;
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
  }, []);

  return (
    <div className='flex flex-col items-center justify-center'>
      <SearchBox onSelected={handleSearchSelected} onFocusChange={setIsSearch} />
      <FloatingMapButton icon={floatingButtonIcon} slashThrough={routeToggled && !isEditingLocation} onClick={handleFloatingButtonClick} />
      <MapContainer
        className='h-[calc(100vh-72px)] text-black dark:text-black'
        center={currentLocation}
        zoom={DefaultZoom}
        zoomControl={false}
        style={{ width: '100%' }}>
        <MapLibreTileLayer
          attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url={`https://tiles.stadiamaps.com/styles/${stadiaTheme}.json?apiKey=${stadiaApiKey}`}
        />
        <MapBridge onMapClick={handleMapClick} mapBounds={searchResultBounds} />
        {
          stops.map((stop) => (
            <StopMarker
              stop={stop}
              key={`${stop.id}-${stop.updatedAt}`}
              hidden={isEditingLocation && stop.id !== editStopDetail?.id}
              onDeleteClicked={() => handleDeleteClick(stop.id)}
              onDetailClicked={() => setDetailModalId(stop.id)}
              onEditClicked={() => setEditStop(stop)}
              onCheckInClick={() => setCheckInModalId(stop.id)}
              onFileUpload={() => handleFileUpload(stop.id)}
              onLocationEditClick={() => {
                setEditStop(stop);
                setIsEditingLocation(true);
              }}
            />
          ))
        }
        {
          routeToggled && !isEditingLocation && stopVectors?.map(([isComplete, ...vector], i) => (
            <Polyline key={`${i}-${isComplete}`} positions={vector} fill color={isComplete ? 'green' : 'gray'} />
          ))
        }
      </MapContainer>

      {newModalOpen && newLocationLatLng && (
        <EditNoteStop latitude={newLocationLatLng.lat} longitude={newLocationLatLng.lng} close={closeModal} saveStop={handleAddStop} />
      )}

      {editStopDetail && !isEditingLocation && (
        <EditNoteStop latitude={editStopDetail.latitude} longitude={editStopDetail.longitude} existingStop={editStopDetail} close={closeModal} saveStop={handleUpdateStop} />
      )}

      {deleteModalOpen && deleteId && (
        <ConfirmModal title='Delete stop' message='Are you sure you want to delete this stop?' onCancel={() => setDeleteModalOpen(false)} onConfirm={handleDeleteStop} />
      )}

      {checkInModalId && (
        <ConfirmModal 
          title='Check in'
          message='Are you sure you want to check in to this stop?'
          onCancel={() => setCheckInModalId(undefined)}
          onConfirm={handleCheckInClick} />
      )}

      {detailModalId && (
        <ViewStopDetails onClose={() => setDetailModalId(null)} stopId={detailModalId} />
      )}
    </div>
  );
}