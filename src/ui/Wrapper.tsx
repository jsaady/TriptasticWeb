

interface WrapperProps extends React.PropsWithChildren {
  showGradient?: boolean;
}


// convert wrapper to tailwind
export const Wrapper = ({ children, showGradient = false }: WrapperProps) => (
  <div className={`dark:bg-neutral-900 dark:text-white h-screen w-screen ${showGradient ? 'bg-gradient-to-r from-red-800 to-blue-800' : ''}`}>
    {children}
  </div>
);