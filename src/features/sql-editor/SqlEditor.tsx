import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { useRef } from 'react';
(self as any).MonacoEnvironment = { getWorker: () => new EditorWorker() };
loader.config({ monaco });
export function SqlEditor({
  value,
  onChange,
  onRun,
}: {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
}) {
  const runRef = useRef(onRun);
  runRef.current = onRun;
  return (
    <Editor
      height="285px"
      language="sql"
      value={value}
      onChange={(v) => onChange(v ?? '')}
      loading={<p className="empty">Загружаем редактор…</p>}
      beforeMount={(m) =>
        m.editor.defineTheme('crimson', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'keyword', foreground: 'F27B98' },
            { token: 'predefined', foreground: 'C8A1D8' },
            { token: 'string', foreground: 'DBB585' },
            { token: 'number', foreground: 'C5A8ED' },
            { token: 'comment', foreground: '686371' },
          ],
          colors: {
            'editor.background': '#141116',
            'editorLineNumber.foreground': '#514957',
            'editor.foreground': '#E3DBE6',
            'editor.lineHighlightBackground': '#211822',
            'editor.selectionBackground': '#583044',
            'editorCursor.foreground': '#FF577C',
          },
        })
      }
      theme="crimson"
      onMount={(e, m) => {
        e.addAction({
          id: 'run-query',
          label: 'Выполнить SQL',
          keybindings: [m.KeyMod.CtrlCmd | m.KeyCode.Enter],
          run: () => runRef.current(),
        });
      }}
      options={{
        fontSize: 13,
        lineHeight: 23,
        fontFamily: 'Consolas, monospace',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 18 },
        automaticLayout: true,
        wordWrap: 'on',
        tabSize: 4,
        renderLineHighlight: 'line',
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
      }}
    />
  );
}
