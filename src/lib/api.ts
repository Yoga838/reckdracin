const BASE = "https://netshort.dramabos.online";

export const DEFAULT_LANG = "in";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as T;
}

export interface ContentItem {
  shortPlayId: string;
  shortPlayLibraryId: string;
  shortPlayName: string;
  shortPlayCover: string;
  heatScoreShow?: string;
  labelArray?: string[];
  scriptName?: string;
}

export interface HomeSection {
  contentName: string;
  contentType: number;
  contentInfos: ContentItem[];
  groupId: string;
}

export interface DramaListResp {
  count: number;
  dataList: ContentItem[];
  completed: boolean;
}

export interface Episode {
  episodeId: string;
  episodeNo: number;
  episodeCover: string;
  episodeGoldCoinPrice: number;
  isLock: boolean;
  playVoucher: string | null;
  subtitleList: Array<{ language?: string; url?: string }> | null;
}

export interface DramaDetail {
  shortPlayName?: string;
  shortPlayCover: string;
  shortPlayEpisodeList: Episode[];
  language: string;
  payPoint: number;
}

export interface CategoryOption {
  key?: number | string;
  value?: string;
  valueEn?: string;
  labelName?: string;
  labelLanguageId?: string | number;
  extList?: unknown;
}

export interface Categories {
  region: CategoryOption[];
  audio: CategoryOption[];
  orderMode: CategoryOption[];
  tag: CategoryOption[];
}

export const api = {
  home: (page: number, lang = DEFAULT_LANG) =>
    get<HomeSection>(`/api/home/${page}?lang=${lang}`),
  categories: (lang = DEFAULT_LANG) =>
    get<Categories>(`/api/categories?lang=${lang}`),
  list: (page: number, lang = DEFAULT_LANG) =>
    get<DramaListResp>(`/api/list/${page}?lang=${lang}`),
  drama: (id: string, lang = DEFAULT_LANG) =>
    get<DramaDetail>(`/api/drama/${id}?lang=${lang}`),
  watch: (id: string, ep: number, token: string, lang = DEFAULT_LANG) =>
    get<Episode>(`/api/watch/${id}/${ep}?lang=${lang}&token=${encodeURIComponent(token)}`),
  search: (q: string, page = 1, lang = DEFAULT_LANG) =>
    get<{ searchCodeSearchResult: ContentItem[] }>(
      `/api/search?lang=${lang}&q=${encodeURIComponent(q)}&page=${page}`,
    ),
};

const HARDCODED_TOKEN = "4CFB9A999639A6742E29B87A142E18C5";

export function getToken(): string {
  return HARDCODED_TOKEN;
}
export function setToken(_t: string) {
  // Token is hardcoded; setToken is a no-op.
}
