# Peta Persebaran Unit Kerja Kemenkes

Web app publik untuk menampilkan persebaran 222 unit kerja Kemenkes dalam filled map provinsi, dilengkapi filter, tabel detail, dan ekspor CSV/Excel.

Perilaku utama saat ini:

- Tabel daftar menampilkan kolom: `No`, `Unit Eselon I - Unit Kerja`, `Provinsi`, `Alamat`, `Aksi`.
- Kolom sumber tidak ditampilkan di tabel UI.
- Kolom sumber tetap tersedia di file export CSV/Excel.
- Pencarian menggunakan exact-word per kata kunci (contoh: `biro` tidak match `birobuli`).

## Stack

- Astro (static site)
- Tailwind CSS
- Leaflet (map)
- GSAP (motion)
- Bun (package manager)

## Arsitektur Frontend

Struktur utama:

```text
/
├── docs/
│   └── data_upt_kemenkes.xlsx         # sumber data mentah
├── scripts/
│   ├── build-data.mjs                 # transform xlsx -> json + geojson map
│   └── validate-data.mjs              # validasi kualitas/konsistensi data
├── public/
│   └── data/
│       └── provinces.geojson          # boundary map provinsi
├── src/
│   ├── data/
│   │   ├── units.json                 # data unit kerja siap pakai
│   │   └── metadata.json              # ringkasan/agregasi data
│   ├── pages/
│   │   └── index.astro                # layout dan markup utama
│   ├── scripts/
│   │   ├── dashboard.js               # state + orchestration UI
│   │   ├── dashboard-events.js        # binding event filter/export/sticky
│   │   ├── dashboard-export.js        # mapping data untuk CSV/XLSX
│   │   ├── dashboard-filters.js       # logika filter + search
│   │   ├── dashboard-map-selection.js # alur klik region peta -> patch state
│   │   ├── dashboard-presenters.js    # render statistik + label filter aktif
│   │   ├── map-view.js                # render map + legend + tooltip
│   │   ├── search-utils.js            # normalisasi & pencarian exact-word
│   │   └── table-view.js              # render tabel + pagination
│   └── styles/
│       └── global.css
└── package.json
```

Pembagian tanggung jawab:

- `dashboard.js` mengelola state utama dan urutan refresh.
- `dashboard-events.js` mengelola semua listener UI.
- `dashboard-filters.js` mengelola filter provinsi/eselon/mapRegion + pencarian.
- `dashboard-export.js` mengelola format kolom export.
- `dashboard-presenters.js` mengelola tampilan statistik dan ringkasan filter.
- `dashboard-map-selection.js` mengelola hasil klik region peta.
- `map-view.js` fokus pada map saja (fetch/cache geojson, warna provinsi, interaksi klik).
- `table-view.js` fokus pada tabel (render rows, empty state, pagination).

Prinsip performa yang dipakai:

- GeoJSON di-cache di memory (tidak fetch ulang tiap filter).
- `xlsx` di-load lazy saat tombol ekspor diklik.
- Search memakai debounce untuk menekan rerender berlebihan.
- Pagination menggunakan event delegation untuk menghindari listener berulang.
- Logika search exact-word dipisah ke util agar mudah ditest.

## Cara Menjalankan

```bash
bun install
bun run dev
```

Opsional (sesuai panduan proyek), jalankan dev server sebagai background process:

```bash
astro dev --background
astro dev status
astro dev logs
astro dev stop
```

Build production:

```bash
bun run build
```

Perintah `build` otomatis menjalankan:

1. `data:build` (generate data dari Excel)
2. `data:validate` (cek kualitas data)
3. `astro build`

## Cara Update Data (Workflow)

1. Edit data sumber di `docs/data_upt_kemenkes.xlsx`.
2. Jalankan generate data:

   ```bash
   bun run data:build
   ```

3. Jalankan validasi:

   ```bash
   bun run data:validate
   ```

4. Jalankan aplikasi lokal untuk review:

   ```bash
   bun run dev
   ```

5. Jika sudah sesuai, build final:

   ```bash
   bun run build
   ```

## Validasi Data yang Dicek

`scripts/validate-data.mjs` memeriksa:

- struktur file JSON/GeoJSON valid
- field wajib tiap unit terisi
- tidak ada duplikasi `id` dan `no`
- konsistensi total pada `metadata.json` vs `units.json`

## Testing

Jalankan unit test:

```bash
bun run test:unit
```

Cakupan test saat ini:

- `search-utils.test.js` untuk normalisasi dan exact-word matching.
- `dashboard-filters.test.js` untuk kombinasi filter utama.
- `dashboard-map-selection.test.js` untuk perilaku klik region peta.

## Catatan

- Koreksi data publik diarahkan lewat WhatsApp dari tombol "Laporkan".
- Beberapa provinsi pemekaran Papua masih berbagi geometri pada dataset boundary map saat ini.
