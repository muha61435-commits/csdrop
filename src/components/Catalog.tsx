import React, { useState, useMemo } from 'react';
import { Skin, SkinCategory, SkinRarity, SkinExterior } from '../types';
import { SkinCard } from './SkinCard';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';

interface CatalogProps {
  skins: Skin[];
  onInspectSkin: (skin: Skin) => void;
  onAddToCart: (skin: Skin) => void;
  cartItemIds: Set<string>;
  activeCategory: SkinCategory;
  onCategoryChange: (cat: SkinCategory) => void;
}

export const Catalog: React.FC<CatalogProps> = ({
  skins,
  onInspectSkin,
  onAddToCart,
  cartItemIds,
  activeCategory,
  onCategoryChange,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<'all' | SkinRarity>('all');
  const [selectedExterior, setSelectedExterior] = useState<'all' | SkinExterior>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [statTrakOnly, setStatTrakOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'float_asc' | 'name'>('default');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const categories: { key: SkinCategory; label: string }[] = [
    { key: 'all', label: 'Все скины' },
    { key: 'knives', label: 'Ножи' },
    { key: 'gloves', label: 'Перчатки' },
    { key: 'rifles', label: 'Винтовки' },
    { key: 'snipers', label: 'Снайперские винтовки' },
    { key: 'pistols', label: 'Пистолеты' },
    { key: 'stickers', label: 'Наклейки' },
  ];

  const rarities: { key: 'all' | SkinRarity; label: string }[] = [
    { key: 'all', label: 'Любая редкость' },
    { key: 'extraordinary', label: '★ Экстраординарное' },
    { key: 'covert', label: 'Тайное (Красное)' },
    { key: 'classified', label: 'Засекреченное (Розовое)' },
    { key: 'restricted', label: 'Запрещенное (Фиолетовое)' },
    { key: 'milspec', label: 'Армейское (Синее)' },
    { key: 'contraband', label: 'Контрабандное' },
  ];

  const exteriors: { key: 'all' | SkinExterior; label: string }[] = [
    { key: 'all', label: 'Любое состояние' },
    { key: 'Factory New', label: 'Прямо с завода (FN)' },
    { key: 'Minimal Wear', label: 'Немного поношенное (MW)' },
    { key: 'Field-Tested', label: 'После полевых (FT)' },
    { key: 'Well-Worn', label: 'Поношенное (WW)' },
    { key: 'Battle-Scarred', label: 'Закаленное в боях (BS)' },
  ];

  // Filtering & Sorting
  const filteredSkins = useMemo(() => {
    return skins.filter(skin => {
      // Category
      if (activeCategory !== 'all' && skin.category !== activeCategory) {
        return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = skin.name.toLowerCase().includes(q);
        const matchesWeapon = skin.weapon.toLowerCase().includes(q);
        const matchesSkinName = skin.skinName.toLowerCase().includes(q);
        if (!matchesName && !matchesWeapon && !matchesSkinName) return false;
      }

      // Rarity
      if (selectedRarity !== 'all' && skin.rarity !== selectedRarity) {
        return false;
      }

      // Exterior
      if (selectedExterior !== 'all' && skin.exterior !== selectedExterior) {
        return false;
      }

      // StatTrak
      if (statTrakOnly && !skin.isStatTrak) {
        return false;
      }

      // In stock
      if (inStockOnly && !skin.inStock) {
        return false;
      }

      // Price bounds
      const min = minPrice ? Number(minPrice) : null;
      const max = maxPrice ? Number(maxPrice) : null;
      if (min !== null && !isNaN(min) && skin.priceKzt < min) return false;
      if (max !== null && !isNaN(max) && skin.priceKzt > max) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceKzt - b.priceKzt;
      if (sortBy === 'price_desc') return b.priceKzt - a.priceKzt;
      if (sortBy === 'float_asc') return a.floatValue - b.floatValue;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // default
    });
  }, [skins, activeCategory, search, selectedRarity, selectedExterior, statTrakOnly, inStockOnly, minPrice, maxPrice, sortBy]);

  const hasActiveFilters = Boolean(
    search || selectedRarity !== 'all' || selectedExterior !== 'all' || minPrice || maxPrice || statTrakOnly || inStockOnly || activeCategory !== 'all'
  );

  const resetAllFilters = () => {
    setSearch('');
    setSelectedRarity('all');
    setSelectedExterior('all');
    setMinPrice('');
    setMaxPrice('');
    setStatTrakOnly(false);
    setInStockOnly(false);
    onCategoryChange('all');
    setSortBy('default');
  };

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Каталог скинов CS2
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Найдено скинов: <strong className="text-white font-mono-numbers">{filteredSkins.length}</strong>
          </p>
        </div>

        {/* Search bar & Mobile filter button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по оружию, скину..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-violet-400" />
            <span>Фильтры</span>
          </button>
        </div>
      </div>

      {/* Category Pills (Functional filter tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onCategoryChange(cat.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeCategory === cat.key
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Advanced Filters & Sorting Panel */}
      <div className={`p-4 sm:p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Rarity select */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Редкость</label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value as any)}
              className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              {rarities.map(r => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Exterior select */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Состояние</label>
            <select
              value={selectedExterior}
              onChange={(e) => setSelectedExterior(e.target.value as any)}
              className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              {exteriors.map(ext => (
                <option key={ext.key} value={ext.key}>{ext.label}</option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Цена от (₸)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0 ₸"
              className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono-numbers"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Цена до (₸)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="10 000 000 ₸"
              className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono-numbers"
            />
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-violet-400" />
              <span>Сортировка</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="default">По умолчанию</option>
              <option value="price_asc">Сначала дешевле (₸ ↑)</option>
              <option value="price_desc">Сначала дороже (₸ ↓)</option>
              <option value="float_asc">По лучшему Float (0.00...)</option>
              <option value="name">По алфавиту (А-Я)</option>
            </select>
          </div>

        </div>

        {/* Toggles & Clear row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={statTrakOnly}
                onChange={(e) => setStatTrakOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
              />
              <span>Только StatTrak™</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
              />
              <span>Только в наличии</span>
            </label>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span>Сбросить фильтры</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Skins: 2 columns on mobile, 3 on tablet, 4 on desktop */}
      {filteredSkins.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5">
          {filteredSkins.map((skin) => (
            <SkinCard
              key={skin.id}
              skin={skin}
              onInspect={onInspectSkin}
              onAddToCart={onAddToCart}
              isInCart={cartItemIds.has(skin.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="text-4xl">🔍</div>
          <h3 className="text-lg font-bold text-white">Скины по заданным критериям не найдены</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Попробуйте изменить поисковый запрос, расширить ценовой диапазон или сбросить активные фильтры.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
          >
            Сбросить все фильтры
          </button>
        </div>
      )}

    </section>
  );
};
