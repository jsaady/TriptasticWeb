// import 'quill/dist/quill.snow.css';

import { HTMLProps, forwardRef, useEffect, useState } from 'react';
import { FormItemProps } from '../utils/forms.js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
type OtherProps = Omit<HTMLProps<HTMLDivElement>, keyof FormItemProps|'children'>;
export type RichTextareaProps = OtherProps & FormItemProps;

export const RichTextarea = forwardRef(({
  name,
  onChange,
  className,
  value: externalValue,
  defaultValue,
}: RichTextareaProps, ref: any) => {
  const [value, setValue] = useState(externalValue ?? defaultValue ?? '');

  useEffect(() => {
    setValue(externalValue ?? value);
  }, [externalValue]);

  const handleChange = (value: string) => {
    setValue(value);

    onChange({ target: { value, name } });
  };

  return <ReactQuill
    theme='snow'
    className={className}
    value={value}
    onChange={handleChange}
    ref={ref ?? undefined} />
});
