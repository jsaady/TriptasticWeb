import { LatLng } from 'leaflet';
import { useCallback } from 'react';
import { Button } from '../../components/Button.js';
import { Input } from '../../components/Input.js';
import { useForm } from '../../utils/forms.js';
import { StyledModal } from '../../utils/modals.js';
import { Stop } from './StopsContext.js';
import { Textarea } from '../../components/Textarea.js';

export interface NewNoteStopProps {
  close: () => void;
  addStop: (stop: Stop) => void;
  latlng: LatLng;
  initialName?: string;
}
// TODO: clean up form styling and add close handler
export const NewNoteStop = ({ close, addStop, latlng, initialName = '' }: NewNoteStopProps) => {
  const { register, registerForm, state } = useForm({
    name: initialName,
    notes: '',
  });

  const submit = useCallback((data: typeof state) => {
    addStop({
      id: Math.random() * -100000,
      name: data.name,
      notes: data.notes,
      photos: [],
      location: latlng,
      createdAt: Date.now(),
    });
    close();
  }, [addStop, close]);

  const handleSubmitClick = useCallback(() => {
    submit(state);
  }, [submit, state]);

  return (
    <StyledModal
      onClose={close}
      primaryText='Save'
      onPrimaryClick={handleSubmitClick}
      title='New stop'
      cancelText='Cancel'>
      <form {...registerForm(submit)}>
        <div>
          <label htmlFor='name'>Name</label>
          <Input {...register('name')} />
        </div>
        <div>
          <label htmlFor='notes'>Notes</label>
          <Textarea {...register('notes')} />
        </div>
        <div>
          <label htmlFor='photos'>Photos & Videos</label>
          <Input type='file' multiple />
        </div>
      </form>
    </StyledModal>
  );
};