import React from 'react';
import { Skin } from '../types';
import { formatKzt, formatFloat, getRarityConfig, getExteriorRu, getExteriorShortCode } from '../utils/formatters';
import { X, ShoppingCart, ShieldCheck, Zap, Layers, Hash, Wallet, PlusCircle } from 'lucide-react';

interface SkinDetailModalProps {
  skin: Skin | null;
  onClose: () => void;
  onAddToCart: (skin: Skin) => void;
  onDirectBuy: (skin: Skin) => void;
  isInCart: boolean;
  userBalanceKzt: number;
  onOpenTopUp: (amount?: number) => void;
}

export const SkinDetailModal: React.FC<SkinDetailModalProps> = ({
  skin,
  onClose,
  onAddToCart,
  onDirectBuy,
  isInCart,
  userBalanceKzt,
  onOpenTopUp
}) => {
  if (!skin) return null;

  const rarity = getRarityConfig(skin.rarity);
  const exteriorRu = getExteriorRu(skin.exterior);
  const exteriorShort = getExteriorShortCode(skin.exterior);
  const floatPercent = Math.min(Math.max(skin.floatValue * 100, 0), 100);
  const missingAmount = Math.max(0, skin.priceKzt - userBalanceKzt);
  const hasSufficientBalance = userBalanceKzt >= skin.priceKzt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#111624] to-[#0a0d14] rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top rarity strip */}
        <div className="h-1.5 w-full" style={{ backgroundColor: rarity.colorHex }} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          
          {/* Left Column: Visual Inspect Canvas */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div className="relative h-64 sm:h-80 w-full rounded-xl bg-[#06080e] border border-slate-800/80 flex items-center justify-center overflow-hidden p-6">
              {/* Radial backdrop aura */}
              <div
                className="absolute inset-0 opacity-25 blur-3xl"
                style={{ backgroundColor: rarity.colorHex }}
              />

              <img
                src={skin.imageUrl}
                alt={skin.name}
                className="relative z-10 max-h-60 max-w-full object-contain filter drop-shadow-2xl transform hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />

              <div className="absolute bottom-3 left-3 text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rarity.colorHex }} />
                <span>CS2 Authentic Game Render</span>
              </div>
            </div>

            {/* Float Gauge Bar */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Степень износа (Float):</span>
                <span className="font-mono-numbers font-bold text-white text-sm">
                  {formatFloat(skin.floatValue)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 w-full rounded-full overflow-hidden bg-slate-800 flex">
                <div className="h-full bg-emerald-500" style={{ width: '7%' }} title="FN 0.00-0.07" />
                <div className="h-full bg-lime-500" style={{ width: '8%' }} title="MW 0.07-0.15" />
                <div className="h-full bg-amber-500" style={{ width: '23%' }} title="FT 0.15-0.38" />
                <div className="h-full bg-orange-500" style={{ width: '7%' }} title="WW 0.38-0.45" />
                <div className="h-full bg-rose-600" style={{ width: '55%' }} title="BS 0.45-1.00" />

                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_white] -translate-x-1/2"
                  style={{ left: `${floatPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono-numbers pt-1">
                <span>0.00 FN</span>
                <span>0.07 MW</span>
                <span>0.15 FT</span>
                <span>0.38 WW</span>
                <span>0.45 BS 1.00</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Specs & Actions */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-5">
            
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded border uppercase tracking-wider"
                  style={{
                    color: rarity.colorHex,
                    borderColor: `${rarity.colorHex}55`,
                    backgroundColor: `${rarity.colorHex}15`
                  }}
                >
                  {rarity.nameRu}
                </span>

                <span className="text-xs font-mono font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  {exteriorRu} ({exteriorShort})
                </span>

                {skin.isStatTrak && (
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-mono-numbers">
                    StatTrak™
                  </span>
                )}

                {skin.isSouvenir && (
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded font-mono-numbers">
                    Сувенир
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-white font-display tracking-tight">
                {skin.name}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                {skin.description}
              </p>
            </div>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-violet-400" />
                  Тип оружия
                </span>
                <span className="font-semibold text-slate-200">{skin.weapon}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-sky-400" />
                  Паттерн (Pattern Seed)
                </span>
                <span className="font-mono-numbers font-semibold text-slate-200">
                  #{skin.patternSeed || '412'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Статус передачи
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Без задержки (0 дней)
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500">Наличие на складе</span>
                <span className="font-semibold text-slate-200">
                  {skin.inStock ? `${skin.stockCount} шт.` : 'Под заказ'}
                </span>
              </div>
            </div>

            {/* Price & Balance Module */}
            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Стоимость:</span>
                  <div className="text-2xl font-black text-white font-mono-numbers">
                    {formatKzt(skin.priceKzt)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Ваш баланс:</span>
                  <div className="text-sm font-bold font-mono-numbers text-emerald-400 flex items-center justify-end gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{formatKzt(userBalanceKzt)}</span>
                  </div>
                </div>
              </div>

              {/* Shortfall warning if balance is lower */}
              {!hasSufficientBalance && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-600/40 text-xs text-amber-300 flex items-center justify-between gap-3">
                  <span className="text-[11px]">
                    Не хватает <strong className="font-mono-numbers text-white">{formatKzt(missingAmount)}</strong>
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTopUp(missingAmount);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Пополнить {formatKzt(missingAmount)}</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onAddToCart(skin)}
                  disabled={!skin.inStock}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isInCart
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-violet-400" />
                  <span>{isInCart ? 'В корзине' : 'В корзину'}</span>
                </button>

                <button
                  onClick={() => {
                    onDirectBuy(skin);
                    onClose();
                  }}
                  disabled={!skin.inStock}
                  className="py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 text-white shadow-lg shadow-violet-900/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Купить скин</span>
                </button>
              </div>

              <div className="text-[11px] text-center text-slate-500">
                🔒 Мгновенный обмен Steam Guard. Оригинальный скин из Counter-Strike 2.
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
