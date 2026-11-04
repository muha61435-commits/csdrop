import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, CheckCircle2, ArrowRight, MoreVertical } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('phantom_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Check if running in standalone mode (already installed on phone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowGuideModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Global custom event so any button in Header/Footer can open the install flow
    const handleOpenInstall = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt().then(() => {
          deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
              setIsInstalled(true);
              setDeferredPrompt(null);
            }
          });
        });
      } else {
        setShowGuideModal(true);
      }
    };
    window.addEventListener('open-pwa-install', handleOpenInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install', handleOpenInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          return;
        }
      } catch (e) {
        console.warn('Install prompt error:', e);
      }
    }
    // If deferredPrompt is not available or dismissed, open clear interactive visual guide
    setShowGuideModal(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('phantom_pwa_dismissed', 'true');
    } catch {}
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Mobile top notice banner */}
      {!dismissed && (
        <div className="bg-gradient-to-r from-amber-950/95 via-slate-900 to-amber-950/95 border-b border-amber-500/40 px-3 py-2 flex items-center justify-between gap-2 text-xs relative z-30">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="truncate text-slate-200 text-[11px]">
              <span className="font-bold text-amber-300">Ярлык PHANTOM:</span> Установите как приложение на телефон
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Download className="w-3 h-3 stroke-[2.5]" />
              <span>Создать ярлык</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Закрыть"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Step-by-Step Installation Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#121727] via-[#0d101a] to-[#07090e] border border-amber-500/30 p-5 sm:p-6 space-y-4 text-left shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* App Header Preview */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-amber-500/40 p-1 shadow-lg shadow-black/60 flex items-center justify-center shrink-0">
                <img
                  src="/pwa-192x192.png"
                  alt="PHANTOM SKINS"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  PHANTOM SKINS
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  Установка как ярлык / приложение
                </p>
              </div>
            </div>

            {/* If deferredPrompt is available right now, offer one-click install */}
            {deferredPrompt && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between gap-2">
                <div className="text-xs text-amber-200 font-medium">
                  Ваш браузер готов к моментальной установке!
                </div>
                <button
                  onClick={async () => {
                    await deferredPrompt.prompt();
                    const choice = await deferredPrompt.userChoice;
                    if (choice.outcome === 'accepted') {
                      setIsInstalled(true);
                      setDeferredPrompt(null);
                      setShowGuideModal(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs uppercase cursor-pointer hover:bg-amber-400 shrink-0 shadow-md"
                >
                  Установить в 1 клик
                </button>
              </div>
            )}

            {/* Browser Specific Guides */}
            {isIOS ? (
              /* iOS Safari instructions */
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Инструкция для iPhone (Safari):
                </div>
                <div className="space-y-2 text-xs text-slate-200">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                    <span>В нижней панели Safari нажмите кнопку <strong className="text-white">«Поделиться» (Share)</strong> с иконкой квадрата со стрелкой.</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                    <span>Пролистайте список вниз и нажмите <strong className="text-amber-400">«На экран "Домой"» (Add to Home Screen)</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                    <span>Нажмите <strong className="text-emerald-400">«Добавить»</strong> в правом верхнем углу — готово!</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Android Chrome instructions (matching user screenshot) */
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Инструкция для Android (Google Chrome):
                </div>
                <div className="space-y-2 text-xs text-slate-200">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px]">1</div>
                    <div>
                      В правом верхнем углу Chrome нажмите меню <strong className="text-white">три точки (⋮)</strong>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">2</div>
                    <div>
                      В открывшемся списке нажмите пункт:
                      <div className="mt-1 font-bold text-amber-300 bg-slate-950/80 px-2 py-1 rounded border border-amber-500/40 inline-flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>«Установить и создать ярлык»</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">3</div>
                    <div>
                      Подтвердите нажатием <strong className="text-emerald-400">«Установить»</strong>. Иконка появится на рабочем столе телефона как полноценное приложение без рамок браузера!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feature Perks of Installing */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Быстрый запуск с экрана</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Полноэкранный режим CS2</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Сохранение баланса</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Мгновенный Upgrader</span>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg transition-all"
            >
              Понятно, спасибо
            </button>
          </div>
        </div>
      )}
    </>
  );
};
