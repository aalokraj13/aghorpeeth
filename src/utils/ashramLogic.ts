import type {
  AppPersistedState,
  GranthBook,
  SahityaCategory,
  SankalpItem,
  VaniCategory,
  VaniItem,
} from '../types/ashram';

export const STORAGE_KEY = 'aghor_peeth_ashram_state_v1';
export const BEADS_PER_MALA = 108;

export function filterVanis(
  vanis: VaniItem[],
  category: VaniCategory,
  query: string
): VaniItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  return vanis.filter((item) => {
    const matchesCategory = category === 'सभी' || item.category === category;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    const haystack = `${item.quote} ${item.author} ${item.source} ${item.bhavarth} ${item.jeevanSutra}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function filterGranths(
  granths: GranthBook[],
  category: SahityaCategory,
  query: string
): GranthBook[] {
  const normalizedQuery = query.trim().toLowerCase();
  return granths.filter((book) => {
    const matchesCategory = category === 'सभी' || book.category === category;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    const chapterTitles = book.chapters.map((c) => c.title).join(' ');
    const haystack = `${book.title} ${book.subtitle} ${book.author} ${book.summary} ${chapterTitles}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function advanceMalaBead(
  currentBead: number,
  completedMalas: number,
  beadsPerMala = BEADS_PER_MALA
): { beadCount: number; completedMalas: number; justCompletedMala: boolean } {
  const safeBead = Math.max(0, Math.floor(currentBead));
  const safeMalas = Math.max(0, Math.floor(completedMalas));
  const nextBead = safeBead + 1;

  if (nextBead >= beadsPerMala) {
    return {
      beadCount: 0,
      completedMalas: safeMalas + 1,
      justCompletedMala: true,
    };
  }

  return {
    beadCount: nextBead,
    completedMalas: safeMalas,
    justCompletedMala: false,
  };
}

export function formatTimerSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function calculateReadingProgress(
  currentChapterIndex: number,
  totalChapters: number
): number {
  if (totalChapters <= 0) return 0;
  const clamped = Math.min(Math.max(0, currentChapterIndex), totalChapters - 1);
  return Math.round(((clamped + 1) / totalChapters) * 100);
}

export function validateSankalpInput(title: string): { valid: boolean; error?: string } {
  const trimmed = title.trim();
  if (!trimmed) {
    return { valid: false, error: 'कृपया अपना साधना संकल्प लिखें।' };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'संकल्प कम से कम ३ अक्षरों का होना चाहिए।' };
  }
  if (trimmed.length > 120) {
    return { valid: false, error: 'संकल्प १२० अक्षरों से छोटा रखें।' };
  }
  return { valid: true };
}

export function validateSevaPledge(
  seekerName: string,
  sevaId: string
): { valid: boolean; error?: string } {
  const trimmedName = seekerName.trim();
  if (!trimmedName) {
    return { valid: false, error: 'कृपया अपना नाम दर्ज करें।' };
  }
  if (trimmedName.length < 2) {
    return { valid: false, error: 'नाम कम से कम २ अक्षरों का लिखें।' };
  }
  if (!sevaId.trim()) {
    return { valid: false, error: 'कृपया सेवा प्रकल्प का चयन करें।' };
  }
  return { valid: true };
}

export function validateJigyasaInput(
  question: string,
  seekerName: string
): { valid: boolean; error?: string } {
  const trimmedQ = question.trim();
  const trimmedName = seekerName.trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { valid: false, error: 'कृपया अपना नाम लिखें (कम से कम २ अक्षर)।' };
  }
  if (!trimmedQ) {
    return { valid: false, error: 'कृपया अपनी आध्यात्मिक जिज्ञासा या प्रश्न लिखें।' };
  }
  if (trimmedQ.length < 6) {
    return { valid: false, error: 'कृपया थोड़ा स्पष्ट प्रश्न लिखें (कम से कम ६ अक्षर)।' };
  }
  return { valid: true };
}

