import { AttachmentDTO } from '@api/features/stops/dto/attachment.dto.js';
import { StopDetailDTO } from '@api/features/stops/dto/stop.dto.js';
import { useEffect, useMemo } from 'react';
import { StyledModal } from '@ui/utils/modals.js';
import { useAsyncHttp } from '@ui/utils/useAsync.js';
import { Serialized } from '../../../common/serialized.js';
import { StopStatus } from '@api/features/stops/entities/stopStatus.enum.js';
import { useStops } from './StopsContext.js';
import { useNavigate } from 'react-router';
import { LinkButton } from '@ui/components/Button.js';
import { Icon } from '@ui/components/Icon.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { UserRole } from '@api/features/users/userRole.enum.js';

export interface ViewStopAttachmentsProps {
  stopId: number;
  showViewMapButton?: boolean;
  onClose: () => void;
}

export const ViewStopDetails = ({ stopId, showViewMapButton, onClose }: ViewStopAttachmentsProps) => {
  const { setFocusedStopId, fetchAttachments, removeAttachment, attachments } = useStops();
  const { me } = useAuthorization();
  const navigate = useNavigate();



  const [fetchStop, { result: stop }] = useAsyncHttp(async ({ get }) => {
    return await get<Serialized<StopDetailDTO>>(`/api/stops/${stopId}`);
  }, [stopId]);

  useEffect(() => {
    fetchAttachments(stopId);
    fetchStop();
  }, [stopId]);

  const handleViewStopOnMap = () => {
    setFocusedStopId(stop?.id ?? null);
    navigate('/map');
  };
  const formattedDesiredArrivalDate = useMemo(() => stop?.desiredArrivalDate ? new Date(stop.desiredArrivalDate).toLocaleDateString() : '', [stop?.desiredArrivalDate]);

  return (
    <StyledModal onClose={onClose} title={stop?.name ?? 'Loading...'} primaryButtonText={showViewMapButton ? 'View on map' : undefined} onPrimaryClick={handleViewStopOnMap} cancelText='Close'>
      <div className='mt-6'>
        <div className='text-sm font-semibold'>Desired Arrival Date: {formattedDesiredArrivalDate}</div>
      </div>
  
      {stop?.status === StopStatus.ACTIVE ? 'Stay tuned for updates!!' : <div className="ql-snow mt-6">
        <div className="ql-editor">
          <div dangerouslySetInnerHTML={{ __html: stop?.notes ?? '' }}></div>
        </div>
      </div>}
      <hr className='mb-6 mt-6' />
      <ul>
        {attachments?.map((attachment) => (
          <li key={attachment.id} className='mb-8'>
            {me?.role === UserRole.ADMIN && <Icon fill='red' height={36} width={36} className='cursor-pointer right-0 ml-auto mr-3 mt-1 mb-[-3em] z-9999 sticky' icon='trash' onClick={() => removeAttachment(stopId, attachment.id)} />}
            {attachment.mimeType.startsWith('image') && (
              <a className='cursor-pointer' onClick={() => window.open('/viewAttachment/' + attachment.id)}>
                <img src={`/api/attachments/thumb/${attachment.id}?w=800`} alt={attachment.fileName} />
              </a>
            )}
            {attachment.mimeType.startsWith('video') && <video src={`/api/attachments/${attachment.id}`} />}
            {/* <a href={`/api/attachments/${attachment.id}`}>{attachment.fileName}</a> */}
          </li>
        ))}
      </ul>
    </StyledModal>
  );
};