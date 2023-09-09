import { PropsWithChildren } from 'react';

export const LoginWrapperEl = ({ children }: React.PropsWithChildren) => (
  <div className="flex flex-wrap justify-center max-w-640px mx-auto p-4 items-center bg-white mt-40">
    {children}
  </div>
);


export const LoginFormEl = ({ children }: React.PropsWithChildren) => (
  <form className="w-full flex flex-col">{children}</form>
);

export const LoginLabelEl = ({ children, hidden }: {hidden: boolean}&React.PropsWithChildren) => (
  <label className="w-90% text-left" hidden={hidden}>{children}</label>
);


export const LoginInputEl = ({ hidden }: {hidden: boolean}) => (
  <input className="bg-gray-200 border-none h-8 w-90% rounded-md text-gray-800 font-bold text-lg" hidden={hidden} />
);

export const LoginFormSeparator = () => (
  <hr className="w-90%" />
);

export const LoginButtonEl = ({children, ...rest}: PropsWithChildren<React.HTMLProps<HTMLButtonElement>>) => (
  <button className="h-8 w-32 bg-gray-300 border-none rounded-md text-gray-800 font-bold text-lg" {...(rest as any)}>{children}</button>
);
export const LoginLink = ({children, ...rest}: PropsWithChildren<React.HTMLProps<HTMLElement>>) => (
  <a className="ml-auto cursor-pointer" {...rest as any}>{children}</a>
);

export const LoginHeading = ({children, ...rest}: PropsWithChildren<React.HTMLProps<HTMLElement>>) => (
  <h3 className="text-2xl font-bold" {...rest as any}>{children}</h3>
);

export const ErrorText = ({ children }: React.PropsWithChildren) => (
  <p className="text-red-500 bg-red-100 p-4">{children}</p>
);
