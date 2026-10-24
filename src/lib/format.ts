const dateFormat = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const monthFormat = new Intl.DateTimeFormat("de-DE", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const moneyFormat = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const numberFormat = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 3,
  useGrouping: false,
});

const parse = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

export function formatDate(isoDate: string): string {
  const parts = dateFormat.formatToParts(parse(isoDate));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("weekday")} ${part("day")}.${part("month")}.${part("year")}`;
}

export function formatMonth(isoDate: string): string {
  return monthFormat.format(parse(isoDate));
}

export function formatMoney(value: number | null): string {
  return value === null ? "–" : moneyFormat.format(value);
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "–";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function daysUntil(isoDate: string, today: string): number {
  return Math.round((parse(isoDate).getTime() - parse(today).getTime()) / 86_400_000);
}

export function relativeDay(isoDate: string, today: string): string {
  const days = daysUntil(isoDate, today);
  if (days === 0) return "Heute";
  if (days === 1) return "Morgen";
  if (days === -1) return "Gestern";
  return days > 0 ? `in ${days} Tagen` : `vor ${-days} Tagen`;
}

export function todayIso(now = new Date()): string {
  return now.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

export function formatNumber(value: number | null): string {
  return value === null ? "" : numberFormat.format(value);
}

export function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const number = Number(trimmed.replace(",", "."));
  return Number.isFinite(number) ? number : null;
}
