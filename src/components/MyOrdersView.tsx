import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { api } from '../services/api';
import { formatKzt, getOrderStatusConfig } from '../utils/formatters';
import { Search, Package, Clock, ExternalLink, RefreshCw } from 'lucide-react';

interface MyOrdersViewProps {
  onBackToCatalog: () => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({ onBackToCatalog }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Initial load: show recent sample orders
  const loadRecentOrders = async (query = '') => {
    setIsLoading(true);
    try {
      const res = await api.trackOrders(query);
      setOrders(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setHasSearched(Boolean(query));
    }
  };

  useEffect(() => {
    loadRecentOrders('csgo.pro.kz@gmail.com');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    loadRecentOrders(searchQuery.trim());
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Search bar */}
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Отслеживание заказов
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Введите номер заказа (например, PH-94102), вашу электронную почту или ссылку на обмен Steam.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="PH-94102 или почта/Trade URL..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm cursor-pointer transition-colors shrink-0"
          >
            {isLoading ? 'Поиск...' : 'Найти заказ'}
          </button>
        </form>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Найдено заказов: <strong className="text-white font-mono-numbers">{orders.length}</strong></span>
          <button
            onClick={() => loadRecentOrders(searchQuery)}
            className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Обновить статус</span>
          </button>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = getOrderStatusConfig(order.status);
              const orderDate = new Date(order.createdAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={order.id}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#111624] to-[#0a0d14] border border-slate-800 space-y-4 shadow-xl"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono-numbers font-black text-white text-base sm:text-lg">
                          Заказ #{order.id}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${statusCfg.colorClass}`}>
                          {statusCfg.labelRu}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{orderDate}</span>
                        <span>·</span>
                        <span>{order.buyerEmail}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Сумма к оплате:</div>
                      <div className="text-lg sm:text-xl font-black text-sky-400 font-mono-numbers">
                        {formatKzt(order.totalAmountKzt)}
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-400">Скины в заказе:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="truncate mr-2">
                            <div className="font-semibold text-white truncate">{item.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {item.exterior} · Float {item.floatValue}
                            </div>
                          </div>
                          <span className="font-mono-numbers font-bold text-sky-400 whitespace-nowrap">
                            {formatKzt(item.priceKzt * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bot & Trade Status Details */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="text-slate-300 font-medium">
                        Торговый бот: <span className="text-violet-400">{order.botName || 'Phantom Bot #01'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Трейд-оффер: {order.tradeOfferId || 'ID#81920'}
                      </div>
                    </div>

                    <a
                      href={order.steamTradeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium text-xs transition-colors shrink-0"
                    >
                      <span>Открыть обмен в Steam</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">
              {hasSearched ? 'Заказы по вашему запросу не найдены' : 'У вас пока нет оформленных заказов'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Оформите покупку любого скина в каталоге, и он сразу появится здесь для отслеживания доставки.
            </p>
            <button
              onClick={onBackToCatalog}
              className="mt-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer"
            >
              Перейти в каталог скинов
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
