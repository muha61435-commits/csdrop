import { SkinRarity, SkinExterior, OrderStatus } from '../types';

export function formatKzt(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₸';
  return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₸';
}

export function formatFloat(floatValue: number): string {
  if (isNaN(floatValue) || floatValue === null || floatValue === undefined) return '0.0000';
  return floatValue.toFixed(4);
}

export interface RarityConfig {
  key: SkinRarity;
  nameRu: string;
  colorHex: string;
  borderClass: string;
  bgGlowClass: string;
  badgeBg: string;
}

export const RARITY_CONFIGS: Record<SkinRarity, RarityConfig> = {
  extraordinary: {
    key: 'extraordinary',
    nameRu: 'Экстраординарного типа',
    colorHex: '#e4ae39',
    borderClass: 'border-[#e4ae39]/60',
    bgGlowClass: 'from-[#e4ae39]/20 to-transparent',
    badgeBg: 'bg-[#e4ae39]/20 text-[#ffd700] border-[#e4ae39]/40',
  },
  contraband: {
    key: 'contraband',
    nameRu: 'Контрабандное',
    colorHex: '#e4ae39',
    borderClass: 'border-[#e4ae39]/60',
    bgGlowClass: 'from-[#e4ae39]/20 to-transparent',
    badgeBg: 'bg-[#e4ae39]/20 text-[#ffd700] border-[#e4ae39]/40',
  },
  covert: {
    key: 'covert',
    nameRu: 'Тайное',
    colorHex: '#eb4b4b',
    borderClass: 'border-[#eb4b4b]/60',
    bgGlowClass: 'from-[#eb4b4b]/20 to-transparent',
    badgeBg: 'bg-[#eb4b4b]/20 text-[#ff6b6b] border-[#eb4b4b]/40',
  },
  classified: {
    key: 'classified',
    nameRu: 'Засекреченное',
    colorHex: '#d32ce6',
    borderClass: 'border-[#d32ce6]/60',
    bgGlowClass: 'from-[#d32ce6]/20 to-transparent',
    badgeBg: 'bg-[#d32ce6]/20 text-[#f472b6] border-[#d32ce6]/40',
  },
  restricted: {
    key: 'restricted',
    nameRu: 'Запрещенное',
    colorHex: '#8847ff',
    borderClass: 'border-[#8847ff]/60',
    bgGlowClass: 'from-[#8847ff]/20 to-transparent',
    badgeBg: 'bg-[#8847ff]/20 text-[#c084fc] border-[#8847ff]/40',
  },
  milspec: {
    key: 'milspec',
    nameRu: 'Армейское качество',
    colorHex: '#4b69ff',
    borderClass: 'border-[#4b69ff]/60',
    bgGlowClass: 'from-[#4b69ff]/20 to-transparent',
    badgeBg: 'bg-[#4b69ff]/20 text-[#60a5fa] border-[#4b69ff]/40',
  },
};

export function getRarityConfig(rarity: SkinRarity): RarityConfig {
  return RARITY_CONFIGS[rarity] || RARITY_CONFIGS.milspec;
}

export function getExteriorShortCode(exterior: SkinExterior): string {
  switch (exterior) {
    case 'Factory New': return 'FN';
    case 'Minimal Wear': return 'MW';
    case 'Field-Tested': return 'FT';
    case 'Well-Worn': return 'WW';
    case 'Battle-Scarred': return 'BS';
    default: return 'FN';
  }
}

export function getExteriorRu(exterior: SkinExterior): string {
  switch (exterior) {
    case 'Factory New': return 'Прямо с завода';
    case 'Minimal Wear': return 'Немного поношенное';
    case 'Field-Tested': return 'После полевых испытаний';
    case 'Well-Worn': return 'Поношенное';
    case 'Battle-Scarred': return 'Закаленное в боях';
    default: return exterior;
  }
}

export function getOrderStatusConfig(status: OrderStatus): { labelRu: string; colorClass: string; stepIndex: number } {
  switch (status) {
    case 'pending':
      return {
        labelRu: 'В обработке',
        colorClass: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
        stepIndex: 1
      };
    case 'trade_sent':
      return {
        labelRu: 'Трейд отправлен в Steam',
        colorClass: 'text-sky-400 bg-sky-400/10 border-sky-400/30',
        stepIndex: 2
      };
    case 'completed':
      return {
        labelRu: 'Завершён (доставлен)',
        colorClass: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
        stepIndex: 3
      };
    case 'cancelled':
      return {
        labelRu: 'Отменён',
        colorClass: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
        stepIndex: 0
      };
    default:
      return {
        labelRu: 'Неизвестно',
        colorClass: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
        stepIndex: 0
      };
  }
}
