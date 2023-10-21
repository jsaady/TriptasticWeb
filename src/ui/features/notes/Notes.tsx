import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button.js';
import { Icon } from '../../components/Icon.js';
import { Textarea } from '../../components/Textarea.js';
import { useForm } from '../../utils/forms.js';
import { useAsyncHttp } from '../../utils/useAsync.js';
import { useSocket } from '../../utils/useSocket.js';

export const Notes = () => {
  const [note$] = useSocket('notes:updated');
  const [chatToken$] = useSocket('chatbot:new_token');

  const [fetch, notes$] = useAsyncHttp((http) => http.get<{ note: string; id: number; hasEmbeddings: boolean; }[]>('/api/notes'), []);
  const [search, searchNotes$] = useAsyncHttp((http, note: string) => http.post<number[]>('/api/notes/search', { note, socketId: chatToken$.id }), []);
  const [createNote, createNote$] = useAsyncHttp((http, note: { note: string; }) => http.post<{ note: string; id: number; }>('/api/notes', note), []);

  const [chatResponse, setChatResponse] = useState('');

  useEffect(() => {
    console.log('Appending ', chatToken$.data);
    setChatResponse(resp => {
      const newMessage = resp + (chatToken$.data ?? '');

      return newMessage;
    });
  }, [chatToken$.data]);


  useEffect(() => {
    fetch()
  }, [createNote$.result, note$.messageTs]);

  const ids = useMemo(() => new Set(searchNotes$.result ?? []), [searchNotes$]);

  const {register, registerForm, setValue, state} = useForm({
    note: ''
  });

  const doCreate = useCallback((props: { note: string; }) => {
    createNote(props);
    setValue('note', '');
  }, [createNote]);

  const doSearch = useCallback(() => {
    setChatResponse('');
    return search(state.note);
  }, [search, state.note]);

  return <div className='flex flex-col w-full'>
    {notes$.result?.length > 0 ? <div className="flex max-h-[25em] my-4 shadow-md border p-2 dark:border-neutral-700 flex-col overflow-scroll">
      {notes$.loading && <Icon icon='circle' className='animate-ping self-end mr-[-1.5rem] mt-[-1.5rem] z-10 text-xl' />}
      {notes$.result?.map(({ id, note, hasEmbeddings }) => <div  key={id} className={`flex items-center border-b p-2 dark:border-neutral-700 last:border-none ${ids.has(id) ? 'bg-neutral-500' : ''}`}>
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
  </div>
};
