import React, { useState, useEffect } from 'react';
import { Skin, Order, OrderStatus, SkinCategory, SkinRarity, SkinExterior } from '../types';
import { api } from '../services/api';
import { formatKzt, formatFloat, getRarityConfig, getOrderStatusConfig } from '../utils/formatters';
import {
  ShieldAlert,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ShoppingBag,
  Package,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Layers
} from 'lucide-react';

interface AdminPanelProps {
  onBackToStore: () => void;
  onRefreshPublicSkins: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToStore,
  onRefreshPublicSkins
}) => {
  // Auth state
  const [token, setToken] = useState<string | null>(api.getStoredToken());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState('phantom');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs: 'products' | 'orders'
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Data states
  const [skins, setSkins] = useState<Skin[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Skin Form Modal (Add / Edit)
  const [isSkinModalOpen, setIsSkinModalOpen] = useState(false);
  const [editingSkin, setEditingSkin] = useState<Skin | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    weapon: 'AK-47',
    skinName: '',
    category: 'rifles' as Exclude<SkinCategory, 'all'>,
    priceKzt: 50000,
    rarity: 'covert' as SkinRarity,
    exterior: 'Factory New' as SkinExterior,
    floatValue: 0.025,
    patternSeed: 100,
    description: '',
    imageUrl: '/src/assets/images/skin_ak47_vulcan_1793626931187.jpg',
    isStatTrak: false,
    isSouvenir: false,
    stockCount: 1
  });

  // Verify auth on mount
  useEffect(() => {
    if (token) {
      api.adminVerify(token).then(res => {
        if (res.authenticated) {
          setIsAuthenticated(true);
          loadAdminData(token);
        } else {
          setIsAuthenticated(false);
          setToken(null);
        }
      });
    }
  }, [token]);

  const loadAdminData = async (activeToken: string) => {
    setIsLoading(true);
    try {
      const [skinsData, ordersData] = await Promise.all([
        api.fetchSkins(true, activeToken),
        api.fetchOrders(activeToken)
      ]);
      setSkins(skinsData);
      setOrders(ordersData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await api.adminLogin(adminUsername, adminPassword);
      setToken(res.token);
      setIsAuthenticated(true);
      await loadAdminData(res.token);
    } catch (err: any) {
      setLoginError(err.message || 'Ошибка входа. Проверьте логин и пароль.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await api.adminLogout(token);
    setToken(null);
    setIsAuthenticated(false);
  };

  const openAddSkinModal = () => {
    setEditingSkin(null);
    setFormData({
      name: '',
      weapon: 'AK-47',
      skinName: '',
      category: 'rifles',
      priceKzt: 75000,
      rarity: 'covert',
      exterior: 'Factory New',
      floatValue: 0.024,
      patternSeed: 420,
      description: 'Скин CS2 высшего качества с редким паттерном.',
      imageUrl: '/src/assets/images/skin_butterfly_doppler_1793626931101.jpg',
      isStatTrak: false,
      isSouvenir: false,
      stockCount: 1
    });
    setIsSkinModalOpen(true);
  };

  const openEditSkinModal = (skin: Skin) => {
    setEditingSkin(skin);
    setFormData({
      name: skin.name,
      weapon: skin.weapon,
      skinName: skin.skinName,
      category: skin.category,
      priceKzt: skin.priceKzt,
      rarity: skin.rarity,
      exterior: skin.exterior,
      floatValue: skin.floatValue,
      patternSeed: skin.patternSeed || 1,
      description: skin.description,
      imageUrl: skin.imageUrl,
      isStatTrak: Boolean(skin.isStatTrak),
      isSouvenir: Boolean(skin.isSouvenir),
      stockCount: skin.stockCount
    });
    setIsSkinModalOpen(true);
  };

  const handleSaveSkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingSkin) {
        // Update
        const updated = await api.updateSkin(editingSkin.id, formData, token);
        setSkins(skins.map(s => s.id === updated.id ? updated : s));
      } else {
        // Create
        const created = await api.createSkin(formData, token);
        setSkins([created, ...skins]);
      }
      setIsSkinModalOpen(false);
      onRefreshPublicSkins();
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения скина');
    }
  };

  const handleDeleteSkin = async (id: string, name: string) => {
    if (!confirm(`Вы действительно хотите удалить скин «${name}»?`)) return;
    if (!token) return;

    try {
      await api.deleteSkin(id, token);
      setSkins(skins.filter(s => s.id !== id));
      onRefreshPublicSkins();
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления скина');
    }
  };

  const handleToggleVisibility = async (id: string) => {
    if (!token) return;
    try {
      const isHidden = await api.toggleVisibility(id, token);
      setSkins(skins.map(s => s.id === id ? { ...s, isHidden } : s));
      onRefreshPublicSkins();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    try {
      const updated = await api.updateOrderStatus(orderId, status, token);
      setOrders(orders.map(o => o.id === updated.id ? updated : o));
    } catch (err: any) {
      alert(err.message || 'Ошибка обновления статуса');
    }
  };

  const handleResetDemoSkins = async () => {
    if (!confirm('Сбросить весь каталог скинов к исходному демо-состоянию? Все добавленные тестовые скины будут удалены.')) return;
    if (!token) return;
    await api.resetDemoSkins(token);
    await loadAdminData(token);
    onRefreshPublicSkins();
  };

  // If not authenticated, render login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-gradient-to-b from-[#111624] to-[#0a0d14] rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/30 text-violet-400 mx-auto flex items-center justify-center shadow-lg shadow-violet-950/40">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-black text-white font-display">
              Вход в админ-панель
            </h1>
            <p className="text-xs text-slate-400">
              Управление каталогом товаров и заказами PHANTOM SKINS
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Логин администратора</label>
              <input
                type="text"
                required
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="phantom"
                className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Пароль администратора</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-[11px] text-slate-500 text-center">
              🔒 Доступ разрешён только владельцу магазина PHANTOM SKINS
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/40 cursor-pointer transition-all"
            >
              {isLoggingIn ? 'Проверка прав...' : 'Войти в панель управления'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={onBackToStore}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Вернуться на главную страницу магазина
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Admin Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#111624] to-[#0c0f17] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold">
            ADM
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white">
              Панель администратора
            </h1>
            <p className="text-xs text-slate-400">
              Авторизован как <span className="text-sky-400 font-semibold">{adminUsername}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleResetDemoSkins}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Восстановить исходные 12 скинов"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Сброс скинов</span>
          </button>

          <button
            onClick={onBackToStore}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
          >
            В магазин
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'products'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Товары ({skins.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Заказы ({orders.length})</span>
        </button>
      </div>

      {/* Tab 1: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Список товаров в базе данных</h2>
            
            <button
              onClick={openAddSkinModal}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-violet-900/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить новый скин</span>
            </button>
          </div>

          {/* Skins Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0c101a]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                  <th className="p-3">Скин</th>
                  <th className="p-3">Категория</th>
                  <th className="p-3">Редкость</th>
                  <th className="p-3">Качество / Float</th>
                  <th className="p-3">Цена (₸)</th>
                  <th className="p-3">Кол-во</th>
                  <th className="p-3">Видимость</th>
                  <th className="p-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {skins.map((skin) => {
                  const rarity = getRarityConfig(skin.rarity);
                  return (
                    <tr key={skin.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Name & Img */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={skin.imageUrl}
                            alt=""
                            className="w-10 h-10 object-contain rounded bg-slate-950 p-1 border border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate max-w-xs">{skin.name}</div>
                            <div className="text-[11px] text-slate-500">{skin.weapon}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3 text-slate-300 capitalize">
                        {skin.category}
                      </td>

                      {/* Rarity */}
                      <td className="p-3">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            color: rarity.colorHex,
                            backgroundColor: `${rarity.colorHex}15`
                          }}
                        >
                          {rarity.nameRu}
                        </span>
                      </td>

                      {/* Exterior / Float */}
                      <td className="p-3">
                        <div className="text-slate-200">{skin.exterior}</div>
                        <div className="font-mono-numbers text-[11px] text-slate-400">{formatFloat(skin.floatValue)}</div>
                      </td>

                      {/* Price */}
                      <td className="p-3 font-mono-numbers font-bold text-sky-400">
                        {formatKzt(skin.priceKzt)}
                      </td>

                      {/* Stock */}
                      <td className="p-3 font-mono-numbers">
                        {skin.stockCount > 0 ? (
                          <span className="text-emerald-400 font-semibold">{skin.stockCount} шт.</span>
                        ) : (
                          <span className="text-rose-400">Нет на складе</span>
                        )}
                      </td>

                      {/* Visibility Toggle */}
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleVisibility(skin.id)}
                          className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                            skin.isHidden
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                          title={skin.isHidden ? 'Скрыт в каталоге (нажмите, чтобы показать)' : 'Отображается в каталоге'}
                        >
                          {skin.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{skin.isHidden ? 'Скрыт' : 'Виден'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditSkinModal(skin)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Редактировать скин"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteSkin(skin.id, skin.name)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Удалить скин"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Список полученных заказов</h2>
            <div className="text-xs text-slate-400 font-mono-numbers">Всего заказов: {orders.length}</div>
          </div>

          <div className="space-y-3">
            {orders.map((order) => {
              const statusCfg = getOrderStatusConfig(order.status);
              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 rounded-xl bg-[#0c101a] border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-numbers font-black text-white text-base">
                          Заказ #{order.id}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${statusCfg.colorClass}`}>
                          {statusCfg.labelRu}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {order.buyerEmail} · {new Date(order.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>

                    {/* Change Status Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Изменить статус:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                      >
                        <option value="pending">В обработке</option>
                        <option value="trade_sent">Трейд отправлен</option>
                        <option value="completed">Завершён (доставлен)</option>
                        <option value="cancelled">Отменён</option>
                      </select>
                    </div>
                  </div>

                  {/* Items in order */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {item.name} × {item.quantity} ({formatKzt(item.priceKzt * item.quantity)})
                      </span>
                    ))}
                  </div>

                  {/* Trade details */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 pt-1">
                    <div className="truncate max-w-md font-mono text-[11px]">
                      Trade URL: {order.steamTradeUrl}
                    </div>
                    <div className="font-mono-numbers font-bold text-sky-400 text-sm">
                      Итого: {formatKzt(order.totalAmountKzt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Skin Modal */}
      {isSkinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div
            className="relative w-full max-w-2xl bg-gradient-to-b from-[#111624] to-[#0a0d14] rounded-2xl border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-display">
                {editingSkin ? 'Редактирование товара' : 'Добавление нового скина в магазин'}
              </h3>
              <button
                onClick={() => setIsSkinModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSkin} className="space-y-4 text-xs">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Полное название скина</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: ★ Нож-бабочка | Волны Допплер"
                  className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Weapon and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Оружие / Предмет</label>
                  <input
                    type="text"
                    required
                    value={formData.weapon}
                    onChange={(e) => setFormData({ ...formData, weapon: e.target.value })}
                    placeholder="AK-47, AWP, Керамбит..."
                    className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Категория</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="knives">Ножи</option>
                    <option value="gloves">Перчатки</option>
                    <option value="rifles">Винтовки</option>
                    <option value="snipers">Снайперские винтовки</option>
                    <option value="pistols">Пистолеты</option>
                    <option value="stickers">Наклейки</option>
                  </select>
                </div>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Цена в тенге (₸)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.priceKzt}
                    onChange={(e) => setFormData({ ...formData, priceKzt: Number(e.target.value) })}
                    placeholder="150000"
                    className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono-numbers"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Количество на складе (шт.)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stockCount}
                    onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                    className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono-numbers"
                  />
                </div>
              </div>

              {/* Rarity and Exterior */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Редкость</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                    className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="extraordinary">★ Экстраординарное (Золото)</option>
                    <option value="covert">Тайное (Красное)</option>
                    <option value="classified">Засекреченное (Розовое)</option>
                    <option value="restricted">Запрещенное (Фиолетовое)</option>
                    <option value="milspec">Армейское качество (Синее)</option>
                    <option value="contraband">Контрабандное (Вой)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Состояние (Exterior)</label>
                  <select
                    value={formData.exterior}
                    onChange={(e) => setFormData({ ...formData, exterior: e.target.value as any })}
                    className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Factory New">Factory New (Прямо с завода)</option>
                    <option value="Minimal Wear">Minimal Wear (Немного поношенное)</option>
                    <option value="Field-Tested">Field-Tested (После полевых)</option>
                    <option value="Well-Worn">Well-Worn (Поношенное)</option>
                    <option value="Battle-Scarred">Battle-Scarred (Закаленное в боях)</option>
                  </select>
                </div>
              </div>

              {/* Float and Pattern Seed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Float Value (0.000 - 1.000)</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1"
                    value={formData.floatValue}
                    onChange={(e) => setFormData({ ...formData, floatValue: parseFloat(e.target.value) || 0.05 })}
                    className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono-numbers"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Pattern Seed (1 - 999)</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={formData.patternSeed}
                    onChange={(e) => setFormData({ ...formData, patternSeed: Number(e.target.value) || 1 })}
                    className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono-numbers"
                  />
                </div>
              </div>

              {/* Image URL & Preset Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Изображение скина (URL)</label>
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/src/assets/images/... или внешняя ссылка"
                  className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                />

                <div className="flex items-center gap-2 pt-1 overflow-x-auto text-[11px] text-slate-400">
                  <span>Быстрые пресеты:</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '/src/assets/images/skin_butterfly_doppler_1793626931101.jpg' })}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-sky-400"
                  >
                    Нож Сапфир
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '/src/assets/images/skin_awp_dragon_lore_1793626932302.jpg' })}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-400"
                  >
                    AWP Dragon Lore
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '/src/assets/images/skin_ak47_vulcan_1793626931187.jpg' })}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-violet-400"
                  >
                    AK-47 Вулкан
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '/src/assets/images/skin_sport_gloves_vice_1793626931990.jpg' })}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-pink-400"
                  >
                    Перчатки Порок
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Описание скина</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Подробности о внешнем виде, редкости или истории скина..."
                  className="w-full bg-[#07090e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isStatTrak}
                    onChange={(e) => setFormData({ ...formData, isStatTrak: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-violet-500"
                  />
                  <span>StatTrak™ технология</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isSouvenir}
                    onChange={(e) => setFormData({ ...formData, isSouvenir: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-violet-500"
                  />
                  <span>Сувенирный скин</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSkinModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 font-bold text-white shadow-md shadow-violet-900/30"
                >
                  {editingSkin ? 'Сохранить изменения' : 'Добавить скин'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
