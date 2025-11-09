import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { products } from './data/products';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';

// Lazy load halaman "Tentang"
const AboutPage = lazy(() => import('./components/AboutPage'));

// Helper untuk localStorage keranjang
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

// Simulasi “fetch” produk berdasarkan kata pencarian (anggap dari server)
const fetchProducts = async (term) => {
  const lower = term.toLowerCase().trim();
  if (!lower) return products;

  // simulasi delay 300ms
  await new Promise((r) => setTimeout(r, 300));

  // filter produk (logika pencarian sama seperti sebelumnya)
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.brand.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower)
  );
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState(() => loadCartFromStorage());
  const [view, setView] = useState('pos');

  // Simpan keranjang setiap kali berubah
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  // Gunakan React Query untuk caching otomatis
  const {
    data: filteredProducts = [],
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: () => fetchProducts(searchTerm),
    staleTime: 5 * 60 * 1000, // data tetap valid selama 5 menit
    cacheTime: 30 * 60 * 1000, // tetap tersimpan di cache selama 30 menit
  });

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

  // ===== UI =====
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', }}>
      <h1>🛒 Point of Sales (POS)</h1>

      {/* Navigasi sederhana */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setView('pos')}>POS</button>
        <button onClick={() => setView('about')} style={{ marginLeft: '10px' }}> Tentang </button>
      </div>

      {view === 'pos' ? (
        <>
          {/* Ringkasan keranjang */}
          <div style={{backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '6px', marginBottom: '20px', }} >
            <strong>Keranjang:</strong> {totalItems} item
          </div>

          {/* Search */}
          <SearchBar onSearch={setSearchTerm} />

          {/* Indikator cache/status query */}
          {isFetching ? (
            <small style={{ color: 'gray' }}>⏳ Memuat data...</small>
          ) : isSuccess && searchTerm ? (
            <small style={{ color: 'green' }}>
              ✅ Data diambil dari cache React Query
            </small>
          ) : null}

          {/* Daftar produk */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', marginTop: '10px', }} >
            <ProductList filteredProducts={filteredProducts}onAddToCart={handleAddToCart}/>
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