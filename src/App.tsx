import { useEffect, useMemo, useState } from 'react';
import {
  AGHOR_VANIS,
  DHARMA_SAHITYA,
  INITIAL_JIGYASA,
  INITIAL_SANKALPS,
} from './data/ashramData';
import type {
  AppPersistedState,
  JigyasaItem,
  SankalpItem,
  ScreenId,
  SevaPledge,
} from './types/ashram';
import {
  STORAGE_KEY,
  advanceMalaBead,
  parsePersistedState,
} from './utils/ashramLogic';
import { TopNav } from './components/TopNav';
import { HomeScreen } from './components/HomeScreen';
import { VaniScreen } from './components/VaniScreen';
import { SahityaScreen } from './components/SahityaScreen';
import { SadhanaScreen } from './components/SadhanaScreen';
import { SevaScreen } from './components/SevaScreen';

function getInitialScreen(): ScreenId {
  if (typeof window === 'undefined') return 'home';
  const params = new URLSearchParams(window.location.search);
  const screenParam = params.get('screen');
  if (
    screenParam === 'home' ||
    screenParam === 'vani' ||
    screenParam === 'sahitya' ||
    screenParam === 'sadhana' ||
    screenParam === 'seva'
  ) {
    return screenParam;
  }
  if (params.get('autostart') === '1') {
    return 'sadhana';
  }
  return 'home';
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>(getInitialScreen);
  const [readerSelection, setReaderSelection] = useState<{
    bookId: string | null;
    chapterIndex: number;
  }>({ bookId: null, chapterIndex: 0 });

  const [state, setState] = useState<AppPersistedState>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return parsePersistedState(raw, INITIAL_SANKALPS);
    } catch {
      return parsePersistedState(null, INITIAL_SANKALPS);
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or privacy mode fallback
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  const handleNavigate = (screen: ScreenId) => {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const toggleSaveVani = (id: string) => {
    setState((prev) => {
      const exists = prev.bookmarkedVaniIds.includes(id);
      return {
        ...prev,
        bookmarkedVaniIds: exists
          ? prev.bookmarkedVaniIds.filter((item) => item !== id)
          : [id, ...prev.bookmarkedVaniIds],
      };
    });
  };

  const saveVaniNote = (id: string, note: string) => {
    setState((prev) => {
      const nextNotes = { ...prev.vaniNotes };
      if (!note) {
        delete nextNotes[id];
      } else {
        nextNotes[id] = note;
      }
      return { ...prev, vaniNotes: nextNotes };
    });
  };

  const toggleEventReminder = (eventId: string) => {
    setState((prev) => {
      const exists = prev.eventReminderIds.includes(eventId);
      return {
        ...prev,
        eventReminderIds: exists
          ? prev.eventReminderIds.filter((id) => id !== eventId)
          : [...prev.eventReminderIds, eventId],
      };
    });
  };

  const toggleBookmarkChapter = (chapterKey: string) => {
    setState((prev) => {
      const exists = prev.bookmarkedChapterKeys.includes(chapterKey);
      return {
        ...prev,
        bookmarkedChapterKeys: exists
          ? prev.bookmarkedChapterKeys.filter((k) => k !== chapterKey)
          : [chapterKey, ...prev.bookmarkedChapterKeys],
      };
    });
  };

  const handleTapMala = () => {
    setState((prev) => {
      const next = advanceMalaBead(prev.malaBeadCount, prev.completedMalas);
      return {
        ...prev,
        malaBeadCount: next.beadCount,
        completedMalas: next.completedMalas,
      };
    });
  };

  const handleResetMala = () => {
    setState((prev) => ({ ...prev, malaBeadCount: 0 }));
  };

  const handleToggleSankalp = (id: string) => {
    setState((prev) => ({
      ...prev,
      sankalps: prev.sankalps.map((item) => {
        if (item.id !== id) return item;
        const nextCompleted = !item.completedToday;
        return {
          ...item,
          completedToday: nextCompleted,
          streakDays: nextCompleted
            ? item.streakDays + 1
            : Math.max(0, item.streakDays - 1),
        };
      }),
    }));
  };

  const handleAddSankalp = (title: string, category: SankalpItem['category']) => {
    const newItem: SankalpItem = {
      id: `sk-${Date.now()}`,
      title,
      category,
      completedToday: false,
      streakDays: 0,
    };
    setState((prev) => ({
      ...prev,
      sankalps: [newItem, ...prev.sankalps],
    }));
  };

  const handleDeleteSankalp = (id: string) => {
    setState((prev) => ({
      ...prev,
      sankalps: prev.sankalps.filter((item) => item.id !== id),
    }));
  };

  const handleAddSevaPledge = (
    sevaId: string,
    sevaTitle: string,
    seekerName: string,
    note: string
  ) => {
    const newPledge: SevaPledge = {
      id: `pledge-${Date.now()}`,
      sevaId,
      sevaTitle,
      seekerName,
      sankalpNote: note,
      createdAt: new Date().toLocaleDateString('hi-IN'),
    };
    setState((prev) => ({
      ...prev,
      sevaPledges: [newPledge, ...prev.sevaPledges],
    }));
  };

  const handleAddJigyasa = (question: string, seekerName: string, topic: string) => {
    const newJigyasa: JigyasaItem = {
      id: `jig-user-${Date.now()}`,
      question,
      seekerName,
      topic,
      answeredBy: 'आश्रम आचार्य मंडल',
      answer:
        'आपकी जिज्ञासा आश्रम संवाद पटल पर दर्ज कर ली गई है। संध्या सत्संग में इस विषय पर विस्तृत मार्गदर्शन प्रदान किया जाएगा। तब तक समदृष्टि और शांत श्वास के साथ नित्य स्वाध्याय जारी रखें।',
      isPending: true,
    };
    setState((prev) => ({
      ...prev,
      customJigyasas: [newJigyasa, ...prev.customJigyasas],
    }));
  };

  const allJigyasas = useMemo(
    () => [...state.customJigyasas, ...INITIAL_JIGYASA],
    [state.customJigyasas]
  );

  const bookmarkedVanis = useMemo(
    () => AGHOR_VANIS.filter((v) => state.bookmarkedVaniIds.includes(v.id)),
    [state.bookmarkedVaniIds]
  );

  const sankalpsDoneCount = state.sankalps.filter((s) => s.completedToday).length;
  const savedTotalCount =
    state.bookmarkedVaniIds.length + state.bookmarkedChapterKeys.length;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1F1A17] transition-colors duration-200 dark:bg-[#14110F] dark:text-[#F4EFE8]">
      <TopNav
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        savedCount={savedTotalCount}
        theme={state.theme}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-20 sm:px-6 md:pt-8 md:pb-12">
        {activeScreen === 'home' && (
          <HomeScreen
            dailyVani={AGHOR_VANIS[0]}
            allVanis={AGHOR_VANIS}
            isDailySaved={state.bookmarkedVaniIds.includes(AGHOR_VANIS[0].id)}
            onToggleSaveVani={toggleSaveVani}
            onNavigate={handleNavigate}
            eventReminderIds={state.eventReminderIds}
            onToggleEventReminder={toggleEventReminder}
            theme={state.theme}
            onToggleTheme={toggleTheme}
            completedMalas={state.completedMalas}
            sankalps={state.sankalps}
            onAdoptSankalp={(title, category) => {
              const trimmed = title.trim();
              if (!trimmed) return;
              const alreadyExists = state.sankalps.some(
                (item) => item.title.trim() === trimmed
              );
              if (!alreadyExists) {
                handleAddSankalp(trimmed, category);
              }
            }}
            sankalpsDoneCount={sankalpsDoneCount}
            sankalpsTotalCount={state.sankalps.length}
          />
        )}

        {activeScreen === 'vani' && (
          <VaniScreen
            vanis={AGHOR_VANIS}
            bookmarkedVaniIds={state.bookmarkedVaniIds}
            onToggleSaveVani={toggleSaveVani}
            vaniNotes={state.vaniNotes}
            onSaveVaniNote={saveVaniNote}
          />
        )}

        {activeScreen === 'sahitya' && (
          <SahityaScreen
            granths={DHARMA_SAHITYA}
            bookmarkedChapterKeys={state.bookmarkedChapterKeys}
            onToggleBookmarkChapter={toggleBookmarkChapter}
            readerFontSize={state.readerFontSize}
            onChangeFontSize={(nextSize) =>
              setState((prev) => ({ ...prev, readerFontSize: nextSize }))
            }
            initialSelectedBookId={readerSelection.bookId}
            initialChapterIndex={readerSelection.chapterIndex}
            onClearInitialSelection={() =>
              setReaderSelection({ bookId: null, chapterIndex: 0 })
            }
          />
        )}

        {activeScreen === 'sadhana' && (
          <SadhanaScreen
            malaBeadCount={state.malaBeadCount}
            completedMalas={state.completedMalas}
            selectedMantraId={state.selectedMantraId}
            onSelectMantra={(mantraId) =>
              setState((prev) => ({ ...prev, selectedMantraId: mantraId }))
            }
            onTapMala={handleTapMala}
            onResetMala={handleResetMala}
            sankalps={state.sankalps}
            onToggleSankalp={handleToggleSankalp}
            onAddSankalp={handleAddSankalp}
            onDeleteSankalp={handleDeleteSankalp}
          />
        )}

        {activeScreen === 'seva' && (
          <SevaScreen
            sevaPledges={state.sevaPledges}
            onAddSevaPledge={handleAddSevaPledge}
            jigyasas={allJigyasas}
            onAddJigyasa={handleAddJigyasa}
            bookmarkedVanis={bookmarkedVanis}
            vaniNotes={state.vaniNotes}
            onRemoveBookmarkedVani={toggleSaveVani}
            bookmarkedChapterKeys={state.bookmarkedChapterKeys}
            granths={DHARMA_SAHITYA}
            onOpenGranthChapter={(bookId, chapterIndex) => {
              setReaderSelection({ bookId, chapterIndex });
              setActiveScreen('sahitya');
            }}
            onRemoveBookmarkedChapter={toggleBookmarkChapter}
          />
        )}
      </main>

      <footer className="hidden border-t border-[#E5DDD0] py-6 text-xs text-[#6B5B4E] md:block dark:border-[#2E2722] dark:text-[#9E9388]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
          <p>अघोर पीठ आश्रम · सद्भाव, साधना एवं मानव कल्याण का डिजिटल मंच</p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => handleNavigate('vani')}
              className="hover:text-[#1F1A17] hover:underline dark:hover:text-[#F4EFE8]"
            >
              अघोरवाणी
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('sahitya')}
              className="hover:text-[#1F1A17] hover:underline dark:hover:text-[#F4EFE8]"
            >
              धार्मिक साहित्य
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('seva')}
              className="hover:text-[#1F1A17] hover:underline dark:hover:text-[#F4EFE8]"
            >
              सेवा एवं संवाद
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
