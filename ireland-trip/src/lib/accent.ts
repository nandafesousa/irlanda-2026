export function deriveAccentVar(index: number): string {
  return `--c${(index % 6) + 1}`;
}
