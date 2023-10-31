import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/Button.js';
import { Icon } from '../../components/Icon.js';
import { Textarea } from '../../components/Textarea.js';
import { useForm } from '../../utils/forms.js';
import { useAsyncHttp } from '../../utils/useAsync.js';
import { useSocket } from '../../utils/useSocket.js';
import AudioRecorder from './Recorder.js';

export const Notes = () => {
  const [note$] = useSocket('notes:updated');
  const [chatToken$] = useSocket('chatbot:new_token');

  const [fetch, notes$] = useAsyncHttp((http) => http.get<{ note: string; id: number; hasEmbeddings: boolean; }[]>('/api/notes'), []);
  const [search, searchNotes$] = useAsyncHttp((http, note: string) => http.post<[number, number][]>('/api/notes/search', { note, socketId: chatToken$.id }), []);
  const [createNote, createNote$] = useAsyncHttp((http, note: { note: string; }) => http.post<{ note: string; id: number; }>('/api/notes', note), []);
  const ids = useMemo(() => {
    const distanceMap = new Map<number, [number, string]>();

    let min = 0, max = 0;

    for (const [_, distance] of searchNotes$.result ?? []) {
      if (!min || distance < min) {
        min = distance;
      }

      if (!max || distance > max) {
        max = distance;
      }
    }

    const range = max - min;

    for (const [id, distance] of searchNotes$.result ?? []) {
      const cleanDistance = Math.round(10 * (max - distance) / range) * 100;
      let shade = 'bg-neutral-900';
      if (cleanDistance >= 700) {
        shade = 'bg-neutral-700'
      } else if (cleanDistance > 200) {
        shade = 'bg-neutral-800';
      }

      distanceMap.set(id, [distance, shade]);
    }

    console.log(distanceMap, min, max);
    return distanceMap;
  }, [searchNotes$]);

  const allNotes = useMemo(() => {
    return notes$.result?.sort((a, b) => {
      const aInResults = ids.has(a.id);
      const bInResults = ids.has(b.id);

      if (aInResults !== bInResults) {
        return aInResults ? -1 : 1;
      } else if (aInResults && bInResults) {
        const [aDistance] = ids.get(a.id)!;
        const [bDistance] = ids.get(b.id)!;
        return aDistance > bDistance ?
          1 : -1;
      }

      return a.id > b.id ? -1 : 1
    }) ?? [];
  }, [ids, notes$.result]);

  const [chatResponse, setChatResponse] = useState('');

  useEffect(() => {
    setChatResponse(resp => {
      const newMessage = resp + (chatToken$.data ?? '');

      return newMessage;
    });
  }, [chatToken$.data]);


  useEffect(() => {
    fetch()
  }, [createNote$.result, note$.messageTs]);


  const {register, registerForm, setValue, state} = useForm({
    note: ''
  });

  useEffect(() => {
    search(state.note);
  }, [state.note]);

  const doCreate = useCallback((props: { note: string; }) => {
    createNote(props);
    setValue('note', '');
  }, [createNote]);

  const doSearch = useCallback(() => {
    setChatResponse('');
    return search(state.note);
  }, [search, state.note]);

  const onRecorderText = useCallback((newText: string) => {
    setValue('note', newText);
  }, [setValue]);

  return <div className='flex flex-col w-full'>
    {allNotes.length > 0 ? <div className="flex max-h-[25em] my-4 shadow-md border p-2 dark:border-neutral-700 flex-col overflow-scroll">
      {notes$.loading && <Icon icon='circle' className='animate-ping self-end mr-[-1.5rem] mt-[-1.5rem] z-10 text-xl' />}
      {allNotes.map(({ id, note, hasEmbeddings }) => <div key={id} className={`flex items-center border-b p-2 dark:border-neutral-700 last:border-none ${ids.has(id) ? ids.get(id)![1] : ''}`}>
        <p className={(ids.has(id) ? 'font-bold' : 'font-light')}>
          #{id}: {note}
        </p>
        <Icon className={`ml-2 ${hasEmbeddings ? "text-green-500" : 'text-yellow-500'}`} icon={hasEmbeddings ? 'check-circle' : 'help-circle'} />
      </div>)}
    </div> : <p className='my-4'>
      You have not entered any notes, Enter a note and save using the + below
    </p>}
    {chatResponse && <div className="flex max-h-[25em] my-4 shadow-md border p-2 dark:border-neutral-700 flex-col">
      <Icon icon='loader' className='self-end mr-[-1.5rem] mt-[-1.5rem] z-10 text-xl' />
      {chatResponse}
    </div>}
    <form className="flex" {...registerForm(doCreate)}>
      <Textarea disabled={createNote$.loading} {...register('note')} />
      <div>
        <Button type='button' className='mr-4 bg-transparent border border-x-0 border-t-0 rounded-none border-b-neutral-500 dark:border-neutral-500' disabled={searchNotes$.loading} onClick={doSearch}>
          <Icon icon={searchNotes$.loading ? 'circle' : 'search'} className={'text-black dark:text-white font-weight-900 text-xl ' + (searchNotes$.loading ? 'animate-ping' : '')} />
        </Button>
        <Button type="submit" className='bg-transparent rounded-none '>
          <Icon icon='plus' className='text-black font-weight-900 text-2xl dark:text-white ' />
        </Button>
      </div>
    </form>
    <AudioRecorder onNewText={onRecorderText} />
  </div>
};
