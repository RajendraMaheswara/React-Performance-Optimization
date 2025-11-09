// src/App.jsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { products } from './data/products';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import { getFromCache, setToCache } from './utils/searchCache';

// Lazy load halaman About
const AboutPage = lazy(() => import('./components/AboutPage'));

// Helper localStorage
const saveCartToStorage = (cart) => {
  localStorage.setItem('pos-cart', JSON.stringify(cart));
};
const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('pos-cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState(() => loadCartFromStorage());
  const [view, setView] = useState('pos'); // navigasi antar halaman
  const [cacheHit, setCacheHit] = useState(false); // <=== indikator cache

  // simpan cart setiap berubah
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  // 🔍 Fungsi pembantu dengan cache
  const filterProducts = (term) => {
    if (!term.trim()) {
      setCacheHit(false);
      return products;
    }

    const cacheKey = term.toLowerCase().trim();
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('🎯 Cache hit:', cacheKey);
      setCacheHit(true);
      return cached;
    }

    console.log('🔍 Cache miss:', cacheKey);
    setCacheHit(false);

    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(cacheKey) ||
        p.brand.toLowerCase().includes(cacheKey) ||
        p.category.toLowerCase().includes(cacheKey)
    );

    setToCache(cacheKey, filtered);
    return filtered;
  };

  // ⏱️ gunakan useMemo agar tidak filter ulang dalam render yang sama
  const filteredProducts = useMemo(() => filterProducts(searchTerm), [searchTerm]);

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // === UI ===
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🛒 Point of Sales (POS)</h1>

      {/* Navigasi */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setView('pos')}>POS</button>
        <button onClick={() => setView('about')} style={{ marginLeft: '10px' }}>
          Tentang
        </button>
      </div>

      {view === 'pos' ? (
        <>
          <div style={{ backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
            <strong>Keranjang:</strong> {totalItems} item
          </div>

          <SearchBar onSearch={setSearchTerm} />

          {/* indikator hasil cache */}
          {searchTerm && (
            <small style={{ color: cacheHit ? 'green' : 'gray' }}>
              {cacheHit ? '✅ Hasil dari cache' : '🔍 Hasil baru dihitung'}
            </small>
          )}

          <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <ProductList filteredProducts={filteredProducts} onAddToCart={handleAddToCart} />
          </div>
        </>
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <AboutPage />
        </Suspense>
      )}
    </div>
  );
}

export default App;