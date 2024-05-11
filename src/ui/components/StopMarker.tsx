import { Popup } from 'react-leaflet';
import { SmallButton } from './Button.js';
import { FeatherMarker } from './FeatherMarker.js';
import { Icon } from './Icon.js';
import { useMemo } from 'react';
import { stopOptions } from '../features/home/stopOptions.js';
import { StopType } from '@api/features/stops/entities/stopType.enum.js';
import { StopListDTO } from '@api/features/stops/dto/stop.dto.js';
import { LatLng } from 'leaflet';

export interface StopMarkerProps {
  stop: StopListDTO;
  onDeleteClicked: () => void;
  onDetailClicked: () => void;
  onEditClicked: () => void;
}
export function StopMarker ({ stop, onDeleteClicked, onEditClicked, onDetailClicked }: StopMarkerProps) {
  const { icon, label } = useMemo(() => {
    return stopOptions.find(option => option.value === stop.type) ?? stopOptions[0];
  }, [stop.type]);

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

  return <FeatherMarker name={icon} title={label} position={location} color={color} className='dark:text-white text-black'>
    <Popup>
      <h2 className='text-lg font-bold'>
        {stop.name}
      </h2>
      <hr className='my-2' />
      <div className='mt-2'>
        <SmallButton className='ml-5' onClick={onDeleteClicked}>
          <Icon icon='trash' />
        </SmallButton>

        <SmallButton className='ml-5' onClick={onEditClicked}>
          <Icon icon='edit' />
        </SmallButton>

        <SmallButton className='ml-5' onClick={onDetailClicked}>
          <Icon icon='info' />
        </SmallButton>
      </div>
    </Popup>
  </FeatherMarker>;
}
