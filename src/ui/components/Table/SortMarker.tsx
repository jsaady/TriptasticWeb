export const SortMarker = ({ direction }: { direction?: 'asc' | 'dsc' }) => {
  return (
    <div className="inline-block pl-2">
      {direction && (direction === 'asc' ? '▲' : '▼')}
    </div>
  );
};