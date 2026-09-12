import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, Database, Play, Search, CheckCircle2 } from 'lucide-react';
import { tasks, categories } from '../data/tasks';
import { schema } from '../data/database';
import { useStore } from '../store/useStore';
import { readTable } from '../features/database/client';
import type { TableData } from '../features/tasks/types';
import { DataTable } from '../components/DataTable';
export function TaskList({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  const [category, setCategory] = useState('Все темы');
  const [difficulty, setDifficulty] = useState('Любая сложность');
  const [filter, setFilter] = useState('Все');
  const { solved, bookmarks } = useStore();
  const filtered = tasks.filter(
    (t) =>
      (category === 'Все темы' || t.category === category) &&
      (difficulty === 'Любая сложность' || t.difficulty === difficulty) &&
      (filter === 'Все' ||
        (filter === 'Решённые' && solved.includes(t.id)) ||
        (filter === 'Сохранённые' && bookmarks.includes(t.id))) &&
      `${t.title} ${t.id} ${t.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">YOUR NEXT CHALLENGE</span>
        <h1>Практика SQL</h1>
        <p>От первого SELECT до сложных запросов. В вашем темпе.</p>
      </div>
      <div className="filters">
        <label className="catalog-search">
          <Search size={15} />
          <input
            aria-label="Поиск по каталогу"
            placeholder="Название или номер задачи"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </label>
        {[
          [category, setCategory, ['Все темы', ...categories]],
          [difficulty, setDifficulty, ['Любая сложность', 'Легко', 'Средне', 'Сложно']],
          [filter, setFilter, ['Все', 'Решённые', 'Сохранённые']],
        ].map(([v, fn, options], i) => (
          <select
            key={i}
            aria-label={['Тема', 'Сложность', 'Статус'][i]}
            value={v as string}
            onChange={(e) => (fn as (v: string) => void)(e.target.value)}
          >
            {(options as string[]).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ))}
        <span className="muted">Найдено: {filtered.length}</span>
      </div>
      <div className="task-grid">
        {filtered.map((t) => (
          <a className="panel task-card" href={`#/task/${t.id}`} key={t.id}>
            <div>
              <span className="topic-tag">{t.category}</span>
              <span className="muted">
                {solved.includes(t.id) ? <CheckCircle2 size={18} /> : String(t.id).padStart(2, '0')}
              </span>
            </div>
            <h3>{t.title}</h3>
            <p>{t.statement}</p>
            <div>
              <span className="badge">{t.difficulty}</span>
              <ArrowUpRight size={18} />
            </div>
          </a>
        ))}
      </div>
      {!filtered.length && <p className="empty">Ничего не найдено. Измените поиск или фильтры.</p>}
    </>
  );
}
export function Dashboard() {
  const { solved } = useStore();
  return (
    <>
      <div className="hero dashboard-hero">
        <div>
          <span className="eyebrow">WELCOME TO YOUR WORKSPACE</span>
          <h1>
            Большие идеи
            <br />
            начинаются с <span>SELECT.</span>
          </h1>
          <p>Ваш путь от первой таблицы до уверенного владения SQL.</p>
          <a
            className="primary"
            href={`#/task/${tasks.find((t) => !solved.includes(t.id))?.id ?? 22}`}
          >
            <Play size={16} /> Продолжить обучение
          </a>
        </div>
        <div className="dashboard-symbol">{'{ SQL }'}</div>
      </div>
      <div className="stats">
        <div className="panel">
          <span>Решено задач</span>
          <strong>
            {solved.length}
            <small> / {tasks.length}</small>
          </strong>
        </div>
        <div className="panel">
          <span>Ваш прогресс</span>
          <strong>
            {Math.round((solved.length / tasks.length) * 100)}
            <small>%</small>
          </strong>
        </div>
        <div className="panel">
          <span>Тем для изучения</span>
          <strong>
            07<small> от основ до практики</small>
          </strong>
        </div>
      </div>
      <h2>Выберите направление</h2>
      <div className="task-grid">
        {categories.map((c, i) => (
          <a
            href={`#/task/${tasks.find((t) => t.category === c)!.id}`}
            className="panel topic-card"
            key={c}
          >
            <BookOpen size={22} />
            <span>МОДУЛЬ 0{i + 1}</span>
            <h3>{c}</h3>
            <p>
              {tasks.filter((t) => t.category === c && solved.includes(t.id)).length} /{' '}
              {tasks.filter((t) => t.category === c).length} задач решено <ArrowUpRight size={16} />
            </p>
          </a>
        ))}
      </div>
      <h2>Продолжайте исследовать</h2>
      <a className="panel featured" href="#/task/22">
        <span className="topic-tag">GROUP BY + JOIN</span>
        <h3>Средняя оценка студентов</h3>
        <p>Объедините таблицы и узнайте, как работают агрегаты. →</p>
      </a>
    </>
  );
}
const reference = [
  [
    'SELECT',
    'Выбирает столбцы. AS даёт столбцу новое имя. DISTINCT убирает дубликаты.',
    'SELECT DISTINCT age AS student_age FROM students;',
  ],
  [
    'WHERE',
    'Фильтрует строки. AND требует оба условия, OR — хотя бы одно. NULL проверяют через IS NULL.',
    'SELECT name FROM students WHERE age BETWEEN 15 AND 16 AND group_id IS NOT NULL;',
  ],
  [
    'JOIN',
    'INNER JOIN оставляет совпадения. LEFT JOIN сохраняет все строки слева, добавляя NULL при отсутствии пары.',
    'SELECT s.name, g.grade FROM students s LEFT JOIN grades g ON s.id = g.student_id;',
  ],
  [
    'GROUP BY',
    'Объединяет строки по ключам. COUNT считает, SUM суммирует, AVG находит среднее, MIN/MAX — крайние значения.',
    'SELECT student_id, AVG(grade) AS avg_grade FROM grades GROUP BY student_id;',
  ],
  [
    'HAVING',
    'Фильтрует группы после агрегации. WHERE работает до неё.',
    'SELECT student_id, COUNT(*) AS total FROM grades GROUP BY student_id HAVING COUNT(*) > 2;',
  ],
  [
    'ORDER BY / LIMIT',
    'ASC сортирует по возрастанию, DESC — по убыванию. LIMIT ограничивает количество строк. Для устойчивого порядка при равенстве добавьте второй ключ.',
    'SELECT name, age FROM students ORDER BY age DESC, name LIMIT 3;',
  ],
  [
    'Подзапросы',
    'Скалярный подзапрос возвращает одно значение. IN проверяет вхождение в набор. EXISTS проверяет наличие хотя бы одной строки.',
    'SELECT s.name FROM students s WHERE EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id);',
  ],
];
export function Reference() {
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">THE SQL FIELD GUIDE</span>
        <h1>Всё нужное под рукой.</h1>
        <p>Коротко о конструкциях, которые вы используете каждый день.</p>
      </div>
      <div className="notice">
        Выполнение: SQLite в браузере. Задачи используют общее подмножество SQL/MySQL. Специфичные
        функции MySQL (DATE_FORMAT, CONCAT), его типизация и collations не эмулируются.
      </div>
      <div className="reference-grid">
        {reference.map(([title, text, sql]) => (
          <article className="panel reference-card" key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
            <pre>{sql}</pre>
          </article>
        ))}
      </div>
      <a href="#/sandbox" className="primary">
        Открыть песочницу <ArrowUpRight size={16} />
      </a>
    </>
  );
}
export function DatabasePage() {
  const [selected, setSelected] = useState('students');
  const [data, setData] = useState<TableData>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setData(undefined);
    setError('');
    readTable(selected)
      .then((d) => active && setData(d))
      .catch((e) => active && setError(String(e)));
    return () => {
      active = false;
    };
  }, [selected]);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">UNIVERSITY DATABASE</span>
        <h1>За каждой строкой — история.</h1>
        <p>Учебная база: студенты, их группы, предметы и оценки.</p>
      </div>
      <div className="filters">
        {schema.map((s) => (
          <button
            className={selected === s.name ? 'primary' : 'secondary'}
            key={s.name}
            onClick={() => setSelected(s.name)}
          >
            <Database size={15} />
            {s.name}
          </button>
        ))}
      </div>
      <div className="panel database-view">
        {data ? <DataTable data={data} /> : <p className="empty">{error || 'Загружаем данные…'}</p>}
      </div>
      <p className="muted">
        Каждый запуск использует новую копию базы. Данные задач остаются одинаковыми.
      </p>
    </>
  );
}
export function Profile() {
  const { solved, bookmarks } = useStore();
  const completed = tasks.filter((task) => solved.includes(task.id));
  const percent = Math.round((completed.length / tasks.length) * 100);
  return (
    <>
      <div className="hero profile-hero">
        <div>
          <span className="eyebrow">ВАШ ПУТЬ В SQL</span>
          <h1>Профиль</h1>
          <p>Каждое решение — ещё один шаг вперёд.</p>
        </div>
      </div>
      <p className="muted">
        Результаты и черновики сохраняются в этом браузере. Вернитесь, чтобы продолжить с того же
        места.
      </p>
      <div className="stats">
        <div className="panel">
          <span>Решено задач</span>
          <strong>
            {completed.length}
            <small> / {tasks.length}</small>
          </strong>
        </div>
        <div className="panel">
          <span>Пройдено</span>
          <strong>
            {percent}
            <small>%</small>
          </strong>
        </div>
        <div className="panel">
          <span>Сохранено задач</span>
          <strong>{bookmarks.length}</strong>
        </div>
      </div>
      <h2>Прогресс по темам</h2>
      <div className="task-grid">
        {categories.map((category) => {
          const total = tasks.filter((task) => task.category === category);
          const count = total.filter((task) => solved.includes(task.id)).length;
          return (
            <article className="panel topic-card" key={category}>
              <h3>{category}</h3>
              <p>
                {count} из {total.length} решено
              </p>
              <progress aria-label={category} value={count} max={total.length} />
            </article>
          );
        })}
      </div>
      <h2 className="profile-results-title">Решённые задачи</h2>
      {completed.length ? (
        <div className="profile-results">
          {completed.map((task) => (
            <a className="panel" href={`#/task/${task.id}`} key={task.id}>
              <CheckCircle2 size={18} /> {task.id}. {task.title}
              <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      ) : (
        <div className="panel reference-card">
          <p>Здесь появятся ваши первые победы.</p>
          <a className="primary" href="#/task/1">
            Решить первую задачу <ArrowUpRight size={16} />
          </a>
        </div>
      )}
    </>
  );
}
