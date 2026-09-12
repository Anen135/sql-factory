import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { seed } from '../../data/database';
import { execute, query } from './engine';
const ready = initSqlJs({ locateFile: () => wasmUrl });
self.onmessage = async ({ data }) => {
  let db;
  try {
    const SQL = await ready;
    db = new SQL.Database();
    db.run(seed);
    const result = data.table
      ? query(db, `SELECT * FROM "${data.table}"`)
      : execute(db, data.sql, data.task);
    self.postMessage({ result });
  } catch (e) {
    self.postMessage({ error: e instanceof Error ? e.message : String(e) });
  } finally {
    db?.close();
  }
};
