import React from 'react';
import { ShoppingBag, ChevronsUp, Package, Wallet, FileText, ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatKzt } from '../utils/formatters';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  inventoryCount: number;
  userBalanceKzt: number;
  onOpenTopUp: () => void;
  isAdmin: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  inventoryCount,
  userBalanceKzt,
  onOpenTopUp,
  isAdmin
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_24px_rgba(0,0,0,0.7)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        
        {/* Tab 1: Catalog */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center h-full transition-all cursor-pointer relative ${
            currentView === 'home' || currentView === 'catalog'
              ? 'text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {(currentView === 'home' || currentView === 'catalog') && (
            <span className="absolute top-0 w-8 h-0.5 bg-violet-500 rounded-full shadow-[0_0_8px_#8b5cf6]" />
          )}
          <ShoppingBag className={`w-5 h-5 ${currentView === 'home' || currentView === 'catalog' ? 'text-violet-400' : ''}`} />
          <span className="text-[10px] font-semibold tracking-tight mt-1">Каталог</span>
        </button>

        {/* Tab 2: UPGRADE (Prominent Feature) */}
        <button
          onClick={() => onNavigate('upgrader')}
          className={`flex flex-col items-center justify-center h-full transition-all cursor-pointer relative group ${
            currentView === 'upgrader'
              ? 'text-amber-400'
              : 'text-amber-400/80 hover:text-amber-300'
          }`}
        >
          {currentView === 'upgrader' && (
            <span className="absolute top-0 w-8 h-0.5 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]" />
          )}
          <div className="relative">
            <div className={`p-1 rounded-xl transition-all ${
              currentView === 'upgrader' ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-105' : 'bg-amber-500/10 text-amber-400'
            }`}>
              <ChevronsUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-0.5 text-amber-400">Апгрейд</span>
        </button>

        {/* Tab 3: Inventory */}
        <button
          onClick={() => onNavigate('inventory')}
          className={`flex flex-col items-center justify-center h-full transition-all cursor-pointer relative ${
            currentView === 'inventory'
              ? 'text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {currentView === 'inventory' && (
            <span className="absolute top-0 w-8 h-0.5 bg-violet-500 rounded-full shadow-[0_0_8px_#8b5cf6]" />
          )}
          <div className="relative">
            <Package className={`w-5 h-5 ${currentView === 'inventory' ? 'text-violet-400' : ''}`} />
            {inventoryCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-violet-600 text-white font-mono font-bold text-[9px] px-1.2 py-0.2 rounded-full min-w-[15px] text-center">
                {inventoryCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-1">Инвентарь</span>
        </button>

        {/* Tab 4: Wallet / Balance Top Up */}
        <button
          onClick={onOpenTopUp}
          className="flex flex-col items-center justify-center h-full transition-all cursor-pointer text-emerald-400 hover:text-emerald-300"
          title="Пополнить баланс"
        >
          <div className="relative">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center">
              +
            </span>
          </div>
          <span className="text-[10px] font-bold font-mono-numbers mt-1 truncate max-w-[62px]">
            {formatKzt(userBalanceKzt)}
          </span>
        </button>

        {/* Tab 5: Orders or Admin */}
        <button
          onClick={() => onNavigate(currentView === 'admin' ? 'home' : (isAdmin ? 'admin' : 'my-orders'))}
          className={`flex flex-col items-center justify-center h-full transition-all cursor-pointer relative ${
            currentView === 'my-orders' || currentView === 'admin'
              ? 'text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {(currentView === 'my-orders' || currentView === 'admin') && (
            <span className="absolute top-0 w-8 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
          )}
          {currentView === 'admin' || isAdmin ? (
            <ShieldCheck className={`w-5 h-5 ${currentView === 'admin' ? 'text-sky-400' : 'text-emerald-400'}`} />
          ) : (
            <FileText className={`w-5 h-5 ${currentView === 'my-orders' ? 'text-sky-400' : ''}`} />
          )}
          <span className="text-[10px] font-semibold tracking-tight mt-1 truncate">
            {currentView === 'admin' ? 'Админ' : 'Заказы'}
          </span>
        </button>

      </div>
    </div>
  );
};
