export const Spinner = ({ active }: { active: boolean }) => {
  return (
    <div className={`spinner w-full h-[2px] animate-pulse ${!active ? 'bg-transparent' : 'bg-blue-700'}`} />
  );
};
