

import * as React from 'react';
import styles from './table.module.scss';


type TableProps = React.ComponentProps<'table'> & {
  type?: string;
  className?: string;
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ type, className, ...props }, ref) => (
    <div className={styles[type]}>
      <table
        ref={ref}
        className={[styles.table, className].filter(Boolean).join(' ')}
        data-slot="table"
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<'thead'>>(
  (props, ref) => (
    <thead
      ref={ref}
      className={styles.tableHeader}
      data-slot="table-header"
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<'tbody'>>(
  (props, ref) => (
    <tbody
      ref={ref}
      className={styles.tableBody}
      data-slot="table-body"
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<'tfoot'>>(
  (props, ref) => (
    <tfoot
      ref={ref}
      className={styles.tableFooter}
      data-slot="table-footer"
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.ComponentProps<'tr'>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={[styles.tableRow, className].filter(Boolean).join(' ')}
      data-slot="table-row"
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ComponentProps<'th'>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={[styles.tableHead, className].filter(Boolean).join(' ')}
      data-slot="table-head"
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.ComponentProps<'td'>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={[styles.tableCell, className].filter(Boolean).join(' ')}
      data-slot="table-cell"
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLElement, React.ComponentProps<'caption'>>(
  (props, ref) => (
    <caption
      ref={ref as any}
      className={styles.tableCaption}
      data-slot="table-caption"
      {...props}
    />
  )
);
TableCaption.displayName = 'TableCaption';


//
// [사용 예시]
//
// import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
//
// <Table>
//   <TableHeader>
//     <TableRow>
//       <TableHead>제목</TableHead>
//       <TableHead>내용</TableHead>
//     </TableRow>
//   </TableHeader>
//   <TableBody>
//     <TableRow>
//       <TableCell>1</TableCell>
//       <TableCell>테스트</TableCell>
//     </TableRow>
//   </TableBody>
// </Table>

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
