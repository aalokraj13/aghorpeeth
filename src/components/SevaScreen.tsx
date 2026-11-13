import { useMemo, useState } from 'react';
import {
  BookOpen,
  BookmarkX,
  Check,
  HeartHandshake,
  MessageSquarePlus,
  Search,
  Send,
} from 'lucide-react';
import { ASHRAM_IMAGES, SEVA_PROGRAMS } from '../data/ashramData';
import type {
  GranthBook,
  JigyasaItem,
  SevaPledge,
  SevaProgram,
  VaniItem,
} from '../types/ashram';
import { validateJigyasaInput, validateSevaPledge } from '../utils/ashramLogic';
import { SafeImage } from './SafeImage';

interface SevaScreenProps {
  sevaPledges: SevaPledge[];
  onAddSevaPledge: (sevaId: string, sevaTitle: string, seekerName: string, note: string) => void;
  jigyasas: JigyasaItem[];
  onAddJigyasa: (question: string, seekerName: string, topic: string) => void;
  bookmarkedVanis: VaniItem[];
  vaniNotes: Record<string, string>;
  onRemoveBookmarkedVani: (id: string) => void;
  bookmarkedChapterKeys: string[];
  granths: GranthBook[];
  onOpenGranthChapter: (bookId: string, chapterIndex: number) => void;
  onRemoveBookmarkedChapter: (key: string) => void;
}

type SevaSubTab = 'seva' | 'jigyasa' | 'sangrah';

