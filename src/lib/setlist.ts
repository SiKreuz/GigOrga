import { playtime } from "./daysheet";

export function parseSongDuration(value: string): number | null {
  const groups = /^(?<minutes>\d+)(?::(?<seconds>[0-5]\d))?$/u.exec(value.trim())?.groups;
  if (!groups) return null;
  const seconds = Number(groups.minutes) * 60 + Number(groups.seconds ?? 0);
  return seconds > 0 ? seconds : null;
}

export function formatSongDuration(seconds: number): string {
  const rest = seconds % 60;
  return `${Math.floor(seconds / 60)}:${String(rest).padStart(2, "0")}`;
}

export function slotOf(gig: Parameters<typeof playtime>[0]): number | null {
  const minutes = playtime(gig);
  return minutes === null ? null : minutes * 60;
}

export function overrun(total: number, slot: number | null): number | null {
  return slot !== null && total > slot ? total - slot : null;
}
