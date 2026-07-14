/**
 * @file DataTable.jsx
 * @description Reusable sortable data table component for Cervify.
 *
 * Renders a styled `<table>` inside a scrollable container using the
 * `.table-container` / `.data-table` CSS classes defined in `index.css`.
 *
 * Usage:
 * @example
 * <DataTable
 *   columns={[
 *     { key: 'student_name', label: 'Name' },
 *     { key: 'student_roll_no', label: 'Roll No' }
 *   ]}
 *   rows={students}
 *   rowKey="stud_id"
 *   renderCell={(col, row) => row[col.key]}
 *   actions={(row) => <button onClick={() => del(row.stud_id)}>Delete</button>}
 * />
 *
 * @param {{
 *   columns: Array<{ key: string, label: string }>,
 *   rows: object[],
 *   rowKey: string,
 *   renderCell?: (col: { key: string, label: string }, row: object) => React.ReactNode,
 *   actions?: (row: object) => React.ReactNode,
 *   emptyMessage?: string
 * }} props
 */

import React from 'react';

/**
 * Reusable data table component.
 * Renders columns from a column definition array and rows from a data array.
 *
 * @returns {JSX.Element}
 */
export default function DataTable({
    columns = [],
    rows = [],
    rowKey,
    renderCell,
    actions,
    emptyMessage = 'No records found.'
}) {
    return (
        <div className="table-container">
            <table className="data-table" aria-label="Data table">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} scope="col">{col.label}</th>
                        ))}
                        {actions && <th scope="col">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length + (actions ? 1 : 0)}
                                style={{ textAlign: 'center', padding: 32, color: 'var(--text-light)' }}
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        rows.map(row => (
                            <tr key={row[rowKey]}>
                                {columns.map(col => (
                                    <td key={col.key}>
                                        {renderCell
                                            ? renderCell(col, row)
                                            : (row[col.key] ?? '—')}
                                    </td>
                                ))}
                                {actions && <td>{actions(row)}</td>}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
