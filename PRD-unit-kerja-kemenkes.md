# PRD - Peta Persebaran Unit Kerja Kemenkes

## 1. Ringkasan

Peta Persebaran Unit Kerja Kemenkes adalah aplikasi web publik independen untuk membantu masyarakat melihat persebaran, jumlah, dan informasi dasar unit kerja Kementerian Kesehatan Republik Indonesia.

Produk menggunakan filled map berdasarkan provinsi. Pengguna dapat menyaring data berdasarkan provinsi dan Unit Eselon I, mencari unit kerja, melihat alamat, dan mengekspor hasil penyaringan ke CSV atau Excel.

Catatan: aplikasi ini bukan produk resmi pemerintah dan tidak berafiliasi dengan Kementerian Kesehatan RI.

## 2. Keputusan Produk

- Nama produk: **Peta Persebaran Unit Kerja Kemenkes**
- Platform deployment: Cloudflare Pages
- Framework: Astro
- UI styling: Tailwind CSS
- Motion and animation: GSAP (`https://gsap.com`)
- Sifat aplikasi: static web app, tanpa database
- Audiens: publik
- Cakupan data: 222 unit kerja resmi Kemenkes
- Visual geografis: filled map per provinsi
- Data alamat: boleh dipublikasikan
- Koreksi data: disampaikan pengguna melalui WhatsApp kepada pengelola
- Ekspor: mengikuti filter aktif
- Posisi produk: project pribadi independen (AI-assisted development / vibe coding)

## 3. Masalah

Informasi unit kerja Kemenkes tersebar dalam sumber yang berbeda dan sulit dipahami secara geografis. Pengguna publik membutuhkan cara yang lebih cepat untuk mengetahui:

- Berapa jumlah unit kerja di setiap provinsi
- Unit Eselon I apa saja yang memiliki unit kerja di suatu provinsi
- Nama dan alamat unit kerja tertentu
- Cara menyampaikan koreksi jika terdapat data yang tidak akurat

## 4. Tujuan

### Tujuan MVP

1. Menampilkan persebaran 222 unit kerja Kemenkes pada peta provinsi Indonesia.
2. Memungkinkan pengguna memfilter unit kerja berdasarkan provinsi dan Unit Eselon I.
3. Menampilkan daftar unit kerja beserta informasi organisasi, provinsi, dan alamat.
4. Memungkinkan pengguna mengekspor data sesuai filter aktif.
5. Menyediakan jalur koreksi data yang mudah melalui WhatsApp.

### Bukan tujuan MVP

- Menyediakan login atau akun pengguna.
- Menyediakan dashboard administrasi di dalam aplikasi publik.
- Mengubah data secara langsung dari browser.
- Menampilkan marker koordinat setiap unit kerja.
- Menyediakan analisis historis atau perbandingan antar-tahun.

## 5. Pengguna Sasaran

- Masyarakat umum
- Peneliti dan mahasiswa
- Jurnalis
- Organisasi masyarakat
- Pegawai atau mitra Kemenkes yang membutuhkan referensi persebaran unit kerja

## 6. User Stories

- Sebagai pengguna publik, saya ingin melihat jumlah unit kerja per provinsi agar dapat memahami persebarannya.
- Sebagai pengguna publik, saya ingin memilih provinsi agar hanya unit kerja pada provinsi tersebut yang ditampilkan.
- Sebagai pengguna publik, saya ingin memfilter berdasarkan Unit Eselon I agar dapat menemukan unit kerja dalam struktur tertentu.
- Sebagai pengguna publik, saya ingin mencari nama unit kerja tanpa harus menelusuri seluruh tabel.
- Sebagai pengguna publik, saya ingin melihat alamat unit kerja.
- Sebagai pengguna publik, saya ingin mengunduh hasil filter dalam format CSV atau Excel.
- Sebagai pengguna publik, saya ingin melaporkan alamat atau informasi yang salah melalui WhatsApp.

## 7. Ruang Lingkup MVP

### 7.1 Dashboard Ringkasan

Tampilkan kartu ringkasan:

- Total unit kerja: 222
- Total provinsi yang memiliki data
- Total Unit Eselon I
- Total alamat unik
- Tanggal pembaruan data

