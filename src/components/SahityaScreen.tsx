import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Minus,
  Plus,
  Search,
  X,
} from 'lucide-react';
import type { GranthBook, SahityaCategory } from '../types/ashram';
import { calculateReadingProgress, filterGranths } from '../utils/ashramLogic';
import { SafeImage } from './SafeImage';

interface SahityaScreenProps {
  granths: GranthBook[];
  bookmarkedChapterKeys: string[];
  onToggleBookmarkChapter: (chapterKey: string) => void;
  readerFontSize: number;
  onChangeFontSize: (nextSize: number) => void;
  initialSelectedBookId?: string | null;
  initialChapterIndex?: number;
  onClearInitialSelection?: () => void;
}

const SAHITYA_CATEGORIES: SahityaCategory[] = [
  'सभी',
  'दर्शन',
  'वाणी संग्रह',
  'साधना विधि',
  'सेवा पथ',
];

export function SahityaScreen({
  granths,
  bookmarkedChapterKeys,
  onToggleBookmarkChapter,
  readerFontSize,
  onChangeFontSize,
  initialSelectedBookId = null,
  initialChapterIndex = 0,
  onClearInitialSelection,
}: SahityaScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<SahityaCategory>('सभी');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBookId, setActiveBookId] = useState<string | null>(initialSelectedBookId);
  const [chapterIndex, setChapterIndex] = useState<number>(initialChapterIndex);

  const filteredBooks = useMemo(
    () => filterGranths(granths, selectedCategory, searchQuery),
    [granths, selectedCategory, searchQuery]
  );

  const activeBook = useMemo(
    () => granths.find((book) => book.id === activeBookId) ?? null,
    [granths, activeBookId]
  );

  const openBook = (bookId: string, startChapter = 0) => {
    setActiveBookId(bookId);
    setChapterIndex(startChapter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeBook = () => {
    setActiveBookId(null);
    setChapterIndex(0);
    onClearInitialSelection?.();
  };

  if (activeBook) {
    const safeIndex = Math.min(Math.max(0, chapterIndex), activeBook.chapters.length - 1);
    const chapter = activeBook.chapters[safeIndex];
    const chapterKey = `${activeBook.id}::${chapter.id}`;
    const isChapterSaved = bookmarkedChapterKeys.includes(chapterKey);
    const progressPct = calculateReadingProgress(safeIndex, activeBook.chapters.length);

    return (
      <div className="space-y-8 pb-10">
        {/* Reader Top Utility Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DDD0] pb-4 dark:border-[#2E2722]">
          <button
            type="button"
            onClick={closeBook}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#D6CCBD] px-3.5 py-2 text-sm font-medium text-[#1F1A17] hover:bg-[#F2ECE1] dark:border-[#3A312B] dark:text-[#F4EFE8] dark:hover:bg-[#26201B]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ग्रंथालय पर वापस जाएँ</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg border border-[#D6CCBD] bg-[#FBF9F5] p-0.5 dark:border-[#3A312B] dark:bg-[#1B1714]">
              <button
                type="button"
                onClick={() => onChangeFontSize(Math.max(15, readerFontSize - 2))}
                aria-label="अक्षर छोटे करें"
                disabled={readerFontSize <= 15}
                className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-md text-[#1F1A17] hover:bg-[#F2ECE1] disabled:opacity-40 dark:text-[#F4EFE8] dark:hover:bg-[#26201B]"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="tabular-nums px-2 text-xs font-medium text-[#574D45] dark:text-[#B9AFA4]">
                अक्षर {readerFontSize}
              </span>
              <button
                type="button"
                onClick={() => onChangeFontSize(Math.min(24, readerFontSize + 2))}
                aria-label="अक्षर बड़े करें"
                disabled={readerFontSize >= 24}
                className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-md text-[#1F1A17] hover:bg-[#F2ECE1] disabled:opacity-40 dark:text-[#F4EFE8] dark:hover:bg-[#26201B]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onToggleBookmarkChapter(chapterKey)}
              aria-pressed={isChapterSaved}
              className={`inline-flex min-h-[42px] items-center gap-1.5 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
                isChapterSaved
                  ? 'border-[#9A3412] bg-[#9A3412] text-[#FBF9F5] dark:border-[#C2410C] dark:bg-[#C2410C]'
                  : 'border-[#D6CCBD] text-[#1F1A17] hover:bg-[#F2ECE1] dark:border-[#3A312B] dark:text-[#F4EFE8] dark:hover:bg-[#26201B]'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" fill={isChapterSaved ? 'currentColor' : 'none'} />
              <span>{isChapterSaved ? 'अध्याय सहेजा गया' : 'अध्याय सहेजें'}</span>
            </button>
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#6B5B4E] dark:text-[#9E9388]">
            <span>{activeBook.title}</span>
            <span className="tabular-nums">
              अध्याय {safeIndex + 1} / {activeBook.chapters.length} · {progressPct}% पूर्ण
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5DDD0] dark:bg-[#2E2722]">
            <div
              className="h-full rounded-full bg-[#9A3412] transition-all duration-200 dark:bg-[#E07A4B]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Two-Column Reader Layout: Chapter Rail + Main Reading Column */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="space-y-3 lg:col-span-4">
            <h2 className="text-xs font-semibold tracking-wider text-[#6B5B4E] dark:text-[#9E9388]">
              अध्याय अनुक्रमणिका
            </h2>
            <div className="space-y-2">
              {activeBook.chapters.map((ch, idx) => {
                const isCurrent = idx === safeIndex;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChapterIndex(idx)}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`w-full rounded-xl border p-3.5 text-left ${
                      isCurrent
                        ? 'border-[#9A3412] bg-[#9A3412] text-[#FBF9F5] dark:border-[#C2410C] dark:bg-[#C2410C]'
                        : 'border-[#E5DDD0] bg-[#FBF9F5] text-[#574D45] hover:bg-[#F2ECE1]/60 dark:border-[#2E2722] dark:bg-[#1B1714] dark:text-[#B9AFA4] dark:hover:bg-[#241E1A]'
                    }`}
                  >
                    <p
                      className={`tabular-nums text-xs ${
                        isCurrent
                          ? 'text-[#FDE6D8]'
                          : 'text-[#9A3412] dark:text-[#E07A4B]'
                      }`}
                    >
                      अध्याय {ch.number} · {ch.readingMinutes} मिनट पठन
                    </p>
                    <p className="mt-1 text-sm font-medium">{ch.title}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <article className="max-w-2xl space-y-6 lg:col-span-8">
            <header className="space-y-2 border-b border-[#E5DDD0] pb-5 dark:border-[#2E2722]">
              <p className="tabular-nums text-xs text-[#6B5B4E] dark:text-[#9E9388]">
                {activeBook.accessionCode} · अध्याय {chapter.number} · {chapter.readingMinutes} मिनट पठन
              </p>
              <h1 className="font-editorial text-3xl font-semibold text-[#1F1A17] sm:text-4xl dark:text-[#F4EFE8]">
                {chapter.title}
              </h1>
            </header>

            {/* Sanskrit Sutra Callout (top & bottom hairline rules, no left thick bar) */}
            <div className="border-y border-[#E0D6C6] py-4 text-center dark:border-[#332B25]">
              <p className="font-editorial text-lg italic text-[#9A3412] sm:text-xl dark:text-[#E07A4B]">
                “{chapter.sutra}”
              </p>
            </div>

            <div className="space-y-5" style={{ fontSize: `${readerFontSize}px` }}>
              {chapter.paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="leading-[1.85] text-[#2B241F] dark:text-[#E4DCD2]"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Chapter Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5DDD0] pt-6 dark:border-[#2E2722]">
              <button
                type="button"
                disabled={safeIndex === 0}
                onClick={() => setChapterIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#D6CCBD] px-4 py-2 text-sm font-medium text-[#1F1A17] hover:bg-[#F2ECE1] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#3A312B] dark:text-[#F4EFE8] dark:hover:bg-[#26201B]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>पिछला अध्याय</span>
              </button>

              <button
                type="button"
                disabled={safeIndex >= activeBook.chapters.length - 1}
                onClick={() =>
                  setChapterIndex((prev) => Math.min(activeBook.chapters.length - 1, prev + 1))
                }
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#9A3412] px-5 py-2 text-sm font-medium text-[#FBF9F5] hover:bg-[#7C2D12] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#C2410C]"
              >
                <span>अगला अध्याय</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2 border-b border-[#E5DDD0] pb-6 dark:border-[#2E2722]">
        <p className="text-xs font-medium text-[#9A3412] dark:text-[#E07A4B]">आध्यात्मिक डिजिटल ग्रंथालय</p>
        <h1 className="font-editorial text-3xl font-semibold text-[#1F1A17] sm:text-4xl dark:text-[#F4EFE8]">
          धार्मिक साहित्य एवं अघोर ग्रंथ
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#574D45] dark:text-[#C7B9A8]">
          अघोर दर्शन, साधना विधि, गुरु-शिष्य संवाद और सेवा संस्कृति पर आधारित प्रामाणिक ग्रंथों का अध्याय-वार स्वाध्याय करें।
        </p>
      </header>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <label htmlFor="sahitya-search" className="sr-only">
            ग्रंथ खोजें
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6B5B4E] dark:text-[#9E9388]" />
          <input
            id="sahitya-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ग्रंथ का नाम, विषय या अध्याय खोजें..."
            className="min-h-[44px] w-full rounded-xl border border-[#D6CCBD] bg-[#FBF9F5] py-2.5 pr-10 pl-10 text-sm text-[#1F1A17] placeholder:text-[#8A7C70] focus:border-[#9A3412] focus:outline-none dark:border-[#3A312B] dark:bg-[#1B1714] dark:text-[#F4EFE8]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="खोज साफ़ करें"
              className="absolute top-1/2 right-2 flex min-h-[36px] min-w-[36px] -translate-y-1/2 items-center justify-center rounded-lg text-[#6B5B4E] hover:bg-[#F2ECE1] dark:text-[#B9AFA4]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div role="tablist" aria-label="साहित्य श्रेणी" className="flex flex-wrap gap-2">
          {SAHITYA_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#9A3412] text-[#FBF9F5] dark:bg-[#C2410C]'
                    : 'bg-[#F2ECE1] text-[#574D45] hover:bg-[#E7DEC9] dark:bg-[#221D19] dark:text-[#C7B9A8]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="rounded-2xl border border-[#E5DDD0] bg-[#F2ECE1]/50 p-10 text-center dark:border-[#2E2722] dark:bg-[#1B1714]">
          <p className="font-editorial text-xl font-medium text-[#1F1A17] dark:text-[#F4EFE8]">
            इस श्रेणी या खोज से संबंधित कोई ग्रंथ नहीं मिला।
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('सभी');
              setSearchQuery('');
            }}
            className="mt-4 min-h-[44px] rounded-lg bg-[#9A3412] px-5 py-2 text-sm font-medium text-[#FBF9F5]"
          >
            सभी ग्रंथ दिखाएँ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredBooks.map((book) => {
            const totalMinutes = book.chapters.reduce((acc, ch) => acc + ch.readingMinutes, 0);
            return (
              <article
                key={book.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] sm:flex-row dark:border-[#2E2722] dark:bg-[#1B1714]"
              >
                <div className="sm:w-44 sm:shrink-0">
                  <SafeImage
                    src={book.coverImage}
                    alt={`${book.title} का आवरण`}
                    fallbackTitle={book.title}
                    className="h-48 w-full object-cover sm:h-full"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                  <div className="space-y-2">
                    <p className="tabular-nums text-xs text-[#6B5B4E] dark:text-[#9E9388]">
                      <span className="font-semibold text-[#9A3412] dark:text-[#E07A4B]">
                        {book.category}
                      </span>
                      {' · '}
                      {book.chapters.length} अध्याय
                      {' · '}
                      {totalMinutes} मिनट
                    </p>
                    <h2 className="font-editorial text-xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                      {book.title}
                    </h2>
                    <p className="text-xs text-[#6B5B4E] dark:text-[#A99D91]">{book.author}</p>
                    <p className="text-sm leading-relaxed text-[#574D45] dark:text-[#C7B9A8]">
                      {book.summary}
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => openBook(book.id, 0)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#9A3412] px-4 py-2.5 text-sm font-medium text-[#FBF9F5] transition-colors hover:bg-[#7C2D12] dark:bg-[#C2410C]"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>स्वाध्याय प्रारंभ करें</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
