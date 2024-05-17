import { Key, useCallback, useMemo, useState } from 'react';
import { ColumnHeader, ColumnHeaderProps } from './ColumnHeader.js';
import React from 'react';
import { TableColumn, TableColumnProps } from './TableColumn.js';

export type KeyColumnType<T> = {
  [K in keyof T]: T[K] extends Key ? K : never;
}[keyof T];


export interface TableProps<T> extends React.PropsWithChildren {
  sortEnabled?: boolean;
  initialSortDirection?: 'asc' | 'dsc';
  initialSortColumn?: keyof T;
  keyColumn: KeyColumnType<T>;
  rows: T[];
}

export const Table = <T,>({ initialSortColumn, initialSortDirection, rows, sortEnabled, keyColumn, children }: TableProps<T>) => {
  const [sortColumn, setSortColumn] = useState(initialSortColumn);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const handleSort = useCallback((column: string&keyof T) => {
    setSortDirection((dir) => dir === 'asc' ? 'dsc' : 'asc');
    setSortColumn(column);
  }, []);

  const columns = useMemo(() => React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === TableColumn) {
      const props = child.props as TableColumnProps<T>;

      return {
        name: props.name,
        key: props.column,
        render: 'children' in props && props.children ? props.children : (row: T) => row[props.column]?.toString(),
      };
    }
    return null;
  })?.filter(c => !!c) ?? [], [children]);

  const sortedRows = useMemo(() => sortEnabled && sortColumn ? [...rows].sort((a, b) => {
    const aVal = a[sortColumn]!;
    const bVal = b[sortColumn]!;
    if (aVal === bVal) return 0;
    if (sortDirection === 'asc') {
      return aVal < bVal ? -1 : 1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  }) : rows, [rows, sortColumn, sortDirection]);

  return (
    <div className="dark:bg-neutral-800">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        <thead className='sticky'>
          <tr className=''>
            {columns.map((column) => (
              <ColumnHeader
                key={column.key as string}
                onClick={() => handleSort(column.key)}
                direction={sortColumn === column.key ? sortDirection : undefined}
                className="px-6 py-3 text-left text-md font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400"
              >
                {column.name}
              </ColumnHeader>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-900 dark:divide-neutral-700 h-80 overflow-scroll">
          {sortedRows.map((row) => (
            <tr key={row[keyColumn] as Key}>
              {columns.map((column) => (
                <td
                  key={column.key as string}
                  className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400"
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}