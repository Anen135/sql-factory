import { Parser } from 'node-sql-parser/build/mysql';
import type { Database } from 'sql.js';
import type { Execution, TableData, Task, Step } from '../tasks/types';
const parser = new Parser();
export function query(db: Database, sql: string): TableData {
  const stmt = db.prepare(sql);
  try {
    const columns = stmt.getColumnNames();
    const values: TableData['values'] = [];
    while (stmt.step()) {
      if (values.length >= 5000) throw new Error('Результат превышает 5000 строк. Добавьте LIMIT.');
      values.push(stmt.get() as TableData['values'][number]);
    }
    return { columns, values };
  } finally {
    stmt.free();
  }
}
export function compare(a: TableData, b: TableData, ordered: boolean) {
  if (
    JSON.stringify(a.columns) !== JSON.stringify(b.columns) ||
    a.values.length !== b.values.length
  )
    return false;
  const row = (r: TableData['values'][number]) =>
    JSON.stringify(r.map((v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v)));
  const x = a.values.map(row),
    y = b.values.map(row);
  if (!ordered) {
    x.sort();
    y.sort();
  }
  return x.every((v, i) => v === y[i]);
}
// AST transformations preserve expressions and nested subqueries; SQL is never parsed with regex.
export function execute(db: Database, sql: string, task?: Task): Execution {
  const start = performance.now();
  const parsed = parser.astify(sql, { database: 'MySQL' });
  const list = Array.isArray(parsed) ? parsed : [parsed];
  if (list.length !== 1 || list[0].type !== 'select')
    throw new Error('В тренажёре разрешён один SELECT-запрос.');
  const ast: any = list[0];
  const result = query(db, sql);
  const execution: Execution = { result, steps: [], elapsed: 0 };
  if (task) execution.correct = compare(result, query(db, task.sampleQuery), task.ordered);
  try {
    if (ast.with || ast._next || ast.window || ast.from?.some((f: any) => !f.table))
      throw new Error(
        'Для CTE, UNION, оконных функций и таблиц-подзапросов доступен результат, но пошаговый разбор пока не поддерживается.',
      );
    const serialize = (a: any) => parser.sqlify(a, { database: 'MySQL' });
    const base: any = {
      ...structuredClone(ast),
      columns: [{ expr: { type: 'column_ref', table: null, column: '*' }, as: null }],
      distinct: null,
      where: null,
      groupby: null,
      having: null,
      orderby: null,
      limit: null,
    };
    const steps: Step[] = [];
    let previous: TableData = { columns: [], values: [] };
    const add = (name: string, description: string, a: any) => {
      const q = serialize(a);
      const output = query(db, q);
      steps.push({ name, description, input: previous, output, query: q });
      previous = output;
    };
    if (ast.from?.length) {
      base.from = [structuredClone(ast.from[0])];
      add('FROM', `Берём строки из ${ast.from[0].table}. Каждая строка — отдельная запись.`, base);
      for (let i = 1; i < ast.from.length; i++) {
        base.from.push(structuredClone(ast.from[i]));
        add(
          'JOIN',
          `Присоединяем ${ast.from[i].table} по условию ON. Одна строка может получить несколько совпадений; LEFT JOIN сохраняет и строки без пары.`,
          base,
        );
      }
    }
    if (ast.where) {
      base.where = ast.where;
      add(
        'WHERE',
        'Проверяем условие для каждой строки. Остаются только строки, для которых условие истинно. Подзапросы вычисляются движком внутри этого условия.',
        base,
      );
    }
    if (ast.groupby) {
      base.groupby = ast.groupby;
      const keys = Array.isArray(ast.groupby) ? ast.groupby : ast.groupby.columns;
      base.columns = [
        ...keys.map((expr: any, i: number) => ({ expr, as: `ключ_${i + 1}` })),
        {
          expr: {
            type: 'aggr_func',
            name: 'COUNT',
            args: { expr: { type: 'star', value: '*' } },
            over: null,
          },
          as: 'строк_в_группе',
        },
      ];
      add(
        'GROUP BY',
        'Строки с одинаковыми ключами образуют группу. Счётчик показывает, сколько исходных строк попало в каждую группу.',
        base,
      );
    }
    const containsAggregate = (node: any): boolean =>
      !!node &&
      typeof node === 'object' &&
      (node.type === 'aggr_func' ||
        Object.values(node).some((v) =>
          Array.isArray(v) ? v.some(containsAggregate) : containsAggregate(v),
        ));
    if (containsAggregate(ast.columns)) {
      base.columns = ast.columns;
      add(
        'AGGREGATE',
        'В каждой группе считаем агрегаты: COUNT — количество, AVG — среднее, SUM — сумму, MIN/MAX — границы. Без GROUP BY все строки составляют одну группу. Здесь также показаны выражения над агрегатами, например ROUND.',
        base,
      );
    }
    if (ast.having) {
      base.columns = ast.columns;
      base.having = ast.having;
      add(
        'HAVING',
        'Фильтруем целые группы по условию. Агрегаты уже рассчитаны; группы, не прошедшие условие, исчезают.',
        base,
      );
    }
    base.columns = ast.columns;
    base.distinct = ast.distinct;
    add(
      'SELECT',
      'Формируем выходные столбцы, вычисляем выражения и назначаем псевдонимы. DISTINCT удаляет повторяющиеся строки.',
      base,
    );
    if (ast.orderby) {
      base.orderby = ast.orderby;
      add(
        'ORDER BY',
        'Сортируем строки результата. ASC — по возрастанию, DESC — по убыванию.',
        base,
      );
    }
    if (ast.limit) {
      base.limit = ast.limit;
      add('LIMIT', 'Оставляем запрошенное число строк после сортировки и пропуска OFFSET.', base);
    }
    execution.steps = steps;
  } catch (error) {
    execution.visualizationError = error instanceof Error ? error.message : String(error);
  }
  execution.elapsed = Math.round(performance.now() - start);
  return execution;
}
