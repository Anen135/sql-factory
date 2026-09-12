import { useState } from 'react';
import type { Execution } from '../tasks/types';
import { DataTable } from '../../components/DataTable';
import { ArrowRight, Workflow } from 'lucide-react';
export function Visualizer({ execution }: { execution: Execution }) {
  const [active, setActive] = useState(0);
  const step = execution.steps[Math.min(active, execution.steps.length - 1)];
  if (!step)
    return (
      <p className="notice">
        {execution.visualizationError ?? 'Выполните запрос, чтобы увидеть этапы.'}
      </p>
    );
  return (
    <div className="visualizer">
      <div className="step-buttons">
        {execution.steps.map((s, i) => (
          <button key={i} className={active === i ? 'selected' : ''} onClick={() => setActive(i)}>
            {i + 1}. {s.name}
          </button>
        ))}
      </div>
      <div className="step-heading">
        <Workflow size={18} />
        <strong>{step.name}</strong>
        <span>
          {step.input.values.length} → {step.output.values.length} строк
        </span>
      </div>
      <p className="muted">{step.description}</p>
      <div className="before-after">
        <div>
          <small>НА ВХОДЕ</small>
          {step.input.columns.length ? (
            <DataTable data={step.input} limit={20} />
          ) : (
            <p className="empty">Исходная база данных</p>
          )}
        </div>
        <ArrowRight size={18} />
        <div>
          <small>НА ВЫХОДЕ</small>
          <DataTable data={step.output} limit={20} />
        </div>
      </div>
      <details>
        <summary>SQL этого этапа</summary>
        <pre>{step.query}</pre>
      </details>
    </div>
  );
}
