import { MEMORIES } from './content/story';

export const PERSONAL_SAVE_KEY = 'duyen_four_fields_v1';
export interface Progress {
  version: 1;
  activePlot: number;
  harvested: boolean[][];
  memories: string[];
  position: { x: number; z: number };
}
export const freshProgress = (): Progress => ({
  version: 1, activePlot: 0, harvested: Array.from({ length: 4 }, () => Array(12).fill(false)),
  memories: [], position: { x: 1, z: 11.4 },
});

export function validateProgress(value: unknown): value is Progress {
  if (!value || typeof value !== 'object') return false;
  const p = value as Partial<Progress>;
  const shapeValid = p.version === 1 && Number.isInteger(p.activePlot) && p.activePlot! >= 0 && p.activePlot! < 4 &&
    Array.isArray(p.harvested) && p.harvested.length === 4 && p.harvested.every(row =>
      Array.isArray(row) && row.length === 12 && row.every(flag => typeof flag === 'boolean')) &&
    Array.isArray(p.memories) && new Set(p.memories).size === p.memories.length &&
    p.memories.every(id => MEMORIES.some(memory => memory.id === id)) &&
    !!p.position && typeof p.position.x === 'number' && Number.isFinite(p.position.x) && Math.abs(p.position.x) <= 18 &&
    typeof p.position.z === 'number' && Number.isFinite(p.position.z) && p.position.z >= -18 && p.position.z <= 15;
  if (!shapeValid) return false;
  const progress = p as Progress;
  return MEMORIES.every((memory, index) => {
    const done = progress.harvested[index].every(Boolean);
    const read = progress.memories.includes(memory.id);
    if (index < progress.activePlot) return done && read;
    if (index > progress.activePlot) return !read && progress.harvested[index].every(flag => !flag);
    return !read || done;
  });
}

export interface ProgressStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function browserStorage(): ProgressStorage | undefined {
  try { return typeof window !== 'undefined' ? window.localStorage : undefined; } catch { return undefined; }
}
export function loadProgress(storage = browserStorage()): { progress: Progress; protected: boolean; warning: string } {
  if (!storage) return { progress: freshProgress(), protected: false, warning: 'Trình duyệt không cho lưu tiến độ. Dùng “Tải bản lưu” để giữ lại.' };
  try {
    const text = storage?.getItem(PERSONAL_SAVE_KEY);
    if (!text) return { progress: freshProgress(), protected: false, warning: '' };
    const data: unknown = JSON.parse(text);
    if (validateProgress(data)) return { progress: data, protected: false, warning: '' };
  } catch { /* Keep an unreadable save rather than replacing it. */ }
  return { progress: freshProgress(), protected: true, warning: 'Bản lưu chưa đọc được. Dữ liệu cũ chưa bị ghi đè; dùng “Tải bản lưu” để giữ lại.' };
}
export function saveProgress(progress: Progress, storage = browserStorage()): boolean {
  try { if (!validateProgress(progress) || !storage) return false; storage.setItem(PERSONAL_SAVE_KEY, JSON.stringify(progress)); return true; } catch { return false; }
}
export function completeMemory(progress: Progress, plot: number): boolean {
  const id = MEMORIES[plot]?.id;
  if (plot !== progress.activePlot || !validateProgress(progress) || !id || !progress.harvested[plot].every(Boolean) || progress.memories.includes(id)) return false;
  progress.memories.push(id); return true;
}
