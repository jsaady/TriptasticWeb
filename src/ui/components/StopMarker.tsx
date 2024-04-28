import { Popup } from 'react-leaflet';
import { Stop } from '../features/home/StopsContext.js';
import { SmallButton } from './Button.js';
import { FeatherMarker } from './FeatherMarker.js';
import { Icon } from './Icon.js';


export interface StopMarkerProps {
  stop: Stop;
  onDeleteClicked: () => void;
  onDetailClicked: () => void;
  onEditClicked: () => void;
}
export function StopMarker ({ stop, onDeleteClicked, onEditClicked, onDetailClicked }: StopMarkerProps) {
  return <FeatherMarker name='map-pin' position={stop.location}>
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
