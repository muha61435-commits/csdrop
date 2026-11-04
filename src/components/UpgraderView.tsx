import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Skin, UserInventoryItem, SkinCategory } from '../types';
import { formatKzt, formatFloat, getRarityConfig, getExteriorShortCode } from '../utils/formatters';
import { 
  ChevronsUp, 
  ChevronsDown, 
  Sparkles, 
  RotateCw, 
  Zap, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Wallet, 
  Search, 
  SlidersHorizontal, 
  ShoppingBag, 
  Send,
  Trophy,
  ArrowRight,
  ShieldCheck,
  RefreshCcw,
  Volume2,
  VolumeX
} from 'lucide-react';

interface UpgraderViewProps {
  skins: Skin[];
  userInventory: UserInventoryItem[];
  userBalanceKzt: number;
  onUpgradeSuccess: (sacrificedInventoryIds: string[], sacrificedBalance: number, wonSkin: Skin) => void;
  onUpgradeFailed: (sacrificedInventoryIds: string[], sacrificedBalance: number) => void;
  onOpenTopUp: () => void;
  onGoToShop: () => void;
  onGoToInventory: () => void;
}

// Sound synthesizer using Web Audio API
class UpgraderSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  unlock() {
    this.initCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playTick(frequency = 580) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {}
  }

  playWin() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.36);
      });
    } catch {}
  }

  playLoss() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.31);
    } catch {}
  }
}

const sounds = new UpgraderSoundEngine();

// Mobile haptic vibration helper
const triggerHaptic = (pattern: number | number[]) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};

