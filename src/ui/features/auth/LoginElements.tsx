import { PropsWithChildren } from 'react';

export const LoginForm = ({ children, ...rest }: React.HTMLProps<HTMLFormElement>) => (
  <form className="w-full flex flex-wrap items-center justify-center" {...rest}>{children}</form>
);

export const LoginFormSeparator = () => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-neutral-300 dark:border-darkblack-400"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="bg-white dark:bg-darkblack-500 px-2 text-base text-bneutral-600">Or</span>
    </div>
  </div>
);

export const LogoutLink = ({ children, className, ...rest }: PropsWithChildren<React.HTMLProps<HTMLElement>>) => (
  <a {...rest as any} className={`${className ?? ''} mt-2 cursor-pointer text-blue-400`}>{children}</a>
);

export const LoginHeading = ({ children, ...rest }: PropsWithChildren<React.HTMLProps<HTMLElement>>) => (
  <h3 className="text-2xl m-4 text-center" {...rest as any}>{children}</h3>
);

export const ErrorText = ({ children }: React.PropsWithChildren) => (
  <p className="text-red-500 bg-red-100 p-4">{children}</p>
);
