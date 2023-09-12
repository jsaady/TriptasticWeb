
export const ErrorBanner = ({ children }: React.PropsWithChildren) => (
  <p className="text-red-500 bg-red-100 p-2 dark:bg-neutral-700 dark:text-red-500 self-start justify-self-start">{children}</p>
);


export const SuccessBanner = ({ children }: React.PropsWithChildren) => (
  <p className="text-green-700 bg-green-100 p-2 dark:bg-neutral-700 dark:text-green-600 self-start justify-self-start">{children}</p>
);

