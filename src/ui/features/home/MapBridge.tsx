import { LatLng, LatLngBounds } from 'leaflet';
import { useCallback, useEffect, useState } from 'react';
import { Popup, useMapEvents } from 'react-leaflet';
import { SmallButton } from '../../components/Button.js';
import { FeatherMarker } from '../../components/FeatherMarker.js';
import { Icon } from '../../components/Icon.js';
import { useGeolocation } from '../../utils/useGeolocation.js';
import { StopType } from './Home.js';
import { BoundsTuple } from 'leaflet-geosearch/dist/providers/provider.js';

export interface MapBridgeProps {
  onNewStop: (type: StopType, stop: LatLng) => void;
  mapBounds: BoundsTuple | null;
}

export const MapBridge = ({ onNewStop, mapBounds }: MapBridgeProps) => {
  const [newPosition, setNewPosition] = useState<LatLng | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const { currentLocation } = useGeolocation();

  const map = useMapEvents({
    click: (e) => {
      if (popupOpen) return;
      onNewStop(StopType.NOTE, e.latlng);
    },
    popupopen: (e) => setPopupOpen(true),
    popupclose: (e) => setPopupOpen(false),
  });

  useEffect(() => {
    if (currentLocation) {
      map.setView(currentLocation, map.getZoom());
    }
  }, [currentLocation]);

  useEffect(() => {
    if (mapBounds) {
      // map.fitBounds(mapBounds);
      map.flyToBounds(mapBounds);
    }
  }, [mapBounds]);


  const handleNoteClick = useCallback(() => {
    if (newPosition) {
      onNewStop(StopType.NOTE, newPosition);
      setNewPosition(null);
    }
  }, [newPosition, setNewPosition]);

  return <>
    {currentLocation && <FeatherMarker name="crosshair" position={currentLocation} color='blue' className='animate-pulse-strong'>
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
  </>;
};
