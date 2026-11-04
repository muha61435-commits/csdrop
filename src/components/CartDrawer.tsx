import React from 'react';
import { CartItem } from '../types';
import { formatKzt, getExteriorShortCode } from '../utils/formatters';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (skinId: string, quantity: number) => void;
  onRemoveItem: (skinId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const totalKzt = items.reduce((acc, curr) => acc + (curr.skin.priceKzt * curr.quantity), 0);
  const totalCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b0e17] border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-violet-400" />
              <h2 className="font-display font-bold text-lg text-white">
                Корзина покупок
              </h2>
              <span className="text-xs text-slate-400 font-mono-numbers">
                ({totalCount})
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length > 0 ? (
              <>
                <div className="flex justify-between items-center text-xs text-slate-400 pb-1">
                  <span>Выбранные скины</span>
                  <button
                    onClick={onClearCart}
                    className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    Очистить корзину
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map(({ skin, quantity }) => (
                    <div
                      key={skin.id}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-[#07090e] border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <img
                          src={skin.imageUrl}
                          alt={skin.name}
                          className="max-h-14 max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-bold text-white truncate" title={skin.name}>
                          {skin.name}
                        </h4>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                            {getExteriorShortCode(skin.exterior)}
                          </span>
                          <span className="text-sky-400 font-bold font-mono-numbers">
                            {formatKzt(skin.priceKzt)}
                          </span>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className="inline-flex items-center rounded-md border border-slate-700 bg-slate-950 p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(skin.id, quantity - 1)}
                              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-white">
                              {quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(skin.id, quantity + 1)}
                              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-[11px] text-slate-500 font-mono-numbers">
                            = {formatKzt(skin.priceKzt * quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(skin.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Удалить из корзины"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-white text-base">Корзина пуста</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Выберите интересующие скины из каталога, чтобы моментально получить их в Steam.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Перейти к покупкам
                </button>
              </div>
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-[#080b12] space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-400">Итого к оплате:</span>
                <span className="text-2xl font-black text-sky-400 font-mono-numbers">
                  {formatKzt(totalKzt)}
                </span>
              </div>

              <div className="text-[11px] text-slate-500">
                ⚡ Демонстрационное оформление: реальные деньги не списываются, бот эмулирует отправку трейда в Steam.
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 text-white shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span>Оформить заказ ({formatKzt(totalKzt)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
