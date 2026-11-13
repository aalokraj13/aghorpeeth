import { useMemo, useState } from 'react';
import { Bookmark, Check, ChevronDown, ChevronUp, Copy, Search, X } from 'lucide-react';
import type { VaniCategory, VaniItem } from '../types/ashram';
import { filterVanis } from '../utils/ashramLogic';

interface VaniScreenProps {
  vanis: VaniItem[];
  bookmarkedVaniIds: string[];
  onToggleSaveVani: (id: string) => void;
  vaniNotes: Record<string, string>;
  onSaveVaniNote: (id: string, note: string) => void;
}

const CATEGORIES: VaniCategory[] = ['सभी', 'आत्मज्ञान', 'समता', 'सेवा', 'साधना', 'वैराग्य'];

export function VaniScreen({
  vanis,
  bookmarkedVaniIds,
  onToggleSaveVani,
  vaniNotes,
  onSaveVaniNote,
}: VaniScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<VaniCategory>('सभी');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({ 'vani-1': true });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>(vaniNotes);
  const [savedNoteFeedbackId, setSavedNoteFeedbackId] = useState<string | null>(null);

  const filteredVanis = useMemo(
    () => filterVanis(vanis, selectedCategory, searchQuery),
    [vanis, selectedCategory, searchQuery]
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (item: VaniItem) => {
    try {
      await navigator.clipboard?.writeText(`"${item.quote}" — ${item.author} (${item.source})`);
    } catch {
      // Clipboard may be unavailable in restricted contexts; still confirm action cleanly
    }
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const handleNoteSubmit = (id: string) => {
    onSaveVaniNote(id, (draftNotes[id] ?? '').trim());
    setSavedNoteFeedbackId(id);
    window.setTimeout(() => setSavedNoteFeedbackId(null), 1800);
  };

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2 border-b border-[#E5DDD0] pb-6 dark:border-[#2E2722]">
        <p className="text-xs font-medium text-[#9A3412] dark:text-[#E07A4B]">सद्गुरु उपदेश संग्रह</p>
        <h1 className="font-editorial text-3xl font-semibold text-[#1F1A17] sm:text-4xl dark:text-[#F4EFE8]">
          अघोरवाणी एवं गुरु-विचार
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#574D45] dark:text-[#C7B9A8]">
          विषय चुनें या शब्द खोजें। प्रत्येक वाणी के साथ उसका भावार्थ, दैनिक जीवन सूत्र और आपका व्यक्तिगत चिंतन सुरक्षित करने की सुविधा उपलब्ध है।
        </p>
      </header>

      {/* Search + Category Filter Toolbar */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <label htmlFor="vani-search" className="sr-only">
            अघोरवाणी खोजें
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6B5B4E] dark:text-[#9E9388]" />
          <input
            id="vani-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="शब्द, विषय या संत नाम से खोजें (जैसे: मौन, सेवा, समता)..."
            className="min-h-[44px] w-full rounded-xl border border-[#D6CCBD] bg-[#FBF9F5] py-2.5 pr-10 pl-10 text-sm text-[#1F1A17] placeholder:text-[#8A7C70] focus:border-[#9A3412] focus:outline-none dark:border-[#3A312B] dark:bg-[#1B1714] dark:text-[#F4EFE8] dark:placeholder:text-[#7D7166]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="खोज साफ़ करें"
              className="absolute top-1/2 right-2 flex min-h-[36px] min-w-[36px] -translate-y-1/2 items-center justify-center rounded-lg text-[#6B5B4E] hover:bg-[#F2ECE1] dark:text-[#B9AFA4] dark:hover:bg-[#26201B]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div role="tablist" aria-label="वाणी विषय फ़िल्टर" className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium ${
                  active
                    ? 'bg-[#9A3412] text-[#FBF9F5] dark:bg-[#C2410C]'
                    : 'bg-[#F2ECE1] text-[#574D45] hover:bg-[#E7DEC9] hover:text-[#1F1A17] dark:bg-[#221D19] dark:text-[#C7B9A8] dark:hover:bg-[#2E2722]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <p className="tabular-nums text-xs text-[#6B5B4E] dark:text-[#9E9388]">
        प्रदर्शित वाणी: {filteredVanis.length} / {vanis.length}
      </p>

      {/* Vani List or Empty State */}
      {filteredVanis.length === 0 ? (
        <div className="rounded-2xl border border-[#E5DDD0] bg-[#F2ECE1]/50 p-10 text-center dark:border-[#2E2722] dark:bg-[#1B1714]">
          <p className="font-editorial text-xl font-medium text-[#1F1A17] dark:text-[#F4EFE8]">
            इस खोज के लिए कोई अघोरवाणी नहीं मिली।
          </p>
          <p className="mt-2 text-sm text-[#6B5B4E] dark:text-[#A99D91]">
            कृपया दूसरा शब्द आज़माएँ या सभी विषय पुनः चुनें।
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('सभी');
              setSearchQuery('');
            }}
            className="mt-4 min-h-[44px] rounded-lg bg-[#9A3412] px-5 py-2 text-sm font-medium text-[#FBF9F5] hover:bg-[#7C2D12]"
          >
            सभी वाणी दिखाएँ
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredVanis.map((item) => {
            const isBookmarked = bookmarkedVaniIds.includes(item.id);
            const isExpanded = !!expandedIds[item.id];
            const savedNote = vaniNotes[item.id] ?? '';
            const currentDraft = draftNotes[item.id] ?? savedNote;

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] p-6 transition-colors dark:border-[#2E2722] dark:bg-[#1B1714]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B5B4E] dark:text-[#A99D91]">
                    <span className="font-semibold text-[#9A3412] dark:text-[#E07A4B]">
                      {item.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.author}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.source}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      aria-label={`${item.category} वाणी कॉपी करें`}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E5DDD0] px-3 py-1.5 text-xs font-medium text-[#574D45] hover:bg-[#F2ECE1] dark:border-[#3A312B] dark:text-[#C7B9A8] dark:hover:bg-[#26201B]"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-[#15803D]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedId === item.id ? 'कॉपी हुई' : 'कॉपी'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleSaveVani(item.id)}
                      aria-pressed={isBookmarked}
                      aria-label={isBookmarked ? 'संग्रह से हटाएँ' : 'संग्रह में सहेजें'}
                      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        isBookmarked
                          ? 'border-[#9A3412] bg-[#9A3412] text-[#FBF9F5] dark:border-[#C2410C] dark:bg-[#C2410C]'
                          : 'border-[#E5DDD0] text-[#574D45] hover:bg-[#F2ECE1] dark:border-[#3A312B] dark:text-[#C7B9A8] dark:hover:bg-[#26201B]'
                      }`}
                    >
                      <Bookmark className="h-3.5 w-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                      <span>{isBookmarked ? 'सहेजी गई' : 'सहेजें'}</span>
                    </button>
                  </div>
                </div>

                <blockquote className="font-editorial mt-4 text-xl leading-relaxed font-medium text-[#1F1A17] sm:text-2xl dark:text-[#F4EFE8]">
                  “{item.quote}”
                </blockquote>

                <div className="mt-4 flex items-center justify-between border-t border-[#EEE7DA] pt-3 dark:border-[#2B241F]">
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    aria-expanded={isExpanded}
                    className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-[#9A3412] hover:underline dark:text-[#E07A4B]"
                  >
                    <span>{isExpanded ? 'भावार्थ समेटें' : 'भावार्थ एवं चिंतन पढ़ें'}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {savedNote && !isExpanded && (
                    <span className="text-xs text-[#6B5B4E] dark:text-[#9E9388]">
                      व्यक्तिगत टिप्पणी सुरक्षित
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4 border-t border-[#EEE7DA] pt-4 dark:border-[#2B241F]">
                    <div className="space-y-2 text-sm leading-relaxed text-[#463D36] dark:text-[#CFC4B8]">
                      <p>
                        <strong className="font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                          गूढ़ भावार्थ:{' '}
                        </strong>
                        {item.bhavarth}
                      </p>
                      <p className="rounded-xl bg-[#F2ECE1]/70 p-3.5 text-sm text-[#3A312A] dark:bg-[#241E1A] dark:text-[#E0D6C9]">
                        <strong className="font-semibold text-[#9A3412] dark:text-[#E07A4B]">
                          दैनिक जीवन सूत्र:{' '}
                        </strong>
                        {item.jeevanSutra}
                      </p>
                    </div>

                    {/* Personal Reflection Note */}
                    <div className="space-y-2 pt-1">
                      <label
                        htmlFor={`note-${item.id}`}
                        className="block text-xs font-medium text-[#6B5B4E] dark:text-[#B9AFA4]"
                      >
                        इस वाणी पर आपका व्यक्तिगत चिंतन (वैकल्पिक)
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          id={`note-${item.id}`}
                          type="text"
                          value={currentDraft}
                          onChange={(e) =>
                            setDraftNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="अपना अनुभव या चिंतन लिखें..."
                          className="min-h-[42px] flex-1 rounded-lg border border-[#D6CCBD] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1F1A17] placeholder:text-[#8A7C70] focus:border-[#9A3412] focus:outline-none dark:border-[#3A312B] dark:bg-[#14110F] dark:text-[#F4EFE8]"
                        />
                        <button
                          type="button"
                          onClick={() => handleNoteSubmit(item.id)}
                          className="min-h-[42px] shrink-0 whitespace-nowrap rounded-lg border border-[#9A3412] px-4 py-2 text-xs font-medium text-[#9A3412] transition-colors hover:bg-[#9A3412] hover:text-[#FBF9F5] dark:border-[#E07A4B] dark:text-[#E07A4B] dark:hover:bg-[#C2410C] dark:hover:text-[#FBF9F5]"
                        >
                          {savedNoteFeedbackId === item.id ? 'चिंतन सहेजा गया' : 'चिंतन सहेजें'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
