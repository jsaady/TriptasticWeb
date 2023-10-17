import { useCallback, useEffect, useMemo } from 'react';
import { Icon } from '../../components/Icon.js';
import { useAsyncHttp } from '../../utils/useAsync.js';
import { Textarea } from '../../components/Textarea.js';
import { useForm } from '../../utils/forms.js';
import { Button } from '../../components/Button.js';

export const Notes = () => {
  const [fetch, notes$] = useAsyncHttp((http) => http.get<{ note: string; id: number; }[]>('/api/notes'), []);
  const [search, searchNotes$] = useAsyncHttp((http, note: string) => http.post<{ chatResponse: string; ids: number[]; }>('/api/notes/search', { note }), []);
  const [createNote, createNote$] = useAsyncHttp((http, note: { note: string; }) => http.post<{ note: string; id: number; }>('/api/notes', note), []);

  useEffect(() => {
    fetch()
  }, [createNote$.result]);

  const ids = useMemo(() => new Set(searchNotes$.result?.ids ?? []), [searchNotes$]);

  const {register, registerForm, setValue, state} = useForm({
    note: ''
  });

  const doCreate = useCallback((props: { note: string; }) => {
    createNote(props);
    setValue('note', '');
  }, [createNote]);

  const doSearch = useCallback(() => {
    return search(state.note);
  }, [search, state.note]);

  const [resync] = useAsyncHttp(({ post }) => post('/api/notes/sync', {}), []);

  useEffect(() => {searchNotes$.result ?? console.log(searchNotes$.result)}, [searchNotes$]);

  return <div className='flex flex-col'>
    <h1>NOTES</h1>
    {notes$.loading && <Icon icon='circle-half' />}
    <div className="flex max-h-[25em] my-4 shadow-md border p-2 dark:border-neutral-700 flex-col overflow-scroll">
      {notes$.result?.map(({ id, note }) => <p className={'border-b p-2 dark:border-neutral-700 ' + (ids.has(id) ? 'font-bold' : 'font-light')} key={id}>{note}</p>)}
    </div>
    {searchNotes$.result && <div className="flex max-h-[25em] my-4 shadow-md border p-2 dark:border-neutral-700 flex-col overflow-scroll">
      {searchNotes$.result.chatResponse}
    </div>}
    <form {...registerForm(doCreate)}>
      <Textarea disabled={createNote$.loading} {...register('note')} />
      <Button type='button' className='mr-4' onClick={doSearch}>
        Search
      </Button>
      <Button type='button' className='mr-4' onClick={resync}>
        Sync
      </Button>
      <Button type="submit">
        Create
      </Button>
    </form>
  </div>
};
