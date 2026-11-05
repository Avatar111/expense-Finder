import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'users_db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2), 'utf-8');
  }
}

function readDB() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading db:', e);
    return { users: {} };
  }
}

function writeDB(data) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password + '_salt_expense_finder_2026').digest('hex');
}

export function getUserByPhone(phone) {
  const db = readDB();
  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  return db.users[cleanPhone] || null;
}

export function registerUser({ phone, password, name, initialTransactions = [] }) {
  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error('സാധുവായ 10 അക്ക ഫോൺ നമ്പർ നൽകുക (Please provide a valid 10-digit phone number)');
  }
  if (!password || password.length < 4) {
    throw new Error('പാസ്‌വേർഡിന് കുറഞ്ഞത് 4 അക്ഷരങ്ങൾ വേണം (Password must be at least 4 characters)');
  }

  const db = readDB();
  if (db.users[cleanPhone]) {
    throw new Error('ഈ ഫോൺ നമ്പർ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്. ലോഗിൻ ചെയ്യുക (Phone number already registered. Please login)');
  }

  const user = {
    phone: cleanPhone,
    name: (name || 'ഉപയോക്താവ് (User)').trim(),
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
    transactions: initialTransactions,
  };

  db.users[cleanPhone] = user;
  writeDB(db);

  return {
    phone: user.phone,
    name: user.name,
    createdAt: user.createdAt,
    transactions: user.transactions,
  };
}

export function loginUser({ phone, password }) {
  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error('സാധുവായ 10 അക്ക ഫോൺ നമ്പർ നൽകുക (Please provide a valid 10-digit phone number)');
  }

  const db = readDB();
  const user = db.users[cleanPhone];
  if (!user) {
    throw new Error('ഈ ഫോൺ നമ്പറിൽ അക്കൗണ്ട് കണ്ടെത്തിയില്ല. രജിസ്റ്റർ ചെയ്യുക (No account found for this phone number. Please register)');
  }

  const testHash = hashPassword(password);
  if (user.passwordHash !== testHash) {
    throw new Error('പാസ്‌വേർഡ് തെറ്റാണ് (Incorrect password)');
  }

  return {
    phone: user.phone,
    name: user.name,
    createdAt: user.createdAt,
    transactions: user.transactions || [],
  };
}

export function syncUserTransactions(phone, transactions) {
  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  const db = readDB();
  if (!db.users[cleanPhone]) {
    throw new Error('User not found');
  }

  db.users[cleanPhone].transactions = transactions;
  db.users[cleanPhone].updatedAt = Date.now();
  writeDB(db);
  return { success: true, count: transactions.length };
}

export function getUserTransactions(phone) {
  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  const db = readDB();
  const user = db.users[cleanPhone];
  if (!user) return [];
  return user.transactions || [];
}
