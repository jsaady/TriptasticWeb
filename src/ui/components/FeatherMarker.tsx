import { icons } from 'feather-icons';
import { Icon as LeafletIcon } from 'leaflet';
import { Marker, MarkerProps } from 'react-leaflet';
import { FeatherIcon } from './Icon.js';

export const FeatherMarker = ({ name, color = 'black', fill = 'rgba(0, 0, 0, 0)', ...rest }: { name: FeatherIcon; color?: string; fill?: string; className?: string; } & MarkerProps) => {
  const icon = new LeafletIcon({
    iconUrl: `data:image/svg+xml;base64,${btoa(icons[name].toSvg({ stroke: color, fill }))}`,
    iconSize: [30, 30],
    className: rest.className ?? '',
  });
  return <Marker icon={icon} {...rest}>
    {rest.children}
  </Marker>;
};
