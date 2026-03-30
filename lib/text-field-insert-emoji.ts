import type { RefObject } from "react";

type Controlled = { value: string; setValue: (next: string) => void };

/**
 * Inserts a string at the caret in a textarea or text input.
 * Use `controlled` when the field is React-controlled (`value` + `onChange`).
 */
export function insertAtCaret(
  inputRef: RefObject<HTMLTextAreaElement | HTMLInputElement | null>,
  text: string,
  controlled?: Controlled,
): void {
  const el = inputRef.current;
  if (!el) {
    if (controlled) controlled.setValue(controlled.value + text);
    return;
  }

  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;

  if (controlled) {
    const next = controlled.value.slice(0, start) + text + controlled.value.slice(end);
    controlled.setValue(next);
    const pos = start + text.length;
    requestAnimationFrame(() => {
      try {
        el.setSelectionRange(pos, pos);
        el.focus();
      } catch {
        /* ignore */
      }
    });
    return;
  }

  const v = el.value;
  el.value = v.slice(0, start) + text + v.slice(end);
  const pos = start + text.length;
  el.setSelectionRange(pos, pos);
  el.focus();
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}
