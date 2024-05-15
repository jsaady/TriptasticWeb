import { icons } from 'feather-icons';
import { Icon as LeafletIcon } from 'leaflet';
import { Marker, MarkerProps } from 'react-leaflet';
import { FeatherIcon } from './Icon.js';
import { useMemo } from 'react';

export const FeatherMarker = ({ name, color, fill = 'rgba(0, 0, 0, 0)', size = 30, ...rest }: { name: FeatherIcon; color?: string; fill?: string; className?: string; size?: number; } & MarkerProps) => {
  const darkMode = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)').matches, []);

  if (color === undefined) {
    color = darkMode ? 'white' : 'black';
  }

  const icon = new LeafletIcon({
    iconUrl: `data:image/svg+xml;base64,${btoa(icons[name].toSvg({ stroke: color, fill }))}`,
    iconSize: [size, size],
    className: rest.className ?? '',
  });

  return <Marker icon={icon} {...rest}>
    {rest.children}
  </Marker>;
};
