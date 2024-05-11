import { AttachmentDTO } from '@api/features/stops/dto/attachment.dto.js';
import { StopDetailDTO } from '@api/features/stops/dto/stop.dto.js';
import type { Serialized } from '@common/serialized.js';
import { useEffect } from 'react';
import { StyledModal } from '@ui/utils/modals.js';
import { useAsyncHttp } from '@ui/utils/useAsync.js';

export interface ViewStopAttachmentsProps {
  stopId: number;
  onClose: () => void;
}

export const ViewStopDetails = ({ stopId, onClose }: ViewStopAttachmentsProps) => {
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

  return (
    <StyledModal onClose={onClose} title={stop?.name ?? 'Loading...'} cancelText='Close'>
      <div className="ql-snow mt-6">
        <div className="ql-editor">
          <div dangerouslySetInnerHTML={{ __html: stop?.notes ?? '' }}></div>
        </div>
      </div>
      {/* <div className='mt-6 ql-snow ql-editor' dangerouslySetInnerHTML={{ __html: stop?.notes ?? '' }}></div> */}
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