export const UpgraderView: React.FC<UpgraderViewProps> = ({
  skins,
  userInventory,
  userBalanceKzt,
  onUpgradeSuccess,
  onUpgradeFailed,
  onOpenTopUp,
  onGoToShop,
  onGoToInventory
}) => {
  // Sacrifice selection
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
  const [addedBalanceKzt, setAddedBalanceKzt] = useState<number>(0);

  // Target item selection
  const [targetSkin, setTargetSkin] = useState<Skin | null>(() => {
    // default target: something exciting like Vulcan or Doppler
    return skins.find(s => s.name.includes('Вулкан')) || skins[2] || skins[0] || null;
  });

  // Mode: Over / Under
  const [rollDirection, setRollDirection] = useState<'under' | 'over'>('under');
  const [isFastSpin, setIsFastSpin] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Animation & game status
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [needleAngle, setNeedleAngle] = useState<number>(0);
  const [lastOutcome, setLastOutcome] = useState<'win' | 'loss' | null>(null);
  const [wonSkinRecord, setWonSkinRecord] = useState<Skin | null>(null);

  // Catalog tab filtering
  const [activeTab, setActiveTab] = useState<'target-items' | 'my-items'>('target-items');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<SkinCategory>('all');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'chance_desc'>('price_desc');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');

  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Clean up selected items that are no longer in inventory
  useEffect(() => {
    const existingIds = new Set(userInventory.map(i => i.inventoryId));
    setSelectedInventoryIds(prev => prev.filter(id => existingIds.has(id)));
  }, [userInventory]);

  // Value calculations
  const selectedInventoryItems = useMemo(() => {
    const set = new Set(selectedInventoryIds);
    return userInventory.filter(i => set.has(i.inventoryId));
  }, [selectedInventoryIds, userInventory]);

  const itemsValueKzt = useMemo(() => {
    return selectedInventoryItems.reduce((acc, curr) => acc + curr.skin.priceKzt, 0);
  }, [selectedInventoryItems]);

  const totalInputValueKzt = itemsValueKzt + addedBalanceKzt;

  // Chance calculation (Fair house edge ~95% RTP like CS2 Upgraders)
  const targetPrice = targetSkin ? targetSkin.priceKzt : 1;
  const rawChance = totalInputValueKzt > 0 && targetSkin
    ? (totalInputValueKzt / targetPrice) * 100 * 0.95
    : 0;
  
  // Clamped between 1.00% and 88.00%
  const chancePercent = Math.min(Math.max(rawChance, 1.0), 88.0);
  const multiplier = totalInputValueKzt > 0 && targetSkin
    ? (targetPrice / totalInputValueKzt).toFixed(2)
    : '0.00';

  const rouletteAreaRef = useRef<HTMLDivElement>(null);

  // Toggle inventory item
  const handleToggleInventoryItem = (id: string) => {
    if (isSpinning) return;
    triggerHaptic(12);
    setSelectedInventoryIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Add balance helpers
  const handleAddBalancePreset = (val: number) => {
    if (isSpinning) return;
    triggerHaptic(12);
    setAddedBalanceKzt(prev => Math.min(prev + val, userBalanceKzt));
  };

  const handleSetMaxBalance = () => {
    if (isSpinning) return;
    triggerHaptic(15);
    setAddedBalanceKzt(userBalanceKzt);
  };

  const handleClearSacrifice = () => {
    if (isSpinning) return;
    triggerHaptic(10);
    setSelectedInventoryIds([]);
    setAddedBalanceKzt(0);
  };

  // Filtered & sorted skins for target catalog
  const filteredTargetSkins = useMemo(() => {
    return skins.filter(s => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.weapon.toLowerCase().includes(q)) return false;
      }
      const min = priceMin ? Number(priceMin) : 0;
      const max = priceMax ? Number(priceMax) : Infinity;
      if (s.priceKzt < min || s.priceKzt > max) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceKzt - b.priceKzt;
      if (sortBy === 'price_desc') return b.priceKzt - a.priceKzt;
      if (sortBy === 'chance_desc') {
        const chA = totalInputValueKzt > 0 ? (totalInputValueKzt / a.priceKzt) : 0;
        const chB = totalInputValueKzt > 0 ? (totalInputValueKzt / b.priceKzt) : 0;
        return chB - chA;
      }
      return 0;
    });
  }, [skins, categoryFilter, searchQuery, priceMin, priceMax, sortBy, totalInputValueKzt]);

  // Execute Upgrade
  const handleExecuteUpgrade = () => {
    if (isSpinning || !targetSkin || totalInputValueKzt <= 0) return;
    if (addedBalanceKzt > userBalanceKzt) {
      onOpenTopUp();
      return;
    }

    sounds.unlock();
    triggerHaptic([25, 40, 25]);
    setIsSpinning(true);
    setLastOutcome(null);
    setWonSkinRecord(null);

    // Roll random number 0.000 to 100.000
    const roll = Math.random() * 100;
    const isWin = rollDirection === 'under'
      ? roll <= chancePercent
      : roll >= (100 - chancePercent);

    // Calculate final needle angle (0..360) corresponding to the roll
    const landingAngle = (roll / 100) * 360;
    
    // Add multiple full spins (e.g. 4 to 6 revolutions = 1440 - 2160 deg)
    const extraSpins = isFastSpin ? 2 : 5;
    const targetFullAngle = (extraSpins * 360) + landingAngle;

    const startTime = Date.now();
    const duration = isFastSpin ? 1200 : 3800;

    let lastTickAngle = 0;
    const tickInterval = 25; // tick every 25 degrees

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentAngle = targetFullAngle * ease;

      setNeedleAngle(currentAngle % 360);

      // Play tick sound & subtle vibration
      if (Math.abs(currentAngle - lastTickAngle) >= tickInterval) {
        sounds.playTick(450 + (needleAngle / 360) * 200);
        triggerHaptic(5);
        lastTickAngle = currentAngle;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Finished spin
        setIsSpinning(false);
        setNeedleAngle(landingAngle);

        if (isWin) {
          sounds.playWin();
          triggerHaptic([40, 80, 50, 150]);
          setLastOutcome('win');
          setWonSkinRecord(targetSkin);
          onUpgradeSuccess(selectedInventoryIds, addedBalanceKzt, targetSkin);
        } else {
          sounds.playLoss();
          triggerHaptic(60);
          setLastOutcome('loss');
          onUpgradeFailed(selectedInventoryIds, addedBalanceKzt);
        }

        // Clear sacrifice inputs
        setSelectedInventoryIds([]);
        setAddedBalanceKzt(0);
      }
    };

    requestAnimationFrame(animate);
  };

  // SVG parameters for the roulette circle
  const radius = 105;
  const circumference = 2 * Math.PI * radius;
  // winning angle in degrees:
  const winArcDegrees = (chancePercent / 100) * 360;
  const strokeDashoffset = circumference - (circumference * chancePercent) / 100;

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8 pb-20 lg:pb-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d111c] via-[#090d16] to-[#080a10] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 font-bold text-[10px] sm:text-xs uppercase tracking-wider border border-violet-500/30">
              CS2 UPGRADE ARENA
            </span>
            <span className="text-slate-500 text-xs">·</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>4 961 онлайн CS2</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white font-display tracking-tight flex items-center gap-2">
            <span>Апгрейдер скинов CS2</span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Используйте скины из инвентаря или баланс, чтобы выиграть более дорогой скин. При победе ваш скин остаётся у вас!
          </p>
        </div>

        {/* User Quick Stats & Audio Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
          <button
            onClick={() => {
              triggerHaptic(10);
              sounds.unlock();
              setSoundEnabled(!soundEnabled);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              triggerHaptic(12);
              onOpenTopUp();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-900/60 transition-colors cursor-pointer active:scale-95"
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="font-mono-numbers">{formatKzt(userBalanceKzt)}</span>
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[11px]">+</span>
          </button>
        </div>
      </div>

      {/* Main Upgrader Stage (Arena) */}
      <div ref={rouletteAreaRef} className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#111624] via-[#0c0f18] to-[#07090e] border border-slate-800 p-3 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* MOBILE LAYOUT (lg:hidden) - Ergonomic Dual-Slot + Inline Roulette inspired by upgrader.pro */}
        <div className="lg:hidden space-y-3 relative z-10">
          
          {/* Dual Slots: Side-by-side on mobile */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* Slot 1: Your Stake */}
            <div
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('my-items');
              }}
              className={`rounded-xl p-2.5 flex flex-col justify-between h-44 relative overflow-hidden cursor-pointer transition-all border ${
                totalInputValueKzt > 0
                  ? 'bg-amber-950/25 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-[#080b12]/90 border-dashed border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300">
                <span className="flex items-center gap-1 text-amber-400">
                  <ChevronsDown className="w-3.5 h-3.5" />
                  <span>Ставка</span>
                </span>
                {totalInputValueKzt > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearSacrifice();
                    }}
                    className="text-rose-400 hover:text-rose-300 font-bold px-1 text-[10px]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {totalInputValueKzt > 0 ? (
                <div className="flex flex-col items-center justify-center my-auto py-1">
                  {selectedInventoryItems.length > 0 ? (
                    <img
                      src={selectedInventoryItems[0].skin.imageUrl}
                      alt=""
                      className="h-16 object-contain filter drop-shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                      <Wallet className="w-6 h-6" />
                    </div>
                  )}
                  <div className="font-mono-numbers font-black text-amber-400 text-sm mt-1">
                    {formatKzt(totalInputValueKzt)}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate max-w-[120px]">
                    {selectedInventoryItems.length > 0
                      ? selectedInventoryItems[0].skin.name
                      : 'Баланс кошелька'}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center my-auto py-1 space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <ChevronsDown className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-[11px] font-bold text-white">Выбрать ставку</span>
                  <span className="text-[9px] text-slate-400">Скин или баланс</span>
                </div>
              )}

              <div className="text-[9px] text-emerald-400 text-center font-medium">
                🛡️ Скин остаётся при победе
              </div>
            </div>

            {/* Slot 2: Target Skin */}
            <div
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('target-items');
              }}
              className={`rounded-xl p-2.5 flex flex-col justify-between h-44 relative overflow-hidden cursor-pointer transition-all border ${
                targetSkin
                  ? 'bg-violet-950/25 border-violet-500/50 shadow-md shadow-violet-500/10'
                  : 'bg-[#080b12]/90 border-dashed border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300">
                <span className="flex items-center gap-1 text-violet-400">
                  <ChevronsUp className="w-3.5 h-3.5" />
                  <span>Желаемый скин</span>
                </span>
                {targetSkin && (
                  <span className="text-[9px] font-mono font-bold bg-slate-800 text-slate-300 px-1 rounded">
                    {getExteriorShortCode(targetSkin.exterior)}
                  </span>
                )}
              </div>

              {targetSkin ? (
                <div className="flex flex-col items-center justify-center my-auto py-1">
                  <img
                    src={targetSkin.imageUrl}
                    alt=""
                    className="h-16 object-contain filter drop-shadow"
                  />
                  <div className="font-mono-numbers font-black text-amber-400 text-sm mt-1">
                    {formatKzt(targetSkin.priceKzt)}
                  </div>
                  <div className="text-[9px] font-bold text-white truncate max-w-[120px]">
                    {targetSkin.name}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center my-auto py-1 space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <ChevronsUp className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-[11px] font-bold text-white">Выбрать цель</span>
                  <span className="text-[9px] text-slate-400">Скин из каталога</span>
                </div>
              )}

              <div className="text-[9px] text-slate-400 text-center font-mono">
                {targetSkin ? `${multiplier}x множитель` : 'Шанс до 88%'}
              </div>
            </div>

          </div>

          {/* Primary Action Button (Big Amber/Yellow Upgrade CTA) */}
          <button
            onClick={handleExecuteUpgrade}
            disabled={isSpinning || !targetSkin || totalInputValueKzt <= 0}
            className="w-full py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>
              {isSpinning
                ? 'Рулетка крутится...'
                : totalInputValueKzt <= 0
                ? 'Выберите ставку'
                : !targetSkin
                ? 'Выберите скин'
                : `Улучшить (${chancePercent.toFixed(2)}%)`}
            </span>
          </button>

          {/* Compact Mobile Roulette Dial */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#090c14]/90 border border-slate-800 space-y-3">
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  className="text-slate-800"
                  strokeWidth="16"
                  stroke="currentColor"
                  fill="transparent"
                />

                {totalInputValueKzt > 0 && targetSkin && (
                  <circle
                    cx="120"
                    cy="120"
                    r={radius}
                    stroke={rollDirection === 'under' ? '#10b981' : '#8b5cf6'}
                    strokeWidth="16"
                    strokeDasharray={`${(circumference * chancePercent) / 100} ${circumference}`}
                    strokeDashoffset={
                      rollDirection === 'under'
                        ? 0
                        : -((circumference * (100 - chancePercent)) / 100)
                    }
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                )}
              </svg>

              {/* Central Info Plaque */}
              <div className="absolute inset-7 rounded-full bg-[#07090e] border border-slate-700/80 flex flex-col items-center justify-center p-3 text-center shadow-inner">
                {targetSkin ? (
                  <>
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">
                      Шанс выигрыша
                    </div>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-300 to-violet-400 font-mono-numbers my-0.5">
                      {chancePercent.toFixed(2)}%
                    </div>
                    <div className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      {multiplier}x
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-slate-500 px-2">
                    Выберите цель для расчёта шанса
                  </div>
                )}
              </div>

              {/* Spinning Needle Pointer */}
              <div
                className="absolute inset-0 pointer-events-none transition-transform will-change-transform flex items-center justify-center"
                style={{
                  transform: `rotate(${needleAngle}deg)`,
                  transition: isSpinning ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                <div className="absolute top-1.5 w-4 h-8 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[16px] border-t-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
                </div>
              </div>
            </div>

            {/* Mobile Controls: Under/Over & Fast mode */}
            <div className="flex items-center justify-center gap-2 w-full">
              <div className="inline-flex rounded-xl bg-slate-900 p-0.5 border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setRollDirection('under');
                  }}
                  disabled={isSpinning}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    rollDirection === 'under' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Меньше (&lt; {chancePercent.toFixed(1)}%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setRollDirection('over');
                  }}
                  disabled={isSpinning}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    rollDirection === 'over' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Больше (&gt; {(100 - chancePercent).toFixed(1)}%)
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setIsFastSpin(!isFastSpin);
                }}
                className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 cursor-pointer transition-colors active:scale-95 ${
                  isFastSpin
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Быстрый спин"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[10px]">Fast</span>
              </button>
            </div>

            {/* Quick Balance Presets for Mobile */}
            <div className="flex flex-wrap items-center justify-between gap-1 w-full pt-1 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium">+ Баланс:</span>
              {[1000, 5000, 25000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddBalancePreset(val)}
                  disabled={isSpinning || userBalanceKzt < val}
                  className="px-2 py-0.5 rounded bg-slate-900 active:bg-slate-800 text-[10px] text-slate-200 font-mono border border-slate-800 disabled:opacity-40 active:scale-95 transition-all"
                >
                  +{formatKzt(val)}
                </button>
              ))}
              <button
                type="button"
                onClick={handleSetMaxBalance}
                disabled={isSpinning || userBalanceKzt <= 0}
                className="px-2 py-0.5 rounded bg-violet-950 text-[10px] text-violet-300 font-bold border border-violet-800/60 active:scale-95 transition-all"
              >
                МАКС
              </button>
            </div>

          </div>

        </div>

        {/* DESKTOP LAYOUT (hidden lg:grid) - 3 Columns */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* LEFT BOX: Selected items or items & balance to use */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <ChevronsDown className="w-4 h-4 text-amber-400" />
                <span>Ваша ставка (Скины и баланс)</span>
              </span>
              {totalInputValueKzt > 0 && (
                <button
                  onClick={handleClearSacrifice}
                  disabled={isSpinning}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Сбросить
                </button>
              )}
            </div>

            {/* Left Slot Box */}
            <div className="h-72 rounded-2xl bg-[#07090e]/80 border-2 border-dashed border-slate-700/80 p-4 flex flex-col justify-between relative overflow-hidden group">
              {totalInputValueKzt > 0 ? (
                <div className="h-full flex flex-col justify-between">
                  <div className="overflow-y-auto max-h-40 space-y-2 pr-1">
                    {selectedInventoryItems.map(({ inventoryId, skin }) => (
                      <div
                        key={inventoryId}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img src={skin.imageUrl} alt="" className="w-8 h-8 object-contain shrink-0" />
                          <div className="truncate">
                            <div className="font-bold text-white truncate text-xs">{skin.name}</div>
                            <div className="text-[10px] text-slate-400">{getExteriorShortCode(skin.exterior)}</div>
                          </div>
                        </div>
                        <div className="font-mono-numbers text-sky-400 font-bold shrink-0 pl-2 text-xs">
                          {formatKzt(skin.priceKzt)}
                        </div>
                      </div>
                    ))}

                    {addedBalanceKzt > 0 && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <Wallet className="w-4 h-4" />
                          <span className="font-bold text-xs">Добавлено с баланса</span>
                        </div>
                        <div className="font-mono-numbers text-emerald-300 font-bold text-xs">
                          +{formatKzt(addedBalanceKzt)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Сумма ставки:</span>
                    <span className="text-xl font-black text-amber-400 font-mono-numbers">
                      {formatKzt(totalInputValueKzt)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-3 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <ChevronsDown className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Выберите скин или баланс</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Кликните на скины из вашего инвентаря ниже или добавьте баланс
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-semibold">
                      🛡️ При победе ваш скин остаётся у вас!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Balance Add Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] text-slate-500 mr-0.5">+ Баланс:</span>
              {[1000, 5000, 25000, 100000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddBalancePreset(val)}
                  disabled={isSpinning || userBalanceKzt < val}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 font-mono border border-slate-800 disabled:opacity-40 cursor-pointer transition-colors active:scale-95"
                >
                  +{formatKzt(val)}
                </button>
              ))}
              <button
                type="button"
                onClick={handleSetMaxBalance}
                disabled={isSpinning || userBalanceKzt <= 0}
                className="px-2 py-1 rounded bg-violet-950/80 hover:bg-violet-900 text-[11px] text-violet-300 font-bold border border-violet-800/60 cursor-pointer transition-colors active:scale-95"
              >
                МАКС
              </button>
            </div>
          </div>

          {/* CENTER: Upgrader Roulette Dial (Circle + Needle) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-5 my-0">
            
            <div className="relative w-72 h-72 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  className="text-slate-800"
                  strokeWidth="16"
                  stroke="currentColor"
                  fill="transparent"
                />

                {totalInputValueKzt > 0 && targetSkin && (
                  <circle
                    cx="120"
                    cy="120"
                    r={radius}
                    stroke={rollDirection === 'under' ? '#10b981' : '#8b5cf6'}
                    strokeWidth="16"
                    strokeDasharray={`${(circumference * chancePercent) / 100} ${circumference}`}
                    strokeDashoffset={
                      rollDirection === 'under'
                        ? 0
                        : -((circumference * (100 - chancePercent)) / 100)
                    }
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  />
                )}
              </svg>

              <div className="absolute inset-8 rounded-full bg-[#090c14] border border-slate-700/80 flex flex-col items-center justify-center p-4 text-center shadow-inner">
                {targetSkin ? (
                  <>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                      Шанс выигрыша
                    </div>
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-300 to-violet-400 font-mono-numbers my-0.5">
                      {chancePercent.toFixed(2)}%
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {multiplier}x
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-500 px-4">
                    Выберите цель для расчёта шанса
                  </div>
                )}
              </div>

              <div
                className="absolute inset-0 pointer-events-none transition-transform will-change-transform flex items-center justify-center"
                style={{
                  transform: `rotate(${needleAngle}deg)`,
                  transition: isSpinning ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                <div className="absolute top-2 w-4 h-8 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 w-full">
              <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRollDirection('under')}
                  disabled={isSpinning}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    rollDirection === 'under' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Меньше (&lt; {chancePercent.toFixed(1)}%)
                </button>
                <button
                  type="button"
                  onClick={() => setRollDirection('over')}
                  disabled={isSpinning}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    rollDirection === 'over' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Больше (&gt; {(100 - chancePercent).toFixed(1)}%)
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsFastSpin(!isFastSpin)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                  isFastSpin
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Быстрый спин"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[11px]">Fast</span>
              </button>
            </div>

            <button
              onClick={handleExecuteUpgrade}
              disabled={isSpinning || !targetSkin || totalInputValueKzt <= 0}
              className="w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>
                {isSpinning
                  ? 'Рулетка крутится...'
                  : totalInputValueKzt <= 0
                  ? 'Выберите ставку'
                  : !targetSkin
                  ? 'Выберите скин'
                  : `Улучшить (${chancePercent.toFixed(2)}%)`}
              </span>
            </button>
          </div>

          {/* RIGHT BOX: Selected target item for upgrade */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <ChevronsUp className="w-4 h-4 text-emerald-400" />
                <span>Желаемый скин (Цель)</span>
              </span>
              <button
                onClick={() => setActiveTab('target-items')}
                className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
              >
                Выбрать другой
              </button>
            </div>

            <div className="h-72 rounded-2xl bg-[#07090e]/80 border-2 border-slate-700/80 p-5 flex flex-col justify-between relative overflow-hidden group">
              {targetSkin ? (
                <>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider"
                      style={{
                        color: getRarityConfig(targetSkin.rarity).colorHex,
                        borderColor: `${getRarityConfig(targetSkin.rarity).colorHex}40`,
                        backgroundColor: `${getRarityConfig(targetSkin.rarity).colorHex}15`
                      }}
                    >
                      {getRarityConfig(targetSkin.rarity).nameRu}
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                      {getExteriorShortCode(targetSkin.exterior)}
                    </span>
                  </div>

                  <div className="relative my-2 h-32 flex items-center justify-center">
                    <div
                      className="absolute inset-0 opacity-20 blur-xl pointer-events-none"
                      style={{ backgroundColor: getRarityConfig(targetSkin.rarity).colorHex }}
                    />
                    <img
                      src={targetSkin.imageUrl}
                      alt={targetSkin.name}
                      className="max-h-28 max-w-full object-contain filter drop-shadow-xl transform group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="border-t border-slate-800 pt-2 space-y-1">
                    <div className="font-bold text-white text-sm truncate" title={targetSkin.name}>
                      {targetSkin.name}
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-400">Стоимость:</span>
                      <span className="text-xl font-black text-amber-400 font-mono-numbers">
                        {formatKzt(targetSkin.priceKzt)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ChevronsUp className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Выберите скин для улучшения</h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Кликните на любой скин из каталога ниже
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Целевой диапазон:</span>
              <span className="text-white font-mono-numbers font-semibold">
                {targetSkin ? formatKzt(targetSkin.priceKzt) : '0 ₸'}
              </span>
            </div>
          </div>

        </div>

        {/* Outcome banner alert */}
        {lastOutcome === 'win' && wonSkinRecord && (
          <div className="mt-4 sm:mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-emerald-950/90 border border-emerald-500/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                <Trophy className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                  <span>УСПЕШНЫЙ АПГРЕЙД!</span>
                  <span className="text-xs bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Победа (+Двойной профит)</span>
                </div>
                <p className="text-xs text-emerald-200 mt-0.5">
                  ✨ Ваш исходный скин <strong className="text-white underline">остался в инвентаре</strong>, и вы дополнительно выиграли <strong className="text-amber-300 font-bold">«{wonSkinRecord.name}»</strong> ({formatKzt(wonSkinRecord.priceKzt)})!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onGoToInventory}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <span>В инвентарь ({userInventory.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {lastOutcome === 'loss' && (
          <div className="mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-3 animate-in shake">
            <div className="flex items-center gap-2.5">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Не повезло в этот раз</span>
                <span className="text-[11px] sm:text-xs">Стрелка остановилась вне победного сектора. Попробуйте ещё раз!</span>
              </div>
            </div>
            <button
              onClick={() => setLastOutcome(null)}
              className="text-slate-400 hover:text-white underline text-xs cursor-pointer shrink-0"
            >
              Закрыть
            </button>
          </div>
        )}

      </div>

      {/* LOWER SECTION: Two Tabs (My items & Desired items) */}
      <div className="space-y-3 sm:space-y-4">
        
        {/* Tab switch bar with mobile ergonomics */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('target-items');
              }}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                activeTab === 'target-items'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <ChevronsUp className="w-4 h-4" />
              <span>Цели ({filteredTargetSkins.length})</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('my-items');
              }}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                activeTab === 'my-items'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <ChevronsDown className="w-4 h-4" />
              <span>Мой инвентарь ({userInventory.length})</span>
              {selectedInventoryIds.length > 0 && (
                <span className="bg-white text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {selectedInventoryIds.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Оригинальные скины Valve CS2</span>
          </div>
        </div>

        {/* TAB 1: TARGET SKINS (DESIRED ITEMS) */}
        {activeTab === 'target-items' && (
          <div className="space-y-4">
            
            {/* Filter controls row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              
              {/* Search */}
              <div className="sm:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск скина для апгрейда..."
                  className="w-full bg-[#07090e] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Price From / To */}
              <div className="sm:col-span-4 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="От (₸)"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-1/2 bg-[#07090e] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono-numbers focus:outline-none focus:border-amber-500"
                />
                <span className="text-slate-600">-</span>
                <input
                  type="number"
                  placeholder="До (₸)"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-1/2 bg-[#07090e] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono-numbers focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Sort By */}
              <div className="sm:col-span-4 flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-[#07090e] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="price_desc">Сначала дорогие (VIP)</option>
                  <option value="price_asc">Сначала доступные</option>
                  <option value="chance_desc">По максимальному шансу</option>
                </select>
              </div>

            </div>

            {/* Category Pills */}
            {/* Category Pills with horizontal swipe */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x pb-1 text-xs">
              {[
                { id: 'all', label: 'Все скины' },
                { id: 'knives', label: '★ Ножи' },
                { id: 'gloves', label: '★ Перчатки' },
                { id: 'rifles', label: 'Винтовки' },
                { id: 'snipers', label: 'Снайперские' },
                { id: 'pistols', label: 'Пистолеты' },
                { id: 'stickers', label: 'Наклейки' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    triggerHaptic(10);
                    setCategoryFilter(cat.id as SkinCategory);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 active:scale-95 ${
                    categoryFilter === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Target Skin Cards Grid (2 columns on mobile, matching upgrader.pro screenshot) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
              {filteredTargetSkins.map((skin) => {
                const isSelected = targetSkin?.id === skin.id;
                const rarity = getRarityConfig(skin.rarity);
                const extCode = getExteriorShortCode(skin.exterior);
                const itemChance = totalInputValueKzt > 0
                  ? Math.min(Math.max((totalInputValueKzt / skin.priceKzt) * 100 * 0.95, 1.0), 88.0)
                  : 0;

                return (
                  <div
                    key={skin.id}
                    onClick={() => {
                      triggerHaptic(12);
                      setTargetSkin(skin);
                    }}
                    className={`rounded-xl p-2.5 sm:p-3 flex flex-col justify-between transition-all cursor-pointer relative group overflow-hidden active:scale-96 ${
                      isSelected
                        ? 'bg-amber-950/40 border-2 border-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-gradient-to-b from-[#111624] to-[#0c0f18] border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top watermark background chevron */}
                    <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                      <ChevronsUp className="w-10 h-10 text-white" />
                    </div>

                    {/* Price in Gold font & condition */}
                    <div className="flex items-center justify-between text-xs mb-1 relative z-10">
                      <span className="font-mono-numbers font-black text-amber-400 text-xs sm:text-sm truncate">
                        {formatKzt(skin.priceKzt)}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono font-bold bg-slate-900 px-1 rounded shrink-0 ml-1">
                        {extCode}
                      </span>
                    </div>

                    {/* Weapon Image */}
                    <div className="relative my-1.5 sm:my-2 h-20 sm:h-24 flex items-center justify-center">
                      <img
                        src={skin.imageUrl}
                        alt={skin.name}
                        className="max-h-16 sm:max-h-20 max-w-full object-contain filter drop-shadow transform group-hover:scale-108 transition-transform"
                      />
                    </div>

                    {/* Weapon and Skin Name */}
                    <div className="space-y-0.5 relative z-10 pt-1 border-t border-slate-800/80">
                      <div className="text-[9px] text-slate-400 truncate">{skin.weapon}</div>
                      <div className="font-bold text-white text-[11px] sm:text-xs truncate" title={skin.name}>
                        {skin.skinName || skin.name}
                      </div>

                      {/* Calculated Chance Badge */}
                      {totalInputValueKzt > 0 && (
                        <div className="text-[9px] font-mono font-bold text-emerald-400 pt-0.5 flex items-center justify-between">
                          <span>Шанс:</span>
                          <span className="bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-500/30">
                            {itemChance.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: MY ITEMS (USER INVENTORY & SACRIFICE) */}
        {activeTab === 'my-items' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-xs sm:text-sm">Ваши скины для ставки</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Выберите один или несколько предметов. При победе вы получаете целевой скин, а ваш исходный остаётся у вас!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onGoToShop}
                  className="flex-1 sm:flex-initial px-3 py-1.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-violet-400" />
                  <span>В магазин</span>
                </button>

                <button
                  onClick={onOpenTopUp}
                  className="flex-1 sm:flex-initial px-3 py-1.5 sm:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Пополнить</span>
                </button>
              </div>
            </div>

            {userInventory.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                {userInventory.map(({ inventoryId, skin }) => {
                  const isSelected = selectedInventoryIds.includes(inventoryId);

                  return (
                    <div
                      key={inventoryId}
                      onClick={() => handleToggleInventoryItem(inventoryId)}
                      className={`rounded-xl p-2.5 sm:p-3 flex flex-col justify-between transition-all cursor-pointer relative group overflow-hidden active:scale-96 ${
                        isSelected
                          ? 'bg-violet-950/60 border-2 border-violet-500 shadow-lg shadow-violet-900/40 ring-2 ring-violet-500/20'
                          : 'bg-gradient-to-b from-[#111624] to-[#0c0f18] border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Checkbox indicator */}
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono-numbers font-bold text-sky-400 text-xs sm:text-sm truncate">
                          {formatKzt(skin.priceKzt)}
                        </span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          isSelected ? 'bg-violet-600 text-white font-bold' : 'border border-slate-700'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </div>
                      </div>

                      {/* Image */}
                      <div className="relative my-1.5 sm:my-2 h-18 sm:h-20 flex items-center justify-center">
                        <img
                          src={skin.imageUrl}
                          alt={skin.name}
                          className="max-h-16 sm:max-h-18 max-w-full object-contain filter drop-shadow transform group-hover:scale-106 transition-transform"
                        />
                      </div>

                      {/* Name */}
                      <div className="space-y-0.5 pt-1 border-t border-slate-800">
                        <div className="text-[9px] text-slate-400 truncate">{skin.weapon}</div>
                        <div className="font-bold text-white text-[11px] sm:text-xs truncate" title={skin.name}>
                          {skin.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">В инвентаре пока пусто</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-0.5">
                    Купите доступный скин или пополните баланс кошелька для апгрейда прямо сейчас!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={onGoToShop}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 text-white font-bold text-xs cursor-pointer active:scale-95 shadow-md"
                  >
                    В магазин скинов
                  </button>
                  <button
                    onClick={onOpenTopUp}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer border border-slate-700 active:scale-95"
                  >
                    Пополнить баланс
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* STICKY MOBILE HUD: Floating thumb-friendly Action Bar docked above bottom nav */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 px-3 py-2 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-8px_24px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {targetSkin ? (
              <img src={targetSkin.imageUrl} alt="" className="w-8 h-8 object-contain shrink-0 filter drop-shadow" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ChevronsUp className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {targetSkin ? targetSkin.name : 'Выберите скин для цели'}
              </div>
              <div className="text-[10px] font-mono-numbers text-amber-400 font-bold flex items-center gap-1.5">
                <span>{chancePercent.toFixed(1)}% шанс</span>
                {targetSkin && <span className="text-slate-400">· {multiplier}x</span>}
                {totalInputValueKzt > 0 && <span className="text-sky-300">· {formatKzt(totalInputValueKzt)}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(15);
              rouletteAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (targetSkin && totalInputValueKzt > 0 && !isSpinning) {
                handleExecuteUpgrade();
              }
            }}
            disabled={isSpinning || totalInputValueKzt <= 0 || !targetSkin}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 shrink-0 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Крутится' : 'Улучшить'}</span>
          </button>
        </div>
      </div>

      {/* VICTORY CELEBRATION MODAL (Mobile & Desktop) */}
      {lastOutcome === 'win' && wonSkinRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#18233a] via-[#0d1322] to-[#07090e] border-2 border-emerald-500/80 p-5 text-center shadow-[0_0_50px_rgba(16,185,129,0.35)] animate-in zoom-in-95">
            
            {/* Trophy Icon */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Trophy className="w-7 h-7 animate-bounce text-emerald-300" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/40 mb-2">
              🎉 УСПЕШНЫЙ АПГРЕЙД!
            </div>

            <h2 className="text-base sm:text-lg font-black text-white font-display truncate">
              {wonSkinRecord.name}
            </h2>

            {/* Weapon Image with Glow */}
            <div className="relative my-3 h-32 flex items-center justify-center bg-[#07090e]/70 rounded-2xl p-2 border border-slate-800 overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10 blur-xl pointer-events-none" />
              <img
                src={wonSkinRecord.imageUrl}
                alt={wonSkinRecord.name}
                className="max-h-24 max-w-full object-contain filter drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] transform scale-105"
              />
            </div>

            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono-numbers mb-2">
              +{formatKzt(wonSkinRecord.priceKzt)}
            </div>

            <p className="text-[11px] text-emerald-200/90 mb-4 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
              ✨ Ваш исходный скин <strong className="text-white underline">остался в инвентаре</strong>, а выигранный скин добавлен к вам!
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setLastOutcome(null);
                  onGoToInventory();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer"
              >
                В инвентарь
              </button>
              <button
                onClick={() => {
                  setLastOutcome(null);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 active:scale-95 cursor-pointer"
              >
                Играть ещё
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
