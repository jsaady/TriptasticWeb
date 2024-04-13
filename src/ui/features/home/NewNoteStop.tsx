import { useCallback } from 'react';
import { Button } from '../../components/Button.js';
import { Input } from '../../components/Input.js';
import { useForm } from '../../utils/forms.js';
import { Modal, StyledModal } from '../../utils/modals.js';
import { Stop, useStops } from './StopsContext.js';
import { LatLng } from 'leaflet';

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
      id: Math.random().toString(36).substring(7),
      name: data.name,
      notes: data.notes,
      photos: [],
      location: latlng,
      createdAt: Date.now(),
    });
    close();
  }, [addStop, close]);

  return (
    <StyledModal onClose={close}>
      <form {...registerForm(submit)}>
        <div>
          <Input {...register('name')} />
        </div>
        <Button className="w-full my-6" type="submit">
          Save
        </Button>

        <Button onClick={close}>
          Close
        </Button>
      </form>
    </StyledModal>
  );
};