import React from 'react';
import { ShieldCheck, Zap, Lock, RefreshCw, HelpCircle } from 'lucide-react';

interface AboutViewProps {
  onGoToCatalog: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onGoToCatalog }) => {
  const faqs = [
    {
      q: 'Как быстро бот отправит скин после оформления заказа?',
      a: 'Наши серверные боты работают автоматически 24/7. Как правило, предложение обмена (Trade Offer) генерируется и отправляется на ваш Steam Trade URL в течение 30–60 секунд.'
    },
    {
      q: 'Что нужно сделать перед покупкой в Steam?',
      a: 'Убедитесь, что у вас включен мобильный аутентификатор Steam Guard (не менее 15 дней), ваш инвентарь открыт для публичного доступа, и на аккаунте нет временных ограничений на трейд.'
    },
    {
      q: 'В какой валюте указаны цены на сайте?',
      a: 'Все цены на PHANTOM SKINS указаны в Казахстанских тенге (₸) без скрытых конвертаций или комиссий платежных шлюзов.'
    },
    {
      q: 'Что такое Float и почему он важен?',
      a: 'Float Value — точное числовое значение износа оружия от 0.0000 до 1.0000. Чем ниже показатель Float, тем чище и детальнее выглядит скин в игре CS2.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Intro Hero */}
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-wider">
          <span>О сервисе</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>PHANTOM SKINS</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Премиальная торговая площадка CS2 в Казахстане
        </h1>

        <p className="text-slate-300 text-base leading-relaxed">
          PHANTOM SKINS создан для игроков и коллекционеров Counter-Strike 2. Мы объединили удобные расчеты в национальной валюте (₸), детальный инспектор паттернов и ультрабыструю систему автоматической отправки скинов в Steam.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#111624] to-[#0a0d14] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-600/30 text-violet-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Моментальный обмен</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Автоматизированные боты создают трейд-оффер сразу после подтверждения. Никакого ожидания продавцов или ручной модерации.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#111624] to-[#0a0d14] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">100% честность и гарантия</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Все скины находятся на наших проверенных ботах и готовы к мгновенной передаче. Вы получаете именно тот Float и Seed, который выбрали.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#111624] to-[#0a0d14] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Безопасность сделок</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Все операции производятся строго через официальный Steam OpenID и Trade Offers. Ваши учетные данные Steam остаются в полной безопасности.
          </p>
        </div>
      </div>

      {/* How it works 3-step diagram */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0b0e17] border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white font-display">
          Как совершить покупку за 3 шага
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="space-y-2">
            <div className="text-2xl font-black text-violet-500 font-mono-numbers">01</div>
            <h4 className="text-sm font-bold text-white">Выберите скин в каталоге</h4>
            <p className="text-xs text-slate-400">
              Используйте фильтры по редкости, оружию, цене и float, чтобы найти идеальный скин.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-2xl font-black text-sky-400 font-mono-numbers">02</div>
            <h4 className="text-sm font-bold text-white">Укажите Steam Trade URL</h4>
            <p className="text-xs text-slate-400">
              Вставьте вашу ссылку на обмен. Бот определит ваш профиль и приготовит предложение.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-2xl font-black text-emerald-400 font-mono-numbers">03</div>
            <h4 className="text-sm font-bold text-white">Примите трейд в Steam</h4>
            <p className="text-xs text-slate-400">
              Откройте уведомление об обмене в клиенте Steam или мобильном приложении и подтвердите получение.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion-like section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl font-bold text-white font-display">
            Часто задаваемые вопросы (FAQ)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-slate-100">{faq.q}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={onGoToCatalog}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-900/40 cursor-pointer transition-all"
        >
          Перейти в каталог скинов
        </button>
      </div>

    </div>
  );
};