Angka ringkasan harus berubah mengikuti filter aktif jika secara teknis relevan. Label harus membedakan jumlah unit kerja dari jumlah lokasi/alamat unik karena beberapa unit dapat berbagi alamat yang sama.

### 7.2 Filled Map

- Menampilkan batas provinsi Indonesia sebagai GeoJSON.
- Warna provinsi menunjukkan jumlah unit kerja.
- Provinsi tanpa data tetap ditampilkan dengan warna netral.
- Tooltip menampilkan nama provinsi dan jumlah unit kerja.
- Klik provinsi menerapkan filter provinsi.
- Legend menjelaskan rentang warna.
- Peta tidak menggunakan koordinat unit kerja individual.

### 7.3 Filter dan Pencarian

Filter wajib:

- Provinsi
- Unit Eselon I

Fitur tambahan:

- Pencarian unit kerja (nama/alamat/eselon/provinsi/jenis unit)
- Pencarian menggunakan exact-word per kata kunci (contoh: `biro` tidak cocok dengan `birobuli`)
- Kata yang cocok ditampilkan dengan highlight pada tabel untuk memudahkan pemindaian
- Tombol reset filter
- Indikator jumlah hasil setelah filter diterapkan
- Filter diterapkan secara konsisten pada peta, ringkasan, tabel, dan ekspor
- State filter disimpan ke URL query agar bisa di-refresh/share tanpa kehilangan konteks

Parameter query yang digunakan:

- `provinsi`
- `eselon`
- `q` (search)
- `map` (region alias hasil klik peta)
- `size` (jumlah baris tabel: 10/20/50)
- `page` (halaman tabel)

### 7.4 Daftar Unit Kerja

Kolom pada daftar unit kerja:

- No
- Unit Eselon I - Unit Kerja
- Provinsi
- Alamat kantor
- Aksi (tautan pelaporan koreksi)

Catatan:

- Kolom sumber tidak ditampilkan pada tabel UI.
- Informasi sumber tetap tersedia pada hasil export CSV/Excel.
- Tabel menampilkan skeleton loading ringan pada render awal.

Tabel harus responsif pada perangkat mobile. Pada layar kecil, detail dapat ditampilkan dalam kartu atau expandable row.

### 7.5 Ekspor

Pengguna dapat mengekspor data yang sedang terlihat setelah filter aktif diterapkan.

- CSV
- Excel `.xlsx`

Ekspor harus menghormati:

- Filter provinsi
- Filter Unit Eselon I
- Kata pencarian
- Konteks tampilan tabel (`size` dan `page`) pada saat export dilakukan

Kolom export:

- No
- Unit Eselon I Unit Kerja
- Provinsi
- Alamat
- Sumber

Baris metadata export:

- Disisipkan di bagian atas file CSV/XLSX.
- Berisi disclaimer non-resmi, tanggal update data, dan ringkasan filter aktif.

Nama file disarankan menggunakan pola:

```text
unit-kerja-kemenkes-[tanggal]-filtered.csv
unit-kerja-kemenkes-[tanggal]-filtered.xlsx
```

### 7.6 Disclaimer dan Transparansi

- Tampilkan sticky banner disclaimer non-resmi di bagian atas halaman.
- Tampilkan card "Baca Sebelum Menggunakan Data" yang memuat konteks kualitas data dan batasan penggunaan.
- Tampilkan modal disclaimer saat kunjungan pertama (disimpan via localStorage).
- Tampilkan footer legal disclaimer permanen.
- Pesan disclaimer harus jelas bahwa aplikasi tidak bisa dijadikan rujukan administratif resmi.

### 7.7 Koreksi Data melalui WhatsApp

Setiap unit kerja memiliki tombol **Laporkan Koreksi** yang membuka WhatsApp dengan pesan terisi otomatis.

Nomor tujuan: `081315866766`

Pesan awal yang disarankan:

```text
Halo, saya ingin mengoreksi data Unit Kerja Kemenkes berikut:

Nama unit: [nama unit]
Provinsi: [provinsi]
Field yang perlu dikoreksi: [alamat/nama/sumber/lainnya]
Informasi yang benar: 
Sumber pendukung: 
```

Pengguna tetap mengirim pesan secara manual. Tidak ada data koreksi yang langsung mengubah data aplikasi.

