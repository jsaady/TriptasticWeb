import feather from 'feather-icons';
import { useMemo } from 'react';

export type FeatherIcon = keyof typeof feather.icons;

export interface IconProps {
  height?: number;
  width?: number;
  icon: FeatherIcon;
  onClick?: () => void;
  className?: string;
  strokeWidth?: number;
  stroke?: string;
  fill?: string;
}


export const Icon = ({ icon, className, height = 24, width = 24, strokeWidth = 2, stroke = 'white', fill, onClick }: IconProps) => {
  const featherIcon = feather.icons[icon];

  const mappedAttrs = useMemo(() => {
    const newAttrs = {
      ...featherIcon.attrs,
      className: featherIcon.attrs['class'],
      strokeLinejoin: featherIcon.attrs['stroke-linejoin'] as any,
      strokeLinecap: featherIcon.attrs['stroke-linecap'] as any,
      strokeWidth: strokeWidth ?? featherIcon.attrs['stroke-width'] as any,
    };

    delete (newAttrs as any)['class'];
    delete (newAttrs as any)['stroke-linejoin'];
    delete (newAttrs as any)['stroke-linecap'];
    delete (newAttrs as any)['stroke-width'];

    return newAttrs;
  }, [featherIcon.attrs]);

  return <svg
    {...mappedAttrs}
    onClick={onClick}
    className={className}
    height={height}
    width={width}
    strokeWidth={strokeWidth}
    stroke={stroke}
    fill={fill}
    data-icon-name={icon}
    dangerouslySetInnerHTML={{ __html: featherIcon.contents}} />
};
