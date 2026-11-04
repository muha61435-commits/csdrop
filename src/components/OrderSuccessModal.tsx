import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { formatKzt } from '../utils/formatters';
import { CheckCircle2, Bot, ArrowRight, ExternalLink } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onGoToMyOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onGoToMyOrders
}) => {
  const [simulationStep, setSimulationStep] = useState(1);

  useEffect(() => {
    if (!order) return;
    setSimulationStep(1);

    const timer1 = setTimeout(() => {
      setSimulationStep(2);
    }, 1800);

    const timer2 = setTimeout(() => {
      setSimulationStep(3);
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-gradient-to-b from-[#111624] to-[#0a0d14] rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-black text-white font-display">
            Заказ успешно оформлен!
          </h2>

          <div className="inline-block bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-300 font-mono">
            Номер заказа: <strong className="text-sky-400 font-mono-numbers">{order.id}</strong>
          </div>
        </div>

        {/* Live Steam Trade Bot Simulation */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-violet-400" />
              <span>{order.botName || 'Phantom Bot #01'}</span>
            </span>
            <span className="text-xs font-mono text-slate-500">{order.tradeOfferId}</span>
          </div>

          {/* Stepper */}
          <div className="space-y-2.5 text-xs">
            <div className={`flex items-center gap-2.5 transition-colors ${simulationStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${simulationStep >= 1 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
              <span>1. Заказ зарегистрирован и оплачен (демо-режим)</span>
            </div>

            <div className={`flex items-center gap-2.5 transition-colors ${simulationStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${simulationStep >= 2 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
              <span>2. Бот подготовил скины из инвентаря</span>
            </div>

            <div className={`flex items-center gap-2.5 transition-colors ${simulationStep >= 3 ? 'text-sky-400 font-semibold' : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${simulationStep >= 3 ? 'bg-sky-400 animate-pulse' : 'bg-slate-700'}`} />
              <span>3. Предложение обмена (Trade Offer) отправлено в ваш Steam!</span>
            </div>
          </div>

          {simulationStep >= 3 && (
            <div className="pt-2">
              <a
                href={order.steamTradeUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Принять трейд в клиенте Steam</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Ordered items recap */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400">Содержимое заказа:</div>
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
                <span className="text-slate-200 font-medium truncate max-w-[260px]">{item.name}</span>
                <span className="text-sky-400 font-mono-numbers font-bold">{formatKzt(item.priceKzt * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-baseline pt-2 text-xs">
            <span className="text-slate-400">Сумма заказа:</span>
            <span className="text-base font-bold text-white font-mono-numbers">{formatKzt(order.totalAmountKzt)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onGoToMyOrders();
            }}
            className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>В «Мои заказы»</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Вернуться в магазин
          </button>
        </div>

      </div>
    </div>
  );
};
