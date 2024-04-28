export const Button = (props: React.HTMLProps<HTMLButtonElement>) => (
  <button {...(props as any)} className={`${props.className ?? ''} rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}>{props.children}</button>
)
export const SmallButton = (props: React.HTMLProps<HTMLButtonElement>) => (
  <button {...(props as any)} className={`${props.className ?? ''} rounded-md bg-indigo-600 px-2.5 py-1.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}>{props.children}</button>
)
export const PrimaryButton = (props: React.HTMLProps<HTMLButtonElement>) => (
  <Button {...props} className={`${props.className ?? ''} bg-blue-600 hover:bg-blue-500`}>{props.children}</Button>
);

export const SecondaryButton = (props: React.HTMLProps<HTMLButtonElement>) => (
  <Button {...props} className={`${props.className ?? ''} bg-gray-600 hover:bg-gray-500`}>{props.children}</Button>
);

export const LinkButton = (props: React.HTMLProps<HTMLButtonElement>) => (
  <Button {...props} className={`${props.className ?? ''} bg-transparent underline`}>{props.children}</Button>
);
