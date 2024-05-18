import { forwardRef } from 'react';

export const Button = forwardRef((props: React.HTMLProps<HTMLButtonElement>, ref) => (
  <button ref={ref} {...(props as any)} className={`${props.className ?? ''} rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300`}>{props.children}</button>
))
export const SmallButton = forwardRef((props: React.HTMLProps<HTMLButtonElement>, ref) => (
  <button ref={ref} {...(props as any)} className={`rounded-md bg-indigo-600 px-2.5 py-1.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${props.className ?? ''} disabled:bg-indigo-300`}>{props.children}</button>
))
export const PrimaryButton = forwardRef((props: React.HTMLProps<HTMLButtonElement>, ref) => (
  <Button ref={ref as any} {...props} className={`${props.className ?? ''} bg-blue-600 hover:bg-blue-500`}>{props.children}</Button>
));

export const SecondaryButton = forwardRef((props: React.HTMLProps<HTMLButtonElement>, ref) => (
  <Button ref={ref as any} {...props} className={`${props.className ?? ''} bg-gray-600 hover:bg-gray-500`}>{props.children}</Button>
));

export const LinkButton = forwardRef((props: React.HTMLProps<HTMLButtonElement>, ref) => (
  <Button ref={ref as any} {...props} className={`${props.className ?? ''} bg-transparent underline`}>{props.children}</Button>
));
