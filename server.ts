import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data storage files
const DATA_DIR = path.resolve(__dirname, 'data');
const SKINS_FILE = path.join(DATA_DIR, 'skins.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial fallback skins with 100% authentic in-game CS2 weapon renders
const DEFAULT_SKINS = [
  {
    id: 'skin-1',
    name: '★ Нож-бабочка | Волны Допплер (Сапфир)',
    weapon: 'Нож-бабочка',
    skinName: 'Волны Допплер Сапфир',
    category: 'knives',
    priceKzt: 2850000,
    rarity: 'extraordinary',
    exterior: 'Factory New',
    floatValue: 0.0124,
    patternSeed: 412,
    description: 'Официальный нож-бабочка из CS2 с редчайшим кристаллическим паттерном Sapphire (Фаза Сапфир). Клинок полностью покрыт сине-фиолетовыми волнами с зеркальным блеском.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Z-ua6bbZrLOmsD2qvxeFmoO1sXRajnRw0tmy6lob-KT-JOgRzAsZ3RuNfs0a5x9HhYuLj4gbbg99NySr6iy4d6C9t4r0EUqF0qLqX0V8wFp5G5A',
    isStatTrak: true,
    inStock: true,
    stockCount: 1,
    tradeLockDays: 0,
    createdAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'skin-2',
    name: 'AWP | История о драконе',
    weapon: 'AWP',
    skinName: 'История о драконе (Dragon Lore)',
    category: 'snipers',
    priceKzt: 6900000,
    rarity: 'covert',
    exterior: 'Factory New',
    floatValue: 0.0289,
    patternSeed: 704,
    description: 'Официальный скин AWP из коллекции Cobblestone. Корпус украшен золотым огнедышащим кельтским драконом и клетчатым оптическим прицелом.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV',
    isSouvenir: true,
    inStock: true,
    stockCount: 1,
    tradeLockDays: 0,
    createdAt: '2026-10-25T14:30:00Z',
  },
  {
    id: 'skin-3',
    name: 'AK-47 | Вулкан',
    weapon: 'AK-47',
    skinName: 'Вулкан',
    category: 'rifles',
    priceKzt: 420000,
    rarity: 'covert',
    exterior: 'Factory New',
    floatValue: 0.0351,
    patternSeed: 188,
    description: 'Официальный спортивный скин AK-47 со строгим контрастом черного матового покрытия, ярких синих акцентов и белых гоночных линий.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSMuWRDGKC_uJ_t-l9AXCxxEh14zjTztivci2ePQZ2W8NzTecD4BKwloLiYeqxtAOIj9gUyyngznQeF7I6QE8',
    isStatTrak: true,
    inStock: true,
    stockCount: 3,
    tradeLockDays: 0,
    createdAt: '2026-10-29T11:20:00Z',
  },
  {
    id: 'skin-4',
    name: '★ Спортивные перчатки | Порок (Vice)',
    weapon: 'Спортивные перчатки',
    skinName: 'Порок (Vice)',
    category: 'gloves',
    priceKzt: 1480000,
    rarity: 'extraordinary',
    exterior: 'Field-Tested',
    floatValue: 0.184,
    patternSeed: 639,
    description: 'Оригинальные перчатки из CS2 с бирюзовой ладонью и ярко-розовыми полимерными накладками.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Tk5UvzWCL2kpn2-DFk_OKherB0H_KfG2Kv0ed4u95lRi67gVNx4T-Bw434IHyVb1QlAsd1FOUDthG4xNznMu3m4QXXg90Wzn_33C1I8G81tLaDi_rK',
    inStock: true,
    stockCount: 2,
    tradeLockDays: 0,
    createdAt: '2026-10-30T09:15:00Z',
  },
  {
    id: 'skin-5',
    name: '★ Керамбит | Градиент (Fade 99%)',
    weapon: 'Керамбит',
    skinName: 'Градиент (Fade)',
    category: 'knives',
    priceKzt: 1650000,
    rarity: 'extraordinary',
    exterior: 'Factory New',
    floatValue: 0.0089,
    patternSeed: 763,
    description: 'Оригинальный керамбит с максимальным градиентом Fade 99%. Лезвие переливается от прозрачно-золотого у рукоятки к розовому и фиолетовому на острие.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SD1iWwOpzj-1gSCGn20tztm_UyIn_JHKUbgYlWMcmQ-ZcskSwldS0MOnntAfd3YlMzH35jntXrnE8SOGRGG8',
    isStatTrak: false,
    inStock: true,
    stockCount: 1,
    tradeLockDays: 0,
    createdAt: '2026-10-26T16:45:00Z',
  },
  {
    id: 'skin-6',
    name: 'M4A4 | Вой (Howl)',
    weapon: 'M4A4',
    skinName: 'Вой',
    category: 'rifles',
    priceKzt: 3100000,
    rarity: 'contraband',
    exterior: 'Field-Tested',
    floatValue: 0.162,
    patternSeed: 294,
    description: 'Единственный официальный скин контрабандного качества в Counter-Strike. Огненный рычащий волк на черном стволе штурмовой винтовки.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afVSKP-EAm6extF6ueZhW2exwkl2tmTXwt39eCiUPQR2DMN4TOVetUK8xoLgM-K341eM2otDnC6okGoXufBz_TAB',
    isStatTrak: true,
    inStock: true,
    stockCount: 1,
    tradeLockDays: 0,
    createdAt: '2026-10-22T08:00:00Z',
  },
  {
    id: 'skin-7',
    name: 'Desert Eagle | Поток информации (Printstream)',
    weapon: 'Desert Eagle',
    skinName: 'Поток информации',
    category: 'pistols',
    priceKzt: 74000,
    rarity: 'covert',
    exterior: 'Factory New',
    floatValue: 0.021,
    patternSeed: 91,
    description: 'Официальный монохромный скин Deagle с перламутровым переливом и геометрической калибровкой CS2.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKFsJ8-DHG6e1f1iouRoQha_nBovp3OGmdeqInyVP1V0XsYlRbEI50a5wNyzZr605AyI3t5MmCSohylAuC89_a9cBoMY9UkV',
    isStatTrak: false,
    inStock: true,
    stockCount: 4,
    tradeLockDays: 0,
    createdAt: '2026-11-01T12:00:00Z',
  },
  {
    id: 'skin-8',
    name: 'USP-S | Подтвержденное убийство',
    weapon: 'USP-S',
    skinName: 'Подтвержденное убийство',
    category: 'pistols',
    priceKzt: 89000,
    rarity: 'covert',
    exterior: 'Minimal Wear',
    floatValue: 0.088,
    patternSeed: 440,
    description: 'Культовый скин USP-S с динамичным артом пули, раскалывающей череп, брызгами огня и глушителем.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSI-WsG3SA_uV_vO1WTCa9kxQ1vjiBpYPwJiPTcFB2Xpp5TO5cskG9lYCxZu_jsVCL3o4Xnij23ClO5ik9tegFA_It8qHJz1aWe-uc160',
    isStatTrak: true,
    inStock: true,
    stockCount: 2,
    tradeLockDays: 0,
    createdAt: '2026-10-31T15:20:00Z',
  },
  {
    id: 'skin-9',
    name: 'AK-47 | Красная линия (Redline)',
    weapon: 'AK-47',
    skinName: 'Красная линия',
    category: 'rifles',
    priceKzt: 18500,
    rarity: 'classified',
    exterior: 'Field-Tested',
    floatValue: 0.155,
    patternSeed: 502,
    description: 'Оригинальный фаворит игроков: углеродное волокно с тонкими красными полосами на ствольной коробке и магазине.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-RHGavzedxuPUnFniykEtzsWWBzoyuIiifaAchDZUjTOZe4RC_w4buM-6z7wzbgokUyzK-0H08hRGDMA',
    isStatTrak: false,
    inStock: true,
    stockCount: 6,
    tradeLockDays: 0,
    createdAt: '2026-11-01T18:30:00Z',
  },
  {
    id: 'skin-10',
    name: 'AWP | Азимов (Asiimov)',
    weapon: 'AWP',
    skinName: 'Азимов',
    category: 'snipers',
    priceKzt: 115000,
    rarity: 'covert',
    exterior: 'Field-Tested',
    floatValue: 0.224,
    patternSeed: 338,
    description: 'Легендарная научно-фантастическая расцветка Азимов в оранжево-бело-черной палитре с геометрическими линиями.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6V-Kf2cGFidxOp_pewnF3nhxEt0sGnSzN76dH3GOg9xC8FyEORftRe-x9PuYurq71bW3d8UnjK-0H0YSTpMGQ',
    isStatTrak: false,
    inStock: true,
    stockCount: 3,
    tradeLockDays: 0,
    createdAt: '2026-10-27T19:10:00Z',
  },
  {
    id: 'skin-11',
    name: 'Наклейка | Корона (металлическая / Crown Foil)',
    weapon: 'Наклейка',
    skinName: 'Корона (Foil)',
    category: 'stickers',
    priceKzt: 460000,
    rarity: 'restricted',
    exterior: 'Factory New',
    floatValue: 0.00,
    patternSeed: 1,
    description: 'Официальная металлическая наклейка с черепом в царской золотой короне, переливающаяся золотым блеском в игре.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJai0ki7VeTHjNm1PHic4ERmpsj3-FbwTyL3kZ_ssycDt6v4PvU_dvTGDWGWl-xwtLZoS36ykB4ltTvXy42seS_EPFQpC8BuBbldJQkRI1c',
    isStatTrak: false,
    inStock: true,
    stockCount: 2,
    tradeLockDays: 0,
    createdAt: '2026-10-18T14:00:00Z',
  },
  {
    id: 'skin-12',
    name: 'Glock-18 | Гамма-волны Изумруд (Emerald)',
    weapon: 'Glock-18',
    skinName: 'Гамма-волны Изумруд',
    category: 'pistols',
    priceKzt: 345000,
    rarity: 'covert',
    exterior: 'Factory New',
    floatValue: 0.015,
    patternSeed: 812,
    description: 'Официальный скин пистолета террористов редчайшей фазы Emerald. Полностью зеленый зеркальный изумрудный затвор.',
    imageUrl: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1a4s2paalgIc-XAXeAzetkj_FhTjq2xyIgvzKGkbD1KCzPKhgnC5pwTLNYsRLrlNXlMe-05gDZ3toWyCmqhyhP5y9r6udQWKIk__XUkUifZoShMfFw',
    isStatTrak: true,
    inStock: true,
    stockCount: 1,
    tradeLockDays: 0,
    createdAt: '2026-10-24T17:40:00Z',
  }
];

// Seed initial files if missing
if (!fs.existsSync(SKINS_FILE)) {
  fs.writeFileSync(SKINS_FILE, JSON.stringify(DEFAULT_SKINS, null, 2), 'utf-8');
}

if (!fs.existsSync(ORDERS_FILE)) {
  const initialOrders = [
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
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(initialOrders, null, 2), 'utf-8');
}

// Helpers
function readSkins(): any[] {
  try {
    const raw = fs.readFileSync(SKINS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading skins file:', err);
    return DEFAULT_SKINS;
  }
}

function writeSkins(skins: any[]) {
  fs.writeFileSync(SKINS_FILE, JSON.stringify(skins, null, 2), 'utf-8');
}

function readOrders(): any[] {
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading orders file:', err);
    return [];
  }
}

function writeOrders(orders: any[]) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

// Admin Auth Configuration (Secret credentials: phantom / phantomGgWp)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'phantom';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'phantomGgWp';
const ACTIVE_SESSIONS = new Map<string, { username: string; expiresAt: number }>();

function generateToken(): string {
  return 'ps_adm_' + crypto.randomBytes(32).toString('hex');
}

function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация администратора' });
  }

  const token = authHeader.split(' ')[1];
  const session = ACTIVE_SESSIONS.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) ACTIVE_SESSIONS.delete(token);
    return res.status(401).json({ error: 'Сессия истекла или недействительна' });
  }

  // Extend session by 24h
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  next();
}

