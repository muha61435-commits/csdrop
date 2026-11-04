import React, { useState } from 'react';
import { UserInventoryItem } from '../types';
import { formatKzt, formatFloat, getRarityConfig, getExteriorShortCode } from '../utils/formatters';
import { Package, Send, ExternalLink, ShieldCheck, CheckCircle2, ArrowRight, Wallet } from 'lucide-react';

interface UserInventoryViewProps {
  items: UserInventoryItem[];
  userBalanceKzt: number;
  onOpenTopUp: () => void;
  onGoToCatalog: () => void;
  onWithdrawToSteam: (inventoryId: string) => void;
}

export const UserInventoryView: React.FC<UserInventoryViewProps> = ({
  items,
  userBalanceKzt,
  onOpenTopUp,
  onGoToCatalog,
  onWithdrawToSteam
}) => {
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [successWithdrawId, setSuccessWithdrawId] = useState<string | null>(null);
  const [selectedForWithdraw, setSelectedForWithdraw] = useState<UserInventoryItem | null>(null);
  const [tradeUrl, setTradeUrl] = useState(() => {
    return localStorage.getItem('phantom_steam_trade_url') || 'https://steamcommunity.com/tradeoffer/new/?partner=18492019&token=a7X9k1Lp';
  });

  const totalInventoryValue = items.reduce((acc, curr) => acc + curr.skin.priceKzt, 0);

  const handleStartWithdraw = (item: UserInventoryItem) => {
    setSelectedForWithdraw(item);
  };

  const handleConfirmWithdraw = () => {
    if (!selectedForWithdraw) return;
    try {
      localStorage.setItem('phantom_steam_trade_url', tradeUrl);
    } catch (e) {
      console.error(e);
    }
    const id = selectedForWithdraw.inventoryId;
    setWithdrawingId(id);
    setSelectedForWithdraw(null);

    setTimeout(() => {
      onWithdrawToSteam(id);
      setWithdrawingId(null);
      setSuccessWithdrawId(id);
      setTimeout(() => setSuccessWithdrawId(null), 4000);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner with Stats & Top Up Action */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111624] via-[#0d121c] to-[#0a0d14] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-wider">
            <span>Личный кабинет игрока</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>PHANTOM SKINS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
            Мой инвентарь скинов CS2
          </h1>
          <p className="text-xs text-slate-400">
            Здесь хранятся ваши купленные скины. Вы можете держать их на аккаунте или в любой момент вывести в свой Steam.
          </p>
        </div>

        {/* Balance Card & Actions */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <div>
            <div className="text-[11px] text-slate-400">Баланс кошелька:</div>
            <div className="text-xl font-black text-emerald-400 font-mono-numbers">
              {formatKzt(userBalanceKzt)}
            </div>
          </div>

          <div className="border-l border-slate-800 pl-4">
            <div className="text-[11px] text-slate-400">Стоимость инвентаря:</div>
            <div className="text-xl font-black text-sky-400 font-mono-numbers">
              {formatKzt(totalInventoryValue)}
            </div>
          </div>

          <button
            onClick={onOpenTopUp}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-violet-900/30 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Пополнить счёт</span>
          </button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Скинов на аккаунте: <strong className="text-white font-mono-numbers">{items.length}</strong></span>
          <button
            onClick={onGoToCatalog}
            className="text-violet-400 hover:text-violet-300 font-medium cursor-pointer"
          >
            + Купить ещё скины в каталоге
          </button>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5">
            {items.map(({ inventoryId, skin, acquiredAt, isWithdrawn }) => {
              const rarity = getRarityConfig(skin.rarity);
              const extCode = getExteriorShortCode(skin.exterior);
              const isProcessing = withdrawingId === inventoryId;
              const isSent = successWithdrawId === inventoryId || isWithdrawn;

              return (
                <div
                  key={inventoryId}
                  className="rounded-xl bg-gradient-to-b from-[#111622] to-[#0c0f17] border border-slate-800/80 p-2.5 sm:p-4 flex flex-col justify-between overflow-hidden shadow-lg relative group"
                >
                  {/* Top rarity line */}
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: rarity.colorHex }} />

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold uppercase tracking-wider text-[9px] sm:text-[10px] truncate max-w-[90px]" style={{ color: rarity.colorHex }}>
                        {rarity.nameRu}
                      </span>
                      <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono font-bold text-[9px] sm:text-[11px]">
                        {extCode}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-xs sm:text-sm truncate" title={skin.name}>
                      {skin.name}
                    </h3>

                    {/* Official Game Render */}
                    <div className="relative my-2 sm:my-3 h-24 sm:h-36 flex items-center justify-center bg-[#07090e]/60 rounded-lg p-1.5 overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-15 blur-xl pointer-events-none"
                        style={{ backgroundColor: rarity.colorHex }}
                      />
                      <img
                        src={skin.imageUrl}
                        alt={skin.name}
                        className="max-h-20 sm:max-h-32 max-w-full object-contain filter drop-shadow-md transform group-hover:scale-106 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Specs */}
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mb-2 sm:mb-3">
                      <span className="truncate">Float: <strong className="text-white font-mono-numbers">{formatFloat(skin.floatValue)}</strong></span>
                      <span className="font-mono-numbers font-bold text-sky-400 text-xs sm:text-sm shrink-0 pl-1">
                        {formatKzt(skin.priceKzt)}
                      </span>
                    </div>
                  </div>

                  {/* Withdrawal Action */}
                  <div className="pt-2 border-t border-slate-800">
                    {isSent ? (
                      <div className="py-1.5 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">В Steam!</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartWithdraw({ inventoryId, skin, acquiredAt, isWithdrawn })}
                        disabled={isProcessing}
                        className="w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span className="truncate">{isProcessing ? 'Трейд...' : 'В Steam'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <Package className="w-14 h-14 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">В вашем инвентаре пока пусто</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Пополните счёт через Kaspi QR или выберите любой понравившийся скин в каталоге, чтобы забрать его в свой инвентарь.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenTopUp}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-sky-500 text-white text-xs font-bold cursor-pointer"
              >
                Пополнить счёт
              </button>
              <button
                onClick={onGoToCatalog}
                className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                В каталог скинов
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Steam Trade URL Confirmation Modal */}
      {selectedForWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0c101a] border border-slate-700 shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Send className="w-5 h-5 text-violet-400" />
                <span>Вывод скина в Steam</span>
              </div>
              <button
                onClick={() => setSelectedForWithdraw(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Отмена
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <img
                src={selectedForWithdraw.skin.imageUrl}
                alt={selectedForWithdraw.skin.name}
                className="w-16 h-12 object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {selectedForWithdraw.skin.name}
                </div>
                <div className="text-[11px] text-sky-400 font-mono-numbers font-semibold">
                  {formatKzt(selectedForWithdraw.skin.priceKzt)}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Ваша Steam Trade URL ссылка:</span>
                <a
                  href="https://steamcommunity.com/id/me/tradeoffers/privacy#trade_offer_access_url"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-violet-400 hover:underline flex items-center gap-1"
                >
                  <span>Где взять?</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="text"
                value={tradeUrl}
                onChange={e => setTradeUrl(e.target.value)}
                placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-violet-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">
                Бот отправит обмен в течение 30-90 секунд. Ваш инвентарь в Steam должен быть открытым.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedForWithdraw(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                disabled={!tradeUrl.includes('tradeoffer')}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-lg shadow-violet-900/30"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Отправить трейд</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
