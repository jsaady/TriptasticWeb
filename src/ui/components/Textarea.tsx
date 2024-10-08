import React, { forwardRef } from 'react';

export type TextAreaProps = Partial<React.HTMLProps<HTMLTextAreaElement>>&{ label?: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, ...props }, ref) => <>
  {label && <label className=" invalid:text-red-500 block text-sm font-semibold leading-6 text-neutral-900 dark:text-white w-full mt-4" hidden={props.hidden}>{label}</label>}
  <textarea ref={ref} className={`rounded-none resize-none invalid:ring-red-500 block w-full border-0 px-3.5 py-2 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-black dark:text-white dark:ring-neutral-600 sm:text-sm sm:leading-6 ${props.className ?? ''} `} {...props} />
</>);
