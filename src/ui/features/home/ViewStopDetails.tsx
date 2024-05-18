import { AttachmentDTO } from '@api/features/stops/dto/attachment.dto.js';
import { StopDetailDTO } from '@api/features/stops/dto/stop.dto.js';
import { useEffect, useMemo } from 'react';
import { StyledModal } from '@ui/utils/modals.js';
import { useAsyncHttp } from '@ui/utils/useAsync.js';
import { Serialized } from '../../../common/serialized.js';
import { StopStatus } from '@api/features/stops/entities/stopStatus.enum.js';
import { useStops } from './StopsContext.js';
import { useNavigate } from 'react-router';

export interface ViewStopAttachmentsProps {
  stopId: number;
  showViewMapButton?: boolean;
  onClose: () => void;
}

export const ViewStopDetails = ({ stopId, showViewMapButton, onClose }: ViewStopAttachmentsProps) => {
  const { setFocusedStopId } = useStops();
  const navigate = useNavigate();

  const [fetchAttachments, { result }] = useAsyncHttp(async ({ get }) => {
    return await get<Serialized<AttachmentDTO[]>>(`/api/stops/${stopId}/attachments`);
  }, [stopId]);

  const [fetchStop, { result: stop }] = useAsyncHttp(async ({ get }) => {
    return await get<Serialized<StopDetailDTO>>(`/api/stops/${stopId}`);
  }, [stopId]);

  useEffect(() => {
    fetchAttachments();
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
        {result?.map((attachment) => (
          <li key={attachment.id}>
            {attachment.mimeType.startsWith('image') && <img src={`/api/attachments/${attachment.id}`} alt={attachment.fileName} />}
            {attachment.mimeType.startsWith('video') && <video src={`/api/attachments/${attachment.id}`} />}
            {/* <a href={`/api/attachments/${attachment.id}`}>{attachment.fileName}</a> */}
          </li>
        ))}
      </ul>
    </StyledModal>
  );
};