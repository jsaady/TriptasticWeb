import { StopListDTO } from '@api/features/stops/dto/stop.dto.js';
import { StopStatus } from '@api/features/stops/entities/stopStatus.enum.js';
import { StopType } from '@api/features/stops/entities/stopType.enum.js';
import { UserRole } from '@api/features/users/userRole.enum.js';
import { DefaultZoom } from '@ui/features/mapView/MapView.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { LatLng, LeafletMouseEvent } from 'leaflet';
import { useCallback, useMemo, useState } from 'react';
import { Popup, useMap, useMapEvents } from 'react-leaflet';
import { stopOptions } from '../features/home/stopOptions.js';
import { SmallButton } from './Button.js';
import { FeatherMarker } from './FeatherMarker.js';
import { Icon } from './Icon.js';

export interface StopMarkerProps {
  stop: StopListDTO;
  hidden?: boolean;
  onDeleteClicked: () => void;
  onDetailClicked: () => void;
  onEditClicked: () => void;
  onCheckInClick: () => void;
  onFileUpload: () => void;
  onLocationEditClick: () => void;
}
export function StopMarker ({ stop, hidden = false, onDeleteClicked, onEditClicked, onDetailClicked, onCheckInClick, onLocationEditClick, onFileUpload }: StopMarkerProps) {
  const { me } = useAuthorization();
  const [currentZoom, setCurrentZoom] = useState(DefaultZoom);

  useMapEvents({
    zoom: (e) => setCurrentZoom(e.target.getZoom()),
    moveend: (e) => setCurrentZoom(e.target.getZoom())
  });

  const iconSize = useMemo(() => {
    if (currentZoom < 5) return 10;
    if (currentZoom < 10) return 20;
    if (currentZoom < 20) return 30;
    return 40;
  }, [currentZoom]);

  const { icon, label } = useMemo(() => {
    return stop.status === StopStatus.ACTIVE ? { label: 'Current Location', icon: 'crosshair' as 'crosshair' } : stopOptions.find(option => option.value === stop.type) ?? stopOptions[0];
  }, [stop.type]);

  const map = useMap();

  const buildCallback = (cb: () => void) => useCallback(() => {
    cb();
    map.closePopup();
  }, [cb, map]);
  
  const handleDeleteClick = buildCallback(onDeleteClicked);
  const handleEditClick = buildCallback(onEditClicked);
  const handleDetailClick = buildCallback(onDetailClicked);
  const handleCheckInClick = buildCallback(onCheckInClick);
  const handleLocationEditClick = buildCallback(onLocationEditClick);
  const handleFileUpload = buildCallback(onFileUpload);

  const darkMode = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)').matches, []);

  const color = useMemo(() => {
    if (hidden) return 'transparent';
    if (stop.status === StopStatus.UPCOMING) return 'gray';
    if (stop.status === StopStatus.ACTIVE) return 'lightblue';

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
  }, [stop.type, darkMode, hidden]);
  
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

        <SmallButton className='ml-5' onClick={handleLocationEditClick}>
          <Icon icon='crosshair' />
        </SmallButton>

        <SmallButton className='ml-5' onClick={handleFileUpload}>
          <Icon icon='upload' />
        </SmallButton>

        {stop.status !== StopStatus.ACTIVE && <SmallButton className='ml-5' onClick={handleCheckInClick}>
          <Icon icon='check' />
        </SmallButton>}
      </div>
    </Popup>
  </FeatherMarker>;
}
