import React, { useState, useEffect } from 'react';
import { formatKzt } from '../utils/formatters';
import { X, Wallet, QrCode, CreditCard, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalanceKzt: number;
  onDeposit: (amountKzt: number) => void;
  recommendedAmount?: number; // if user needed money for a specific skin
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  currentBalanceKzt,
  onDeposit,
  recommendedAmount
}) => {
  const [amount, setAmount] = useState<number>(recommendedAmount || 50000);
  const [paymentMethod, setPaymentMethod] = useState<'kaspi' | 'halyk' | 'card'>('kaspi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (recommendedAmount && recommendedAmount > 0) {
      setAmount(recommendedAmount);
    }
  }, [recommendedAmount]);

  if (!isOpen) return null;

  const quickPresets = [10000, 25000, 50000, 100000, 250000, 500000];

  const handleConfirmDeposit = () => {
    if (amount <= 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      onDeposit(amount);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-[#111624] to-[#0a0d14] rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display">
                Пополнение счёта
              </h2>
              <div className="text-xs text-slate-400">
                Текущий баланс: <strong className="text-sky-400 font-mono-numbers">{formatKzt(currentBalanceKzt)}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {recommendedAmount && recommendedAmount > 0 ? (
          <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-800/40 text-xs text-violet-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold">Для покупки скина не хватает:</span>
              <div className="text-sky-300 font-mono-numbers font-bold text-sm">
                {formatKzt(recommendedAmount)}
              </div>
            </div>
            <button
              onClick={() => setAmount(recommendedAmount)}
              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs cursor-pointer"
            >
              Выбрать эту сумму
            </button>
          </div>
        ) : null}

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-white">Счёт успешно пополнен!</h3>
            <p className="text-xs text-slate-300">
              Зачислено: <strong className="text-sky-400 font-mono-numbers text-sm">{formatKzt(amount)}</strong>. Теперь вы можете забрать скины в свой инвентарь!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Способ оплаты в Казахстане</label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('kaspi')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'kaspi'
                      ? 'bg-rose-950/40 border-rose-500 text-white ring-2 ring-rose-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-7 h-7 mx-auto rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center mb-1">
                    K
                  </div>
                  <div className="text-xs font-bold">Kaspi QR / Gold</div>
                  <div className="text-[10px] text-emerald-400">0% комиссия</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('halyk')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'halyk'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-1">
                    H
                  </div>
                  <div className="text-xs font-bold">Halyk Bank</div>
                  <div className="text-[10px] text-emerald-400">0% комиссия</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-sky-950/40 border-sky-500 text-white ring-2 ring-sky-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-7 h-7 mx-auto text-sky-400 mb-1" />
                  <div className="text-xs font-bold">Карта Visa/MC</div>
                  <div className="text-[10px] text-slate-400">Любой банк</div>
                </button>
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Сумма пополнения (₸)</label>
              <input
                type="number"
                min={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-white font-mono-numbers focus:outline-none focus:border-violet-500"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                      amount === preset
                        ? 'bg-violet-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    +{formatKzt(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Kaspi QR Interactive Card */}
            {paymentMethod === 'kaspi' && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0 shadow-md">
                  <QrCode className="w-full h-full text-slate-950" />
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Kaspi QR для оплаты</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Отсканируйте QR в мобильном приложении Kaspi.kz или нажмите кнопку ниже для мгновенного подтверждения.
                  </p>
                </div>
              </div>
            )}

            {/* Action CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmDeposit}
                disabled={isProcessing || amount <= 0}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 text-white shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Обработка платежа...</span>
                ) : (
                  <>
                    <span>Пополнить счёт на {formatKzt(amount)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Безопасный шлюз. Демо-пополнение счёта без списания реальных денег.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
