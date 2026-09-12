import { useRef, useState } from 'react';
import {
  Bookmark,
  Play,
  RotateCcw,
  Sparkles,
  Database,
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  Copy,
  Terminal,
} from 'lucide-react';
import type { Task, Execution } from '../features/tasks/types';
import { schema } from '../data/database';
import { useStore } from '../store/useStore';
import { SqlEditor } from '../features/sql-editor/SqlEditor';
import { runSQL } from '../features/database/client';
import { DataTable } from '../components/DataTable';
import { Visualizer } from '../features/sql-visualizer/Visualizer';
export function TaskPage({ task, sandbox = false }: { task: Task; sandbox?: boolean }) {
  const store = useStore();
  const value = store.drafts[sandbox ? 0 : task.id] ?? task.starter;
  const sqlRef = useRef(value);
  sqlRef.current = value;
  const [execution, setExecution] = useState<Execution>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('result');
  const [hint, setHint] = useState(0);
  const [stale, setStale] = useState(false);
  const [phase, setPhase] = useState('FROM');
  const busyRef = useRef(false);
  const execute = async (visual = false) => {
    if (busyRef.current) return;
    busyRef.current = true;
    const submitted = sqlRef.current;
    setBusy(true);
    setError('');
    try {
      const result = await runSQL(submitted, sandbox ? undefined : task);
      setExecution(result);
      setStale(sqlRef.current !== submitted);
      setTab(visual ? 'visual' : 'result');
      if (result.correct) store.complete(task.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setExecution(undefined);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  return (
    <>
      <div className="breadcrumbs">
        <a href="#/tasks">Задачи</a>
        <ChevronRight size={12} />
        <span>{task.category}</span>
        <ChevronRight size={12} />
        <span>Задача {task.id}</span>
      </div>
      <div className="hero">
        <div>
          <div className="eyebrow">
            <span /> LEARN. QUERY. UNDERSTAND.
          </div>
          <h1>
            Каждый запрос — <span>новый уровень.</span>
          </h1>
          <p>Решайте задачи. Исследуйте данные. Понимайте SQL.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <div className="art-code">
            &lt;<span>SQL</span>/&gt;
          </div>
          <i />
          <b>BUILD YOUR FUTURE_</b>
        </div>
      </div>
      <div className="workspace">
        <article className="panel statement">
          <div className="panel-toolbar">
            <span className="topic-tag">{sandbox ? 'ПЕСОЧНИЦА' : task.category.toUpperCase()}</span>
            <button
              className={`icon-button ${store.bookmarks.includes(task.id) ? 'saved' : ''}`}
              onClick={() => store.bookmark(task.id)}
              aria-label="Сохранить задачу"
            >
              <Bookmark size={18} />
            </button>
          </div>
          <h2>{sandbox ? 'Свободная практика' : `Задача ${task.id}. ${task.title}`}</h2>
          <div className="task-meta">
            <span className="badge">{task.difficulty}</span>
            <span>≈ 10 минут</span>
            <span>
              <span className="tiny-dot" /> Учебная база
            </span>
          </div>
          <p className="statement-text">
            {sandbox
              ? 'Исследуйте учебную базу и выполняйте любые SELECT-запросы. Здесь нет проверки по эталону.'
              : task.statement}
          </p>
          <div className="instruction">
            <strong>
              <Terminal size={16} /> Что нужно сделать?
            </strong>
            <p>
              Напишите запрос к таблицам ниже
              {sandbox
                ? '.'
                : ', чтобы получить указанный результат. Имена выходных столбцов должны совпадать с условием.'}
            </p>
          </div>
          {!sandbox && (
            <>
              <h4>Ожидаемые столбцы в результате</h4>
              <div className="column-chips">
                {task.expectedColumns.map((c) => (
                  <code key={c}>{c}</code>
                ))}
              </div>
              <button
                className="hint-button"
                onClick={() => setHint(Math.min(hint + 1, task.hints.length))}
              >
                <Lightbulb size={16} /> Подсказка{' '}
                <span>
                  {hint ? `${hint}/${task.hints.length}` : 'Показать'} <ChevronRight size={13} />
                </span>
              </button>
              {hint > 0 && <p className="hint-text">{task.hints.slice(0, hint).join(' ')}</p>}
            </>
          )}
          <div className="schema-title">
            <h3>
              <Database size={16} /> Таблицы базы данных
            </h3>
            <a href="#/database">
              Все данные <ArrowUpRight size={13} />
            </a>
          </div>
          <div className="schema-cards">
            {schema
              .filter((s) => sandbox || task.tables.includes(s.name))
              .map((table) => (
                <div className="schema-card" key={table.name}>
                  <strong>
                    <Database size={13} />
                    {table.name}
                    <span>{table.fields.length}</span>
                  </strong>
                  {table.fields.map(([name, type]) => (
                    <div key={name}>
                      <span className={name === 'id' ? 'primary-key' : ''}>
                        {name === 'id' ? '⚿ ' : ''}
                        {name}
                      </span>
                      <small>{type}</small>
                    </div>
                  ))}
                </div>
              ))}
          </div>
          <p className="schema-note">
            Связи: grades.student_id → students.id
            <br />
            grades.subject_id → subjects.id · students.group_id → student_groups.id
          </p>
          {!sandbox && (
            <details className="solution">
              <summary>Пример решения и пояснение</summary>
              <p className="muted">
                Сначала попробуйте решить самостоятельно. Пример можно редактировать и разбирать по
                этапам.
              </p>
              <pre>{task.sampleQuery}</pre>
              <button
                className="secondary"
                onClick={() => {
                  store.draft(task.id, task.sampleQuery);
                  setStale(true);
                }}
              >
                <Copy size={14} /> Вставить в редактор
              </button>
            </details>
          )}
        </article>
        <section className="coding-column">
          <div className="panel editor-panel">
            <div className="panel-toolbar">
              <h3>
                <CodeIcon /> Напишите SQL-запрос
              </h3>
              <button
                className="text-button"
                onClick={() => {
                  store.draft(sandbox ? 0 : task.id, task.starter);
                  setStale(true);
                }}
              >
                <RotateCcw size={13} /> Сбросить
              </button>
            </div>
            <div className="editor-file">
              <span>
                <span className="tiny-dot" /> solution.sql
              </span>
              <small>SQL · MySQL basics</small>
            </div>
            <SqlEditor
              value={value}
              onChange={(v) => {
                store.draft(sandbox ? 0 : task.id, v);
                setStale(true);
              }}
              onRun={() => void execute()}
            />
            <div className="editor-actions">
              <button className="primary" disabled={busy} onClick={() => void execute()}>
                <Play size={15} fill="currentColor" />
                {busy ? 'Выполняем…' : 'Выполнить'}
              </button>
              <button className="secondary" disabled={busy} onClick={() => void execute(true)}>
                <Sparkles size={15} /> Разобрать запрос
              </button>
              <kbd>Ctrl ↵</kbd>
            </div>
          </div>
          <div className="panel result-panel">
            <div className="tabs">
              {[
                ['result', 'Результат'],
                ['visual', 'Визуализация'],
                ['plan', 'План выполнения'],
              ].map(([id, title]) => (
                <button className={tab === id ? 'active' : ''} key={id} onClick={() => setTab(id)}>
                  {id === 'result' && <Database size={14} />} {title}
                </button>
              ))}
            </div>
            {error ? (
              <div className="error">
                <strong>Проверьте запрос</strong>
                <p>{error}</p>
              </div>
            ) : execution ? (
              <>
                <div
                  className={`execution-status ${execution.correct === false ? 'incorrect' : ''}`}
                >
                  <span>
                    <CheckCircle2 size={15} />
                    {sandbox
                      ? 'Запрос выполнен'
                      : execution.correct
                        ? 'Верное решение!'
                        : 'Результат отличается от эталона'}
                  </span>
                  <small>
                    {execution.result.values.length} строк · {execution.elapsed} мс
                  </small>
                </div>
                {stale && (
                  <p className="notice">
                    Запрос изменён. Выполните его заново, чтобы обновить результат и разбор.
                  </p>
                )}
                {tab === 'result' ? (
                  <DataTable data={execution.result} />
                ) : tab === 'visual' ? (
                  <Visualizer key={JSON.stringify(execution)} execution={execution} />
                ) : (
                  <div className="plan">
                    <p>Логический план вашего запроса, а не физический EXPLAIN движка.</p>
                    {execution.steps.map((s, i) => (
                      <div key={i}>
                        <span>{i + 1}</span>
                        <strong>{s.name}</strong>
                        <small>
                          {s.input.values.length} → {s.output.values.length} строк
                        </small>
                      </div>
                    ))}
                    {execution.visualizationError && (
                      <p className="notice">{execution.visualizationError}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="result-empty">
                <div>
                  <Terminal size={28} />
                </div>
                <h3>Данные ждут вашего запроса</h3>
                <p>
                  Нажмите «Выполнить», чтобы увидеть результат.
                  <br />
                  Или разберите запрос шаг за шагом.
                </p>
                <span>Всё выполняется прямо в браузере</span>
              </div>
            )}
            <div className="result-footer">
              <span className="tiny-dot" /> SQLite / sql.js <span>Локальная учебная база</span>
            </div>
          </div>
        </section>
      </div>
      <section className="panel stages">
        <div className="stages-heading">
          <h3>
            <Sparkles size={17} /> Этапы выполнения SQL-запроса
          </h3>
          <span>Порядок написания ≠ порядок выполнения</span>
        </div>
        <div className="stage-track">
          {['FROM', 'JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY'].map((s, i) => (
            <button key={s} className={phase === s ? 'selected' : ''} onClick={() => setPhase(s)}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <strong>{s}</strong>
              <small>
                {
                  [
                    'Источник данных',
                    'Объединение таблиц',
                    'Фильтрация строк',
                    'Создание групп',
                    'Фильтрация групп',
                    'Выбор столбцов',
                    'Сортировка',
                  ][i]
                }
              </small>
              {i < 6 && <ChevronRight className="stage-arrow" size={15} />}
            </button>
          ))}
        </div>
        <p className="stage-description">
          <Circle size={10} /> {phase}:{' '}
          {
            (
              {
                FROM: 'получаем исходные записи из таблицы.',
                JOIN: 'находим совпадения по условию соединения.',
                WHERE: 'проверяем каждую строку до группировки.',
                'GROUP BY': 'собираем строки с одинаковыми ключами в группы.',
                HAVING: 'отбираем группы после вычисления агрегатов.',
                SELECT: 'формируем поля и их псевдонимы.',
                'ORDER BY': 'задаём порядок строк в ответе.',
              } as Record<string, string>
            )[phase]
          }{' '}
          <button className="text-button" disabled={busy} onClick={() => void execute(true)}>
            Посмотреть на своих данных →
          </button>
        </p>
      </section>
      <footer className="page-footer">
        <span>
          SQL TRAINER <i> / </i> Учись мыслить запросами.
        </span>
        <span>
          Сделано для будущих разработчиков <span className="red">✦</span>
        </span>
      </footer>
    </>
  );
}
function CodeIcon() {
  return <Terminal size={17} />;
}
