import React, { useState } from 'react';
import { CartItem, Order } from '../types';
import { formatKzt } from '../utils/formatters';
import { X, ShieldCheck, HelpCircle, ArrowRight, Loader2, Wallet, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  userBalanceKzt: number;
  onOpenTopUp: (recommendedAmount?: number) => void;
  onSubmitOrder: (data: {
    steamTradeUrl: string;
    buyerEmail: string;
    buyerPhone: string;
    comment: string;
    payFromBalance?: boolean;
  }) => Promise<Order>;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  userBalanceKzt,
  onOpenTopUp,
  onSubmitOrder,
  onOrderSuccess
}) => {
  const [paymentChoice, setPaymentChoice] = useState<'balance' | 'direct'>('balance');
  const [steamTradeUrl, setSteamTradeUrl] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTradeUrlHelp, setShowTradeUrlHelp] = useState(false);

  if (!isOpen) return null;

  const totalKzt = items.reduce((acc, curr) => acc + curr.skin.priceKzt * curr.quantity, 0);
  const missingAmount = Math.max(0, totalKzt - userBalanceKzt);
  const hasSufficientBalance = userBalanceKzt >= totalKzt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (paymentChoice === 'balance' && !hasSufficientBalance) {
      setError(`Недостаточно средств на балансе. Требуется пополнить ещё ${formatKzt(missingAmount)}.`);
      return;
    }

    // Validation
    const cleanUrl = steamTradeUrl.trim();
    if (!cleanUrl) {
      setError('Укажите ваш Steam Trade URL для передачи скина в инвентарь Steam.');
      return;
    }
    if (!cleanUrl.includes('steamcommunity.com/tradeoffer/new')) {
      setError('Некорректная ссылка на обмен. Пример: https://steamcommunity.com/tradeoffer/new/?partner=...&token=...');
      return;
    }

    const cleanEmail = buyerEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Укажите корректный адрес электронной почты.');
      return;
    }

    try {
      setIsSubmitting(true);
      const order = await onSubmitOrder({
        steamTradeUrl: cleanUrl,
        buyerEmail: cleanEmail,
        buyerPhone: buyerPhone.trim(),
        comment: comment.trim(),
        payFromBalance: paymentChoice === 'balance'
      });
      onOrderSuccess(order);
    } catch (err: any) {
      setError(err.message || 'Ошибка оформления заказа. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoTradeUrl = () => {
    setSteamTradeUrl('https://steamcommunity.com/tradeoffer/new/?partner=84192019&token=a8X9k1Lp');
    setBuyerEmail('steampresident@csgo.kz');
    setBuyerPhone('+7 (777) 123-45-67');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#111624] to-[#0a0d14] rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-display">
              Оформление покупки скинов
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Скинов в заказе: {items.length} · Итого к оплате: <span className="text-sky-400 font-bold font-mono-numbers">{formatKzt(totalKzt)}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Option: Balance vs Direct */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Способ оплаты</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentChoice('balance')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  paymentChoice === 'balance'
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Баланс счёта</span>
                    <span className="text-[11px] font-mono-numbers font-bold text-emerald-400">
                      {formatKzt(userBalanceKzt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Списание со счёта с зачислением в инвентарь магазина
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentChoice('direct')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  paymentChoice === 'direct'
                    ? 'bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-white">Прямой демо-заказ</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Тестовая эмуляция передачи скина без списания
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Account Balance Shortfall Banner */}
          {paymentChoice === 'balance' && !hasSufficientBalance && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Не хватает средств для оплаты
                </span>
                <span className="font-mono-numbers text-rose-400 font-bold">
                  -{formatKzt(missingAmount)}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                На вашем счёте {formatKzt(userBalanceKzt)}, а стоимость заказа составляет {formatKzt(totalKzt)}. Чтобы совершить покупку, пополните баланс на сумму нехватки.
              </p>
              <button
                type="button"
                onClick={() => onOpenTopUp(missingAmount)}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Пополнить баланс на недостающие {formatKzt(missingAmount)} (Kaspi QR / Карта)</span>
              </button>
            </div>
          )}

          {/* Steam Trade URL field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Steam Trade URL (Ссылка на обмен)</span>
                <span className="text-rose-400">*</span>
              </label>

              <button
                type="button"
                onClick={() => setShowTradeUrlHelp(!showTradeUrlHelp)}
                className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Где взять ссылку?</span>
              </button>
            </div>

            <input
              type="text"
              required
              value={steamTradeUrl}
              onChange={(e) => setSteamTradeUrl(e.target.value)}
              placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..."
              className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono"
            />

            {showTradeUrlHelp && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <p>1. Откройте инвентарь Steam на ПК или в браузере.</p>
                <p>2. Нажмите «Предложения обмена» → «Кто может отправлять мне предложения обмена?».</p>
                <p>3. Внизу найдите блок «Сторонние сайты» и скопируйте вашу уникальную ссылку.</p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleFillDemoTradeUrl}
                    className="text-violet-400 hover:text-violet-300 underline font-medium cursor-pointer"
                  >
                    Вставить пример тестовой ссылки для быстрой проверки
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Электронная почта (Email)</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              required
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="gamer@example.kz"
              className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
            />
            <span className="text-[10px] text-slate-500">
              На этот адрес мы отправим квитанцию и статус отправки трейда в Steam.
            </span>
          </div>

          {/* Contact (Phone / Telegram) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Телефон или Telegram (опционально)
              </label>
              <input
                type="text"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="+7 (7XX) XXX-XX-XX или @telegram"
                className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Комментарий к заказу
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Например: быстрее, перед матчем!"
                className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Order Summary & Submit CTA */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (paymentChoice === 'balance' && !hasSufficientBalance)}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 text-white shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Обработка и передача в инвентарь...</span>
                </>
              ) : (
                <>
                  <span>
                    {paymentChoice === 'balance'
                      ? `Оплатить с баланса (${formatKzt(totalKzt)})`
                      : `Оформить заказ (${formatKzt(totalKzt)})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
