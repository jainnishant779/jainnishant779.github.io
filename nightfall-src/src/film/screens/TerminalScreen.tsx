import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sound';
import { COMMANDS, PROMPT, complete, runCommand, type Action, type Line } from './commands';

type Printed = Line | { kind: 'cmd'; text: string };

const MAX_LINES = 200;
const KIND_CLASS: Record<string, string> = {
  out: 'text-text-1',
  dim: 'text-text-3',
  err: 'text-danger',
  accent: 'text-accent',
  cmd: 'text-text-1',
};

export interface TerminalScreenProps {
  /** True once the monitor has finished booting; starts the typed intro. */
  active: boolean;
  onOpenProject: (slug: string) => void;
}

/**
 * The left monitor: a small shell that answers from the real portfolio content.
 * It types a first command by itself, and stops as soon as the visitor touches the keyboard.
 */
export function TerminalScreen({ active, onOpenProject }: TerminalScreenProps) {
  const [lines, setLines] = useState<Printed[]>([]);
  const [input, setInput] = useState('');
  const history = useRef<string[]>([]);
  const historyIdx = useRef(-1);
  const touched = useRef(false);
  const introStarted = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doAction = useCallback(
    (action: Action) => {
      if (action.type === 'clear') {
        setLines([]);
      } else if (action.type === 'open-project') {
        onOpenProject(action.slug);
      } else if (action.href.startsWith('mailto:')) {
        window.location.href = action.href;
      } else {
        window.open(action.href, '_blank', 'noopener,noreferrer');
      }
    },
    [onOpenProject],
  );

  const exec = useCallback(
    (text: string) => {
      const result = runCommand(text);
      if (result.action?.type !== 'clear') {
        setLines((prev) => [...prev, { kind: 'cmd' as const, text }, ...result.lines].slice(-MAX_LINES));
      }
      if (result.action) doAction(result.action);
    },
    [doAction],
  );

  // Typed intro, once, after the monitor has booted
  useEffect(() => {
    if (!active || introStarted.current) return;
    introStarted.current = true;
    const timers: number[] = [];
    const script = 'neofetch';
    script.split('').forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          if (!touched.current) setInput(script.slice(0, i + 1));
        }, 500 + i * 70),
      );
    });
    timers.push(
      window.setTimeout(() => {
        if (touched.current) return;
        setInput('');
        exec(script);
        setLines((prev) => [...prev, { kind: 'dim' as const, text: 'Try: projects · open 1 · skills · sudo hire nishant' }]);
      }, 500 + script.length * 70 + 450),
    );
    return () => {
      introStarted.current = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [active, exec]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, input]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    touched.current = true;
    const text = input.trim();
    setInput('');
    historyIdx.current = -1;
    if (!text) return;
    history.current = [text, ...history.current].slice(0, 50);
    sound.playUiClick();
    exec(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation(); // keep the workstation shortcuts (1-5, arrows, Enter) out of the shell
    touched.current = true;
    if (e.key.length === 1) sound.playTerminalKey();
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = historyIdx.current + (e.key === 'ArrowUp' ? 1 : -1);
      if (next >= -1 && next < history.current.length) {
        historyIdx.current = next;
        setInput(next === -1 ? '' : history.current[next]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const options = complete(input);
      if (options.length === 1) {
        const [first, ...rest] = input.trimStart().split(/\s+/);
        setInput(rest.length === 0 ? options[0] + ' ' : `${first} ${options[0]}`);
      } else if (options.length > 1) {
        setLines((prev) => [...prev, { kind: 'cmd' as const, text: input }, { kind: 'dim' as const, text: options.join('  ') }]);
      }
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="terminal-screen">
      <div className="flex items-center gap-2 border-b border-line-strong bg-bg-1/60 py-1.5 pr-2.5 pl-7">
        <span className="size-1.5 rounded-full bg-danger/80" aria-hidden />
        <span className="size-1.5 rounded-full bg-warn/80" aria-hidden />
        <span className="size-1.5 rounded-full bg-ok/80" aria-hidden />
        <span className="ml-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-screen">MON-01 // TERMINAL</span>
        <span className="ml-auto text-[0.58rem] uppercase tracking-[0.14em] text-text-3">{COMMANDS.length} commands</span>
      </div>

      <div
        ref={scroller}
        className="min-h-0 flex-1 cursor-text overflow-y-auto py-2 pr-2.5 pl-7 text-[0.7rem] leading-[1.45] break-words"
        onClick={() => inputRef.current?.focus()}
        role="log"
        aria-live="polite"
      >
        {lines.map((line, i) => {
          const content =
            line.kind === 'cmd' ? (
              <>
                <span className="text-ok">{PROMPT}</span> {line.text}
              </>
            ) : (
              line.text
            );
          const action = 'action' in line ? line.action : undefined;
          return action ? (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playUiClick();
                doAction(action);
              }}
              className={cn('block w-full cursor-pointer text-left whitespace-pre-wrap hover:text-accent hover:underline', KIND_CLASS[line.kind])}
            >
              {content}
            </button>
          ) : (
            <div key={i} className={cn('whitespace-pre-wrap', KIND_CLASS[line.kind])}>
              {content}
            </div>
          );
        })}

        <form onSubmit={submit} className="flex items-center gap-1.5">
          <span className="shrink-0 text-ok">{PROMPT}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              touched.current = true;
              setInput(e.target.value);
            }}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 bg-transparent text-text-1 caret-accent outline-none"
            aria-label="Terminal input"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </form>
      </div>
    </div>
  );
}