export function SevaScreen({
  sevaPledges,
  onAddSevaPledge,
  jigyasas,
  onAddJigyasa,
  bookmarkedVanis,
  vaniNotes,
  onRemoveBookmarkedVani,
  bookmarkedChapterKeys,
  granths,
  onOpenGranthChapter,
  onRemoveBookmarkedChapter,
}: SevaScreenProps) {
  const [activeTab, setActiveTab] = useState<SevaSubTab>('seva');

  // Seva pledge modal/inline state
  const [selectedSeva, setSelectedSeva] = useState<SevaProgram | null>(null);
  const [pledgeName, setPledgeName] = useState('');
  const [pledgeNote, setPledgeNote] = useState('');
  const [pledgeError, setPledgeError] = useState<string | null>(null);
  const [pledgeSuccessMsg, setPledgeSuccessMsg] = useState<string | null>(null);

  // Jigyasa search & ask form
  const [jigyasaSearch, setJigyasaSearch] = useState('');
  const [askerName, setAskerName] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionTopic, setQuestionTopic] = useState('साधना व जीवन');
  const [jigyasaError, setJigyasaError] = useState<string | null>(null);
  const [jigyasaSuccess, setJigyasaSuccess] = useState(false);

  const filteredJigyasas = useMemo(() => {
    const q = jigyasaSearch.trim().toLowerCase();
    if (!q) return jigyasas;
    return jigyasas.filter((item) =>
      `${item.question} ${item.answer} ${item.topic} ${item.seekerName}`.toLowerCase().includes(q)
    );
  }, [jigyasas, jigyasaSearch]);

  const savedChaptersList = useMemo(() => {
    return bookmarkedChapterKeys
      .map((key) => {
        const [bookId, chapterId] = key.split('::');
        const book = granths.find((g) => g.id === bookId);
        if (!book) return null;
        const chIndex = book.chapters.findIndex((c) => c.id === chapterId);
        if (chIndex === -1) return null;
        return { key, book, chapter: book.chapters[chIndex], chIndex };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [bookmarkedChapterKeys, granths]);

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeva) return;
    const validation = validateSevaPledge(pledgeName, selectedSeva.id);
    if (!validation.valid) {
      setPledgeError(validation.error ?? 'कृपया सही विवरण भरें।');
      return;
    }
    onAddSevaPledge(selectedSeva.id, selectedSeva.title, pledgeName.trim(), pledgeNote.trim());
    setPledgeSuccessMsg(`“${selectedSeva.title}” के लिए आपका सेवा संकल्प सुरक्षित हो गया है।`);
    setSelectedSeva(null);
    setPledgeName('');
    setPledgeNote('');
    setPledgeError(null);
  };

  const handleJigyasaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateJigyasaInput(questionText, askerName);
    if (!validation.valid) {
      setJigyasaError(validation.error ?? 'कृपया मान्य प्रश्न लिखें।');
      return;
    }
    onAddJigyasa(questionText.trim(), askerName.trim(), questionTopic);
    setAskerName('');
    setQuestionText('');
    setJigyasaError(null);
    setJigyasaSuccess(true);
    window.setTimeout(() => setJigyasaSuccess(false), 3000);
  };

  const totalSavedItems = bookmarkedVanis.length + savedChaptersList.length;

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-2 border-b border-[#E5DDD0] pb-6 dark:border-[#2E2722]">
        <p className="text-xs font-medium text-[#9A3412] dark:text-[#E07A4B]">
          मानव कल्याण, संवाद एवं व्यक्तिगत संग्रह
        </p>
        <h1 className="font-editorial text-3xl font-semibold text-[#1F1A17] sm:text-4xl dark:text-[#F4EFE8]">
          आश्रम सेवा प्रकल्प, जिज्ञासा एवं मेरा संग्रह
        </h1>
      </header>

      {/* Sub-Navigation Tabs */}
      <div role="tablist" aria-label="सेवा अनुभाग" className="flex flex-wrap gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'seva'}
          onClick={() => setActiveTab('seva')}
          className={`min-h-[42px] shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'seva'
              ? 'bg-[#9A3412] text-[#FBF9F5] dark:bg-[#C2410C]'
              : 'bg-[#F2ECE1] text-[#574D45] hover:bg-[#E7DEC9] dark:bg-[#221D19] dark:text-[#C7B9A8]'
          }`}
        >
          सेवा प्रकल्प
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'jigyasa'}
          onClick={() => setActiveTab('jigyasa')}
          className={`min-h-[42px] shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'jigyasa'
              ? 'bg-[#9A3412] text-[#FBF9F5] dark:bg-[#C2410C]'
              : 'bg-[#F2ECE1] text-[#574D45] hover:bg-[#E7DEC9] dark:bg-[#221D19] dark:text-[#C7B9A8]'
          }`}
        >
          गुरु-जिज्ञासा संवाद ({jigyasas.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sangrah'}
          onClick={() => setActiveTab('sangrah')}
          className={`min-h-[42px] shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'sangrah'
              ? 'bg-[#9A3412] text-[#FBF9F5] dark:bg-[#C2410C]'
              : 'bg-[#F2ECE1] text-[#574D45] hover:bg-[#E7DEC9] dark:bg-[#221D19] dark:text-[#C7B9A8]'
          }`}
        >
          मेरा संग्रह ({totalSavedItems})
        </button>
      </div>

      {/* TAB 1: SEVA PROGRAMS */}
      {activeTab === 'seva' && (
        <div className="space-y-8">
          <section className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-[#E5DDD0] bg-[#F2ECE1]/60 p-6 lg:grid-cols-12 dark:border-[#2E2722] dark:bg-[#1E1916]">
            <div className="space-y-3 lg:col-span-7">
              <p className="text-xs font-semibold text-[#9A3412] dark:text-[#E07A4B]">
                नर सेवा ही नारायण सेवा
              </p>
              <h2 className="font-editorial text-2xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                अघोर पीठ आश्रम की लोक-कल्याणकारी सेवाएँ
              </h2>
              <p className="text-sm leading-relaxed text-[#574D45] dark:text-[#C7B9A8]">
                आश्रम परंपरा में ज्ञान तभी सार्थक है जब वह करुणा और सेवा में रूपांतरित हो। आप नीचे दिए किसी भी प्रकल्प से जुड़कर अपना सेवा-संकल्प दर्ज कर सकते हैं।
              </p>
            </div>
            <div className="lg:col-span-5">
              <figure className="overflow-hidden rounded-xl border border-[#E0D6C6] dark:border-[#332B25]">
                <SafeImage
                  src={ASHRAM_IMAGES.sevaAnnakshetra}
                  alt="आश्रम अन्नक्षेत्र में सात्विक भोजन प्रसाद सेवा"
                  fallbackTitle="आश्रम अन्नक्षेत्र सेवा"
                  className="aspect-[4/3] w-full object-cover"
                />
              </figure>
            </div>
          </section>

          {pledgeSuccessMsg && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-xl border border-[#15803D]/30 bg-[#15803D]/10 px-4 py-3 text-sm font-medium text-[#15803D] dark:text-[#4ADE80]"
            >
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                {pledgeSuccessMsg}
              </span>
              <button
                type="button"
                onClick={() => setPledgeSuccessMsg(null)}
                className="text-xs underline"
              >
                बंद करें
              </button>
            </div>
          )}

          {/* Inline Seva Pledge Form Drawer when a Seva is selected */}
          {selectedSeva && (
            <form
              onSubmit={handlePledgeSubmit}
              noValidate
              className="space-y-4 rounded-2xl border border-[#9A3412] bg-[#FBF9F5] p-6 dark:border-[#E07A4B] dark:bg-[#1B1714]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-[#9A3412] dark:text-[#E07A4B]">
                    सेवा सहभागिता संकल्प
                  </p>
                  <h3 className="font-editorial text-xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                    {selectedSeva.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSeva(null);
                    setPledgeError(null);
                  }}
                  className="min-h-[38px] rounded-lg border border-[#D6CCBD] px-3 py-1 text-xs font-medium text-[#574D45] dark:border-[#3A312B] dark:text-[#C7B9A8]"
                >
                  रद्द करें
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="pledge-name"
                    className="mb-1 block text-xs font-medium text-[#574D45] dark:text-[#C7B9A8]"
                  >
                    साधक / श्रद्धालु का नाम *
                  </label>
                  <input
                    id="pledge-name"
                    type="text"
                    value={pledgeName}
                    onChange={(e) => {
                      setPledgeName(e.target.value);
                      if (pledgeError) setPledgeError(null);
                    }}
                    placeholder="अपना पूरा नाम लिखें"
                    className="min-h-[44px] w-full rounded-xl border border-[#D6CCBD] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1F1A17] focus:border-[#9A3412] focus:outline-none dark:border-[#3A312B] dark:bg-[#14110F] dark:text-[#F4EFE8]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pledge-note"
                    className="mb-1 block text-xs font-medium text-[#574D45] dark:text-[#C7B9A8]"
                  >
                    सहभागिता विवरण (वैकल्पिक)
                  </label>
                  <input
                    id="pledge-note"
                    type="text"
                    value={pledgeNote}
                    onChange={(e) => setPledgeNote(e.target.value)}
                    placeholder="जैसे: रविवार श्रमदान या पुस्तक सहयोग"
                    className="min-h-[44px] w-full rounded-xl border border-[#D6CCBD] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1F1A17] focus:border-[#9A3412] focus:outline-none dark:border-[#3A312B] dark:bg-[#14110F] dark:text-[#F4EFE8]"
                  />
                </div>
              </div>

              {pledgeError && (
                <p role="alert" className="text-xs font-medium text-[#B91C1C] dark:text-[#F87171]">
                  {pledgeError}
                </p>
              )}

              <button
                type="submit"
                className="min-h-[44px] rounded-xl bg-[#9A3412] px-6 py-2.5 text-sm font-medium text-[#FBF9F5] hover:bg-[#7C2D12] dark:bg-[#C2410C]"
              >
                सेवा संकल्प पुष्टि करें
              </button>
            </form>
          )}

          {/* Seva Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {SEVA_PROGRAMS.map((prog) => {
              const userPledgesCount = sevaPledges.filter((p) => p.sevaId === prog.id).length;
              const totalCount = prog.baseParticipants + userPledgesCount;
              return (
                <article
                  key={prog.id}
                  className="flex flex-col justify-between space-y-4 rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] p-6 dark:border-[#2E2722] dark:bg-[#1B1714]"
                >
                  <div className="space-y-2">
                    <p className="tabular-nums text-xs text-[#6B5B4E] dark:text-[#9E9388]">
                      <span className="font-semibold text-[#9A3412] dark:text-[#E07A4B]">
                        {prog.impactMetric}
                      </span>
                      {' · '}
                      {prog.schedule}
                    </p>
                    <h3 className="font-editorial text-xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                      {prog.title}
                    </h3>
                    <p className="text-xs font-medium text-[#574D45] dark:text-[#C7B9A8]">
                      {prog.subtitle}
                    </p>
                    <p className="pt-1 text-sm leading-relaxed text-[#574D45] dark:text-[#B9AFA4]">
                      {prog.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#EEE7DA] pt-4 dark:border-[#2B241F]">
                    <span className="tabular-nums text-xs text-[#6B5B4E] dark:text-[#9E9388]">
                      सहभागी साधक: {totalCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSeva(prog);
                        setPledgeError(null);
                        setPledgeSuccessMsg(null);
                      }}
                      className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#9A3412] px-4 py-2 text-xs font-medium text-[#FBF9F5] hover:bg-[#7C2D12] dark:bg-[#C2410C]"
                    >
                      <HeartHandshake className="h-4 w-4" />
                      <span>सेवा संकल्प लें</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {sevaPledges.length > 0 && (
            <section className="space-y-3 rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] p-6 dark:border-[#2E2722] dark:bg-[#1B1714]">
              <h3 className="font-editorial text-lg font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                आपके दर्ज सेवा संकल्प ({sevaPledges.length})
              </h3>
              <ul className="divide-y divide-[#EEE7DA] dark:divide-[#2B241F]">
                {sevaPledges.map((pledge) => (
                  <li key={pledge.id} className="py-3 text-sm">
                    <p className="font-medium text-[#1F1A17] dark:text-[#F4EFE8]">
                      {pledge.sevaTitle} · {pledge.seekerName}
                    </p>
                    {pledge.sankalpNote && (
                      <p className="mt-0.5 text-xs text-[#574D45] dark:text-[#B9AFA4]">
                        नोट: {pledge.sankalpNote}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* TAB 2: GURU-JIGYASA Q&A */}
      {activeTab === 'jigyasa' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="relative">
              <label htmlFor="jigyasa-search" className="sr-only">
                जिज्ञासा खोजें
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6B5B4E]" />
              <input
                id="jigyasa-search"
                type="search"
                value={jigyasaSearch}
                onChange={(e) => setJigyasaSearch(e.target.value)}
                placeholder="प्रश्न या विषय खोजें (जैसे: गृहस्थ, साधना, भ्रांति)..."
                className="min-h-[44px] w-full rounded-xl border border-[#D6CCBD] bg-[#FBF9F5] py-2.5 pr-4 pl-10 text-sm text-[#1F1A17] focus:border-[#9A3412] focus:outline-none dark:border-[#3A312B] dark:bg-[#1B1714] dark:text-[#F4EFE8]"
              />
            </div>

            {filteredJigyasas.length === 0 ? (
              <div className="rounded-2xl border border-[#E5DDD0] p-8 text-center text-sm text-[#6B5B4E] dark:border-[#2E2722] dark:text-[#A99D91]">
                कोई संबंधित प्रश्न नहीं मिला। आप दाईं ओर से नया प्रश्न पूछ सकते हैं।
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJigyasas.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] p-6 dark:border-[#2E2722] dark:bg-[#1B1714]"
                  >
                    <p className="text-xs text-[#6B5B4E] dark:text-[#9E9388]">
                      <span className="font-semibold text-[#9A3412] dark:text-[#E07A4B]">
                        {item.topic}
                      </span>
                      {' · '}
                      जिज्ञासु: {item.seekerName}
                    </p>
                    <h3 className="font-editorial mt-2 text-lg font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                      प्र. {item.question}
                    </h3>
                    <p className="mt-3 border-t border-[#EEE7DA] pt-3 text-sm leading-relaxed text-[#463D36] dark:border-[#2B241F] dark:text-[#CFC4B8]">
                      <strong className="font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                        {item.answeredBy}:{' '}
                      </strong>
                      {item.answer}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:col-span-5">
            <form
              onSubmit={handleJigyasaSubmit}
              noValidate
              className="space-y-4 rounded-2xl border border-[#E5DDD0] bg-[#F2ECE1]/60 p-6 dark:border-[#2E2722] dark:bg-[#1E1916]"
            >
              <div className="flex items-center gap-2 text-[#9A3412] dark:text-[#E07A4B]">
                <MessageSquarePlus className="h-5 w-5" />
                <h2 className="font-editorial text-xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                  अपनी आध्यात्मिक जिज्ञासा पूछें
                </h2>
              </div>
              <p className="text-xs leading-relaxed text-[#574D45] dark:text-[#C7B9A8]">
                अघोर दर्शन, ध्यान या जीवन-मूल्यों से जुड़ा अपना प्रश्न दर्ज करें।
              </p>

              <div>
                <label
                  htmlFor="jigyasa-name"
                  className="mb-1 block text-xs font-medium text-[#574D45] dark:text-[#C7B9A8]"
                >
                  आपका नाम *
                </label>
                <input
                  id="jigyasa-name"
                  type="text"
                  value={askerName}
                  onChange={(e) => {
                    setAskerName(e.target.value);
                    if (jigyasaError) setJigyasaError(null);
                  }}
                  placeholder="जैसे: विवेक शर्मा"
                  className="min-h-[44px] w-full rounded-xl border border-[#D6CCBD] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1F1A17] focus:border-[#9A3412] focus:outline-none dark:border-[#3A312B] dark:bg-[#14110F] dark:text-[#F4EFE8]"
                />
              </div>

              <div>
                <label
                  htmlFor="jigyasa-topic"
                  className="mb-1 block text-xs font-medium text-[#574D45] dark:text-[#C7B9A8]"
                >
                  विषय
                </label>
                <select
                  id="jigyasa-topic"
                  value={questionTopic}
                  onChange={(e) => setQuestionTopic(e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-[#D6CCBD] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1F1A17] focus:border-[#9A3412] focus:outline-none dark:border-[#3A312B] dark:bg-[#14110F] dark:text-[#F4EFE8]"
                >
                  <option value="साधना व जीवन">साधना व जीवन</option>
                  <option value="अघोर दर्शन">अघोर दर्शन</option>
                  <option value="गृहस्थ धर्म">गृहस्थ धर्म</option>
                  <option value="सेवा व करुणा">सेवा व करुणा</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="jigyasa-question"
                  className="mb-1 block text-xs font-medium text-[#574D45] dark:text-[#C7B9A8]"
                >
                  आपका प्रश्न *
                </label>
                <textarea
                  id="jigyasa-question"
                  rows={4}
                  value={questionText}
                  onChange={(e) => {
                    setQuestionText(e.target.value);
                    if (jigyasaError) setJigyasaError(null);
                  }}
                  placeholder="अपनी जिज्ञासा स्पष्ट रूप से लिखें..."
                  className="w-full rounded-xl border border-[#D6CCBD] bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-[#1F1A17] focus:border-[#9A3412] focus:outline-none dark:border-[#3A312B] dark:bg-[#14110F] dark:text-[#F4EFE8]"
                />
              </div>

              {jigyasaError && (
                <p role="alert" className="text-xs font-medium text-[#B91C1C] dark:text-[#F87171]">
                  {jigyasaError}
                </p>
              )}

              {jigyasaSuccess && (
                <p role="status" className="text-xs font-medium text-[#15803D] dark:text-[#4ADE80]">
                  आपकी जिज्ञासा संवाद सूची में जोड़ दी गई है।
                </p>
              )}

              <button
                type="submit"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#9A3412] px-5 py-2.5 text-sm font-medium text-[#FBF9F5] hover:bg-[#7C2D12] dark:bg-[#C2410C]"
              >
                <Send className="h-4 w-4" />
                <span>जिज्ञासा भेजें</span>
              </button>
            </form>
          </aside>
        </div>
      )}

      {/* TAB 3: SAVED COLLECTION (MERA SANGRAH) */}
      {activeTab === 'sangrah' && (
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="font-editorial text-2xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
              सहेजी गई अघोरवाणी ({bookmarkedVanis.length})
            </h2>
            {bookmarkedVanis.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D6CCBD] p-8 text-center text-sm text-[#6B5B4E] dark:border-[#3A312B] dark:text-[#A99D91]">
                अभी कोई अघोरवाणी सहेजी नहीं गई है। “अघोरवाणी” अनुभाग से अपनी प्रिय वाणी सहेजें।
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarkedVanis.map((vani) => (
                  <article
                    key={vani.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] p-5 sm:flex-row sm:items-start dark:border-[#2E2722] dark:bg-[#1B1714]"
                  >
                    <div className="space-y-2">
                      <p className="text-xs text-[#6B5B4E] dark:text-[#9E9388]">
                        <span className="font-semibold text-[#9A3412] dark:text-[#E07A4B]">
                          {vani.category}
                        </span>
                        {' · '}
                        {vani.author}
                      </p>
                      <blockquote className="font-editorial text-lg font-medium text-[#1F1A17] dark:text-[#F4EFE8]">
                        “{vani.quote}”
                      </blockquote>
                      {vaniNotes[vani.id] && (
                        <p className="text-xs text-[#574D45] dark:text-[#C7B9A8]">
                          आपका चिंतन: {vaniNotes[vani.id]}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveBookmarkedVani(vani.id)}
                      aria-label={`संग्रह से हटाएँ: ${vani.quote.slice(0, 20)}`}
                      className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 self-start rounded-lg border border-[#E5DDD0] px-3 py-1.5 text-xs font-medium text-[#574D45] hover:bg-[#F2ECE1] dark:border-[#3A312B] dark:text-[#C7B9A8]"
                    >
                      <BookmarkX className="h-3.5 w-3.5" />
                      <span>हटाएँ</span>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-editorial text-2xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
              सहेजे गए ग्रंथ अध्याय ({savedChaptersList.length})
            </h2>
            {savedChaptersList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D6CCBD] p-8 text-center text-sm text-[#6B5B4E] dark:border-[#3A312B] dark:text-[#A99D91]">
                अभी कोई अध्याय बुकमार्क नहीं किया गया है। “धर्म साहित्य” पाठक में अध्याय सहेज सकते हैं।
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {savedChaptersList.map(({ key, book, chapter, chIndex }) => (
                  <article
                    key={key}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] p-5 dark:border-[#2E2722] dark:bg-[#1B1714]"
                  >
                    <div>
                      <p className="text-xs text-[#6B5B4E] dark:text-[#9E9388]">
                        {book.title} · अध्याय {chapter.number}
                      </p>
                      <h3 className="font-editorial mt-1 text-lg font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                        {chapter.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenGranthChapter(book.id, chIndex)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#9A3412] px-3.5 py-1.5 text-xs font-medium text-[#FBF9F5] hover:bg-[#7C2D12]"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>पढ़ें</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveBookmarkedChapter(key)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E5DDD0] px-3 py-1.5 text-xs font-medium text-[#574D45] hover:bg-[#F2ECE1] dark:border-[#3A312B] dark:text-[#C7B9A8]"
                      >
                        <BookmarkX className="h-3.5 w-3.5" />
                        <span>हटाएँ</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
