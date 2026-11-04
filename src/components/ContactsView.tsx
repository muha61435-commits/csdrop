import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, Mail, Clock } from 'lucide-react';

export const ContactsView: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSent(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-wider">
          <span>Служба поддержки</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>PHANTOM SKINS</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Контакты и клиентская поддержка
        </h1>

        <p className="text-slate-300 text-base leading-relaxed">
          Возникли вопросы по трейду или нужна помощь в подборе скина? Мы на связи 24 часа в сутки и оперативно отвечаем в Telegram и на почту.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Telegram Поддержка</h3>
                <p className="text-xs text-slate-400">@phantom_skins_support</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Быстрый ответ в течение 5 минут. Помощь с отправкой трейдов и проверкой ссылок обмена.
            </p>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              Написать в Telegram →
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Электронная почта</h3>
                <p className="text-xs text-slate-400">support@phantomskins.kz</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Для официальных запросов, сотрудничества и коммерческих предложений.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Режим работы:</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Торговые Steam-боты: <strong className="text-white">круглосуточно (24/7)</strong><br />
              Операторы поддержки: <strong className="text-white">10:00 — 02:00 (время Астаны / UTC+5)</strong>
            </p>
          </div>

        </div>

        {/* Feedback Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#111624] to-[#0a0d14] border border-slate-800 space-y-5">
            <h3 className="text-lg font-bold text-white font-display">
              Отправить сообщение
            </h3>

            {isSent ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Сообщение отправлено!</h4>
                <p className="text-xs text-slate-300">
                  Спасибо за обращение. Наш оператор свяжется с вами по указанному адресу в ближайшее время.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                >
                  Отправить еще сообщение
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Ваше имя</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Алихан"
                      className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Email для ответа</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="player@gmail.com"
                      className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Текст сообщения</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Опишите вопрос, укажите номер заказа или ссылку на обмен..."
                    className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Отправить обращение</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
