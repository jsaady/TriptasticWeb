import { UserRole } from '@api/features/users/userRole.enum.js';
import { SmallButton } from '@ui/components/Button.js';
import { FeatherMarker } from '@ui/components/FeatherMarker.js';
import { Icon } from '@ui/components/Icon.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { LatLng } from 'leaflet';
import { BoundsTuple } from 'leaflet-geosearch/dist/providers/provider.js';
import { useCallback, useEffect, useState } from 'react';
import { Popup, useMapEvents } from 'react-leaflet';
import { useStops } from '../home/StopsContext.js';

export interface MapBridgeProps {
  onMapClick: (stop: LatLng) => void;
  mapBounds: BoundsTuple | null;
}

export const MapBridge = ({ onMapClick, mapBounds }: MapBridgeProps) => {
  const [newPosition, setNewPosition] = useState<LatLng | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const { me } = useAuthorization();
  const { focusedStopId, setFocusedStopId, stops } = useStops();

  const map = useMapEvents({
    click: (e) => {
      if (popupOpen) return;
      if (me?.role === UserRole.ADMIN) {
        onMapClick(e.latlng);
      }
    },
    popupopen: (e) => setPopupOpen(true),
    popupclose: (e) => setPopupOpen(false),
  });

  useEffect(() => {
    if (focusedStopId) {
      const focusedStop = stops.find(stop => stop.id === focusedStopId);

      if (focusedStop) {
        map.flyTo([focusedStop.latitude, focusedStop.longitude], 12);
        setFocusedStopId(null);
      }
    }
  }, [focusedStopId, stops]);

  useEffect(() => {
    if (mapBounds) {
      map.flyToBounds(mapBounds);
    }
  }, [mapBounds]);


  const handleNoteClick = useCallback(() => {
    if (newPosition) {
      onMapClick(newPosition);
      setNewPosition(null);
    }
  }, [newPosition, setNewPosition]);

  return <>
    {newPosition && (
      <FeatherMarker draggable name="plus-square" fill='white' position={newPosition} color='DarkSlateBlue'>
        <Popup closeButton={false}>
          <h2 className='text-center mb-2'>
            Add stop
          </h2>
          <SmallButton className='ml-5' onClick={handleNoteClick}>
            <Icon icon='list' />
          </SmallButton>
        </Popup>
      </FeatherMarker>
    )}
  </>;
};
