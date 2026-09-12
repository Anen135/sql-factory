import { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  Code2,
  Search,
  Terminal,
  Check,
  ChevronDown,
  GraduationCap,
} from 'lucide-react';
import { tasks, categories } from '../data/tasks';
import { useStore } from '../store/useStore';
export function Header({
  page,
  search,
  onSearch,
}: {
  page: string;
  search: string;
  onSearch: (s: string) => void;
}) {
  const solved = useStore((s) => s.solved);
  return (
    <>
      <header>
        <a className="brand" href="#/dashboard">
          <span className="brand-icon">
            <Terminal size={23} />
          </span>
          <span>
            SQL<span className="brand-light"> Trainer</span>
            <small>Практика сегодня — карьера завтра</small>
          </span>
        </a>
        <nav>
          {[
            ['dashboard', 'Обучение'],
            ['tasks', 'Задачи'],
            ['reference', 'Справочник'],
            ['database', 'База данных'],
          ].map(([id, title]) => (
            <a
              key={id}
              className={page === id || (page === 'task' && id === 'tasks') ? 'active' : ''}
              href={`#/${id}`}
            >
              {title}
            </a>
          ))}
        </nav>
        <div className="header-right">
          <label className="search">
            <Search size={15} />
            <input
              aria-label="Поиск задач"
              placeholder="Найти задачу…"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
            <kbd>/</kbd>
          </label>
          <div className="mini-progress">
            <span>{Math.round((solved.length / tasks.length) * 100)}%</span>
            <div>
              <i style={{ width: `${(solved.length / tasks.length) * 100}%` }} />
            </div>
          </div>
          <a
            className="profile"
            href="#/profile"
            aria-label="Профиль"
            aria-current={page === 'profile' ? 'page' : undefined}
          >
            <span className="avatar">
              <GraduationCap size={20} />
            </span>
            <div>
              Профиль
              <small>
                {solved.length} из {tasks.length} решено
              </small>
            </div>
            <ChevronRight size={13} />
          </a>
        </div>
      </header>
    </>
  );
}
export function Sidebar({ current, search }: { current: number; search: string }) {
  const solved = useStore((s) => s.solved);
  const [closed, setClosed] = useState<string[]>([]);
  const treeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tree = treeRef.current;
    const active = tree?.querySelector<HTMLElement>('.current');
    if (tree && active) {
      tree.scrollTop += active.getBoundingClientRect().top - tree.getBoundingClientRect().top - 100;
    }
  }, [current]);
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <h3>
          <Code2 size={18} /> Задачи
        </h3>
        <span>{tasks.length}</span>
      </div>
      <a className="all-tasks" href="#/tasks">
        Все задачи <ChevronRight size={14} />
      </a>
      <div className="task-tree" ref={treeRef}>
        {categories.map((category) => {
          const list = tasks.filter(
            (t) =>
              t.category === category &&
              `${t.id} ${t.title} ${t.category}`.toLowerCase().includes(search.toLowerCase()),
          );
          if (!list.length) return null;
          return (
            <section key={category}>
              <button
                className="category-toggle"
                onClick={() =>
                  setClosed(
                    closed.includes(category)
                      ? closed.filter((x) => x !== category)
                      : [...closed, category],
                  )
                }
              >
                <ChevronDown
                  size={13}
                  style={{ transform: closed.includes(category) ? 'rotate(-90deg)' : '' }}
                />
                {category}
                <span>
                  {list.filter((t) => solved.includes(t.id)).length}/{list.length}
                </span>
              </button>
              {!closed.includes(category) &&
                list.map((t) => (
                  <a
                    className={`tree-task ${current === t.id ? 'current' : ''}`}
                    key={t.id}
                    href={`#/task/${t.id}`}
                  >
                    <span className={`task-number ${solved.includes(t.id) ? 'done' : ''}`}>
                      {solved.includes(t.id) ? <Check size={13} /> : String(t.id).padStart(2, '0')}
                    </span>
                    <div>
                      {t.title}
                      <small
                        className={`difficulty ${t.difficulty === 'Легко' ? 'easy' : t.difficulty === 'Сложно' ? 'hard' : ''}`}
                      >
                        {t.difficulty}
                      </small>
                    </div>
                    {current === t.id && <span className="active-dot" />}
                  </a>
                ))}
            </section>
          );
        })}
      </div>
      <div className="sidebar-bottom">
        <GraduationCap size={23} />
        <strong>
          Маленькие шаги.
          <br />
          Большие возможности.
        </strong>
        <p>Один запрос ближе к цели.</p>
      </div>
    </aside>
  );
}
