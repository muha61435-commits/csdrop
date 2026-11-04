import React, { useState, useEffect, useMemo } from 'react';
import { Skin, CartItem, Order, SkinCategory, UserInventoryItem } from './types';
import { api } from './services/api';
import { INITIAL_SKINS } from './data/initialSkins';
import { TEAM_THEMES, TeamThemeId } from './data/teamThemes';
import { TeamBackgroundLayer } from './components/TeamBackgroundLayer';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Hero } from './components/Hero';
import { Catalog } from './components/Catalog';
import { UpgraderView } from './components/UpgraderView';
import { SkinDetailModal } from './components/SkinDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { WalletModal } from './components/WalletModal';
import { UserInventoryView } from './components/UserInventoryView';
import { MyOrdersView } from './components/MyOrdersView';
import { AboutView } from './components/AboutView';
import { ContactsView } from './components/ContactsView';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { Check } from 'lucide-react';
import { formatKzt } from './utils/formatters';

const STORAGE_CART_KEY = 'phantom_cart_items_v1';
const STORAGE_THEME_KEY = 'phantom_team_theme_v1';
const STORAGE_INTENSITY_KEY = 'phantom_backdrop_intensity_v1';
const STORAGE_BALANCE_KEY = 'phantom_user_balance_v1';
const STORAGE_INVENTORY_KEY = 'phantom_user_inventory_v1';

