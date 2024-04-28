import { Control, LatLng } from 'leaflet';
import { SearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { SmallButton } from '../../components/Button.js';
import { ConfirmModal } from '../../components/ConfirmModal.js';
import { FeatherMarker } from '../../components/FeatherMarker.js';
import { Icon } from '../../components/Icon.js';
import { StopMarker } from '../../components/StopMarker.js';
import { useOpenStreetMap } from '../../utils/osm.js';
import { NewNoteStop } from './NewNoteStop.js';
import { Stop, useStops, withStopsProvider } from './StopsContext.js';

interface MapBridgeProps {
  onNewStop: (type: StopType, stop: LatLng) => void;
}

export enum StopType {
  PHOTO = 'PHOTO',
  NOTE = 'NOTE',
}


const MapEventBridge = ({ onNewStop }: MapBridgeProps) => {
  const [position, setPosition] = useState<LatLng>(null as any);
  const [newPosition, setNewPosition] = useState<LatLng | null>(null);
  const [searchElAdded, setSearchElAdded] = useState(false);
  const { setLastLocation } = useStops();

  const geoProv = useOpenStreetMap();
  const map = useMapEvents({
    click: (e) => {
      onNewStop(StopType.NOTE, e.latlng);
    }
  });

  const searchEl: typeof SearchControl & Control = useMemo(() => {
    return new (SearchControl as any)({
      provider: geoProv,
      style: 'bar',
    });
  }, []);

  useEffect(() => {
    if (!searchElAdded) {
      map.addControl(searchEl);
      setSearchElAdded(true);
    }
  }, []);


  useEffect(() => {
    map.locate();
    map.once('locationfound', (e) => {
      setLastLocation([e.latlng.lat, e.latlng.lng]);
      setPosition(e.latlng);
      map.setView(e.latlng, map.getZoom());
    });
  }, []);

  const handleCamClick = useCallback(() => {
    if (newPosition) {
      onNewStop(StopType.PHOTO, newPosition);
      setNewPosition(null);
    }
  }, [newPosition]);
  const handleNoteClick = useCallback(() => {
    if (newPosition) {
      onNewStop(StopType.NOTE, newPosition);
      setNewPosition(null);
    }
  }, [newPosition, setNewPosition]);

  return <>
    {position && <FeatherMarker name="crosshair" position={position} color='blue' className='animate-pulse-strong'>
      <Popup>
        Your location
      </Popup>
    </FeatherMarker>}
    {newPosition && (
      <FeatherMarker draggable name="plus-square" fill='white' position={newPosition} color='DarkSlateBlue'>
        <Popup closeButton={false}>
          <h2 className='text-center mb-2'>
            Add stop
          </h2>
          {/* <SmallButton disabled className='ml-2.5' onClick={handleCamClick}>
            <Icon icon='camera' />
          </SmallButton> */}
          <SmallButton className='ml-5' onClick={handleNoteClick}>
            <Icon icon='list' />
          </SmallButton>
        </Popup>
      </FeatherMarker>
    )}
  </>
};



// TODO: wire up search by latlng and zoom based on map position
export const Home = withStopsProvider(() => {
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [newLocationLatLng, setNewLocationLatLng] = useState<LatLng | null>(null);

  const handleNewStop = useCallback((type: StopType, stop: LatLng) => {
    setNewModalOpen(true);
    setNewLocationLatLng(stop);
  }, []);

  const {
    stops,
    lastLocation,
    addStop,
    fetchStops,
    removeStop
  } = useStops();

  const handleAddStop = useCallback((stop: Stop) => {
    setNewLocationLatLng(null);
    addStop(stop);
  }, []);

  const handleDeleteStop = useCallback(() => {
    if (deleteId) {
      removeStop(deleteId);
      setDeleteModalOpen(false);
    }
  }, [deleteId]);

  const closeModal = useCallback(() => setNewModalOpen(false), []);

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  }, []);

  useEffect(() => {
    fetchStops();
  }, []);

  return <div className='flex flex-col items-center justify-center'>
    <MapContainer
      className='h-[calc(100vh-72px)] text-black dark:text-black invert-hue'
      center={lastLocation}
      zoom={11}
      style={{ width: '100%' }}>
      <TileLayer
        url="/api/map/{s}/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEventBridge onNewStop={handleNewStop} />
      {
        stops.map((stop) => (
          <StopMarker
            stop={stop}
            key={stop.id}
            onDeleteClicked={() => handleDeleteClick(stop.id)}
          />
        ))
    }
    </MapContainer>

    {newModalOpen && newLocationLatLng && (
      <NewNoteStop latlng={newLocationLatLng} close={closeModal} addStop={handleAddStop} />
    )}


    {deleteModalOpen && deleteId && (
      <ConfirmModal title='Delete stop' message='Are you sure you want to delete this stop?' onCancel={() => setDeleteModalOpen(false)} onConfirm={handleDeleteStop} />
    )}
  </div>
});


