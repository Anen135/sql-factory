import type { Execution, TableData, Task } from '../tasks/types';
function request<T>(payload: object): Promise<T> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./sql.worker.ts', import.meta.url), { type: 'module' });
    const finish = () => {
      clearTimeout(timer);
      worker.terminate();
    };
    const timer = setTimeout(() => {
      finish();
      reject(new Error('Запрос выполнялся дольше 8 секунд. Упростите его и попробуйте ещё раз.'));
    }, 8000);
    worker.onmessage = ({ data }) => {
      finish();
      data.error ? reject(new Error(data.error)) : resolve(data.result);
    };
    worker.onerror = () => {
      finish();
      reject(new Error('Не удалось загрузить SQL-движок. Обновите страницу.'));
    };
    worker.postMessage(payload);
  });
}
export const runSQL = (sql: string, task?: Task) => request<Execution>({ sql, task });
export const readTable = (table: string) => request<TableData>({ table });
