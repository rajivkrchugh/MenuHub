import React from 'react';
import './MenuTable.css';

export default function MenuTable({ data }) {
  if (!data || !data.headers || !data.rows.length) return null;

  return (
    <div className="menu-table-wrap">
      <div className="menu-table-scroll">
        <table className="menu-table">
          <thead>
            <tr>
              {data.headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>
                    {/* Highlight Veg/Non-Veg column */}
                    {data.headers[ci]?.toLowerCase().includes('veg') ? (
                      <span className={`menu-table__badge ${
                        cell.toLowerCase().includes('non') ? 'menu-table__badge--nonveg' : 'menu-table__badge--veg'
                      }`}>
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
