// import 'quill/dist/quill.snow.css';

import { Quill } from 'react-quill';
import { HTMLProps, MutableRefObject, forwardRef, useEffect, useRef } from 'react';
import { FormItemProps } from '../utils/forms.js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
type OtherProps = Omit<HTMLProps<HTMLDivElement>, keyof FormItemProps|'children'>;
export type RichTextareaProps = OtherProps & FormItemProps;

export const RichTextarea = forwardRef(({
  name,
  onChange,
  value,
  className,
}: RichTextareaProps, ref: any) => {
  const handleChange = (value: string) => {
    onChange({ target: { value, name } });
  };

  return <ReactQuill
    theme='snow'
    className={className}
    value={value}
    onChange={handleChange}
    ref={ref ?? undefined} />
});
