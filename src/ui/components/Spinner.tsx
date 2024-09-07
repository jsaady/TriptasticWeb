export const Spinner = ({ active, progress }: { active: boolean; progress?: number | null; }) => {
  progress = progress ?? 100;
  progress = progress > 100 ? 100 : progress;
  return (
    <div className={`spinner w-full h-[2px] transition-all animate-pulse ${!active ? 'bg-transparent' : 'bg-blue-700'}`} style={{ width: `${progress}%` }} />
  );
};