// API Routes

// 1. Admin Authentication
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Укажите логин и пароль' });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = generateToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    ACTIVE_SESSIONS.set(token, { username, expiresAt });
    return res.json({
      success: true,
      token,
      adminName: username,
      expiresAt
    });
  }

  return res.status(401).json({ error: 'Неверный логин или пароль администратора' });
});

app.get('/api/admin/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ authenticated: false });
  }
  const token = authHeader.split(' ')[1];
  const session = ACTIVE_SESSIONS.get(token);
  if (!session || session.expiresAt < Date.now()) {
    return res.json({ authenticated: false });
  }
  return res.json({ authenticated: true, username: session.username });
});

app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    ACTIVE_SESSIONS.delete(token);
  }
  return res.json({ success: true });
});

// 2. Skins CRUD
// Public list (or all if admin)
app.get('/api/skins', (req: Request, res: Response) => {
  const skins = readSkins();
  const isAdminView = req.query.admin === 'true';

  let hasValidAdminAuth = false;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = ACTIVE_SESSIONS.get(token);
    if (session && session.expiresAt > Date.now()) {
      hasValidAdminAuth = true;
    }
  }

  if (isAdminView && hasValidAdminAuth) {
    return res.json(skins);
  }

  // Non-admin: filter out hidden skins
  const publicSkins = skins.filter(s => !s.isHidden);
  return res.json(publicSkins);
});

