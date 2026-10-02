import React from 'react';

const AdminRecordCard = ({ item, columns, renderCell, actions }) => {
  const titleColumn = columns[0];
  const statusColumn = columns.includes('paymentStatus') ? 'paymentStatus' : 'status';
  const summaryColumns = columns.filter((column) => ['amount', 'category', 'email', 'date', 'createdAt', 'publishedDate'].includes(column) && column !== titleColumn);
  const detailsColumns = columns.filter((column) => column !== titleColumn && column !== statusColumn && !summaryColumns.includes(column));

  return (
    <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 font-sans text-sm font-semibold text-primary-700 [overflow-wrap:anywhere]">{renderCell(titleColumn, item[titleColumn])}</h3>
        {item[statusColumn] && <div>{renderCell(statusColumn, item[statusColumn])}</div>}
      </div>
      <div className="mt-2 space-y-1 text-xs text-slate-500">
        {summaryColumns.map((column) => <div key={column} className="min-w-0 whitespace-normal [overflow-wrap:anywhere]">{renderCell(column, item[column])}</div>)}
      </div>
      {detailsColumns.length > 0 && (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer font-medium text-primary-700">More details</summary>
          <dl className="mt-2 space-y-2">
            {detailsColumns.map((column) => (
              <div key={column} className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3">
                <dt className="capitalize text-slate-500">{column.replace(/([A-Z])/g, ' $1').trim()}</dt>
                <dd className="min-w-0 whitespace-normal text-slate-800 [overflow-wrap:anywhere]">{renderCell(column, item[column])}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">{actions}</div>
    </article>
  );
};

export default AdminRecordCard;
