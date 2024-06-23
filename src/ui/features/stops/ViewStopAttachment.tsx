import { Button } from '@ui/components/Button.js';
import { Icon } from '@ui/components/Icon.js';
import { useParams } from 'react-router';

export const ViewStopAttachment = () => {
  const { id } = useParams();

  return <>
    <Button className='cursor-pointer z-9999 absolute left-2 top-2 animate-pulse-5'>
      <Icon height={36} width={36} icon='chevron-left' fill='transparent' onClick={() => window.close()} />
    </Button>
    <img src={'/api/attachments/' + id} />
  </>;
}