app.get('/api/skins/:id', (req: Request, res: Response) => {
  const skins = readSkins();
  const skin = skins.find(s => s.id === req.params.id);
  if (!skin) {
    return res.status(404).json({ error: 'Скин не найден' });
  }
  return res.json(skin);
});

// Admin: Create Skin
app.post('/api/skins', verifyAdmin, (req: Request, res: Response) => {
  const {
    name,
    weapon,
    skinName,
    category,
    priceKzt,
    rarity,
    exterior,
    floatValue,
    patternSeed,
    description,
    imageUrl,
    isStatTrak,
    isSouvenir,
    stockCount,
  } = req.body;

  if (!name || !priceKzt || !category) {
    return res.status(400).json({ error: 'Пожалуйста, заполните обязательные поля: название, цену и категорию' });
  }

  const skins = readSkins();
  const newSkin = {
    id: 'skin-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    weapon: weapon?.trim() || name.split('|')[0]?.trim() || 'Оружие',
    skinName: skinName?.trim() || name.split('|')[1]?.trim() || name.trim(),
    category: category || 'rifles',
    priceKzt: Number(priceKzt) || 0,
    rarity: rarity || 'covert',
    exterior: exterior || 'Factory New',
    floatValue: typeof floatValue === 'number' ? floatValue : parseFloat(floatValue) || 0.05,
    patternSeed: patternSeed ? Number(patternSeed) : Math.floor(Math.random() * 999) + 1,
    description: description?.trim() || 'Эксклюзивный скин CS2 из каталога PHANTOM SKINS.',
    imageUrl: imageUrl?.trim() || '/src/assets/images/skin_butterfly_doppler_1793626931101.jpg',
    isStatTrak: Boolean(isStatTrak),
    isSouvenir: Boolean(isSouvenir),
    inStock: Number(stockCount) > 0,
    stockCount: Math.max(0, Number(stockCount) || 1),
    isHidden: false,
    tradeLockDays: 0,
    createdAt: new Date().toISOString()
  };

  skins.unshift(newSkin);
  writeSkins(skins);
  return res.status(201).json(newSkin);
});

