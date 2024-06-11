import { StopDetailDTO, UpdateStopDTO } from '@api/features/stops/dto/stop.dto.js';
import { StopType } from '@api/features/stops/entities/stopType.enum.js';
import { ButtonSelect } from '@ui/components/ButtonSelect.js';
import { Input } from '@ui/components/Input.js';
import { RichTextarea } from '@ui/components/RichTextarea.js';
import { useForm } from '@ui/utils/forms.js';
import { StyledModal } from '@ui/utils/modals.js';
import { useAsyncHttp } from '@ui/utils/useAsync.js';
import { useCallback, useEffect } from 'react';
import { stopOptions } from './stopOptions.js';
import { StopStatus } from '@api/features/stops/entities/stopStatus.enum.js';

export interface EditNoteStopProps {
  close: () => void;
  saveStop: (stop: UpdateStopDTO, attachments?: FileList) => void;
  latitude: number;
  longitude: number;
  initialName?: string;
  existingStop?: UpdateStopDTO;
}

export const EditNoteStop = ({ close, saveStop, latitude, longitude, initialName = '', existingStop }: EditNoteStopProps) => {
  const { register, registerForm, state } = useForm({
    name: existingStop?.name ?? initialName,
    notes: existingStop?.notes ?? '',
    attachments: null as any as FileList,
    type: existingStop?.type ?? StopType.NATIONAL_PARK,
    desiredArrivalDate: existingStop?.desiredArrivalDate ?? new Date(),
    actualArrivalDate: existingStop?.actualArrivalDate ?? null,
    sortOrder: existingStop?.sortOrder ?? 0,
  });

  const submit = useCallback((data: typeof state) => {
    const desiredArrivalDate = new Date(data.desiredArrivalDate);
    const actualArrivalDate = data.actualArrivalDate ? new Date(data.actualArrivalDate) : null;
    saveStop({
      id: existingStop?.id ?? Math.random() * -100000,
      name: data.name,
      notes: data.notes,
      latitude,
      longitude,
      type: data.type,
      status: existingStop?.status ?? StopStatus.UPCOMING,
      desiredArrivalDate: desiredArrivalDate,
      actualArrivalDate: actualArrivalDate ?? desiredArrivalDate ?? new Date(),
      sortOrder: data.sortOrder,
    }, data.attachments);

    close();
  }, [saveStop, close]);

  const handleSubmitClick = useCallback(() => {
    const submitState = existingStop ? { ...existingStop, ...state } : state;
    submit(submitState);
  }, [submit, state]);


  return (
    <StyledModal
      onClose={close}
      primaryButtonText='Save'
      onPrimaryClick={handleSubmitClick}
      title='New stop'
      cancelText='Cancel'>
      <form {...registerForm(submit)}>
        <fieldset>
          <div className='pb-4'>
            <label className='font-bold mb-1 block' htmlFor='type'>Type</label>
            <ButtonSelect {...register('type')} options={stopOptions} className='flex justify-between w-[75%]' />
          </div>
          <div className='pb-4'>
            <label className='font-bold mb-1 block' htmlFor='name'>Name</label>
            <Input {...register('name')} />
          </div>
          <div className='pb-4'>
            <label className='font-bold mb-1 block' htmlFor='name'>Arrival Date</label>
            <Input {...register('desiredArrivalDate')} type='date' />
          </div>
          <div className='pb-4'>
            <label className='font-bold mb-1 block' htmlFor='name'>Sort Order (for multiple stops per day)</label>
            <Input {...register('sortOrder')} type='number' />
          </div>

          {existingStop && <div className='pb-4'>
            <label className='font-bold mb-1 block' htmlFor='name'>Actual Arrival Date</label>
            <Input {...register('actualArrivalDate')} type='date' />
          </div>}

          <div className='pb-4'>
            <label className='font-bold mb-1 block' htmlFor='notes'>Notes</label>
            <RichTextarea {...register('notes')} />
          </div>

          {!existingStop && <div>
            <label className='font-bold mb-1 block' htmlFor='photos'>Photos & Videos</label>
            <Input {...register('attachments')} type='file' multiple accept='image/*' />
          </div>}
        </fieldset>
      </form>
    </StyledModal>
  );
};