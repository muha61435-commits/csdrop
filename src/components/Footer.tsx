import React from 'react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#06080e] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-sky-500 flex items-center justify-center font-display font-black text-white text-xs">
                Ψ
              </div>
              <span className="font-display font-bold text-white text-base">
                PHANTOM <span className="text-violet-400">SKINS</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Премиальный магазин скинов Counter-Strike 2 в Республике Казахстан. Моментальная автоматическая передача предметов через ботов Steam.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <div className="font-bold text-white text-sm">Разделы магазина</div>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-slate-200 transition-colors cursor-pointer">
                  Каталог скинов
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-orders')} className="hover:text-slate-200 transition-colors cursor-pointer">
                  Отследить заказ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-slate-200 transition-colors cursor-pointer">
                  О магазине и гарантиях
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contacts')} className="hover:text-slate-200 transition-colors cursor-pointer">
                  Контакты поддержки
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-2.5">
            <div className="font-bold text-white text-sm">Популярные категории</div>
            <ul className="space-y-2 text-slate-400">
              <li>Ножи (Керамбит, Бабочка, M9)</li>
              <li>Перчатки (Спортивные, Мотоциклетные)</li>
              <li>Винтовки (AK-47, M4A4, M4A1-S)</li>
              <li>Снайперские винтовки (AWP Dragon Lore)</li>
              <li>Коллекционные наклейки</li>
            </ul>
          </div>

          {/* Col 4: Legal & Security */}
          <div className="space-y-2.5">
            <div className="font-bold text-white text-sm">Безопасность</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Не аффилирован с Valve Corporation. Counter-Strike и CS2 являются товарными знаками Valve Corporation. Все права защищены.
            </p>
            <div className="pt-2 flex flex-col gap-1.5">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold flex items-center gap-1.5"
              >
                <span>📱 Установить как ярлык на телефон</span>
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className="text-[11px] text-slate-500 hover:text-violet-400 transition-colors cursor-pointer text-left"
              >
                Панель управления (Admin)
              </button>
            </div>
          </div>

        </div>

        {/* Bottom strip */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} PHANTOM SKINS. Все права защищены.
          </div>
          <div className="flex items-center gap-4">
            <span>Валюта: KZT (₸)</span>
            <span>·</span>
            <span>Steam Trade 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
