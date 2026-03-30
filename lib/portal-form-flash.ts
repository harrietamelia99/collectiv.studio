/** Returned from portal server actions when used with `PortalFormWithFlash` + `useFormState`. */
export type PortalFormFlash = { ok: true; message?: string } | { ok: false; error: string };

export function portalFlashOk(message = "Saved."): PortalFormFlash {
  return { ok: true, message };
}

export function portalFlashErr(error: string): PortalFormFlash {
  return { ok: false, error };
}
