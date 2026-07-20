import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

type Props<T extends FieldValues> = {
  register: UseFormRegister<T>;
  trapId: string;
  websiteTrapId: string;
};

/** Visually hidden fields — bots often fill these; humans never see them. */
export function HoneypotFields<T extends FieldValues & { trap: string; websiteTrap: string }>({
  register,
  trapId,
  websiteTrapId,
}: Props<T>) {
  return (
    <div
      className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
      aria-hidden="true"
    >
      <label htmlFor={trapId}>Title</label>
      <input id={trapId} tabIndex={-1} autoComplete="off" {...register("trap" as Path<T>)} />
      <label htmlFor={websiteTrapId}>Company website</label>
      <input
        id={websiteTrapId}
        tabIndex={-1}
        autoComplete="off"
        {...register("websiteTrap" as Path<T>)}
      />
    </div>
  );
}
