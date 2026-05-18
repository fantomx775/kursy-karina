"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import type { IconType } from "react-icons";
import {
  LuBold,
  LuChevronDown,
  LuEraser,
  LuItalic,
  LuList,
  LuListOrdered,
  LuPilcrow,
  LuUnderline,
} from "react-icons/lu";
import {
  getCourseDescriptionHtml,
  sanitizeCourseDescriptionHtml,
} from "@/lib/courseDescription";
import { cn } from "@/lib/utils";

type CourseDescriptionEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "onChange">;

type ToolbarAction = {
  icon: IconType;
  title: string;
  command: string;
};

type ActiveStates = Record<string, boolean>;

const textStyles = [
  { label: "Akapit", value: "p" },
  { label: "Nagłówek 2", value: "h2" },
  { label: "Nagłówek 3", value: "h3" },
  { label: "Nagłówek 4", value: "h4" },
] as const;

const inlineActions = [
  { icon: LuBold, title: "Pogrubienie", command: "bold" },
  { icon: LuItalic, title: "Kursywa", command: "italic" },
  { icon: LuUnderline, title: "Podkreślenie", command: "underline" },
] satisfies ToolbarAction[];

const listActions = [
  { icon: LuList, title: "Lista punktowana", command: "insertUnorderedList" },
  {
    icon: LuListOrdered,
    title: "Lista numerowana",
    command: "insertOrderedList",
  },
] satisfies ToolbarAction[];

export function CourseDescriptionEditor({
  id,
  value,
  onChange,
  className,
  ...editorProps
}: CourseDescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef("");
  const [currentBlock, setCurrentBlock] = useState("p");
  const [activeStates, setActiveStates] = useState<ActiveStates>({});

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) {
      return;
    }

    const html = getCourseDescriptionHtml(value);
    if (html !== lastHtmlRef.current) {
      editor.innerHTML = html;
      lastHtmlRef.current = html;
    }
  }, [value]);

  const syncToolbarState = () => {
    if (
      typeof document.queryCommandState !== "function" ||
      typeof document.queryCommandValue !== "function"
    ) {
      return;
    }

    const nextStates = [...inlineActions, ...listActions].reduce<ActiveStates>(
      (states, action) => {
        states[action.command] = document.queryCommandState(action.command);
        return states;
      },
      {},
    );
    const blockValue = document.queryCommandValue("formatBlock");
    const normalizedBlock = blockValue.replace(/[<>]/g, "").toLowerCase();

    setActiveStates(nextStates);
    setCurrentBlock(
      textStyles.some((style) => style.value === normalizedBlock)
        ? normalizedBlock
        : "p",
    );
  };

  const emitChange = () => {
    const html = sanitizeCourseDescriptionHtml(
      editorRef.current?.innerHTML ?? "",
    );
    lastHtmlRef.current = html;
    onChange(html);
    syncToolbarState();
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const formatBlock = (block: string) => {
    runCommand("formatBlock", block);
    setCurrentBlock(block);
  };

  const renderToolbarButton = (action: ToolbarAction) => {
    const Icon = action.icon;
    const isActive = activeStates[action.command];

    return (
      <button
        key={action.command}
        type="button"
        title={action.title}
        aria-label={action.title}
        aria-pressed={isActive}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => runCommand(action.command)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded border border-transparent text-[var(--coffee-charcoal)] transition hover:border-[var(--coffee-cappuccino)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--coffee-macchiato)]",
          isActive &&
            "border-[var(--coffee-macchiato)] bg-white text-[var(--coffee-espresso)] shadow-sm",
        )}
      >
        <Icon aria-hidden="true" className="h-4 w-4" />
      </button>
    );
  };

  return (
    <div className="overflow-hidden border border-[var(--coffee-cappuccino)] bg-white shadow-sm">
      <div className="flex min-h-12 flex-wrap items-center gap-1 border-b border-[var(--coffee-cappuccino)] bg-[#faf8f5] px-2 py-2">
        <div className="relative mr-1">
          <label htmlFor={`${id}-text-style`} className="sr-only">
            Styl tekstu
          </label>
          <select
            id={`${id}-text-style`}
            value={currentBlock}
            onChange={(event) => formatBlock(event.target.value)}
            onFocus={syncToolbarState}
            className="h-9 min-w-[150px] appearance-none rounded border border-[var(--coffee-cappuccino)] bg-white py-0 pl-3 pr-9 text-sm font-medium text-[var(--coffee-charcoal)] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
          >
            {textStyles.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
          <LuChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--coffee-charcoal)]"
          />
        </div>

        <div className="mx-1 flex items-center gap-1 border-l border-[var(--coffee-cappuccino)] pl-2">
          {inlineActions.map(renderToolbarButton)}
        </div>

        <div className="mx-1 flex items-center gap-1 border-l border-[var(--coffee-cappuccino)] pl-2">
          {listActions.map(renderToolbarButton)}
        </div>

        <div className="mx-1 flex items-center gap-1 border-l border-[var(--coffee-cappuccino)] pl-2">
          <button
            type="button"
            title="Akapit"
            aria-label="Akapit"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => formatBlock("p")}
            className="flex h-9 w-9 items-center justify-center rounded border border-transparent text-[var(--coffee-charcoal)] transition hover:border-[var(--coffee-cappuccino)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
          >
            <LuPilcrow aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Wyczyść formatowanie"
            aria-label="Wyczyść formatowanie"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              runCommand("removeFormat");
              formatBlock("p");
            }}
            className="flex h-9 w-9 items-center justify-center rounded border border-transparent text-[var(--coffee-charcoal)] transition hover:border-[var(--coffee-cappuccino)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
          >
            <LuEraser aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        id={id}
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onFocus={syncToolbarState}
        onKeyUp={syncToolbarState}
        onMouseUp={syncToolbarState}
        className={cn(
          "min-h-[220px] w-full overflow-auto bg-white px-4 py-3 text-[15px] leading-7 text-[var(--coffee-charcoal)] outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--coffee-macchiato)] [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-lg [&_h4]:font-semibold [&_li]:ml-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc",
          className,
        )}
        {...editorProps}
      />
    </div>
  );
}
