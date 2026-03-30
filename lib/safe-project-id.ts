/** Prisma `cuid()` ids are lowercase alnum, typically 25 chars — reject traversal / garbage early. */
const CUID_LIKE = /^[a-z0-9]{20,36}$/;

export function isLikelyProjectId(id: string | undefined): id is string {
  if (!id || id.length > 40) return false;
  return CUID_LIKE.test(id);
}
