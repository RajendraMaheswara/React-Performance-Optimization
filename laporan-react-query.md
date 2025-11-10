# Laporan Praktikum: Implementasi React Query

---

#### Nama: Rajendra Agra Farrel Maheswara
#### NIM: V3424070
#### Mata Kuliah: Pemrograman Frontend

---

## 1. Analisis Performa Berdasarkan Screenshot DevTools

### **Praktik 01 - Base Optimization (Memoization + Virtualization)**
<img width="1920" height="1080" alt="Screenshot 2025-11-10 183744" src="https://github.com/user-attachments/assets/6beff4f8-639e-4446-8d0f-9b49f4120a5f" />
- **ProductList render time:** 0.5ms - 1.2ms (24.8ms - 27.9ms total)
- **Karakteristik:**
  - Menggunakan React.memo pada ProductRow
  - Implementasi react-window untuk virtualisasi
  - Debouncing pada SearchBar
  - Render hanya komponen yang visible

---

### **Praktik 02 - localStorage Integration**
<img width="1920" height="1080" alt="Screenshot 2025-11-10 183918" src="https://github.com/user-attachments/assets/42602fb0-d2ca-46a8-909a-38b5ba6f9f1a" />
- **ProductList render time:** 0.4ms - 1.3ms (24.1ms - 20.9ms total)
- **Karakteristik:**
  - Ditambah persistensi keranjang di localStorage
  - Performa rendering tetap stabil
  - Tidak ada penurunan performa signifikan

---

### **Praktik 03 - Custom Cache dengan localStorage**
<img width="1920" height="1080" alt="Screenshot 2025-11-10 184733" src="https://github.com/user-attachments/assets/3bbe070f-26b7-4d47-b4bf-edde3cc4e822" />
- **ProductList render time:** 0.4ms - 1.8ms (19.5ms - 9.1ms total)
- **Fitur Cache Hit:**
  - Console menunjukkan "Cache hit: makanan" 
  - UI menampilkan "✅ Hasil dari cache"
  - Waktu render menurun drastis saat cache hit

---

### **React Query Implementation**
<img width="1920" height="1080" alt="Screenshot 2025-11-10 185029" src="https://github.com/user-attachments/assets/7c0ebcbc-27e4-4bee-b105-e8885fbac6eb" />
- **ProductList render time:** 0.6ms - 1s (24.1ms - 10.1ms total)
- **Fitur React Query:**
  - Console: "Cache hit: makanan" (otomatis dari React Query)
  - Tidak perlu manual cache management
  - Stale time dan cache time otomatis dikelola
  - Background refetching untuk data freshness

---

## 2. Perbandingan Waktu Respons

| Praktikum | Initial Load | Filter (No Cache) | Filter (Cache Hit) | Cache Management |
|-----------|--------------|-------------------|-------------------|------------------|
| **Praktik 01** | 24.8ms | 27.9ms | - | Manual (useMemo) |
| **Praktik 02** | 24.1ms | 20.9ms | - | localStorage manual |
| **Praktik 03** | 19.5ms | 9.1ms | **<5ms** | Custom cache + localStorage |
| **React Query** | 24.1ms | 10.1ms | **<3ms** | **Automatic & Intelligent** |

---

## 3. Bagaimana React Query Mengelola Cache?

Dari hasil praktikum, saya melihat bahwa React Query mengelola cache secara otomatis dengan cara:

### **Cache Otomatis**
React Query langsung menyimpan hasil pencarian tanpa perlu kita tulis kode sendiri. Ketika saya mencari "makanan" lalu mencari lagi, hasilnya langsung muncul dari cache.

```javascript
// React Query otomatis membuat cache berdasarkan key
useQuery(['products', searchTerm], () => fetchProducts(searchTerm))
```

### **Data Tetap Fresh**
Yang menarik, data di cache tetap diperbarui di background. Jadi user tetap lihat data lama dulu (cepat), tapi aplikasi tetap cek data terbaru di belakang layar.

### **Pembersihan Otomatis**
Cache yang tidak dipakai akan otomatis dihapus, jadi tidak bikin browser berat. Berbeda dengan custom cache yang saya buat di Praktik 03, dimana saya harus atur sendiri kapan cache dihapus.

---

## 4. Keuntungan React Query vs Custom Cache

### **React Query:**
✅ Tidak perlu banyak koding - tinggal pakai  
✅ Cache otomatis tersimpan dan dikelola  
✅ Ada loading dan error state bawaan  
✅ Data bisa auto-refresh di background  
✅ Ada DevTools untuk debugging  

### **Custom Cache (Praktik 03):**
⚠️ Harus nulis semua kode sendiri  
⚠️ Kalau lupa hapus cache, bisa bikin memori penuh  
⚠️ Harus handle error manual  
⚠️ Tidak ada fitur auto-refresh  

**Kesimpulan saya:** React Query jauh lebih praktis untuk project sebenarnya. Custom cache bagus untuk belajar, tapi untuk aplikasi beneran lebih baik pakai library yang sudah teruji.

---

## 5. Apakah Cache/localStorage Membuat Aplikasi Lebih Baik? Kenapa?

### **Ya, Sangat Membantu!** ✅

Berdasarkan percobaan saya:

**1. Aplikasi Jadi Lebih Cepat**
- Tanpa cache: filter 10.000 produk butuh 27.9ms setiap kali
- Dengan cache: cuma butuh <5ms (hampir 6x lebih cepat!)
- User tidak perlu menunggu lama

**2. Hemat Proses Perhitungan**
- Kalau user cari "makanan" 2 kali, tidak perlu filter ulang
- Hasil sudah tersimpan, tinggal ambil

**3. Data Tidak Hilang Saat Refresh**
- Dengan localStorage, keranjang belanja tetap ada setelah refresh
- Sangat berguna untuk user experience

**4. Aplikasi Terasa Lebih Smooth**
- Tidak ada loading berulang-ulang
- Pencarian terasa instant

---

## 6. Metrics Summary

| Metric | Sebelum Optimasi | Setelah React Query | Peningkatan |
|--------|------------------|---------------------|-------------|
| Initial Load | 24.8ms | 24.1ms | 3% lebih cepat |
| Filter pertama kali | 27.9ms | 10.1ms | 64% lebih cepat |
| Filter dengan cache | 27.9ms | <3ms | **89% lebih cepat** |
| Kompleksitas Kode | Tinggi | Rendah | Lebih mudah maintain |

**Hasil percobaan menunjukkan bahwa menggunakan cache (baik custom maupun React Query) sangat meningkatkan performa aplikasi, terutama untuk aplikasi dengan data yang banyak.**

---
