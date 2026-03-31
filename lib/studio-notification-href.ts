/** Parse project id from notification deep link (`/portal/project/:id/...`). */
export function projectIdFromStudioNotificationHref(href: string | null | undefined): string | null {
  const m = href?.match(/\/portal\/project\/([^/#?]+)/);
  return m?.[1] ?? null;
}