// Admin: Update Skin
app.put('/api/skins/:id', verifyAdmin, (req: Request, res: Response) => {
  const skins = readSkins();
  const index = skins.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Скин не найден' });
  }

  const existing = skins[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id, // keep immutable id
    priceKzt: req.body.priceKzt !== undefined ? Number(req.body.priceKzt) : existing.priceKzt,
    stockCount: req.body.stockCount !== undefined ? Math.max(0, Number(req.body.stockCount)) : existing.stockCount,
    inStock: req.body.stockCount !== undefined ? Number(req.body.stockCount) > 0 : existing.inStock,
    updatedAt: new Date().toISOString()
  };

  skins[index] = updated;
  writeSkins(skins);
  return res.json(updated);
});

// Admin: Toggle visibility
app.patch('/api/skins/:id/visibility', verifyAdmin, (req: Request, res: Response) => {
  const skins = readSkins();
  const skin = skins.find(s => s.id === req.params.id);
  if (!skin) {
    return res.status(404).json({ error: 'Скин не найден' });
  }

  skin.isHidden = !skin.isHidden;
  writeSkins(skins);
  return res.json({ success: true, isHidden: skin.isHidden, skin });
});

// Admin: Delete Skin
app.delete('/api/skins/:id', verifyAdmin, (req: Request, res: Response) => {
  const skins = readSkins();
  const filtered = skins.filter(s => s.id !== req.params.id);
  if (filtered.length === skins.length) {
    return res.status(404).json({ error: 'Скин не найден' });
  }

  writeSkins(filtered);
  return res.json({ success: true });
});

