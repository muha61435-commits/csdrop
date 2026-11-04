import React from 'react';
import { ShieldCheck, Zap, RefreshCw, ArrowRight, Sparkles, Trophy, ChevronsUp } from 'lucide-react';
import { TeamTheme } from '../data/teamThemes';

interface HeroProps {
  onScrollToCatalog: () => void;
  onSelectCategory: (cat: string) => void;
  totalSkinsCount: number;
  theme: TeamTheme;
  onOpenThemeSelector: () => void;
  onNavigateToUpgrader: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToCatalog,
  onSelectCategory,
  totalSkinsCount,
  theme,
  onOpenThemeSelector,
  onNavigateToUpgrader
}) => {
  return (
    <div className="relative overflow-hidden border-b border-slate-800/80 bg-[#07090e]/60">
      {/* Background glow elements */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 transition-colors duration-700"
        style={{ backgroundColor: theme.primaryColorHex }}
      />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        
        {/* Main 2-column or Banner Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Team custom kicker badge */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenThemeSelector}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs text-white transition-all cursor-pointer shadow-md group"
              >
                <img
                  src={theme.logoUrl}
                  alt={theme.name}
                  className="w-4 h-4 object-contain rounded"
                  referrerPolicy="no-referrer"
                />
                <span className="font-bold">{theme.name}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400 group-hover:text-violet-300 font-normal">Сменить команду</span>
                <Sparkles className="w-3 h-3 text-violet-400" />
              </button>

              <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span>Казахстан (₸)</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-emerald-400">Steam Trade 24/7</span>
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight text-balance">
              Культовые скины CS2 и Апгрейдер с моментальным выводом
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
              30+ оригинальных скинов из Counter-Strike 2: ножи, перчатки и редкие паттерны в тенге. Покупайте в свой инвентарь или умножайте в режиме <strong>Upgrader CS2</strong>!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onNavigateToUpgrader}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <ChevronsUp className="w-5 h-5" />
                <span>Играть в Апгрейдер</span>
              </button>

              <button
                onClick={onScrollToCatalog}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-900/40 active:scale-95 cursor-pointer"
              >
                <span>В магазин ({totalSkinsCount})</span>
                <ArrowRight className="w-4 h-4 text-violet-200" />
              </button>

              <button
                onClick={() => onSelectCategory('knives')}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-medium text-sm transition-colors cursor-pointer"
              >
                <span>Коллекция ножей</span>
              </button>
            </div>

            {/* Value Props Strip */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Доставка</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-white font-mono-numbers">
                  ~45 сек.
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Безопасность</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-white">
                  Steam Guard
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                  <span>Валюта</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-white font-mono-numbers">
                  Тенге (₸)
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: High-Impact Team Showcase Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 bg-gradient-to-b from-slate-900 to-[#0b0e17] shadow-2xl shadow-violet-950/40 group">
              <img
                src={theme.backgroundUrl}
                alt={`${theme.name} Background`}
                className="w-full h-72 sm:h-80 object-cover object-top transform group-hover:scale-104 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/40 to-transparent" />
              
              {/* Team Panther / Emblem floating watermark in top right */}
              <div className="absolute top-3 right-3 w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-700 p-1 backdrop-blur-md">
                <img
                  src={theme.logoUrl}
                  alt={theme.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Bottom Card Overlay */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{theme.trophyTitle}</span>
                  </div>
                  <button
                    onClick={onOpenThemeSelector}
                    className="text-[11px] text-violet-400 hover:text-violet-300 font-medium underline cursor-pointer"
                  >
                    Сменить команду
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <div className="text-white font-bold">{theme.name}</div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    {theme.roster.slice(0, 3).join(', ')}...
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
