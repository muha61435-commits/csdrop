import React from 'react';
import { TEAM_THEMES, TeamThemeId, TeamTheme } from '../data/teamThemes';
import { X, Check, Sparkles, Sliders, Trophy, Users } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: TeamThemeId;
  onSelectTheme: (themeId: TeamThemeId) => void;
  backdropIntensity: 'balanced' | 'vivid' | 'stealth';
  onChangeIntensity: (val: 'balanced' | 'vivid' | 'stealth') => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
  backdropIntensity,
  onChangeIntensity
}) => {
  if (!isOpen) return null;

  const themeList = Object.values(TEAM_THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-gradient-to-b from-[#111624] to-[#0a0d14] rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Кастомизация витрины CS2</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              Выберите тему любимой команды
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Выбранная команда и фото состава чемпионов украсят задний фон магазина
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Backdrop Intensity Selector */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sliders className="w-4 h-4 text-violet-400" />
            <span className="font-semibold">Яркость фото команды на фоне:</span>
          </div>

          <div className="inline-flex rounded-lg bg-[#07090e] p-1 border border-slate-800">
            <button
              onClick={() => onChangeIntensity('vivid')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                backdropIntensity === 'vivid'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Яркий
            </button>
            <button
              onClick={() => onChangeIntensity('balanced')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                backdropIntensity === 'balanced'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Сбалансированный
            </button>
            <button
              onClick={() => onChangeIntensity('stealth')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                backdropIntensity === 'stealth'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Тёмный
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themeList.map((t: TeamTheme) => {
            const isSelected = t.id === activeThemeId;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-slate-900 to-[#121828] border-violet-500 shadow-xl shadow-violet-950/50 ring-2 ring-violet-500/30'
                    : 'bg-[#0a0d14] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                {/* Mini background preview */}
                <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none">
                  <img
                    src={t.backgroundUrl}
                    alt=""
                    className="w-full h-full object-cover filter blur-[1px]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/70 to-transparent" />
                </div>

                <div className="relative z-10 space-y-3">
                  {/* Top info with Logo */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center p-1.5 overflow-hidden shadow-md">
                        <img
                          src={t.logoUrl}
                          alt={t.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-extrabold text-white text-base">
                            {t.name}
                          </h3>
                          {isSelected && (
                            <span className="p-0.5 rounded-full bg-violet-500 text-slate-950">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {t.country}
                        </span>
                      </div>
                    </div>

                    <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: t.primaryColorHex }}
                      title={`Фирменный цвет: ${t.primaryColorHex}`}
                    />
                  </div>

                  {/* Slogan */}
                  <div className="text-xs font-mono font-medium text-slate-300">
                    {t.tagline}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.description}
                  </p>

                  {/* Roster & Trophy */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{t.trophyTitle}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">Состав: {t.roster.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom select button */}
                <div className="relative z-10 pt-3 mt-2 border-t border-slate-800/50 flex justify-end">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Активная тема' : 'Выбрать тему'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white shadow-lg shadow-violet-900/40 cursor-pointer transition-colors"
          >
            Применить и закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
