import { forwardRef } from 'react';

export interface InputExtras {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, React.HTMLProps<HTMLInputElement>&InputExtras>((props, ref) => (
  <>
    {props.label && <label className=" invalid:text-red-500 block text-sm font-semibold leading-6 text-neutral-900 dark:text-white w-full mt-4" hidden={props.hidden}>{props.label}</label>}
    <input {...props} ref={ref} className={`invalid:ring-red-500 block w-full rounded-md border-0 px-3.5 py-2 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-black dark:text-white dark:ring-neutral-600 sm:text-sm sm:leading-6 ${props.className ?? ''} `} />
  </>
));
