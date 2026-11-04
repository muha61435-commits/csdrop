export type SkinCategory = 'all' | 'knives' | 'gloves' | 'rifles' | 'pistols' | 'snipers' | 'stickers';

export type SkinRarity = 
  | 'extraordinary' // Gold (Knives/Gloves)
  | 'covert'        // Red
  | 'classified'    // Pink
  | 'restricted'    // Purple
  | 'milspec'       // Dark Blue
  | 'contraband';   // Gold/Orange (Howl)

export type SkinExterior = 
  | 'Factory New' 
  | 'Minimal Wear' 
  | 'Field-Tested' 
  | 'Well-Worn' 
  | 'Battle-Scarred';

export interface Skin {
  id: string;
  name: string;             // e.g. "★ Нож-бабочка | Волны Сапфир"
  weapon: string;           // e.g. "Нож-бабочка"
  skinName: string;         // e.g. "Волны Сапфир"
  category: Exclude<SkinCategory, 'all'>;
  priceKzt: number;         // Price in Kazakh Tenge (₸)
  rarity: SkinRarity;
  exterior: SkinExterior;
  floatValue: number;       // 0.000 - 1.000
  patternSeed?: number;     // Paint seed, e.g. 412
  description: string;
  imageUrl: string;
  isStatTrak?: boolean;
  isSouvenir?: boolean;
  inStock: boolean;
  stockCount: number;
  isHidden?: boolean;
  tradeLockDays?: number;   // 0 = Instant trade
  createdAt?: string;
}

export interface CartItem {
  skin: Skin;
  quantity: number;
}

export type OrderStatus = 'pending' | 'trade_sent' | 'completed' | 'cancelled';

export interface OrderItem {
  skinId: string;
  name: string;
  weapon: string;
  priceKzt: number;
  quantity: number;
  imageUrl: string;
  exterior: SkinExterior;
  floatValue: number;
}

export interface Order {
  id: string;
  createdAt: string;
  steamTradeUrl: string;
  buyerEmail: string;
  buyerPhone?: string;
  comment?: string;
  items: OrderItem[];
  totalAmountKzt: number;
  status: OrderStatus;
  tradeOfferId?: string;
  botName?: string;
}

export interface FilterState {
  search: string;
  category: SkinCategory;
  rarity: 'all' | SkinRarity;
  exterior: 'all' | SkinExterior;
  minPrice: number;
  maxPrice: number;
  statTrakOnly: boolean;
  inStockOnly: boolean;
  sortBy: 'default' | 'price_asc' | 'price_desc' | 'float_asc' | 'rarity';
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  token: string | null;
  adminName: string | null;
}

export interface UserInventoryItem {
  inventoryId: string;
  skin: Skin;
  acquiredAt: string;
  orderId?: string;
  isWithdrawn?: boolean;
}
