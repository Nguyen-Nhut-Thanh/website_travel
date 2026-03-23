export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isNaN(value) ? 0 : value;
  if (typeof value === 'bigint') return Number(value);

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof value === 'object') {
    const maybeWithToNumber = value as { toNumber?: () => number };
    if (typeof maybeWithToNumber.toNumber === 'function') {
      const parsed = maybeWithToNumber.toNumber();
      return Number.isNaN(parsed) ? 0 : parsed;
    }

    const maybeWithToString = value as { toString?: () => string };
    if (typeof maybeWithToString.toString === 'function') {
      const parsed = Number(maybeWithToString.toString());
      return Number.isNaN(parsed) ? 0 : parsed;
    }
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