## 8. Sumber dan Struktur Data

Workbook awal berada di `docs/data_upt_kemenkes.xlsx` dan memiliki dua sheet:

- `Detail UPT`
- `Peta UPT per Provinsi`

Untuk aplikasi, data harus ditransformasi menjadi data statis yang lebih eksplisit:

```text
data/units.json
data/provinces.geojson
data/metadata.json
```

Contoh record `units.json`:

```json
{
  "id": "unit-001",
  "name": "Poltekkes Kemenkes Bandung",
  "parentEselonI": "Ditjen SDM Kesehatan",
  "unitType": "Poltekkes",
  "address": "Jl. Pajajaran No. 56, Kota Bandung, Jawa Barat",
  "provinceCode": "32",
  "provinceName": "Jawa Barat",
  "sourceLabel": "Sumber resmi",
  "sourceUrl": "https://example.go.id",
  "verificationStatus": "needs_review"
}
```

Markdown digunakan untuk dokumentasi, metodologi, dan data dictionary. Markdown bukan format utama untuk data aplikasi. JSON digunakan oleh aplikasi karena mudah difilter dan diekspor di client-side.

## 9. Catatan Kualitas Data

Data awal memiliki karakteristik berikut:

- 222 baris unit kerja.
- 8 Unit Eselon I.
- 36 provinsi tercatat.
- 171 alamat unik.
- Beberapa unit kerja menggunakan alamat fisik yang sama.
- Terdapat sumber yang belum terverifikasi.
- Sebagian sumber berasal dari Wikipedia atau Instagram.
- Data belum memiliki latitude dan longitude.

Produk harus menampilkan tanggal pembaruan dan catatan bahwa data dapat berubah. Data dengan status belum diverifikasi tidak boleh ditampilkan seolah-olah sudah dikonfirmasi sepenuhnya.

Sebelum publikasi, pengelola perlu mengonfirmasi apakah dua provinsi yang belum muncul pada dataset memang tidak memiliki unit kerja atau belum tercakup dalam data.

## 10. Arsitektur Teknis

- Astro untuk halaman dan komponen UI.
- Tailwind CSS untuk styling, layout responsif, design tokens, dan state visual.
- GSAP untuk animasi antarmuka yang membutuhkan sequencing, timeline, atau transisi yang lebih kaya.
- Cloudflare Pages untuk hosting dan deployment.
- JSON statis sebagai sumber data aplikasi.
- GeoJSON statis untuk batas provinsi.
- MapLibre GL JS atau Leaflet untuk peta.
- Library client-side seperti SheetJS untuk ekspor Excel.
- CSV dibuat dari data hasil filter di browser.
- Tidak ada database pada MVP.
- Tidak ada server-side mutation pada MVP.

### Pedoman Animasi

Animasi digunakan untuk memperjelas perubahan konteks dan memberikan feedback, bukan sebagai dekorasi pada setiap elemen.

- Animasi masuk ringan untuk kartu ringkasan, panel filter, dan tabel saat halaman pertama dimuat.
- Transisi halus ketika filter mengubah jumlah hasil dan warna filled map.
- Animasi tooltip atau detail provinsi saat pengguna berinteraksi dengan peta.
- Animasi panel filter yang singkat dan interruptible pada mobile.
- Hindari animasi berulang, parallax, atau gerakan besar yang mengganggu pembacaan data.
- Hormati `prefers-reduced-motion: reduce` dengan mematikan atau mempersingkat animasi.
- Jangan menganimasikan angka secara berlebihan sampai mengurangi keterbacaan atau memperlambat akses informasi.
- Animasi tidak boleh menjadi satu-satunya cara untuk menyampaikan perubahan status.

GSAP sebaiknya digunakan pada komponen interaktif yang memang membutuhkan kontrol timeline atau koordinasi beberapa elemen. Transisi sederhana tetap menggunakan CSS/Tailwind agar bundle dan kompleksitas tetap rendah.

Pipeline pembaruan data yang disarankan:

1. Edit dan verifikasi workbook sumber.
2. Jalankan transformasi workbook ke JSON.
3. Jalankan validasi data.
4. Tinjau perubahan.
5. Deploy ke Cloudflare Pages.

