import { useState } from 'react';
import {
  ArrowRight,
  Bell,
  BellRing,
  Bookmark,
  Check,
  Copy,
  Moon,
  Plus,
  RefreshCw,
  Sun,
} from 'lucide-react';
import { AGHOR_PILLARS, ASHRAM_IMAGES, ASHRAM_SCHEDULE } from '../data/ashramData';
import type { SankalpItem, ScreenId, VaniItem } from '../types/ashram';
import {
  mapVaniCategoryToSankalpCategory,
  pickRandomInspiringVani,
} from '../utils/ashramLogic';
import { SafeImage } from './SafeImage';

interface HomeScreenProps {
  dailyVani: VaniItem;
  allVanis: VaniItem[];
  isDailySaved: boolean;
  onToggleSaveVani: (id: string) => void;
  onNavigate: (screen: ScreenId) => void;
  eventReminderIds: string[];
  onToggleEventReminder: (eventId: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  completedMalas: number;
  sankalps: SankalpItem[];
  onAdoptSankalp: (title: string, category: SankalpItem['category']) => void;
  sankalpsDoneCount: number;
  sankalpsTotalCount: number;
}

export function HomeScreen({
  dailyVani,
  allVanis,
  isDailySaved,
  onToggleSaveVani,
  onNavigate,
  eventReminderIds,
  onToggleEventReminder,
  theme,
  onToggleTheme,
  completedMalas,
  sankalps,
  onAdoptSankalp,
  sankalpsDoneCount,
  sankalpsTotalCount,
}: HomeScreenProps) {
  const [copiedToday, setCopiedToday] = useState(false);
  const [affirmationVani, setAffirmationVani] = useState<VaniItem>(
    () => pickRandomInspiringVani(allVanis, dailyVani.id) ?? dailyVani
  );

  const isAffirmationAdopted = sankalps.some(
    (item) => item.title.trim() === affirmationVani.jeevanSutra.trim()
  );

  const handleRefreshAffirmation = () => {
    const next = pickRandomInspiringVani(allVanis, affirmationVani.id);
    if (next) {
      setAffirmationVani(next);
    }
  };

  const handleCopyToday = async () => {
    try {
      await navigator.clipboard?.writeText(`"${dailyVani.quote}" — ${dailyVani.author}`);
      setCopiedToday(true);
      window.setTimeout(() => setCopiedToday(false), 1800);
    } catch {
      setCopiedToday(true);
      window.setTimeout(() => setCopiedToday(false), 1800);
    }
  };

  return (
    <div className="space-y-14 pb-8">
      {/* Operational Utility Ribbon + Theme Control (below header) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DDD0] pb-4 text-xs text-[#6B5B4E] dark:border-[#2E2722] dark:text-[#B9AFA4]">
        <p className="leading-relaxed">
          दैनिक आश्रम वेला · प्रातः ०५:०० मंगल आरती · मध्याह्न १२:०० अन्नक्षेत्र · सायं ०६:३० संध्या सत्संग
        </p>
        <button
          type="button"
          onClick={onToggleTheme}
          className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-[#E5DDD0] bg-[#F2ECE1]/60 px-3 py-1.5 text-xs font-medium text-[#1F1A17] transition-colors hover:bg-[#EAE1D3] md:inline-flex dark:border-[#3A312B] dark:bg-[#211C18] dark:text-[#F4EFE8] dark:hover:bg-[#2C2520]"
        >
          {theme === 'light' ? (
            <>
              <Moon className="h-3.5 w-3.5" />
              <span>संध्या ध्यान मोड</span>
            </>
          ) : (
            <>
              <Sun className="h-3.5 w-3.5" />
              <span>प्रातः दर्शन मोड</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Split: Editorial Welcome & Courtyard Visual */}
      <section className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        <div className="flex flex-col justify-between space-y-6 lg:col-span-6">
          <div className="space-y-4">
            <p className="text-xs font-medium tracking-wider text-[#9A3412] dark:text-[#E07A4B]">
              अघोर पीठ आश्रम · आध्यात्मिक ज्ञान एवं साधना मंच
            </p>
            <h1 className="font-editorial text-3xl leading-tight font-semibold text-[#1F1A17] sm:text-4xl lg:text-5xl dark:text-[#F4EFE8]">
              जो सरल, निर्भय और सबमें सम है—वही अघोर है।
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[#574D45] dark:text-[#C7B9A8]">
              अघोर दर्शन, गुरु-वाणी, प्रामाणिक धार्मिक साहित्य, दैनिक १०८ मनका जप साधना और मानव कल्याणकारी सेवा प्रकल्पों का शांत डिजिटल संगम।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('sadhana')}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#9A3412] px-6 py-3 text-sm font-medium text-[#FBF9F5] transition-colors hover:bg-[#7C2D12] dark:bg-[#C2410C] dark:hover:bg-[#9A3412]"
            >
              <span>आज की साधना आरंभ करें</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('vani')}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-[#D6CCBD] bg-transparent px-5 py-3 text-sm font-medium text-[#1F1A17] transition-colors hover:bg-[#F2ECE1] dark:border-[#3A312B] dark:text-[#F4EFE8] dark:hover:bg-[#211C18]"
            >
              <span>अघोरवाणी पढ़ें</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <figure className="h-full overflow-hidden rounded-2xl border border-[#E5DDD0] bg-[#F2ECE1] dark:border-[#2E2722] dark:bg-[#1E1916]">
            <SafeImage
              src={ASHRAM_IMAGES.courtyardHero}
              alt="सूर्योदय के समय नदी तट पर स्थित शांत अघोर पीठ आश्रम प्रांगण"
              fallbackTitle="अघोर पीठ आश्रम प्रांगण"
              className="h-64 w-full object-cover sm:h-80 lg:h-full lg:min-h-[340px]"
            />
          </figure>
        </div>
      </section>

      {/* Full-width 4-item Sadhana & Archive Strip below Hero */}
      <section aria-label="आश्रम सारांश" className="grid grid-cols-2 gap-4 border-y border-[#E5DDD0] py-6 md:grid-cols-4 dark:border-[#2E2722]">
        <button
          type="button"
          onClick={() => onNavigate('vani')}
          className="group text-left transition-colors"
        >
          <p className="text-xs text-[#6B5B4E] dark:text-[#9E9388]">गुरु-विचार संग्रह</p>
          <p className="font-editorial tabular-nums mt-1 text-2xl font-semibold text-[#1F1A17] group-hover:text-[#9A3412] dark:text-[#F4EFE8] dark:group-hover:text-[#E07A4B]">
            ८ अघोरवाणी सूत्र
          </p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('sahitya')}
          className="group text-left transition-colors"
        >
          <p className="text-xs text-[#6B5B4E] dark:text-[#9E9388]">डिजिटल ग्रंथालय</p>
          <p className="font-editorial tabular-nums mt-1 text-2xl font-semibold text-[#1F1A17] group-hover:text-[#9A3412] dark:text-[#F4EFE8] dark:group-hover:text-[#E07A4B]">
            ४ प्रामाणिक ग्रंथ
          </p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('sadhana')}
          className="group text-left transition-colors"
        >
          <p className="text-xs text-[#6B5B4E] dark:text-[#9E9388]">आपकी पूर्ण माला</p>
          <p className="font-editorial tabular-nums mt-1 text-2xl font-semibold text-[#1F1A17] group-hover:text-[#9A3412] dark:text-[#F4EFE8] dark:group-hover:text-[#E07A4B]">
            {completedMalas} माला जप
          </p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('sadhana')}
          className="group text-left transition-colors"
        >
          <p className="text-xs text-[#6B5B4E] dark:text-[#9E9388]">दैनिक संकल्प प्रगति</p>
          <p className="font-editorial tabular-nums mt-1 text-2xl font-semibold text-[#1F1A17] group-hover:text-[#9A3412] dark:text-[#F4EFE8] dark:group-hover:text-[#E07A4B]">
            {sankalpsDoneCount} / {sankalpsTotalCount} पूर्ण
          </p>
        </button>
      </section>

      {/* Daily Sankalp Affirmation Section */}
      <section
        aria-labelledby="daily-sankalp-heading"
        className="space-y-4 rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] p-6 sm:p-8 dark:border-[#2E2722] dark:bg-[#1B1714]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B5B4E] dark:text-[#B9AFA4]">
            <span className="font-semibold text-[#9A3412] dark:text-[#E07A4B]">
              प्रातःकालीन दैनिक संकल्प (Daily Sankalp Affirmation)
            </span>
            <span aria-hidden="true">·</span>
            <span>{affirmationVani.category}</span>
            <span aria-hidden="true">·</span>
            <span>{affirmationVani.source}</span>
          </div>

          <button
            type="button"
            onClick={handleRefreshAffirmation}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#D6CCBD] px-3.5 py-1.5 text-xs font-medium text-[#1F1A17] hover:bg-[#F2ECE1] dark:border-[#3A312B] dark:text-[#F4EFE8] dark:hover:bg-[#26201B]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>नया संकल्प विचार</span>
          </button>
        </div>

        <blockquote
          id="daily-sankalp-heading"
          className="font-editorial text-xl leading-relaxed font-medium text-[#1F1A17] sm:text-2xl dark:text-[#F4EFE8]"
        >
          “{affirmationVani.quote}”
        </blockquote>
        <p className="text-xs text-[#574D45] dark:text-[#C7B9A8]">
          — {affirmationVani.author}
        </p>

        <div className="flex flex-col justify-between gap-4 border-t border-[#EEE7DA] pt-4 sm:flex-row sm:items-center dark:border-[#2B241F]">
          <p className="max-w-2xl text-sm leading-relaxed text-[#3A312A] dark:text-[#E0D6C9]">
            <strong className="font-semibold text-[#9A3412] dark:text-[#E07A4B]">
              आज का संकल्प:{' '}
            </strong>
            {affirmationVani.jeevanSutra}
          </p>

          <button
            type="button"
            disabled={isAffirmationAdopted}
            onClick={() =>
              onAdoptSankalp(
                affirmationVani.jeevanSutra,
                mapVaniCategoryToSankalpCategory(affirmationVani.category)
              )
            }
            className={`inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
              isAffirmationAdopted
                ? 'border border-[#15803D]/30 bg-[#15803D]/10 text-[#15803D] dark:text-[#4ADE80]'
                : 'bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] dark:bg-[#C2410C]'
            }`}
          >
            {isAffirmationAdopted ? (
              <>
                <Check className="h-4 w-4" />
                <span>संकल्प सूची में सुरक्षित</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>संकल्प सूची में जोड़ें</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Today's Aghorvani Editorial Spotlight */}
      <section aria-labelledby="today-vani-heading" className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-[#E5DDD0] bg-[#F2ECE1]/70 p-6 sm:p-8 lg:grid-cols-12 dark:border-[#2E2722] dark:bg-[#1E1916]">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B5B4E] dark:text-[#B9AFA4]">
            <span className="font-semibold text-[#9A3412] dark:text-[#E07A4B]">आज की अघोरवाणी</span>
            <span aria-hidden="true">·</span>
            <span>{dailyVani.category}</span>
            <span aria-hidden="true">·</span>
            <span>{dailyVani.source}</span>
          </div>
          <blockquote id="today-vani-heading" className="font-editorial text-2xl leading-relaxed font-medium text-[#1F1A17] sm:text-3xl dark:text-[#F4EFE8]">
            “{dailyVani.quote}”
          </blockquote>
          <p className="text-sm text-[#574D45] dark:text-[#C7B9A8]">
            — {dailyVani.author}
          </p>
          <p className="max-w-2xl border-t border-[#E0D6C6] pt-4 text-sm leading-relaxed text-[#463D36] dark:border-[#332B25] dark:text-[#CFC4B8]">
            <strong className="font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">भावार्थ: </strong>
            {dailyVani.bhavarth}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onToggleSaveVani(dailyVani.id)}
              aria-pressed={isDailySaved}
              className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                isDailySaved
                  ? 'border-[#9A3412] bg-[#9A3412] text-[#FBF9F5] dark:border-[#C2410C] dark:bg-[#C2410C]'
                  : 'border-[#D6CCBD] bg-[#FBF9F5] text-[#1F1A17] hover:bg-[#EAE1D3] dark:border-[#3A312B] dark:bg-[#14110F] dark:text-[#F4EFE8] dark:hover:bg-[#26201B]'
              }`}
            >
              <Bookmark className="h-4 w-4" fill={isDailySaved ? 'currentColor' : 'none'} />
              <span>{isDailySaved ? 'संग्रह में सुरक्षित' : 'संग्रह में सहेजें'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyToday}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-[#D6CCBD] bg-[#FBF9F5] px-4 py-2 text-sm font-medium text-[#1F1A17] transition-colors hover:bg-[#EAE1D3] dark:border-[#3A312B] dark:bg-[#14110F] dark:text-[#F4EFE8] dark:hover:bg-[#26201B]"
            >
              {copiedToday ? <Check className="h-4 w-4 text-[#15803D]" /> : <Copy className="h-4 w-4" />}
              <span>{copiedToday ? 'प्रतिलिपि तैयार' : 'वाणी कॉपी करें'}</span>
            </button>
          </div>
        </div>
        <div className="lg:col-span-4">
          <figure className="overflow-hidden rounded-xl border border-[#E0D6C6] dark:border-[#332B25]">
            <SafeImage
              src={ASHRAM_IMAGES.dhuniSanctuary}
              alt="आश्रम अध्ययन कक्ष में प्रज्वलित दीपक, रुद्राक्ष माला और प्राचीन ग्रंथ"
              fallbackTitle="अघोर साधना कक्ष"
              className="aspect-[4/3] w-full object-cover"
            />
          </figure>
        </div>
      </section>

      {/* Four Pillars of Aghor Philosophy */}
      <section aria-labelledby="pillars-heading" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#9A3412] dark:text-[#E07A4B]">दर्शन एवं जीवन दृष्टि</p>
            <h2 id="pillars-heading" className="font-editorial mt-1 text-2xl font-semibold text-[#1F1A17] sm:text-3xl dark:text-[#F4EFE8]">
              अघोर दर्शन के चार आधार स्तंभ
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('sahitya')}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[#9A3412] hover:underline dark:text-[#E07A4B]"
          >
            <span>ग्रंथालय में विस्तार से पढ़ें</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {AGHOR_PILLARS.map((pillar) => (
            <article
              key={pillar.index}
              className="rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] p-6 dark:border-[#2E2722] dark:bg-[#1B1714]"
            >
              <p className="tabular-nums text-xs font-medium text-[#9A3412] dark:text-[#E07A4B]">
                {pillar.index} · मूल सिद्धांत
              </p>
              <h3 className="font-editorial mt-2 text-xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                {pillar.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-[#463D36] dark:text-[#D5C9BC]">
                {pillar.subtitle}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#6B5B4E] dark:text-[#A99D91]">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Ashram Daily Schedule & Upcoming Samagam */}
      <section aria-labelledby="schedule-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#9A3412] dark:text-[#E07A4B]">आश्रम दिनचर्या एवं समागम</p>
            <h2 id="schedule-heading" className="font-editorial mt-1 text-2xl font-semibold text-[#1F1A17] sm:text-3xl dark:text-[#F4EFE8]">
              दैनिक आश्रम क्रम
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('seva')}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[#9A3412] hover:underline dark:text-[#E07A4B]"
          >
            <span>सेवा एवं संवाद देखें</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="divide-y divide-[#E5DDD0] rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] dark:divide-[#2E2722] dark:border-[#2E2722] dark:bg-[#1B1714]">
          {ASHRAM_SCHEDULE.map((ev) => {
            const reminded = eventReminderIds.includes(ev.id);
            return (
              <div
                key={ev.id}
                className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B5B4E] dark:text-[#A99D91]">
                    <span className="tabular-nums font-semibold text-[#9A3412] dark:text-[#E07A4B]">
                      {ev.time}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{ev.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ev.isDaily ? 'नित्य क्रम' : 'विशेष समागम'}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                    {ev.title}
                  </h3>
                  <p className="text-sm text-[#574D45] dark:text-[#B9AFA4]">{ev.detail}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleEventReminder(ev.id)}
                  aria-pressed={reminded}
                  className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-lg border px-4 py-2 text-xs font-medium transition-colors sm:self-center ${
                    reminded
                      ? 'border-[#9A3412] bg-[#9A3412]/10 text-[#9A3412] dark:border-[#E07A4B] dark:bg-[#E07A4B]/15 dark:text-[#E07A4B]'
                      : 'border-[#E5DDD0] text-[#574D45] hover:bg-[#F2ECE1] dark:border-[#3A312B] dark:text-[#C7B9A8] dark:hover:bg-[#26201B]'
                  }`}
                >
                  {reminded ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  <span>{reminded ? 'स्मरण सक्रिय' : 'स्मरण जोड़ें'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
