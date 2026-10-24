type TimedEntry = { kind: string; start: string; end: string };

const minutesOfDay = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export function parseSongDuration(value: string): number | null {
  const match = /^(\d+)(?::([0-5]\d))?$/u.exec(value.trim());
  if (!match) return null;
  const seconds = Number(match[1]) * 60 + Number(match[2] ?? 0);
  return seconds > 0 ? seconds : null;
}

export function formatSongDuration(seconds: number): string {
  const rest = seconds % 60;
  return `${Math.floor(seconds / 60)}:${String(rest).padStart(2, "0")}`;
}

export function showSlot(timetable: readonly TimedEntry[]): number | null {
  const show = timetable.find(
    (entry) => entry.kind === "show" && entry.start !== "" && entry.end !== "",
  );
  if (show === undefined) return null;
  const minutes = (minutesOfDay(show.end) - minutesOfDay(show.start) + 1440) % 1440;
  return minutes * 60;
}

export function overrun(total: number, slot: number | null): number | null {
  return slot !== null && total > slot ? total - slot : null;
}