## 11. Persyaratan Non-Fungsional

- Dapat digunakan pada desktop dan mobile.
- Peta tetap dapat digunakan pada layar kecil.
- Pendekatan responsive bersifat mobile-first, bukan sekadar mengecilkan layout desktop.
- Pada mobile, filter dapat dibuka sebagai bottom sheet atau panel penuh yang mudah ditutup.
- Tabel dapat berubah menjadi kartu atau expandable row tanpa kehilangan field penting.
- Tidak ada horizontal scrolling pada halaman utama; jika tabel membutuhkan overflow, overflow hanya berada di area tabel.
- Kontrol peta, filter, ekspor, dan tombol koreksi memiliki target sentuh yang nyaman.
- Waktu muat awal rendah dengan data dan asset yang dikompresi.
- Tidak memerlukan login.
- Tidak menyimpan data pribadi pengguna dalam aplikasi.
- Memiliki aksesibilitas dasar: keyboard navigation, kontras memadai, label kontrol, dan alternatif tabel untuk informasi peta.
- Mendukung `prefers-reduced-motion` dan tetap usable tanpa animasi.
- Peta menyediakan catatan atribusi untuk sumber boundary dan tile provider.
- Halaman menampilkan disclaimer non-resmi secara jelas pada area yang mudah terlihat.

## 12. Kriteria Penerimaan MVP

- Halaman publik dapat dibuka melalui Cloudflare Pages.
- Peta Indonesia menampilkan seluruh provinsi dalam GeoJSON.
- Jumlah seluruh unit kerja pada kondisi awal adalah 222.
- Filter provinsi mengubah peta, ringkasan, tabel, dan hasil ekspor.
- Filter Unit Eselon I mengubah peta, ringkasan, tabel, dan hasil ekspor.
- Pencarian unit kerja (exact-word per kata kunci) bekerja bersama filter lain.
- Keyword pencarian yang cocok tampil dengan highlight pada tabel.
- Tooltip peta menampilkan jumlah unit per provinsi.
- Tabel menampilkan No, Unit Eselon I - Unit Kerja, provinsi, alamat, dan aksi.
- CSV yang diunduh hanya berisi data sesuai filter aktif.
- Excel yang diunduh hanya berisi data sesuai filter aktif.
- CSV/XLSX menyisipkan baris metadata disclaimer + ringkasan filter aktif.
- URL query menyimpan state filter (`provinsi`, `eselon`, `q`, `map`, `size`, `page`) agar bisa di-share.
- Tombol koreksi membuka WhatsApp dengan nomor tujuan dan pesan terisi.
- Tanggal pembaruan dan catatan kualitas data terlihat oleh pengguna.
- Aplikasi dapat digunakan pada viewport mobile.

## 13. Roadmap Setelah MVP

### Fase 2

- Filter jenis unit kerja.
- Detail halaman per provinsi.
- Status verifikasi yang lebih terstruktur.
- Riwayat pembaruan data.
- Validasi URL sumber secara otomatis.

### Fase 3

- Koordinat lokasi resmi dan marker individual.
- Pencarian berdasarkan kabupaten/kota.
- Peta kepadatan lokasi.
- Perbandingan data antar-periode.
- Form koreksi terstruktur dengan workflow review.

## 14. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Data unit kerja tercampur dengan definisi UPT | Gunakan istilah Unit Kerja dan dokumentasikan definisi data |
| Alamat berubah | Sediakan tanggal pembaruan dan tombol koreksi WhatsApp |
| Sumber tidak resmi atau belum diverifikasi | Tampilkan indikator kualitas data dan sertakan sumber pada hasil export |
| Nama provinsi tidak cocok dengan GeoJSON | Gunakan kode provinsi sebagai key utama |
| Pengguna menganggap jumlah unit sama dengan jumlah lokasi | Tampilkan metrik unit kerja dan alamat unik secara terpisah |
| WhatsApp tidak tersedia di perangkat pengguna | Tampilkan nomor dan pesan koreksi sebagai alternatif |
| Data berkembang melebihi kebutuhan static app | Evaluasi database atau CMS hanya jika volume dan frekuensi pembaruan meningkat |

## 15. Definisi Selesai

