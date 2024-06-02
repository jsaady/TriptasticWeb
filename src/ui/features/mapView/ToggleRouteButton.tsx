import { SmallButton } from '@ui/components/Button.js';
import { FeatherIcon, Icon } from '@ui/components/Icon.js';

interface ToggleRouteButtonProps {
  slashThrough: boolean;
  icon: FeatherIcon;
  onClick: () => void;
}
export const FloatingMapButton = ({ slashThrough: toggled, onClick, icon }: ToggleRouteButtonProps) => {
  return (
    <SmallButton className='absolute top-24 z-[1000] px-2 ml-80 mt-0.5 md:ml-96' onClick={onClick}>
      <Icon icon={icon} />
      {toggled && <Icon className='mt-[-1.5rem]' icon='slash' fill='transparent' />}
    </SmallButton>
  );
};
