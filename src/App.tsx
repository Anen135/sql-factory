import { useEffect, useState } from 'react';
import { Header, Sidebar } from './layout/Layout';
import { TaskPage } from './pages/TaskPage';
import { Profile, Dashboard, DatabasePage, Reference, TaskList } from './pages/OtherPages';
import { tasks } from './data/tasks';
export default function App() {
  const [hash, setHash] = useState(location.hash || '#/task/22');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const update = () => setHash(location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const [, page = 'task', id = '22'] = hash.split('/');
  const task = tasks.find((t) => t.id === Number(id));
  const taskMode = page === 'task' || page === 'sandbox';
  return (
    <>
      <div className="ambient-background" aria-hidden="true" />
      <Header
        page={page}
        search={search}
        onSearch={(v) => {
          setSearch(v);
          if (page !== 'tasks') location.hash = '/tasks';
        }}
      />
      <div className="app-body">
        <Sidebar current={taskMode ? Number(id) : 0} search={search} />
        <main>
          {page === 'task' ? (
            task ? (
              <TaskPage key={task.id} task={task} />
            ) : (
              <p className="empty">
                Задача не найдена. <a href="#/tasks">Открыть каталог</a>
              </p>
            )
          ) : page === 'sandbox' ? (
            <TaskPage key="sandbox" sandbox task={tasks[0]} />
          ) : page === 'tasks' ? (
            <TaskList search={search} onSearch={setSearch} />
          ) : page === 'dashboard' ? (
            <Dashboard />
          ) : page === 'reference' ? (
            <Reference />
          ) : page === 'database' ? (
            <DatabasePage />
          ) : page === 'profile' ? (
            <Profile />
          ) : (
            <p className="empty">
              Страница не найдена. <a href="#/dashboard">На главную</a>
            </p>
          )}
          <footer className="art-credit">
            Иллюстрация:{' '}
            <a href="https://commons.wikimedia.org/wiki/File:Wikipe-tan_full_length.png">
              Wikipe-tan · Kasuga
            </a>
            {' · '}
            <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a> · Тонирование
            и кадрирование CSS
          </footer>
        </main>
      </div>
    </>
  );
}
