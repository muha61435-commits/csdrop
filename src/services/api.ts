import { Skin, Order, OrderStatus } from '../types';
import { INITIAL_SKINS } from '../data/initialSkins';

const API_BASE = '/api';

// Local storage keys for resilient offline/sandbox state
const STORAGE_SKINS_KEY = 'phantom_skins_v1';
const STORAGE_ORDERS_KEY = 'phantom_orders_v1';
const STORAGE_ADMIN_TOKEN_KEY = 'phantom_admin_token_v1';

function getLocalSkins(): Skin[] {
  try {
    const raw = localStorage.getItem(STORAGE_SKINS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_SKINS;
}

function setLocalSkins(skins: Skin[]) {
  try {
    localStorage.setItem(STORAGE_SKINS_KEY, JSON.stringify(skins));
  } catch (e) {
    console.error(e);
  }
}

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: 'PH-94102',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      steamTradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=18492019&token=a7X9k1Lp',
      buyerEmail: 'csgo.pro.kz@gmail.com',
      buyerPhone: '+7 (707) 819-20-44',
      comment: 'Пожалуйста, отправьте скорее до турнира',
      items: [
        {
          skinId: 'skin-7',
          name: 'Desert Eagle | Поток информации (Printstream)',
          weapon: 'Desert Eagle',
          priceKzt: 74000,
          quantity: 1,
          imageUrl: '/src/assets/images/skin_ak47_vulcan_1793626931187.jpg',
          exterior: 'Factory New',
          floatValue: 0.021
        }
      ],
      totalAmountKzt: 74000,
      status: 'completed',
      tradeOfferId: 'TRADE-BOT-01#98214',
      botName: 'Phantom Bot #01'
    }
  ];
}

function setLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error(e);
  }
}

