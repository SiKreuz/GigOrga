export function safeRedirect(target: string | null): string {
  if (
    target === null ||
    !target.startsWith("/") ||
    target.startsWith("//") ||
    target.startsWith("/\\")
  ) {
    return "/";
  }
  return target;
}