export default function App() {
  // Navigation
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin') return 'admin';
      if (path === '/upgrader') return 'upgrader';
      if (window.location.hash === '#admin') return 'admin';
      if (window.location.hash === '#upgrader') return 'upgrader';
    }
    return 'home';
  });

  // Team Theme State (defaults to 'furia' as requested by the user!)
  const [activeThemeId, setActiveThemeId] = useState<TeamThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved && saved in TEAM_THEMES) return saved as TeamThemeId;
    } catch (e) {
      console.error(e);
    }
    return 'furia';
  });

  const [backdropIntensity, setBackdropIntensity] = useState<'balanced' | 'vivid' | 'stealth'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INTENSITY_KEY);
      if (saved === 'balanced' || saved === 'vivid' || saved === 'stealth') return saved;
    } catch {}
    return 'balanced';
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // User Wallet Account Balance (in KZT ₸)
  const [userBalanceKzt, setUserBalanceKzt] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BALANCE_KEY);
      if (saved !== null) {
        const val = Number(saved);
        if (!isNaN(val)) return val;
      }
    } catch (e) {
      console.error(e);
    }
    return 250000; // Initial test balance: 250,000 ₸
  });

  // User Purchased Skins Inventory (seeded with 2 starter skins for instant Upgrader trial)
  const [userInventory, setUserInventory] = useState<UserInventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INVENTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const redline = INITIAL_SKINS.find(s => s.name.includes('Красная линия')) || INITIAL_SKINS[21];
    const atheris = INITIAL_SKINS.find(s => s.name.includes('Древесная гадюка')) || INITIAL_SKINS[20];
    return [
      {
        inventoryId: 'starter-1',
        skin: redline,
        acquiredAt: new Date().toISOString(),
        isWithdrawn: false
      },
      {
        inventoryId: 'starter-2',
        skin: atheris,
        acquiredAt: new Date().toISOString(),
        isWithdrawn: false
      }
    ];
  });

  // Wallet Modal
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletRecommendedAmount, setWalletRecommendedAmount] = useState<number | undefined>(undefined);

  // Skins data
  const [skins, setSkins] = useState<Skin[]>([]);
  const [isLoadingSkins, setIsLoadingSkins] = useState(true);
  const [activeCategory, setActiveCategory] = useState<SkinCategory>('all');

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals
  const [inspectingSkin, setInspectingSkin] = useState<Skin | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Admin status check
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3200);
  };

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync balance to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BALANCE_KEY, String(userBalanceKzt));
    } catch (e) {
      console.error(e);
    }
  }, [userBalanceKzt]);

  // Sync inventory to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(userInventory));
    } catch (e) {
      console.error(e);
    }
  }, [userInventory]);

  // Load public skins
  const loadPublicSkins = async () => {
    setIsLoadingSkins(true);
    try {
      const data = await api.fetchSkins(false);
      setSkins(data);
    } catch (e) {
      console.error('Failed to load skins:', e);
    } finally {
      setIsLoadingSkins(false);
    }
  };

  useEffect(() => {
    loadPublicSkins();

    // Check admin token on start
    const token = api.getStoredToken();
    if (token) {
      api.adminVerify(token).then(res => {
        setIsAdminLoggedIn(Boolean(res.authenticated));
      });
    }

    // Handle browser popstate
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin') setCurrentView('admin');
      else if (path === '/upgrader') setCurrentView('upgrader');
      else setCurrentView('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'upgrader') {
      window.history.pushState({}, '', '/upgrader');
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Wallet Actions
  const handleOpenTopUp = (recommendedAmount?: number) => {
    setWalletRecommendedAmount(recommendedAmount);
    setIsWalletModalOpen(true);
  };

  const handleDeposit = (amountKzt: number) => {
    setUserBalanceKzt(prev => prev + amountKzt);
    showToast(`Баланс пополнен на ${formatKzt(amountKzt)}`);
  };

  // Upgrader Handlers
  const handleUpgradeSuccess = (_sacrificedInventoryIds: string[], sacrificedBalance: number, wonSkin: Skin) => {
    // When the user WINS an upgrade, their placed skin(s) REMAIN in their inventory
    // and the won skin is added as a bonus prize!
    const newWonItem: UserInventoryItem = {
      inventoryId: `inv_upg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      skin: wonSkin,
      acquiredAt: new Date().toISOString(),
      isWithdrawn: false
    };

    // User keeps ALL their current inventory items AND gets the won skin
    setUserInventory(prev => [newWonItem, ...prev]);

    // Sacrificed balance (if any cash balance was added to the roll) is consumed
    if (sacrificedBalance > 0) {
      setUserBalanceKzt(prev => Math.max(0, prev - sacrificedBalance));
    }

    showToast(`🎉 ПОБЕДА! Ваш скин остался у вас, и вы дополнительно выиграли «${wonSkin.name}»!`);
  };

  const handleUpgradeFailed = (sacrificedInventoryIds: string[], sacrificedBalance: number) => {
    const sacrificedSet = new Set(sacrificedInventoryIds);
    setUserInventory(prev => prev.filter(item => !sacrificedSet.has(item.inventoryId)));

    if (sacrificedBalance > 0) {
      setUserBalanceKzt(prev => Math.max(0, prev - sacrificedBalance));
    }

    showToast(`Не повезло в этот раз. Попробуйте еще раз!`);
  };

  // Cart operations
  const handleAddToCart = (skin: Skin) => {
    if (!skin.inStock) return;

    setCart(prev => {
      const existing = prev.find(item => item.skin.id === skin.id);
      if (existing) {
        return prev.map(item =>
          item.skin.id === skin.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { skin, quantity: 1 }];
      }
    });

    showToast(`«${skin.name}» добавлен в корзину`);
  };

  const handleDirectBuy = (skin: Skin) => {
    if (!skin.inStock) return;
    setCart([{ skin, quantity: 1 }]);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (skinId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(skinId);
      return;
    }
    setCart(prev =>
      prev.map(item => item.skin.id === skinId ? { ...item, quantity } : item)
    );
  };

  const handleRemoveCartItem = (skinId: string) => {
    setCart(prev => prev.filter(item => item.skin.id !== skinId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleSubmitOrder = async (orderPayload: {
    steamTradeUrl: string;
    buyerEmail: string;
    buyerPhone: string;
    comment: string;
    payFromBalance?: boolean;
  }): Promise<Order> => {
    const totalCost = cart.reduce((acc, curr) => acc + curr.skin.priceKzt * curr.quantity, 0);

    // If paid from wallet balance
    if (orderPayload.payFromBalance) {
      if (userBalanceKzt < totalCost) {
        throw new Error(`Недостаточно средств. Не хватает ${formatKzt(totalCost - userBalanceKzt)}`);
      }
      setUserBalanceKzt(prev => Math.max(0, prev - totalCost));

      // Append bought skins to user's persistent inventory
      const newInventoryItems: UserInventoryItem[] = [];
      cart.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          newInventoryItems.push({
            inventoryId: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            skin: item.skin,
            acquiredAt: new Date().toISOString(),
            isWithdrawn: false
          });
        }
      });
      setUserInventory(prev => [...newInventoryItems, ...prev]);
    }

    const itemsPayload = cart.map(item => ({
      skinId: item.skin.id,
      quantity: item.quantity
    }));

    const newOrder = await api.createOrder({
      steamTradeUrl: orderPayload.steamTradeUrl,
      buyerEmail: orderPayload.buyerEmail,
      buyerPhone: orderPayload.buyerPhone,
      comment: orderPayload.comment,
      items: itemsPayload
    });

    setCart([]);
    await loadPublicSkins();
    return newOrder;
  };

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setCompletedOrder(order);
  };

  const handleWithdrawToSteam = (inventoryId: string) => {
    setUserInventory(prev =>
      prev.map(item =>
        item.inventoryId === inventoryId ? { ...item, isWithdrawn: true } : item
      )
    );
    showToast('Трейд отправлен! Подтвердите получение в Steam Guard');
  };

  // Scroll to catalog helper
  const handleScrollToCatalog = () => {
    setCurrentView('home');
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroSelectCategory = (cat: string) => {
    setActiveCategory(cat as SkinCategory);
    handleScrollToCatalog();
  };

  const currentTheme = TEAM_THEMES[activeThemeId] || TEAM_THEMES.furia;

  const handleSelectTheme = (themeId: TeamThemeId) => {
    setActiveThemeId(themeId);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, themeId);
    } catch (e) {
      console.error(e);
    }
    const t = TEAM_THEMES[themeId];
    if (t) {
      showToast(`Тема «${t.name}» установлена на фон!`);
    }
  };

  const handleChangeIntensity = (val: 'balanced' | 'vivid' | 'stealth') => {
    setBackdropIntensity(val);
    try {
      localStorage.setItem(STORAGE_INTENSITY_KEY, val);
    } catch (e) {
      console.error(e);
    }
  };

  const cartCount = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cart]);

  const cartTotalKzt = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (curr.skin.priceKzt * curr.quantity), 0);
  }, [cart]);

  const cartItemIds = useMemo(() => {
    return new Set(cart.map(c => c.skin.id));
  }, [cart]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#07090e] text-slate-100 selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Fullscreen Team Background Wallpaper Layer */}
      <TeamBackgroundLayer
        theme={currentTheme}
        backdropIntensity={backdropIntensity}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* PWA Mobile Install Banner */}
        <PWAInstallBanner />

        {/* Top Banner Notice */}
        <div className="hidden sm:block bg-gradient-to-r from-violet-950/80 via-slate-950/90 to-sky-950/80 backdrop-blur-sm border-b border-violet-900/30 py-1.5 px-4 text-center text-xs text-slate-300">
          <span className="font-semibold text-violet-300">PHANTOM SKINS</span> · Режим: <strong className="text-amber-300 font-bold">CS2 UPGRADER</strong> · Тема: <strong className="text-white">{currentTheme.name}</strong> · Баланс: <strong className="text-emerald-300 font-mono-numbers">{formatKzt(userBalanceKzt)}</strong>
        </div>

        {/* Main Header */}
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          cartCount={cartCount}
          cartTotalKzt={cartTotalKzt}
          onOpenCart={() => setIsCartOpen(true)}
          isAdmin={isAdminLoggedIn}
          currentTheme={currentTheme}
          onOpenThemeSelector={() => setIsThemeModalOpen(true)}
          userBalanceKzt={userBalanceKzt}
          onOpenTopUp={() => handleOpenTopUp()}
          inventoryCount={userInventory.length}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 border border-amber-500/50 shadow-2xl shadow-black/80 text-xs font-semibold text-white backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main View Router (with pb-24 on mobile so bottom bar never obstructs content) */}
        <main className="flex-1 pb-24 md:pb-8">
          {currentView === 'home' || currentView === 'catalog' ? (
            <>
              <Hero
                onScrollToCatalog={handleScrollToCatalog}
                onSelectCategory={handleHeroSelectCategory}
                totalSkinsCount={skins.length}
                theme={currentTheme}
                onOpenThemeSelector={() => setIsThemeModalOpen(true)}
                onNavigateToUpgrader={() => handleNavigate('upgrader')}
              />

              <Catalog
                skins={skins}
                onInspectSkin={(skin) => setInspectingSkin(skin)}
                onAddToCart={handleAddToCart}
                cartItemIds={cartItemIds}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </>
          ) : currentView === 'upgrader' ? (
            <UpgraderView
              skins={skins}
              userInventory={userInventory}
              userBalanceKzt={userBalanceKzt}
              onUpgradeSuccess={handleUpgradeSuccess}
              onUpgradeFailed={handleUpgradeFailed}
              onOpenTopUp={() => handleOpenTopUp()}
              onGoToShop={() => handleNavigate('home')}
              onGoToInventory={() => handleNavigate('inventory')}
            />
          ) : currentView === 'inventory' ? (
            <UserInventoryView
              items={userInventory}
              userBalanceKzt={userBalanceKzt}
              onOpenTopUp={() => handleOpenTopUp()}
              onGoToCatalog={() => handleNavigate('home')}
              onWithdrawToSteam={handleWithdrawToSteam}
            />
          ) : currentView === 'my-orders' ? (
            <MyOrdersView onBackToCatalog={() => handleNavigate('home')} />
          ) : currentView === 'about' ? (
            <AboutView onGoToCatalog={() => handleNavigate('home')} />
          ) : currentView === 'contacts' ? (
            <ContactsView />
          ) : currentView === 'admin' ? (
            <AdminPanel
              onBackToStore={() => handleNavigate('home')}
              onRefreshPublicSkins={loadPublicSkins}
            />
          ) : null}
        </main>

        {/* Footer (hidden or compact on mobile) */}
        <div className="hidden md:block">
          <Footer onNavigate={handleNavigate} />
        </div>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <MobileBottomNav
          currentView={currentView}
          onNavigate={handleNavigate}
          inventoryCount={userInventory.length}
          userBalanceKzt={userBalanceKzt}
          onOpenTopUp={() => handleOpenTopUp()}
          isAdmin={isAdminLoggedIn}
        />
      </div>

      {/* Team Theme Selection Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        activeThemeId={activeThemeId}
        onSelectTheme={handleSelectTheme}
        backdropIntensity={backdropIntensity}
        onChangeIntensity={handleChangeIntensity}
      />

      {/* Wallet Deposit Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false);
          setWalletRecommendedAmount(undefined);
        }}
        currentBalanceKzt={userBalanceKzt}
        onDeposit={handleDeposit}
        recommendedAmount={walletRecommendedAmount}
      />

      {/* Skin Detail Modal (Inspect) */}
      <SkinDetailModal
        skin={inspectingSkin}
        onClose={() => setInspectingSkin(null)}
        onAddToCart={handleAddToCart}
        onDirectBuy={handleDirectBuy}
        isInCart={inspectingSkin ? cartItemIds.has(inspectingSkin.id) : false}
        userBalanceKzt={userBalanceKzt}
        onOpenTopUp={handleOpenTopUp}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        userBalanceKzt={userBalanceKzt}
        onOpenTopUp={(missing) => {
          setIsCheckoutOpen(false);
          handleOpenTopUp(missing);
        }}
        onSubmitOrder={handleSubmitOrder}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onGoToMyOrders={() => handleNavigate('my-orders')}
      />

    </div>
  );
}
