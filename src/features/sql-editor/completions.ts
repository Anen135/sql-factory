import type { languages } from 'monaco-editor';
import { schema } from '../../data/database';

const keywords = [
  'SELECT',
  'FROM',
  'WHERE',
  'JOIN',
  'LEFT JOIN',
  'INNER JOIN',
  'CROSS JOIN',
  'ON',
  'AS',
  'DISTINCT',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'ASC',
  'DESC',
  'LIMIT',
  'OFFSET',
  'AND',
  'OR',
  'NOT',
  'IN',
  'EXISTS',
  'BETWEEN',
  'LIKE',
  'IS NULL',
  'IS NOT NULL',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'UNION',
  'UNION ALL',
  'WITH',
];
const functions = [
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'ROUND',
  'ABS',
  'COALESCE',
  'NULLIF',
  'LOWER',
  'UPPER',
  'LENGTH',
  'TRIM',
  'SUBSTR',
];
const reserved = new Set(keywords.flatMap((word) => word.split(' ')));

// Preserve offsets while hiding strings and comments from context matching.
function maskSql(sql: string) {
  return sql.replace(/--[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|'(?:''|[^'])*(?:'|$)/g, (value) =>
    value.replace(/[^\n]/g, ' '),
  );
}

export function createSqlCompletionProvider(
  kinds: typeof languages.CompletionItemKind,
): languages.CompletionItemProvider {
  return {
    triggerCharacters: ['.'],
    provideCompletionItems(model, position) {
      const offset = model.getOffsetAt(position);
      const source = model.getValue();
      const masked = maskSql(source);
      // Explicit invocation should also stay quiet inside comments and strings.
      const hidden = /--[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|'(?:''|[^'])*(?:'|$)/g;
      for (const match of source.matchAll(hidden)) {
        const end = match.index! + match[0].length;
        const closed = match[0].startsWith('/*')
          ? match[0].endsWith('*/')
          : match[0].startsWith("'") && match[0].length > 1 && match[0].endsWith("'");
        if (offset > match.index! && (offset < end || (offset === end && !closed))) {
          return { suggestions: [] };
        }
      }
      const start = masked.lastIndexOf(';', offset - 1) + 1;
      const next = masked.indexOf(';', offset);
      const statement = masked.slice(start, next < 0 ? undefined : next);
      const before = masked.slice(start, offset);
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const item = (
        label: string,
        kind: languages.CompletionItemKind,
        detail: string,
      ): languages.CompletionItem => ({ label, kind, detail, insertText: label, range });
      const aliases = new Map<string, (typeof schema)[number]>();
      for (const match of statement.matchAll(
        /\b(?:FROM|JOIN)\s+([a-z_]\w*)(?:\s+(?:AS\s+)?([a-z_]\w*))?/gi,
      )) {
        const table = schema.find((entry) => entry.name === match[1].toLowerCase());
        if (!table) continue;
        aliases.set(table.name, table);
        if (match[2] && !reserved.has(match[2].toUpperCase()))
          aliases.set(match[2].toLowerCase(), table);
      }
      const qualified = before.match(/\b([a-z_]\w*)\.\w*$/i);
      if (qualified) {
        const name = qualified[1].toLowerCase();
        const table = aliases.get(name) ?? schema.find((entry) => entry.name === name);
        return {
          suggestions:
            table?.fields.map(([field, type]) =>
              item(field, kinds.Field, `${table.name} · ${type}`),
            ) ?? [],
        };
      }
      const tables = schema.map((table) => item(table.name, kinds.Struct, table.description));
      if (/\b(?:FROM|JOIN)\s+\w*$/i.test(before)) return { suggestions: tables };
      const columns = new Map<string, languages.CompletionItem>();
      for (const table of new Set(aliases.size ? aliases.values() : schema)) {
        for (const [field, type] of table.fields) {
          const previous = columns.get(field);
          if (previous) previous.detail += `; ${table.name} · ${type}`;
          else columns.set(field, item(field, kinds.Field, `${table.name} · ${type}`));
        }
      }
      return {
        suggestions: [
          ...keywords.map((keyword) => item(keyword, kinds.Keyword, 'SQL')),
          ...functions.map((name) => item(name, kinds.Function, `${name}(…)`)),
          ...tables,
          ...columns.values(),
        ],
      };
    },
  };
}
