import { icons } from 'feather-icons';
import { Control, LatLng, LatLngTuple, Icon as LeafletIcon } from 'leaflet';
import { SearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, MarkerProps, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { SmallButton } from '../../components/Button.js';
import { FeatherIcon, Icon } from '../../components/Icon.js';
import { useOpenStreetMap } from '../../utils/osm.js';
import { NewNoteStop } from './NewNoteStop.js';
import { Stop, useStops, withStopsProvider } from './StopsContext.js';
import type { Stop as StopEntity } from '../../../api/features/stops/entities/stop.entity.js';

const FeatherMarker = ({name, color = 'black', fill = 'rgba(0, 0, 0, 0)', ...rest}: { name: FeatherIcon, color?: string, fill?: string, className?: string } & MarkerProps) => {
  const icon = new LeafletIcon({
    iconUrl: `data:image/svg+xml;base64,${btoa(icons[name].toSvg({ stroke: color, fill }))}`,
    iconSize: [30, 30],
    className: rest.className ?? '',
  });
  return <Marker icon={icon} {...rest}>
    {rest.children}
  </Marker>
};


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
  const position = [51.505, -0.09] as LatLngTuple; // Latitude, Longitude
  const [modalOpen, setModalOpen] = useState(false);
  const [newLocationLatLng, setNewLocationLatLng] = useState<LatLng | null>(null);

  const handleNewStop = useCallback((type: StopType, stop: LatLng) => {
    console.log(type, stop);
    setModalOpen(true);
    setNewLocationLatLng(stop);
  }, []);

  const { stops, addStop, fetchStops } = useStops();

  const handleAddStop = useCallback((stop: Stop) => {
    setNewLocationLatLng(null);
    addStop(stop);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    fetchStops();
  }, []);

  console.log(stops);

  return <div className='flex flex-col items-center justify-center'>
    <MapContainer
      className='h-[calc(100vh-72px)] text-black dark:text-black invert-hue'
      center={position}
      zoom={13}
      style={{ width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEventBridge onNewStop={handleNewStop} />
      {
        stops.map((stop) => {
          return <FeatherMarker key={stop.id} name='map-pin' position={stop.location}>
            <Popup>
              <h2>{stop.name}</h2>
              <p>{stop.notes}</p>
            </Popup>
          </FeatherMarker>
      })
    }
    </MapContainer>

    {modalOpen && newLocationLatLng && (
      <NewNoteStop latlng={newLocationLatLng} close={closeModal} addStop={handleAddStop} />
    )}
  </div>
});
