export type Cell = string | number | null;
export interface TableData {
  columns: string[];
  values: Cell[][];
}
export interface Task {
  id: number;
  title: string;
  category: string;
  difficulty: 'Легко' | 'Средне' | 'Сложно';
  statement: string;
  hints: string[];
  tables: string[];
  expectedColumns: string[];
  sampleQuery: string;
  starter: string;
  ordered: boolean;
  tags: string[];
}
export interface Step {
  name: string;
  description: string;
  input: TableData;
  output: TableData;
  query: string;
}
export interface Execution {
  result: TableData;
  correct?: boolean;
  steps: Step[];
  visualizationError?: string;
  elapsed: number;
}
