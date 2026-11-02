export function summarize(notes) {
  if (!Array.isArray(notes)) throw new TypeError('notes must be an array');
  for (const note of notes) {
    if (!Number.isFinite(note.minutes) || note.minutes < 0) {
      throw new RangeError('minutes must be a finite non-negative number');
    }
  }
  return { count: notes.length, totalMinutes: notes.reduce((sum, note) => sum + note.minutes, 0) };
}
