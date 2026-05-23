const STORAGE_KEY = "ns_history";

export interface HistoryItem {
  shortPlayId: string;
  shortPlayName: string;
  shortPlayCover: string;
  episodeNo?: number;
  timestamp: number;
}

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addHistory(item: Omit<HistoryItem, "timestamp">) {
  const history = getHistory();
  // Remove existing entry for same drama+episode
  const filtered = history.filter(
    (h) =>
      !(
        h.shortPlayId === item.shortPlayId &&
        h.episodeNo === item.episodeNo
      )
  );
  const newItem: HistoryItem = { ...item, timestamp: Date.now() };
  // Keep most recent first, limit to 200
  const next = [newItem, ...filtered].slice(0, 200);
  setHistory(next);
}

export function clearHistory() {
  setHistory([]);
}

export function removeHistoryItem(shortPlayId: string, episodeNo?: number) {
  const history = getHistory();
  const filtered = history.filter(
    (h) => !(h.shortPlayId === shortPlayId && h.episodeNo === episodeNo)
  );
  setHistory(filtered);
}
