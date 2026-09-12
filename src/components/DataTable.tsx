import type { TableData } from '../features/tasks/types';
export function DataTable({ data, limit = 100 }: { data: TableData; limit?: number }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th className="row-num">#</th>
            {data.columns.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.values.slice(0, limit).map((row, i) => (
            <tr key={i}>
              <td className="row-num">{i + 1}</td>
              {row.map((v, j) => (
                <td key={j}>{v === null ? <span className="null">NULL</span> : String(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!data.values.length && <p className="empty">Нет строк</p>}
      {data.values.length > limit && (
        <p className="muted">
          Показаны первые {limit} из {data.values.length} строк.
        </p>
      )}
    </div>
  );
}