export const api = {
  // Fetch skins
  async fetchSkins(isAdmin = false, token?: string | null): Promise<Skin[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/skins${isAdmin ? '?admin=true' : ''}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch from server');
      const data = await res.json();
      setLocalSkins(data);
      return data;
    } catch {
      // Fallback to local storage
      const local = getLocalSkins();
      return isAdmin ? local : local.filter(s => !s.isHidden);
    }
  },

  // Fetch skin by ID
  async fetchSkinById(id: string): Promise<Skin | null> {
    try {
      const res = await fetch(`${API_BASE}/skins/${id}`);
      if (!res.ok) throw new Error('Not found');
      return await res.json();
    } catch {
      const skins = getLocalSkins();
      return skins.find(s => s.id === id) || null;
    }
  },

  // Create new skin (Admin)
  async createSkin(skinData: Partial<Skin>, token: string): Promise<Skin> {
    try {
      const res = await fetch(`${API_BASE}/skins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(skinData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка при добавлении скина');
      }
      const created = await res.json();
      const current = getLocalSkins();
      setLocalSkins([created, ...current]);
      return created;
    } catch (e: any) {
      // Local fallback
      const current = getLocalSkins();
      const newSkin: Skin = {
        id: 'skin-' + Date.now(),
        name: skinData.name || 'Оружие | Скин',
        weapon: skinData.weapon || 'Оружие',
        skinName: skinData.skinName || 'Скин',
        category: skinData.category || 'rifles',
        priceKzt: Number(skinData.priceKzt) || 0,
        rarity: skinData.rarity || 'covert',
        exterior: skinData.exterior || 'Factory New',
        floatValue: skinData.floatValue !== undefined ? Number(skinData.floatValue) : 0.05,
        patternSeed: skinData.patternSeed || Math.floor(Math.random() * 999) + 1,
        description: skinData.description || 'Эксклюзивный скин CS2 из каталога PHANTOM SKINS.',
        imageUrl: skinData.imageUrl || '/src/assets/images/skin_butterfly_doppler_1793626931101.jpg',
        isStatTrak: Boolean(skinData.isStatTrak),
        isSouvenir: Boolean(skinData.isSouvenir),
        inStock: Number(skinData.stockCount || 1) > 0,
        stockCount: Math.max(0, Number(skinData.stockCount) || 1),
        isHidden: false,
        tradeLockDays: 0,
        createdAt: new Date().toISOString()
      };
      setLocalSkins([newSkin, ...current]);
      return newSkin;
    }
  },

  // Update skin (Admin)
  async updateSkin(id: string, skinData: Partial<Skin>, token: string): Promise<Skin> {
    try {
      const res = await fetch(`${API_BASE}/skins/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(skinData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка при обновлении скина');
      }
      const updated = await res.json();
      const current = getLocalSkins().map(s => s.id === id ? updated : s);
      setLocalSkins(current);
      return updated;
    } catch {
      const current = getLocalSkins().map(s => s.id === id ? { ...s, ...skinData } : s);
      setLocalSkins(current);
      const updated = current.find(s => s.id === id);
      return updated!;
    }
  },

  // Delete skin (Admin)
  async deleteSkin(id: string, token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/skins/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Ошибка удаления');
    } catch {
      // ignore
    }
    const current = getLocalSkins().filter(s => s.id !== id);
    setLocalSkins(current);
    return true;
  },

  // Toggle skin visibility (Admin)
  async toggleVisibility(id: string, token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/skins/${id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const current = getLocalSkins().map(s => s.id === id ? { ...s, isHidden: data.isHidden } : s);
        setLocalSkins(current);
        return data.isHidden;
      }
    } catch {
      // fallback
    }
    const current = getLocalSkins();
    let isHidden = false;
    const updated = current.map(s => {
      if (s.id === id) {
        isHidden = !s.isHidden;
        return { ...s, isHidden };
      }
      return s;
    });
    setLocalSkins(updated);
    return isHidden;
  },

  // Reset to initial demo skins
  async resetDemoSkins(token: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/admin/reset-skins`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {}
    setLocalSkins(INITIAL_SKINS);
    return true;
  },

  // Create Order (Public)
  async createOrder(payload: {
    steamTradeUrl: string;
    buyerEmail: string;
    buyerPhone?: string;
    comment?: string;
    items: { skinId: string; quantity: number }[];
  }): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка при оформлении заказа');
      }
      const data = await res.json();
      const current = getLocalOrders();
      setLocalOrders([data.order, ...current]);
      return data.order;
    } catch (e: any) {
      if (e.message && e.message.includes('Trade URL')) throw e;
      // Fallback
      const skins = getLocalSkins();
      const orderId = 'PH-' + Math.floor(100000 + Math.random() * 900000);
      let totalAmountKzt = 0;
      const processedItems = payload.items.map(item => {
        const skin = skins.find(s => s.id === item.skinId);
        const price = skin ? skin.priceKzt : 10000;
        totalAmountKzt += price * item.quantity;
        return {
          skinId: item.skinId,
          name: skin?.name || 'CS2 Скин',
          weapon: skin?.weapon || 'Оружие',
          priceKzt: price,
          quantity: item.quantity,
          imageUrl: skin?.imageUrl || '/src/assets/images/skin_butterfly_doppler_1793626931101.jpg',
          exterior: skin?.exterior || 'Factory New',
          floatValue: skin?.floatValue || 0.05
        };
      });

      const fallbackOrder: Order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        steamTradeUrl: payload.steamTradeUrl,
        buyerEmail: payload.buyerEmail,
        buyerPhone: payload.buyerPhone,
        comment: payload.comment,
        items: processedItems,
        totalAmountKzt,
        status: 'pending',
        tradeOfferId: 'TRADE-BOT-03#' + Math.floor(10000 + Math.random() * 90000),
        botName: 'Phantom Bot #03'
      };

      const current = getLocalOrders();
      setLocalOrders([fallbackOrder, ...current]);
      return fallbackOrder;
    }
  },

  // Track Orders (Public)
  async trackOrders(query: string): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/orders/track?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    const local = getLocalOrders();
    const q = query.toLowerCase().trim();
    return local.filter(o => 
      o.id.toLowerCase() === q ||
      o.buyerEmail.toLowerCase() === q ||
      o.steamTradeUrl.toLowerCase().includes(q)
    );
  },

  // Fetch all orders (Admin)
  async fetchOrders(token: string): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLocalOrders(data);
        return data;
      }
    } catch {}
    return getLocalOrders();
  },

  // Update order status (Admin)
  async updateOrderStatus(orderId: string, status: OrderStatus, token: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        const current = getLocalOrders().map(o => o.id === orderId ? data.order : o);
        setLocalOrders(current);
        return data.order;
      }
    } catch {}
    const current = getLocalOrders();
    const order = current.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      setLocalOrders([...current]);
      return order;
    }
    throw new Error('Order not found');
  },

  // Admin Login
  async adminLogin(username: string, password: string): Promise<{ token: string; adminName: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_ADMIN_TOKEN_KEY, data.token);
        return data;
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Неверный логин или пароль');
    } catch (e: any) {
      if (e.message && e.message.includes('Неверный логин')) throw e;
      // Resilient fallback for static Vercel / GitHub Pages deployments
      if (username === 'phantom' && password === 'phantomGgWp') {
        const token = 'ps_adm_local_' + Date.now();
        localStorage.setItem(STORAGE_ADMIN_TOKEN_KEY, token);
        return { token, adminName: 'phantom' };
      }
      throw new Error('Неверный логин или пароль администратора');
    }
  },

  // Admin Verify Token
  async adminVerify(token: string): Promise<{ authenticated: boolean; username?: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    if (token && (token.startsWith('ps_adm_') || token.startsWith('ps_adm_local_'))) {
      return { authenticated: true, username: 'phantom' };
    }
    return { authenticated: false };
  },

  // Admin Logout
  async adminLogout(token?: string | null) {
    try {
      if (token) {
        await fetch(`${API_BASE}/admin/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch {}
    localStorage.removeItem(STORAGE_ADMIN_TOKEN_KEY);
  },

  getStoredToken(): string | null {
    return localStorage.getItem(STORAGE_ADMIN_TOKEN_KEY);
  }
};
