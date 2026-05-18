"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { Button } from "@/components/ui";
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

const toolbarActions = [
  { label: "B", title: "Pogrubienie", command: "bold" },
  { label: "I", title: "Kursywa", command: "italic" },
  { label: "H2", title: "Naglowek", command: "formatBlock", value: "h2" },
  { label: "H3", title: "Podnaglowek", command: "formatBlock", value: "h3" },
  { label: "P", title: "Akapit", command: "formatBlock", value: "p" },
  { label: "Lista", title: "Lista punktowana", command: "insertUnorderedList" },
  { label: "1.", title: "Lista numerowana", command: "insertOrderedList" },
];

export function CourseDescriptionEditor({
  id,
  value,
  onChange,
  className,
  ...editorProps
}: CourseDescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef("");

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

  const emitChange = () => {
    const html = sanitizeCourseDescriptionHtml(
      editorRef.current?.innerHTML ?? "",
    );
    lastHtmlRef.current = html;
    onChange(html);
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {toolbarActions.map((action) => (
          <Button
            key={`${action.command}-${action.value ?? action.label}`}
            type="button"
            variant="outline"
            size="sm"
            title={action.title}
            aria-label={action.title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(action.command, action.value)}
            className="min-w-10 px-3"
          >
            {action.label}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            runCommand("removeFormat");
            runCommand("formatBlock", "p");
          }}
        >
          Wyczyść
        </Button>
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
        className={cn(
          "min-h-[180px] w-full overflow-auto border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 text-[var(--coffee-charcoal)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)] [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc",
          className,
        )}
        {...editorProps}
      />
    </div>
  );
}
