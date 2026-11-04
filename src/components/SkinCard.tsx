import React from 'react';
import { Skin } from '../types';
import { formatKzt, formatFloat, getRarityConfig, getExteriorShortCode, getExteriorRu } from '../utils/formatters';
import { Eye, ShoppingCart, Check, AlertCircle } from 'lucide-react';

interface SkinCardProps {
  skin: Skin;
  onInspect: (skin: Skin) => void;
  onAddToCart: (skin: Skin) => void;
  isInCart: boolean;
}

export const SkinCard: React.FC<SkinCardProps> = ({
  skin,
  onInspect,
  onAddToCart,
  isInCart
}) => {
  const rarity = getRarityConfig(skin.rarity);
  const exteriorShort = getExteriorShortCode(skin.exterior);
  const exteriorFull = getExteriorRu(skin.exterior);

  // Float value clamped 0 to 1
  const floatPercent = Math.min(Math.max(skin.floatValue * 100, 0), 100);

  return (
    <div
      className={`group relative rounded-xl bg-gradient-to-b from-[#111622] to-[#0c0f17] border border-slate-800/80 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between overflow-hidden cs-card-glow ${
        !skin.inStock ? 'opacity-65' : ''
      }`}
    >
      {/* Top subtle rarity line */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: rarity.colorHex }}
      />

      <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between">
        
        {/* Header: Rarity & Exterior badges & StatTrak */}
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span
              className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider truncate max-w-[110px]"
              style={{ color: rarity.colorHex }}
            >
              {rarity.nameRu}
            </span>

            <div className="flex items-center gap-1 shrink-0">
              {skin.isStatTrak && (
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-1 py-0.2 rounded font-mono-numbers">
                  ST™
                </span>
              )}
              {skin.isSouvenir && (
                <span className="text-[9px] sm:text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-1 py-0.2 rounded font-mono-numbers">
                  ★
                </span>
              )}
              <span
                className="text-[9px] sm:text-xs font-mono font-medium text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded"
                title={exteriorFull}
              >
                {exteriorShort}
              </span>
            </div>
          </div>

          {/* Skin Title */}
          <h3
            onClick={() => onInspect(skin)}
            className="text-xs sm:text-base font-bold text-white hover:text-violet-300 transition-colors cursor-pointer truncate"
            title={skin.name}
          >
            {skin.name}
          </h3>

          <div className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
            {skin.weapon} · {skin.skinName}
          </div>
        </div>

        {/* Visual Showcase: Weapon Image with glow */}
        <div
          onClick={() => onInspect(skin)}
          className="relative my-2 sm:my-4 h-24 sm:h-44 w-full flex items-center justify-center cursor-pointer overflow-hidden rounded-lg bg-[#07090e]/60 group-hover:bg-[#07090e]/90 transition-colors"
        >
          {/* Subtle weapon aura matching rarity */}
          <div
            className="absolute inset-0 opacity-15 blur-xl transition-opacity group-hover:opacity-30"
            style={{ backgroundColor: rarity.colorHex }}
          />

          <img
            src={skin.imageUrl}
            alt={skin.name}
            className="relative z-10 max-h-20 sm:max-h-36 max-w-full object-contain filter drop-shadow-md transform group-hover:scale-106 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.img-fallback')) {
                const div = document.createElement('div');
                div.className = 'img-fallback text-center p-2 text-xs text-slate-400';
                div.innerHTML = `<span class="block text-lg mb-0.5">🔫</span><span class="font-medium text-slate-300 text-[10px]">${skin.weapon}</span>`;
                parent.appendChild(div);
              }
            }}
          />

          {/* Quick inspect button hover trigger */}
          <div className="hidden sm:flex absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInspect(skin);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-medium border border-slate-700 flex items-center gap-1.5 shadow-lg hover:bg-slate-800 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-violet-400" />
              <span>Осмотреть</span>
            </button>
          </div>
        </div>

        {/* Float Wear Meter */}
        <div className="space-y-1 mb-2.5 sm:mb-4">
          <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-slate-400">
            <span>Float: <strong className="text-slate-200 font-mono-numbers">{formatFloat(skin.floatValue)}</strong></span>
            {skin.patternSeed ? (
              <span className="font-mono-numbers text-slate-500 hidden sm:inline">#{skin.patternSeed}</span>
            ) : null}
          </div>

          {/* Exterior float color bar */}
          <div className="relative h-1 sm:h-1.5 w-full rounded-full overflow-hidden bg-slate-800 flex">
            <div className="h-full bg-emerald-500" style={{ width: '7%' }} title="FN (0.00-0.07)" />
            <div className="h-full bg-lime-500" style={{ width: '8%' }} title="MW (0.07-0.15)" />
            <div className="h-full bg-amber-500" style={{ width: '23%' }} title="FT (0.15-0.38)" />
            <div className="h-full bg-orange-500" style={{ width: '7%' }} title="WW (0.38-0.45)" />
            <div className="h-full bg-rose-600" style={{ width: '55%' }} title="BS (0.45-1.00)" />

            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_6px_white] -translate-x-1/2"
              style={{ left: `${floatPercent}%` }}
              title={`Float: ${skin.floatValue}`}
            />
          </div>
        </div>

        {/* Bottom Strip: Stock, Price and CTA */}
        <div className="pt-2 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 sm:gap-3">
          <div className="min-w-0">
            <div className="text-xs sm:text-lg font-black text-white font-mono-numbers tracking-tight truncate">
              {formatKzt(skin.priceKzt)}
            </div>

            <div className="text-[9px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              {skin.inStock ? (
                <span className="text-emerald-400 font-medium">В наличии</span>
              ) : (
                <span className="text-rose-400 flex items-center gap-0.5 font-medium">
                  <AlertCircle className="w-2.5 h-2.5" />
                  Нет
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onAddToCart(skin)}
            disabled={!skin.inStock}
            className={`px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 active:scale-95 ${
              !skin.inStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isInCart
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-900/30'
            }`}
            title={isInCart ? 'Добавлено в корзину' : 'Купить скин'}
          >
            {isInCart ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">В корзине</span>
                <span className="sm:hidden">✓</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Купить</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
