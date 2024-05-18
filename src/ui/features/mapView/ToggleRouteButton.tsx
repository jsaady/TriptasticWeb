import { SmallButton } from '@ui/components/Button.js';
import { Icon } from '@ui/components/Icon.js';

interface ToggleRouteButtonProps {
  toggled: boolean;
  onClick: () => void;
}
export const ToggleRouteButton = ({ toggled, onClick }: ToggleRouteButtonProps) => {
  return (
    <SmallButton className='absolute top-24 z-[1000] px-2 ml-80 mt-0.5 md:ml-96' onClick={onClick}>
      <Icon icon='git-commit' />
      {toggled && <Icon className='mt-[-1.5rem]' icon='slash' fill='transparent' />}
    </SmallButton>
  );
};
