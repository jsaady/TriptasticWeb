interface BaseTableColumnProps<T> {
  name: string;
  column: string & keyof T;
}

export interface TableColumnPropsWithChildren<T> extends BaseTableColumnProps<T> {
  children?: (row: T) => React.ReactNode | React.ReactNode[];
}

export interface TableColumnPropsWithClick<T> extends BaseTableColumnProps<T> {
  onClick?: () => void;
}


export type TableColumnProps<T> = TableColumnPropsWithChildren<T> | TableColumnPropsWithClick<T>;

export const TableColumn = <T,>(_: TableColumnProps<T>) => {
  return null;
}
