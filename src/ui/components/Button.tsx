import { forwardRef } from 'react';

const BaseButton = forwardRef((props: React.HTMLProps<HTMLButtonElement>, ref) => (
  <button ref={ref} {...(props as any)} className={`${props.className ?? ''} rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}>{props.children}</button>
));
export const SmallButton = forwardRef((props: React.HTMLProps<HTMLButtonElement>, ref) => (
  <button ref={ref} {...(props as any)} className={`rounded-md bg-indigo-600 px-2.5 py-1.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${props.className ?? ''} disabled:bg-indigo-300`}>{props.children}</button>
));
export const PrimaryButton = forwardRef((props: React.HTMLProps<HTMLButtonElement>, ref) => (
  <BaseButton ref={ref as any} {...props} className={`${props.className ?? ''} bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600 disabled:bg-indigo-300`}>{props.children}</BaseButton>
));

export const SecondaryButton = forwardRef((props: React.HTMLProps<HTMLButtonElement>, ref) => (
  <BaseButton ref={ref as any} {...props} className={`${props.className ?? ''} bg-gray-600 hover:bg-gray-500 focus-visible:outline-gray-600 disabled:bg-gray-300`}>{props.children}</BaseButton>
));

export const LinkButton = forwardRef((props: React.HTMLProps<HTMLButtonElement>, ref) => (
  <BaseButton ref={ref as any} {...props} className={`${props.className ?? ''} bg-transparent underline`}>{props.children}</BaseButton>
));

export const Button = PrimaryButton;
