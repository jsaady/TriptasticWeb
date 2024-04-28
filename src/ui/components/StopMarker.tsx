import { Popup } from 'react-leaflet';
import { Stop } from '../features/home/StopsContext.js';
import { SmallButton } from './Button.js';
import { FeatherMarker } from './FeatherMarker.js';
import { Icon } from './Icon.js';


export interface StopMarkerProps {
  stop: Stop;
  onDeleteClicked: () => void;
}
export function StopMarker ({ stop, onDeleteClicked }: StopMarkerProps) {
  return <FeatherMarker name='map-pin' position={stop.location}>
    <Popup>
      <h2>{stop.name}</h2>
      <p>{stop.notes}</p>
      <SmallButton className='ml-5' onClick={onDeleteClicked}>
        <Icon icon='trash' />
      </SmallButton>
    </Popup>
  </FeatherMarker>;
}
