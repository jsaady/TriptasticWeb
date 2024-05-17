import { SortMarker } from './SortMarker.js';

export interface ColumnHeaderProps extends React.HTMLAttributes<HTMLTableCellElement> {
  onClick: () => void;
  direction: 'asc' | 'dsc' | undefined;
}

export const ColumnHeader = ({ children, onClick, direction, ...rest }: ColumnHeaderProps) => {
  return <th onClick={onClick} {...rest}>
    <div className='flex space-between'>
      {children}
      <SortMarker direction={direction} />
    </div>
  </th>;
};
