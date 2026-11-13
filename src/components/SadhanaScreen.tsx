import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MANTRA_OPTIONS } from '../data/ashramData';
import type { SankalpItem } from '../types/ashram';
import {
  BEADS_PER_MALA,
  formatTimerSeconds,
  validateSankalpInput,
} from '../utils/ashramLogic';

interface SadhanaScreenProps {
  malaBeadCount: number;
  completedMalas: number;
  selectedMantraId: string;
  onSelectMantra: (mantraId: string) => void;
  onTapMala: () => void;
  onResetMala: () => void;
  sankalps: SankalpItem[];
  onToggleSankalp: (id: string) => void;
  onAddSankalp: (title: string, category: SankalpItem['category']) => void;
  onDeleteSankalp: (id: string) => void;
}

const TIMER_PRESETS_MIN = [5, 10, 15, 21];

function playSoftBellChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2.5);
  } catch {
    // Audio playback optional if blocked by browser autoplay policy
  }
}

export function SadhanaScreen({
  malaBeadCount,
  completedMalas,
  selectedMantraId,
  onSelectMantra,
  onTapMala,
  onResetMala,
  sankalps,
  onToggleSankalp,
  onAddSankalp,
  onDeleteSankalp,
}: SadhanaScreenProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  // Dhyana Timer state
  const [presetMinutes, setPresetMinutes] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timerCompletedMessage, setTimerCompletedMessage] = useState(false);

  // Sankalp form state
  const [sankalpTitle, setSankalpTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SankalpItem['category']>('जप');
  const [sankalpError, setSankalpError] = useState<string | null>(null);
  const [malaCompletedBanner, setMalaCompletedBanner] = useState(false);

  const prevMalasRef = useRef(completedMalas);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  useEffect(() => {
    if (completedMalas > prevMalasRef.current) {
      setMalaCompletedBanner(true);
      if (soundEnabledRef.current) {
        playSoftBellChime();
      }
      const tid = window.setTimeout(() => setMalaCompletedBanner(false), 4500);
      prevMalasRef.current = completedMalas;
      return () => window.clearTimeout(tid);
    }
    prevMalasRef.current = completedMalas;
  }, [completedMalas]);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setTimerCompletedMessage(true);
          if (soundEnabledRef.current) {
            playSoftBellChime();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const activeMantra =
    MANTRA_OPTIONS.find((m) => m.id === selectedMantraId) ?? MANTRA_OPTIONS[0];

  const malaRadius = 82;
  const malaCircumference = 2 * Math.PI * malaRadius;
  const malaProgress = malaBeadCount / BEADS_PER_MALA;
  const malaDashOffset = malaCircumference * (1 - malaProgress);

  const totalTimerSeconds = presetMinutes * 60;
  const timerProgress = totalTimerSeconds > 0 ? 1 - secondsLeft / totalTimerSeconds : 0;
  const timerRadius = 64;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerDashOffset = timerCircumference * (1 - timerProgress);

  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    setPresetMinutes(mins);
    setSecondsLeft(mins * 60);
    setTimerCompletedMessage(false);
  };

  const handleTimerReset = () => {
    setIsRunning(false);
    setSecondsLeft(presetMinutes * 60);
    setTimerCompletedMessage(false);
  };

  const handleSankalpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateSankalpInput(sankalpTitle);
    if (!check.valid) {
      setSankalpError(check.error ?? 'अमान्य संकल्प।');
      return;
    }
    onAddSankalp(sankalpTitle.trim(), selectedCategory);
    setSankalpTitle('');
    setSankalpError(null);
  };

  return (
    <div className="space-y-10 pb-10">
      <header className="space-y-2 border-b border-[#E5DDD0] pb-6 dark:border-[#2E2722]">
        <p className="text-xs font-medium text-[#9A3412] dark:text-[#E07A4B]">अंतर्मुखी अभ्यास कक्ष</p>
        <h1 className="font-editorial text-3xl font-semibold text-[#1F1A17] sm:text-4xl dark:text-[#F4EFE8]">
          नित्य साधना, जप माला एवं ध्यान
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#574D45] dark:text-[#C7B9A8]">
          १०८ मनकों की डिजिटल रुद्राक्ष माला से मंत्र जप करें, शांत ध्यान घड़ी के साथ मौन में बैठें और अपने दैनिक आध्यात्मिक संकल्पों का पालन करें।
        </p>
      </header>

      {/* Top Two-Column Grid: 108-Bead Mala + Dhyana Timer */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Japa Mala Section */}
        <section
          aria-labelledby="mala-heading"
          className="flex flex-col justify-between space-y-6 rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] p-6 sm:p-8 lg:col-span-7 dark:border-[#2E2722] dark:bg-[#1B1714]"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="mala-heading" className="font-editorial text-2xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                १०८ मनका जप माला
              </h2>
              <p className="tabular-nums text-sm font-medium text-[#9A3412] dark:text-[#E07A4B]">
                पूर्ण माला: {completedMalas}
              </p>
            </div>

            {/* Mantra Selector */}
            <div className="space-y-2">
              <label
                htmlFor="mantra-select"
                className="block text-xs font-medium text-[#6B5B4E] dark:text-[#A99D91]"
              >
                मंत्र चुनें
              </label>
              <select
                id="mantra-select"
                value={selectedMantraId}
                onChange={(e) => onSelectMantra(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-[#D6CCBD] bg-[#F2ECE1]/60 px-3.5 py-2 text-sm font-medium text-[#1F1A17] focus:border-[#9A3412] focus:outline-none dark:border-[#3A312B] dark:bg-[#14110F] dark:text-[#F4EFE8]"
              >
                {MANTRA_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl bg-[#F2ECE1]/70 p-4 dark:bg-[#241E1A]">
              <p className="font-editorial text-base leading-relaxed font-medium text-[#1F1A17] sm:text-lg dark:text-[#F4EFE8]">
                {activeMantra.sanskrit}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#574D45] dark:text-[#C7B9A8]">
                भाव: {activeMantra.meaning}
              </p>
            </div>
          </div>

          {/* Interactive Mala Ring */}
          <div className="flex flex-col items-center justify-center space-y-5 py-2">
            <button
              type="button"
              onClick={() => {
                setConfirmReset(false);
                onTapMala();
              }}
              aria-label={`मनका जप करें। वर्तमान संख्या ${malaBeadCount} में से १०८`}
              className="group relative flex h-52 w-52 items-center justify-center rounded-full transition-transform active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A3412]"
            >
              <svg className="h-52 w-52 -rotate-90" viewBox="0 0 192 192" aria-hidden="true">
                <circle
                  cx="96"
                  cy="96"
                  r={malaRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-[#E5DDD0] dark:text-[#2E2722]"
                />
                <circle
                  cx="96"
                  cy="96"
                  r={malaRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={malaCircumference}
                  strokeDashoffset={malaDashOffset}
                  className="text-[#9A3412] transition-all duration-150 dark:text-[#E07A4B]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="tabular-nums font-editorial text-5xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                  {malaBeadCount}
                </span>
                <span className="tabular-nums mt-1 text-xs font-medium text-[#6B5B4E] dark:text-[#A99D91]">
                  / १०८ मनके
                </span>
                <span className="mt-2 text-xs font-semibold text-[#9A3412] group-hover:underline dark:text-[#E07A4B]">
                  स्पर्श कर जपें
                </span>
              </div>
            </button>

            {malaCompletedBanner && (
              <p
                role="status"
                className="rounded-xl border border-[#15803D]/30 bg-[#15803D]/10 px-4 py-2 text-center text-xs font-medium text-[#15803D] dark:text-[#4ADE80]"
              >
                एक माला (१०८ मनके) पूर्ण हुई! साधना निरंतर रहे।
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  onTapMala();
                }}
                className="min-h-[44px] rounded-xl bg-[#9A3412] px-6 py-2.5 text-sm font-medium text-[#FBF9F5] transition-colors hover:bg-[#7C2D12] active:scale-[0.98] dark:bg-[#C2410C]"
              >
                मनका जपें (+१)
              </button>

              {!confirmReset ? (
                <button
                  type="button"
                  disabled={malaBeadCount === 0}
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#D6CCBD] px-4 py-2.5 text-sm font-medium text-[#574D45] hover:bg-[#F2ECE1] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#3A312B] dark:text-[#C7B9A8] dark:hover:bg-[#26201B]"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>माला रीसेट</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetMala();
                      setConfirmReset(false);
                    }}
                    className="min-h-[44px] rounded-xl bg-[#B91C1C] px-4 py-2 text-xs font-medium text-white hover:bg-[#991B1B]"
                  >
                    हाँ, शून्य करें
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="min-h-[44px] rounded-xl border border-[#D6CCBD] px-3 py-2 text-xs font-medium text-[#574D45] dark:border-[#3A312B] dark:text-[#C7B9A8]"
                  >
                    नहीं
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Silent Dhyana Timer Section */}
        <section
          aria-labelledby="timer-heading"
          className="flex flex-col justify-between space-y-6 rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] p-6 sm:p-8 lg:col-span-5 dark:border-[#2E2722] dark:bg-[#1B1714]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="timer-heading" className="font-editorial text-2xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
              मौन ध्यान घड़ी
            </h2>
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-label={soundEnabled ? 'समाप्ति ध्वनि बंद करें' : 'समाप्ति ध्वनि चालू करें'}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#E5DDD0] text-[#574D45] hover:bg-[#F2ECE1] dark:border-[#3A312B] dark:text-[#C7B9A8] dark:hover:bg-[#26201B]"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          {/* Preset Duration Tabs */}
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="ध्यान अवधि चुनें">
            {TIMER_PRESETS_MIN.map((mins) => {
              const active = presetMinutes === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleSelectPreset(mins)}
                  className={`tabular-nums min-h-[42px] rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#9A3412] text-[#FBF9F5] dark:bg-[#C2410C]'
                      : 'bg-[#F2ECE1] text-[#574D45] hover:bg-[#E7DEC9] dark:bg-[#241E1A] dark:text-[#C7B9A8]'
                  }`}
                >
                  {mins} मिनट
                </button>
              );
            })}
          </div>

          {/* Timer Circle */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative flex h-44 w-44 items-center justify-center">
              <svg className="h-44 w-44 -rotate-90" viewBox="0 0 156 156" aria-hidden="true">
                <circle
                  cx="78"
                  cy="78"
                  r={timerRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-[#E5DDD0] dark:text-[#2E2722]"
                />
                <circle
                  cx="78"
                  cy="78"
                  r={timerRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={timerCircumference}
                  strokeDashoffset={timerDashOffset}
                  className="text-[#B45309] transition-all duration-300 dark:text-[#D97706]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="tabular-nums font-editorial text-4xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
                  {formatTimerSeconds(secondsLeft)}
                </span>
                <span className="mt-1 text-xs text-[#6B5B4E] dark:text-[#A99D91]">
                  {isRunning ? 'ध्यान गतिमान' : secondsLeft === 0 ? 'पूर्ण हुआ' : 'तैयार'}
                </span>
              </div>
            </div>

            {timerCompletedMessage && (
              <p className="mt-3 text-center text-sm font-medium text-[#15803D] dark:text-[#4ADE80]">
                आपका मौन ध्यान सत्र शांतिपूर्वक पूर्ण हुआ। ॐ शांतिः।
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (secondsLeft === 0) {
                  setSecondsLeft(presetMinutes * 60);
                  setTimerCompletedMessage(false);
                }
                setIsRunning((prev) => !prev);
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#1F1A17] px-6 py-2.5 text-sm font-medium text-[#FBF9F5] hover:bg-[#3A312B] dark:bg-[#F4EFE8] dark:text-[#14110F] dark:hover:bg-[#E0D6C9]"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isRunning ? 'विराम दें' : secondsLeft === 0 ? 'पुनः प्रारंभ' : 'ध्यान प्रारंभ'}</span>
            </button>

            <button
              type="button"
              onClick={handleTimerReset}
              aria-label="ध्यान घड़ी रीसेट करें"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#D6CCBD] px-4 py-2.5 text-sm font-medium text-[#574D45] hover:bg-[#F2ECE1] dark:border-[#3A312B] dark:text-[#C7B9A8] dark:hover:bg-[#26201B]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>रीसेट</span>
            </button>
          </div>
        </section>
      </div>

      {/* Daily Sadhana Sankalp Tracker */}
      <section aria-labelledby="sankalp-heading" className="space-y-6 rounded-2xl border border-[#E5DDD0] bg-[#FBF9F5] p-6 sm:p-8 dark:border-[#2E2722] dark:bg-[#1B1714]">
        <div className="space-y-1">
          <h2 id="sankalp-heading" className="font-editorial text-2xl font-semibold text-[#1F1A17] dark:text-[#F4EFE8]">
            दैनिक साधना एवं आचरण संकल्प
          </h2>
          <p className="text-sm text-[#574D45] dark:text-[#C7B9A8]">
            अपने प्रतिदिन के छोटे-छोटे आध्यात्मिक नियम जोड़ें और पूर्ण होने पर चिह्नित करें।
          </p>
        </div>

        {/* Add Sankalp Form */}
        <form onSubmit={handleSankalpSubmit} noValidate className="space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="sankalp-title-input" className="sr-only">
                नया संकल्प लिखें
              </label>
              <input
                id="sankalp-title-input"
                type="text"
                value={sankalpTitle}
                onChange={(e) => {
                  setSankalpTitle(e.target.value);
                  if (sankalpError) setSankalpError(null);
                }}
                placeholder="नया संकल्प जोड़ें (जैसे: संध्या को १ माला गायत्री/अघोर जप)..."
                aria-invalid={!!sankalpError}
                className="min-h-[44px] w-full rounded-xl border border-[#D6CCBD] bg-[#FBF9F5] px-4 py-2.5 text-sm text-[#1F1A17] placeholder:text-[#8A7C70] focus:border-[#9A3412] focus:outline-none dark:border-[#3A312B] dark:bg-[#14110F] dark:text-[#F4EFE8]"
              />
            </div>

            <div>
              <label htmlFor="sankalp-category-select" className="sr-only">
                संकल्प श्रेणी
              </label>
              <select
                id="sankalp-category-select"
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value as SankalpItem['category'])
                }
                className="min-h-[44px] w-full rounded-xl border border-[#D6CCBD] bg-[#F2ECE1]/60 px-3.5 py-2.5 text-sm text-[#1F1A17] focus:border-[#9A3412] focus:outline-none sm:w-36 dark:border-[#3A312B] dark:bg-[#14110F] dark:text-[#F4EFE8]"
              >
                <option value="जप">जप</option>
                <option value="स्वाध्याय">स्वाध्याय</option>
                <option value="सेवा">सेवा</option>
                <option value="मौन">मौन</option>
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#9A3412] px-5 py-2.5 text-sm font-medium text-[#FBF9F5] hover:bg-[#7C2D12] dark:bg-[#C2410C]"
            >
              <Plus className="h-4 w-4" />
              <span>संकल्प जोड़ें</span>
            </button>
          </div>
          {sankalpError && (
            <p role="alert" className="text-xs font-medium text-[#B91C1C] dark:text-[#F87171]">
              {sankalpError}
            </p>
          )}
        </form>

        {/* Sankalp List */}
        {sankalps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D6CCBD] p-6 text-center text-sm text-[#6B5B4E] dark:border-[#3A312B] dark:text-[#A99D91]">
            अभी कोई संकल्प सूची में नहीं है। ऊपर दिए गए फ़ॉर्म से अपना पहला दैनिक नियम जोड़ें।
          </div>
        ) : (
          <ul className="divide-y divide-[#EEE7DA] dark:divide-[#2B241F]">
            {sankalps.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-3.5"
              >
                <button
                  type="button"
                  onClick={() => onToggleSankalp(item.id)}
                  aria-pressed={item.completedToday}
                  className="flex min-h-[44px] flex-1 items-center gap-3 text-left"
                >
                  {item.completedToday ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#15803D] dark:text-[#4ADE80]" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-[#8A7C70] dark:text-[#7D7166]" />
                  )}
                  <div className="space-y-0.5">
                    <p
                      className={`text-sm font-medium ${
                        item.completedToday
                          ? 'text-[#6B5B4E] line-through dark:text-[#8E8277]'
                          : 'text-[#1F1A17] dark:text-[#F4EFE8]'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="tabular-nums text-xs text-[#6B5B4E] dark:text-[#9E9388]">
                      {item.category} · निरंतरता: {item.streakDays} दिन
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteSankalp(item.id)}
                  aria-label={`संकल्प हटाएँ: ${item.title}`}
                  className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-[#6B5B4E] hover:bg-[#F2ECE1] hover:text-[#B91C1C] dark:text-[#9E9388] dark:hover:bg-[#26201B] dark:hover:text-[#F87171]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