export function createDefaultState(initialSankalps: SankalpItem[]): AppPersistedState {
  return {
    bookmarkedVaniIds: ['vani-1'],
    bookmarkedChapterKeys: [],
    vaniNotes: {},
    eventReminderIds: [],
    malaBeadCount: 0,
    completedMalas: 0,
    selectedMantraId: 'mantra-aghor',
    sankalps: initialSankalps,
    sevaPledges: [],
    customJigyasas: [],
    readerFontSize: 18,
    theme: 'light',
  };
}

export function parsePersistedState(
  rawJson: string | null,
  fallbackSankalps: SankalpItem[]
): AppPersistedState {
  const defaults = createDefaultState(fallbackSankalps);
  if (!rawJson) return defaults;
  try {
    const parsed = JSON.parse(rawJson) as Partial<AppPersistedState>;
    if (!parsed || typeof parsed !== 'object') return defaults;
    return {
      bookmarkedVaniIds: Array.isArray(parsed.bookmarkedVaniIds)
        ? parsed.bookmarkedVaniIds.filter((v): v is string => typeof v === 'string')
        : defaults.bookmarkedVaniIds,
      bookmarkedChapterKeys: Array.isArray(parsed.bookmarkedChapterKeys)
        ? parsed.bookmarkedChapterKeys.filter((v): v is string => typeof v === 'string')
        : defaults.bookmarkedChapterKeys,
      vaniNotes:
        parsed.vaniNotes && typeof parsed.vaniNotes === 'object' && !Array.isArray(parsed.vaniNotes)
          ? parsed.vaniNotes
          : defaults.vaniNotes,
      eventReminderIds: Array.isArray(parsed.eventReminderIds)
        ? parsed.eventReminderIds.filter((v): v is string => typeof v === 'string')
        : defaults.eventReminderIds,
      malaBeadCount:
        typeof parsed.malaBeadCount === 'number' && parsed.malaBeadCount >= 0 && parsed.malaBeadCount < BEADS_PER_MALA
          ? Math.floor(parsed.malaBeadCount)
          : defaults.malaBeadCount,
      completedMalas:
        typeof parsed.completedMalas === 'number' && parsed.completedMalas >= 0
          ? Math.floor(parsed.completedMalas)
          : defaults.completedMalas,
      selectedMantraId:
        typeof parsed.selectedMantraId === 'string' && parsed.selectedMantraId
          ? parsed.selectedMantraId
          : defaults.selectedMantraId,
      sankalps: Array.isArray(parsed.sankalps) ? parsed.sankalps : defaults.sankalps,
      sevaPledges: Array.isArray(parsed.sevaPledges) ? parsed.sevaPledges : defaults.sevaPledges,
      customJigyasas: Array.isArray(parsed.customJigyasas)
        ? parsed.customJigyasas
        : defaults.customJigyasas,
      readerFontSize:
        typeof parsed.readerFontSize === 'number' &&
        parsed.readerFontSize >= 14 &&
        parsed.readerFontSize <= 26
          ? parsed.readerFontSize
          : defaults.readerFontSize,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return defaults;
  }
}

export function pickRandomInspiringVani(
  vanis: VaniItem[],
  excludeId?: string,
  randomFn: () => number = Math.random
): VaniItem | null {
  if (vanis.length === 0) return null;
  const pool =
    excludeId && vanis.length > 1
      ? vanis.filter((item) => item.id !== excludeId)
      : vanis;
  const candidates = pool.length > 0 ? pool : vanis;
  const idx = Math.min(
    candidates.length - 1,
    Math.max(0, Math.floor(randomFn() * candidates.length))
  );
  return candidates[idx];
}

export function mapVaniCategoryToSankalpCategory(
  category: VaniItem['category']
): SankalpItem['category'] {
  switch (category) {
    case 'सेवा':
      return 'सेवा';
    case 'साधना':
      return 'जप';
    case 'वैराग्य':
      return 'मौन';
    case 'आत्मज्ञान':
    case 'समता':
    default:
      return 'स्वाध्याय';
  }
}

