import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

type Props<T extends FieldValues> = {
  register: UseFormRegister<T>;
  trapId: string;
  websiteTrapId: string;
  confirmEmailTrapId: string;
};

/** Visually hidden fields — bots often fill these; humans never see them. */
export function HoneypotFields<
  T extends FieldValues & { trap: string; websiteTrap: string; confirmEmail: string },
>({ register, trapId, websiteTrapId, confirmEmailTrapId }: Props<T>) {
  return (
    <div className="absolute m-0 h-px w-px overflow-hidden border-0 p-0 [clip:rect(0,0,0,0)] whitespace-nowrap" aria-hidden="true">
      <label htmlFor={trapId}>Job title</label>
      <input id={trapId} tabIndex={-1} autoComplete="off" {...register("trap" as Path<T>)} />
      <label htmlFor={websiteTrapId}>Company website</label>
      <input
        id={websiteTrapId}
        tabIndex={-1}
        autoComplete="off"
        {...register("websiteTrap" as Path<T>)}
      />
      <label htmlFor={confirmEmailTrapId}>Confirm email</label>
      <input
        id={confirmEmailTrapId}
        tabIndex={-1}
        autoComplete="off"
        {...register("confirmEmail" as Path<T>)}
      />
    </div>
  );
}
