export type ScreenId = 'home' | 'vani' | 'sahitya' | 'sadhana' | 'seva';

export type VaniCategory =
  | 'सभी'
  | 'आत्मज्ञान'
  | 'समता'
  | 'सेवा'
  | 'साधना'
  | 'वैराग्य';

export type SahityaCategory = 'सभी' | 'दर्शन' | 'वाणी संग्रह' | 'साधना विधि' | 'सेवा पथ';

export interface VaniItem {
  id: string;
  quote: string;
  author: string;
  source: string;
  category: Exclude<VaniCategory, 'सभी'>;
  bhavarth: string;
  jeevanSutra: string;
  featuredDate?: string;
}

export interface GranthChapter {
  id: string;
  number: number;
  title: string;
  readingMinutes: number;
  sutra: string;
  paragraphs: string[];
}

export interface GranthBook {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  category: Exclude<SahityaCategory, 'सभी'>;
  accessionCode: string;
  summary: string;
  coverImage: string;
  chapters: GranthChapter[];
}

export interface AshramEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  location: string;
  isDaily: boolean;
}

export interface SevaProgram {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  impactMetric: string;
  schedule: string;
  baseParticipants: number;
}

export interface SevaPledge {
  id: string;
  sevaId: string;
  sevaTitle: string;
  seekerName: string;
  sankalpNote: string;
  createdAt: string;
}

export interface SankalpItem {
  id: string;
  title: string;
  category: 'जप' | 'स्वाध्याय' | 'सेवा' | 'मौन';
  completedToday: boolean;
  streakDays: number;
}

export interface JigyasaItem {
  id: string;
  question: string;
  seekerName: string;
  answer: string;
  answeredBy: string;
  topic: string;
  isPending?: boolean;
}

export interface MantraOption {
  id: string;
  title: string;
  sanskrit: string;
  meaning: string;
}

export interface AppPersistedState {
  bookmarkedVaniIds: string[];
  bookmarkedChapterKeys: string[];
  vaniNotes: Record<string, string>;
  eventReminderIds: string[];
  malaBeadCount: number;
  completedMalas: number;
  selectedMantraId: string;
  sankalps: SankalpItem[];
  sevaPledges: SevaPledge[];
  customJigyasas: JigyasaItem[];
  readerFontSize: number;
  theme: 'light' | 'dark';
}
