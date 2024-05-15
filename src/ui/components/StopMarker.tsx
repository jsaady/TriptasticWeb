import { Popup, useMap, useMapEvents } from 'react-leaflet';
import { SmallButton } from './Button.js';
import { FeatherMarker } from './FeatherMarker.js';
import { Icon } from './Icon.js';
import { useCallback, useMemo, useState } from 'react';
import { stopOptions } from '../features/home/stopOptions.js';
import { StopType } from '@api/features/stops/entities/stopType.enum.js';
import { StopListDTO } from '@api/features/stops/dto/stop.dto.js';
import { LatLng, LeafletMouseEvent } from 'leaflet';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { UserRole } from '@api/features/users/userRole.enum.js';

export interface StopMarkerProps {
  stop: StopListDTO;
  onDeleteClicked: () => void;
  onDetailClicked: () => void;
  onEditClicked: () => void;
}
export function StopMarker ({ stop, onDeleteClicked, onEditClicked, onDetailClicked }: StopMarkerProps) {
  const { me } = useAuthorization();
  const [currentZoom, setCurrentZoom] = useState(0);

  useMapEvents({
    zoom: (e) => setCurrentZoom(e.target.getZoom())
  });

  const iconSize = useMemo(() => {
    if (currentZoom < 5) return 10;
    if (currentZoom < 10) return 20;
    if (currentZoom < 20) return 30;
    return 40;
  }, [currentZoom]);

  const { icon, label } = useMemo(() => {
    return stopOptions.find(option => option.value === stop.type) ?? stopOptions[0];
  }, [stop.type]);

  const map = useMap();

  const handleDeleteClick = useCallback(() => {
    onDeleteClicked();
    map.closePopup();
  }, [onDeleteClicked, map]);

  const handleEditClick = useCallback(() => {
    onEditClicked();
    map.closePopup();
  }, [onEditClicked, map]);

  const handleDetailClick = useCallback(() => {
    onDetailClicked();
    map.closePopup();
  }, [onDetailClicked, map]);

  const darkMode = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)').matches, []);

  const color = useMemo(() => {
    switch (stop.type) {
      case StopType.NATIONAL_PARK:
        return darkMode ? 'lightgreen' : 'darkgreen';
      case StopType.FAMILY_AND_FRIENDS:
        return darkMode ? 'pink' : 'crimson';
      case StopType.HIDDEN_GEM:
        return darkMode ? '#B666D2' : 'purple';
      case StopType.HOCKEY_CITY:
        return darkMode ? 'lightblue' : 'darkblue';
      case StopType.PIT_STOP:
        return darkMode ? 'yellow' : '#FBB917';
    }
  }, [stop.type, darkMode]);
  
  const location = useMemo(() => new LatLng(stop.latitude, stop.longitude), [stop.latitude, stop.longitude])

  const onClick = useCallback((e: LeafletMouseEvent) => {
    if (me?.role !== UserRole.ADMIN) {
      handleDetailClick();
    }
  }, [me, handleEditClick, handleDetailClick]);

  return <FeatherMarker
    eventHandlers={{ click: onClick }}
    name={icon}
    title={label}
    position={location}
    color={color}
    className='dark:text-white text-black'
    size={iconSize}>
    <Popup>
      <h2 className='text-lg font-bold'>
        {stop.name}
      </h2>
      <hr className='my-2' />
      <div className='mt-2'>
        <SmallButton className='ml-5' onClick={handleDeleteClick}>
          <Icon icon='trash' />
        </SmallButton>

        <SmallButton className='ml-5' onClick={handleEditClick}>
          <Icon icon='edit' />
        </SmallButton>

        <SmallButton className='ml-5' onClick={handleDetailClick}>
          <Icon icon='info' />
        </SmallButton>
      </div>
    </Popup>
  </FeatherMarker>;
}
