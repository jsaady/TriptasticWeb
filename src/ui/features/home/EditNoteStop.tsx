import { LatLng } from 'leaflet';
import { useCallback, useEffect } from 'react';
import { StopType } from '../../../api/features/stops/entities/stopType.enum.js';
import { ButtonSelect } from '../../components/ButtonSelect.js';
import { Input } from '../../components/Input.js';
import { RichTextarea } from '../../components/RichTextarea.js';
import { useForm } from '../../utils/forms.js';
import { StyledModal } from '../../utils/modals.js';
import { useAsyncHttp } from '../../utils/useAsync.js';
import { Stop } from './StopsContext.js';
import { stopOptions } from './stopOptions.js';

export interface EditNoteStopProps {
  close: () => void;
  saveStop: (stop: Stop) => void;
  latlng: LatLng;
  initialName?: string;
  existingStop?: Stop;
}

export const EditNoteStop = ({ close, saveStop, latlng, initialName = '', existingStop }: EditNoteStopProps) => {
  const [fetchNote, { result, loading }] = useAsyncHttp(async ({ get }) => {
    return await get<Stop>(`/api/stops/${existingStop?.id}`);
  }, [existingStop?.id]);

  const { register, registerForm, state, setValue } = useForm({
    name: existingStop?.name ?? initialName,
    notes: existingStop?.notes ?? '',
    attachments: null as any as FileList,
    type: existingStop?.type ?? StopType.NATIONAL_PARK,
  });

  const submit = useCallback((data: typeof state) => {
    saveStop({
      id: existingStop?.id ?? Math.random() * -100000,
      name: data.name,
      notes: data.notes,
      attachments: existingStop?.attachments ?? data.attachments,
      location: existingStop?.location ?? latlng,
      createdAt: existingStop?.createdAt ?? Date.now(),
      type: data.type,
    });
    close();
  }, [saveStop, close]);

  const handleSubmitClick = useCallback(() => {
    const submitState = existingStop ? { ...existingStop, ...state } : state;
    submit(submitState);
  }, [submit, state]);

  useEffect(() => {
    if (existingStop) {
      fetchNote();
    }
  }, [existingStop]);

  useEffect(() => {
    if (result) {
      setValue('name', result.name);
      setValue('notes', result.notes);
    }
  }, [result]);

  return (
    <StyledModal
      onClose={close}
      primaryText='Save'
      onPrimaryClick={handleSubmitClick}
      title='New stop'
      cancelText='Cancel'>
      <form {...registerForm(submit)}>
        <fieldset disabled={loading}>
          <div>
            <label htmlFor='type'>Type</label>
            <br />
            <ButtonSelect {...register('type')} options={stopOptions} />
          </div>
          <div>
            <label htmlFor='name'>Name</label>
            <Input {...register('name')} />
          </div>
          <div>
            <label htmlFor='notes'>Notes</label>
            <RichTextarea {...register('notes')} />
          </div>
          {!existingStop && <div>
            <label htmlFor='photos'>Photos & Videos</label>
            <Input {...register('attachments')} type='file' multiple accept='image/*,video/*' />
          </div>}
        </fieldset>
      </form>
    </StyledModal>
  );
};