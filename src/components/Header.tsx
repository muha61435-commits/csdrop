import React from 'react';
import { ShoppingBag, ShieldCheck, ShieldAlert, Package, ChevronsUp, Wallet, Download } from 'lucide-react';
import { TeamTheme } from '../data/teamThemes';
import { formatKzt } from '../utils/formatters';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  cartTotalKzt: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  currentTheme: TeamTheme;
  onOpenThemeSelector: () => void;
  userBalanceKzt: number;
  onOpenTopUp: () => void;
  inventoryCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  cartCount,
  cartTotalKzt,
  onOpenCart,
  isAdmin,
  currentTheme,
  onOpenThemeSelector,
  userBalanceKzt,
  onOpenTopUp,
  inventoryCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Zone 1: Selected Team Emblem & Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-none rounded-lg p-1 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center p-1 shadow-md shadow-black/60 group-hover:border-white transition-all overflow-hidden shrink-0">
            <img
              src={currentTheme.logoUrl}
              alt={currentTheme.name}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-display font-extrabold text-base sm:text-xl tracking-tight text-white whitespace-nowrap shrink-0 group-hover:text-violet-400 transition-colors">
              PHANTOM <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">SKINS</span>
            </span>
            <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono -mt-1 hidden sm:block">
              <span className="text-white font-semibold">{currentTheme.shortName}</span> · ₸ KZT
            </div>
          </div>
        </button>

        {/* Zone 2: Desktop Navigation Links (hidden on mobile, mobile has fixed bottom nav) */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentView === 'home' || currentView === 'catalog'
                ? 'text-white border-b-2 border-violet-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Каталог
          </button>

          {/* Upgrader tab (Featured CS2 game mode!) */}
          <button
            onClick={() => onNavigate('upgrader')}
            className={`whitespace-nowrap transition-all py-1 px-2.5 rounded-lg cursor-pointer flex items-center gap-1.5 font-bold ${
              currentView === 'upgrader'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <ChevronsUp className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Апгрейдер</span>
            <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
              CS2
            </span>
          </button>

          <button
            onClick={() => onNavigate('inventory')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              currentView === 'inventory'
                ? 'text-white border-b-2 border-violet-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-violet-400" />
            <span>Инвентарь</span>
            {inventoryCount > 0 && (
              <span className="bg-violet-600 text-white font-mono-numbers text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {inventoryCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('my-orders')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentView === 'my-orders'
                ? 'text-white border-b-2 border-violet-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Заказы
          </button>

          <button
            onClick={() => onNavigate('about')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentView === 'about'
                ? 'text-white border-b-2 border-violet-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            О магазине
          </button>

          <button
            onClick={() => onNavigate('contacts')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentView === 'contacts'
                ? 'text-white border-b-2 border-violet-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Контакты
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs px-2.5 py-1 rounded transition-colors ${
              currentView === 'admin'
                ? 'bg-violet-950 text-violet-300 border border-violet-700/60'
                : 'text-slate-400 hover:text-violet-300 hover:bg-slate-900'
            }`}
            title="Панель администратора"
          >
            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />}
            <span>Админ</span>
          </button>
        </nav>

        {/* Zone 3: Mobile & Desktop Quick Actions (Balance, Theme Switcher, Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* User Wallet Balance Button */}
          <button
            onClick={onOpenTopUp}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-[11px] sm:text-xs font-semibold text-emerald-300 transition-all cursor-pointer shadow-sm group hover:border-emerald-400"
            title="Пополнить баланс в тенге (₸)"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-mono-numbers">{formatKzt(userBalanceKzt)}</span>
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] sm:text-[11px] group-hover:bg-emerald-500 group-hover:text-black font-bold shrink-0">+</span>
          </button>

          {/* Team Theme Switcher Button */}
          <button
            onClick={onOpenThemeSelector}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] sm:text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-sm group hover:border-white"
            title="Выбрать любимую команду"
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded overflow-hidden bg-slate-950 flex items-center justify-center p-0.5 border border-slate-800 shrink-0">
              <img
                src={currentTheme.logoUrl}
                alt=""
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="hidden sm:inline font-display">{currentTheme.shortName}</span>
          </button>

          {/* Quick Install App / Shortcut Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-[11px] sm:text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Установить как ярлык на телефон"
          >
            <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Ярлык</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-violet-900/30 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            aria-label="Открыть корзину"
          >
            <ShoppingBag className="w-4 h-4 text-violet-200" />
            <span className="hidden lg:inline">Корзина</span>
            {cartCount > 0 && (
              <span className="bg-sky-400 text-slate-950 font-bold text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full font-mono-numbers">
                {cartCount}
              </span>
            )}
            {cartTotalKzt > 0 && (
              <span className="hidden xl:inline text-xs text-violet-200 font-mono-numbers border-l border-violet-400/30 pl-2">
                {formatKzt(cartTotalKzt)}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