// Admin: Reset to default skins
app.post('/api/admin/reset-skins', verifyAdmin, (req: Request, res: Response) => {
  writeSkins(DEFAULT_SKINS);
  return res.json({ success: true, count: DEFAULT_SKINS.length });
});

// 3. Orders API
// Public: Create Order
app.post('/api/orders', (req: Request, res: Response) => {
  const { steamTradeUrl, buyerEmail, buyerPhone, comment, items } = req.body;

  if (!steamTradeUrl || !steamTradeUrl.includes('steamcommunity.com/tradeoffer/new')) {
    return res.status(400).json({ error: 'Укажите корректный Steam Trade URL (ссылка на обмен)' });
  }

  if (!buyerEmail || !buyerEmail.includes('@')) {
    return res.status(400).json({ error: 'Укажите действительный адрес эл. почты' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Корзина пуста' });
  }

  const skins = readSkins();
  let totalAmountKzt = 0;
  const processedItems = [];

  for (const item of items) {
    const skin = skins.find(s => s.id === item.skinId);
    if (skin) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      totalAmountKzt += skin.priceKzt * qty;
      processedItems.push({
        skinId: skin.id,
        name: skin.name,
        weapon: skin.weapon,
        priceKzt: skin.priceKzt,
        quantity: qty,
        imageUrl: skin.imageUrl,
        exterior: skin.exterior,
        floatValue: skin.floatValue
      });

      // Decrease stock if available
      if (skin.stockCount !== undefined) {
        skin.stockCount = Math.max(0, skin.stockCount - qty);
        skin.inStock = skin.stockCount > 0;
      }
    }
  }

  writeSkins(skins);

  const orderId = 'PH-' + Math.floor(100000 + Math.random() * 900000);
  const botNumber = Math.floor(Math.random() * 8) + 1;
  const newOrder = {
    id: orderId,
    createdAt: new Date().toISOString(),
    steamTradeUrl: steamTradeUrl.trim(),
    buyerEmail: buyerEmail.trim().toLowerCase(),
    buyerPhone: buyerPhone?.trim() || '',
    comment: comment?.trim() || '',
    items: processedItems,
    totalAmountKzt,
    status: 'pending',
    tradeOfferId: 'TRADE-BOT-0' + botNumber + '#' + Math.floor(10000 + Math.random() * 90000),
    botName: 'Phantom Bot #0' + botNumber
  };

  const orders = readOrders();
  orders.unshift(newOrder);
  writeOrders(orders);

  return res.status(201).json({
    success: true,
    order: newOrder
  });
});

// Public: Track user orders by email or Steam Trade URL or ID
app.get('/api/orders/track', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim().toLowerCase();
  if (!query) {
    return res.json([]);
  }

  const orders = readOrders();
  const matched = orders.filter(o => 
    o.id.toLowerCase() === query ||
    o.buyerEmail.toLowerCase() === query ||
    o.steamTradeUrl.toLowerCase().includes(query)
  );

  return res.json(matched);
});

// Admin: List all orders
app.get('/api/orders', verifyAdmin, (req: Request, res: Response) => {
  const orders = readOrders();
  return res.json(orders);
});

// Admin: Update order status
app.patch('/api/orders/:id/status', verifyAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'trade_sent', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Неверный статус заказа' });
  }

  const orders = readOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  writeOrders(orders);

  return res.json({ success: true, order });
});

// Production or Vite Dev Integration
async function startServer() {
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PHANTOM SKINS] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
