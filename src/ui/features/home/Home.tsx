import { LatLng } from 'leaflet';
import 'leaflet-geosearch/dist/geosearch.css';
import { BoundsTuple } from 'leaflet-geosearch/dist/providers/provider.js';
import 'leaflet/dist/leaflet.css';
import { memo, useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { ConfirmModal } from '../../components/ConfirmModal.js';
import { LocalSearchResult, SearchBox } from '../../components/SearchBox.js';
import { StopMarker } from '../../components/StopMarker.js';
import { useGeolocation } from '../../utils/useGeolocation.js';
import { EditNoteStop } from './EditNoteStop.js';
import { MapBridge } from './MapBridge.js';
import { Stop, useStops, withStopsProvider } from './StopsContext.js';
import { ViewStopDetails } from './ViewStopDetails.js';

export enum StopType {
  PHOTO = 'PHOTO',
  NOTE = 'NOTE',
}


export const Home = withStopsProvider(memo(() => {
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailModalId, setDetailModalId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSearch, setIsSearch] = useState(false);
  const [newLocationLatLng, setNewLocationLatLng] = useState<LatLng | null>(null);
  const [searchResultBounds, setSearchResultBounds] = useState<BoundsTuple | null>(null);
  const [editStop, setEditStop] = useState<Stop | null>(null);

  const {
    stops,
    addStop,
    updateStop,
    fetchStops,
    removeStop
  } = useStops();

  const {
    currentLocation,
    lastLocation,
    getLocation
  } = useGeolocation();

  const handleNewStop = useCallback((type: StopType, stop: LatLng) => {
    if (isSearch) return;

    setNewModalOpen(true);
    setNewLocationLatLng(stop);
  }, [isSearch]);

  const handleAddStop = useCallback((stop: Stop) => {
    setNewLocationLatLng(null);
    addStop(stop);
  }, []);

  const handleUpdateStop = useCallback((stop: Stop) => {
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

  const handleSearchSelected = useCallback((result: LocalSearchResult) => {
    setSearchResultBounds(result.bounds);
  }, []);

  useEffect(() => {
    fetchStops();
    getLocation();
  }, []);

  return <div className='flex flex-col items-center justify-center'>
    <SearchBox onSelected={handleSearchSelected} onFocusChange={setIsSearch} />
    <MapContainer
      className='h-[calc(100vh-72px)] text-black dark:text-black invert-hue'
      center={currentLocation ?? lastLocation}
      zoom={11}
      style={{ width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // url="/api/map/{s}/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
          />
        ))
      }
    </MapContainer>

    {newModalOpen && newLocationLatLng && (
      <EditNoteStop latlng={newLocationLatLng} close={closeModal} saveStop={handleAddStop} />
    )}

    {editStop && (
      <EditNoteStop latlng={editStop.location} existingStop={editStop} close={closeModal} saveStop={handleUpdateStop} />
    )}

    {deleteModalOpen && deleteId && (
      <ConfirmModal title='Delete stop' message='Are you sure you want to delete this stop?' onCancel={() => setDeleteModalOpen(false)} onConfirm={handleDeleteStop} />
    )}

    {detailModalId && (
      <ViewStopDetails onClose={() => setDetailModalId(null)} stopId={detailModalId} />
    )}
  </div>;
}));


