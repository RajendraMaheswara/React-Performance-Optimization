// src/utils/searchCache.js
const CACHE_KEY = 'pos-search-cache';
const MAX_CACHE_SIZE = 50;
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

// ---- Helper: ubah Map -> Array untuk disimpan ----
function mapToArray(map) {
  return Array.from(map.entries()).map(([key, value]) => ({
    key,
    data: value.data,
    timestamp: value.timestamp,
  }));
}

// ---- Helper: ubah Array -> Map saat dimuat ----
function arrayToMap(arr) {
  const map = new Map();
  if (!Array.isArray(arr)) return map;

  for (const item of arr) {
    if (Date.now() - item.timestamp <= CACHE_TTL) {
      map.set(item.key, {
        data: item.data,
        timestamp: item.timestamp,
      });
    }
  }
  return map;
}

// ---- Muat cache dari localStorage saat modul ini pertama kali dijalankan ----
let searchCache = new Map();
try {
  const saved = localStorage.getItem(CACHE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    searchCache = arrayToMap(parsed);
  }
} catch (e) {
  console.warn('Gagal memuat cache dari localStorage:', e);
}

// ---- Simpan cache ke localStorage setiap ada perubahan ----
function persistCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(mapToArray(searchCache)));
  } catch (e) {
    console.warn('Gagal menyimpan cache ke localStorage:', e);
  }
}

// ---- Fungsi publik ----
export const getFromCache = (key) => {
  if (!searchCache.has(key)) return null;

  const entry = searchCache.get(key);
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    searchCache.delete(key);
    persistCache(); // hapus data expired
    return null;
  }

  return entry.data;
};

export const setToCache = (key, data) => {
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchCache.keys().next().value;
    searchCache.delete(firstKey);
  }

  searchCache.set(key, {
    data,
    timestamp: Date.now(),
  });

  persistCache(); // langsung simpan perubahan
};