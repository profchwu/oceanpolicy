/** Change in number of correct answers; unfinished phases remain missing. */
export function scoreChange(after: number | undefined, before: number | undefined): number | null {
  return after === undefined || before === undefined ? null : after - before;
}

export function formatChange(change: number | null): string {
  return change === null ? '—' : `${change > 0 ? '+' : ''}${change}`;
}
