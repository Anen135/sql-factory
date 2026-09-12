import { beforeAll, describe, expect, it } from 'vitest';
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import { seed } from '../../data/database';
import { tasks } from '../../data/tasks';
import { compare, execute } from './engine';
let SQL: SqlJsStatic;
beforeAll(async () => {
  SQL = await initSqlJs();
});
function run(sql: string, id?: number) {
  const db = new SQL.Database();
  try {
    db.run(seed);
    return execute(
      db,
      sql,
      tasks.find((t) => t.id === id),
    );
  } finally {
    db.close();
  }
}
describe('Task curriculum', () => {
  for (const task of tasks)
    it(`task ${task.id}: sample executes, validates and visualizes`, () => {
      const r = run(task.sampleQuery, task.id);
      expect(r.correct).toBe(true);
      expect(r.result.columns).toEqual(task.expectedColumns);
      expect(r.visualizationError).toBeUndefined();
      expect(r.steps.at(-1)?.output).toEqual(r.result);
    });
  it('accepts an equivalent solution without redundant subjects join', () =>
    expect(run(tasks.find((t) => t.id === 22)!.starter, 22).correct).toBe(true));
  it('rejects wrong ordering and column names', () => {
    expect(
      run(
        'SELECT s.name AS student_name, ROUND(AVG(g.grade),2) AS avg_grade FROM students s JOIN grades g ON s.id=g.student_id GROUP BY s.id,s.name ORDER BY avg_grade ASC',
        22,
      ).correct,
    ).toBe(false);
    expect(run('SELECT COUNT(*) AS wrong FROM students', 16).correct).toBe(false);
  });
  it('shows actual JOIN, WHERE, groups and HAVING transitions', () => {
    const r = run(
      'SELECT s.name, AVG(g.grade) AS avg_grade FROM students s JOIN grades g ON s.id=g.student_id WHERE g.grade >= 4 GROUP BY s.id,s.name HAVING AVG(g.grade)>4 ORDER BY avg_grade DESC',
    );
    expect(r.visualizationError).toBeUndefined();
    expect(r.steps.find((s) => s.name === 'FROM')!.output.values).toHaveLength(7);
    expect(r.steps.find((s) => s.name === 'JOIN')!.output.values).toHaveLength(18);
    expect(r.steps.find((s) => s.name === 'WHERE')!.output.values).toHaveLength(15);
    expect(r.steps.find((s) => s.name === 'GROUP BY')!.output.values).toHaveLength(6);
    expect(r.steps.find((s) => s.name === 'HAVING')!.output.values).toHaveLength(3);
  });
  it('LEFT JOIN preserves students without matches', () => {
    const r = run('SELECT s.name, g.grade FROM students s LEFT JOIN grades g ON s.id=g.student_id');
    expect(r.result.values).toHaveLength(19);
    expect(r.result.values.at(-1)).toEqual(['Никита Орлов', null]);
  });
  it('blocks mutations and multiple statements', () => {
    expect(() => run('DELETE FROM students')).toThrow();
    expect(() => run('SELECT * FROM students; SELECT * FROM grades;')).toThrow();
  });
  it('supports empty results', () =>
    expect(run('SELECT name FROM students WHERE age > 100').result).toEqual({
      columns: ['name'],
      values: [],
    }));
  it('compares multisets without losing duplicates', () => {
    const a = { columns: ['x'], values: [[1], [1], [2]] };
    expect(compare(a, { columns: ['x'], values: [[2], [1], [1]] }, false)).toBe(true);
    expect(compare(a, { columns: ['x'], values: [[2], [2], [1]] }, false)).toBe(false);
  });
});
