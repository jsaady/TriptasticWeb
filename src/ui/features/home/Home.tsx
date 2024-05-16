import { LatLng } from 'leaflet';
import 'leaflet-geosearch/dist/geosearch.css';
import { BoundsTuple } from 'leaflet-geosearch/dist/providers/provider.js';
import 'leaflet/dist/leaflet.css';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { ConfirmModal } from '@ui/components/ConfirmModal.js';
import { LocalSearchResult, SearchBox } from '@ui/components/SearchBox.js';
import { StopMarker } from '@ui/components/StopMarker.js';
import { useGeolocation } from '@ui/utils/useGeolocation.js';
import { EditNoteStop } from './EditNoteStop.js';
import { MapBridge } from './MapBridge.js';
import { useStops, withStopsProvider } from './StopsContext.js';
import { ViewStopDetails } from './ViewStopDetails.js';
import { withOpenStreetMapProvider } from '@ui/utils/osm.js';
import { MapLibreTileLayer } from './MapLibreTileLayer.js';
import { CreateStopDTO, UpdateStopDTO } from '@api/features/stops/dto/stop.dto.js';
import { useFetchApiKey } from './fetchApiKey.js';

export const Home = withOpenStreetMapProvider(withStopsProvider(memo(() => {
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [checkInModalId, setCheckInModalId] = useState<number>();
  const [detailModalId, setDetailModalId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSearch, setIsSearch] = useState(false);
  const [newLocationLatLng, setNewLocationLatLng] = useState<LatLng | null>(null);
  const [searchResultBounds, setSearchResultBounds] = useState<BoundsTuple | null>(null);
  const [editStop, setEditStop] = useState<UpdateStopDTO | null>(null);

  const { result, loading } = useFetchApiKey();

  const {
    stops,
    addStop,
    updateStop,
    fetchStops,
    checkIn,
    removeStop
  } = useStops();

  const {
    currentLocation,
    lastLocation,
    getLocation
  } = useGeolocation();

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
    fetchStops();
    getLocation();
  }, []);

  const darkMode = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)').matches, []);

  const stadiaTheme = useMemo(() => darkMode ? 'alidade_smooth_dark' : 'alidade_smooth', [darkMode]);

  if (loading) return <div>Loading...</div>

  return <div className='flex flex-col items-center justify-center'>
    <SearchBox onSelected={handleSearchSelected} onFocusChange={setIsSearch} />
    <MapContainer
      className='h-[calc(100vh-72px)] text-black dark:text-black'
      center={currentLocation ?? lastLocation}
      zoom={11}
      style={{ width: '100%' }}>
      <MapLibreTileLayer
        attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        url={`https://tiles.stadiamaps.com/styles/${stadiaTheme}.json?apiKey=${result}`}
      />
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
      <ConfirmModal title='Delete stop' message='Are you sure you want to delete this stop?' onCancel={() => setCheckInModalId(undefined)} onConfirm={handleCheckInClick} />
    )}

    {detailModalId && (
      <ViewStopDetails onClose={() => setDetailModalId(null)} stopId={detailModalId} />
    )}
  </div>;
})));


