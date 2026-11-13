import { BookOpen, Flame, Home, HeartHandshake, Sparkles, Sun, Moon } from 'lucide-react';
import type { ScreenId } from '../types/ashram';

interface TopNavProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  savedCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_ITEMS: { id: ScreenId; label: string; mobileLabel: string }[] = [
  { id: 'home', label: 'गृह दर्शन', mobileLabel: 'गृह' },
  { id: 'vani', label: 'अघोरवाणी', mobileLabel: 'वाणी' },
  { id: 'sahitya', label: 'धर्म साहित्य', mobileLabel: 'साहित्य' },
  { id: 'sadhana', label: 'जप साधना', mobileLabel: 'साधना' },
  { id: 'seva', label: 'सेवा व संग्रह', mobileLabel: 'सेवा' },
];

function getMobileIcon(id: ScreenId) {
  switch (id) {
    case 'home':
      return Home;
    case 'vani':
      return Sparkles;
    case 'sahitya':
      return BookOpen;
    case 'sadhana':
      return Flame;
    case 'seva':
      return HeartHandshake;
  }
}

export function TopNav({
  activeScreen,
  onNavigate,
  savedCount,
  theme,
  onToggleTheme,
}: TopNavProps) {
  const activeItem = NAV_ITEMS.find((item) => item.id === activeScreen) ?? NAV_ITEMS[0];

  return (
    <>
      {/* Desktop Top Bar: strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 hidden border-b border-[#E5DDD0] bg-[#FBF9F5]/95 backdrop-blur-md md:block dark:border-[#2E2722] dark:bg-[#14110F]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single-element brand wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-editorial shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight text-[#1F1A17] transition-colors hover:text-[#9A3412] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A3412] dark:text-[#F4EFE8] dark:hover:text-[#E07A4B]"
          >
            अघोर पीठ आश्रम
          </button>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav aria-label="मुख्य नेविगेशन" className="flex items-center gap-7">
            {NAV_ITEMS.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`shrink-0 whitespace-nowrap border-b-2 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A3412] ${
                    isActive
                      ? 'border-[#9A3412] text-[#9A3412] dark:border-[#E07A4B] dark:text-[#E07A4B]'
                      : 'border-transparent text-[#574D45] hover:text-[#1F1A17] dark:text-[#B9AFA4] dark:hover:text-[#F4EFE8]'
                  }`}
                >
                  {item.label}
                  {item.id === 'seva' && savedCount > 0 ? ` (${savedCount})` : ''}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('sadhana')}
              className="shrink-0 whitespace-nowrap rounded-lg bg-[#9A3412] px-4 py-2 text-sm font-medium text-[#FBF9F5] transition-colors hover:bg-[#7C2D12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412] dark:bg-[#C2410C] dark:hover:bg-[#9A3412]"
            >
              साधना आरंभ
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Compact Top App Bar (48px) */}
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-[#E5DDD0] bg-[#FBF9F5]/95 px-4 backdrop-blur-md md:hidden dark:border-[#2E2722] dark:bg-[#14110F]/95">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="font-editorial min-h-[44px] truncate whitespace-nowrap text-base font-semibold text-[#1F1A17] dark:text-[#F4EFE8]"
        >
          अघोर पीठ आश्रम
        </button>
        <span className="truncate px-2 text-xs font-medium text-[#6B5B4E] dark:text-[#B9AFA4]">
          {activeItem.label}
        </span>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'संध्या ध्यान मोड चालू करें' : 'प्रातः दर्शन मोड चालू करें'}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#574D45] hover:bg-[#F2ECE1] dark:text-[#C7B9A8] dark:hover:bg-[#26201B]"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </header>

      {/* Mobile Bottom Thumb-Zone Tab Bar (56px; total fixed height 104px <= 15% of 844px) */}
      <nav
        aria-label="मोबाइल नेविगेशन"
        className="fixed right-0 bottom-0 left-0 z-40 grid h-14 grid-cols-5 border-t border-[#E5DDD0] bg-[#FBF9F5]/95 backdrop-blur-md md:hidden dark:border-[#2E2722] dark:bg-[#14110F]/95"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = getMobileIcon(item.id);
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                isActive
                  ? 'text-[#9A3412] dark:text-[#E07A4B]'
                  : 'text-[#6B5B4E] hover:text-[#1F1A17] dark:text-[#9E9388] dark:hover:text-[#F4EFE8]'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={isActive ? 2.2 : 1.75} />
              <span className="whitespace-nowrap text-[11px] font-medium leading-none">
                {item.mobileLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