MVP dianggap selesai ketika seluruh kriteria penerimaan terpenuhi, 222 record telah divalidasi terhadap sumber kerja, peta dapat menampilkan data per provinsi, ekspor mengikuti filter aktif, dan alur pelaporan koreksi melalui WhatsApp telah diuji di desktop serta mobile.

## 16. Rekomendasi Tambahan

- Gunakan kode provinsi sebagai identifier utama, bukan nama provinsi, untuk mencegah masalah perbedaan penulisan.
- Tambahkan script validasi pada proses build untuk memastikan jumlah record, field wajib, duplikasi ID, provinsi yang tidak dikenali, dan URL sumber.
- Tambahkan automated test untuk kombinasi filter, perhitungan jumlah, CSV, dan Excel agar hasil ekspor tidak berbeda dari data yang terlihat.
- Gunakan GSAP hanya untuk interaksi yang membutuhkan timeline atau koordinasi beberapa elemen. Gunakan CSS/Tailwind untuk transisi sederhana.
- Tetapkan durasi dan easing animasi sebagai design tokens agar motion konsisten.
- Pastikan peta memiliki atribusi yang terlihat untuk sumber GeoJSON dan tile provider serta memeriksa lisensinya sebelum deployment.
- Pertimbangkan privacy-friendly analytics hanya setelah MVP stabil dan jika memang dibutuhkan untuk memahami penggunaan publik.
- Gunakan URL WhatsApp format internasional (`https://wa.me/6281315866766`) pada tombol agar konsisten di desktop dan mobile.
- Simpan workbook sumber dan hasil JSON dalam version control agar setiap perubahan data dapat dilacak.
- Tambahkan halaman atau panel "Tentang Data" yang menjelaskan definisi unit kerja, tanggal pembaruan, metode verifikasi, dan keterbatasan dataset.

## 17. Prinsip Anti-AI-Slop

Antarmuka harus terasa seperti produk data publik yang dirancang dengan sengaja, bukan template dashboard generik yang diisi otomatis. Prinsip ini menjadi bagian dari acceptance review visual.

- Gunakan hierarki informasi yang jelas: peta dan pertanyaan "di mana unit kerja berada?" menjadi fokus utama, bukan kumpulan kartu dekoratif.
- Gunakan tipografi, spacing, warna, dan iconography yang konsisten serta memiliki alasan fungsional.
- Bangun identitas visual yang tenang, institusional, dan informatif; hindari meniru dashboard SaaS generik.
- Hindari hero section besar dengan headline kosong, gradient berlebihan, glassmorphism dekoratif, neon glow, blob abstrak, dan kartu dengan shadow berat jika tidak membantu pemahaman data.
- Jangan menambahkan animasi hanya untuk membuat halaman terlihat hidup. Setiap animasi harus menjelaskan perubahan state, hubungan spasial, atau memberi feedback.
- Hindari penggunaan terlalu banyak rounded card, badge, icon, dan angka besar yang membuat semua elemen memiliki bobot visual sama.
- Jangan menggunakan emoji sebagai icon UI utama. Gunakan icon yang konsisten dan memiliki label atau tooltip yang sesuai.
- State loading, empty, error, dan filtered harus dirancang secara eksplisit, bukan hanya menampilkan spinner generik.
- Tampilkan data nyata sedini mungkin pada halaman; jangan memenuhi area awal dengan placeholder yang tidak informatif.
- Pastikan desain tetap memiliki karakter saat seluruh animasi dimatikan.
- Review visual harus dilakukan pada desktop, tablet, dan mobile dengan data nyata sebelum dianggap selesai.

### Arah Visual yang Direkomendasikan

- Layout editorial-data: judul singkat, konteks pembaruan, peta sebagai kanvas utama, lalu filter dan daftar sebagai alat eksplorasi.
- Warna peta menggunakan skala sequential yang memiliki kontras cukup dan tidak bergantung pada warna merah-hijau saja.
- Warna aksen digunakan secara hemat untuk aksi, status, dan highlight provinsi aktif.
- Gunakan border, whitespace, dan alignment untuk membentuk struktur; jangan mengandalkan shadow dan gradient.
- Animasi masuk dibuat singkat dan tidak menghalangi pengguna membaca atau berinteraksi.
