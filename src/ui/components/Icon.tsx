import feather from 'feather-icons';

export type FeatherIcon = keyof typeof feather.icons;

export interface IconProps {
  height?: number;
  width?: number;
  icon: FeatherIcon;
  className?: string;
  strokeWidth?: number;
}


export const Icon = ({ icon, className, height = 24, width = 24, strokeWidth = 2 }: IconProps) => {
  const featherIcon = feather.icons[icon];

  return <svg
    {...featherIcon.attrs}
    className={className}
    height={height}
    width={width}
    strokeWidth={strokeWidth}
    data-icon-name={icon}
    dangerouslySetInnerHTML={{ __html: featherIcon.contents}} />
};
