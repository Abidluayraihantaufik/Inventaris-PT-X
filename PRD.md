# Product Requirement Document (PRD)

## Sistem Manajemen Inventaris PT Maskitani

**Versi:** 1.1\
**Status:** Ready for Development\
**Tanggal:** 1 September 2026\
**Platform:** Web Application (Desktop & Tablet)\
**Frontend:** React.js + Vite + Tailwind CSS\
**Backend:** Laravel REST API\
**Database:** MySQL (XAMPP)

------------------------------------------------------------------------

## 1. Ringkasan Produk

### 1.1 Latar Belakang

PT Maskitani merupakan perusahaan yang bergerak di bidang agrokimia.
Produk yang dikelola dapat berupa herbisida, fungisida, insektisida,
pupuk, perekat, dan produk sejenis.

Karakteristik produk agrokimia membutuhkan pencatatan yang lebih
terstruktur karena setiap stok dapat memiliki:

-   nomor batch;
-   tanggal masuk;
-   tanggal kadaluarsa;
-   supplier/PT asal;
-   jumlah dan satuan;
-   lokasi penyimpanan di gudang.

Sistem ini dibuat untuk membantu proses pencatatan, pemantauan,
pengeluaran, dan audit stok secara terpusat.

### 1.2 Permasalahan

Permasalahan utama yang ingin diselesaikan:

1.  Pencatatan stok secara manual berisiko menimbulkan human error.
2.  Stok fisik dapat berbeda dengan data administrasi.
3.  Barang yang mendekati kadaluarsa sulit dipantau secara cepat.
4.  Lokasi penyimpanan barang sulit ditemukan tanpa pencatatan terpusat.
5.  Pengeluaran barang belum memiliki mekanisme prioritas berdasarkan
    tanggal kadaluarsa.
6.  Riwayat barang masuk dan keluar sulit ditelusuri untuk kebutuhan
    audit.

### 1.3 Tujuan

Sistem bertujuan untuk:

1.  Mendigitalisasi pengelolaan inventaris PT Maskitani.
2.  Mencatat stok berdasarkan produk dan batch.
3.  Menampilkan lokasi penyimpanan setiap batch.
4.  Memberikan peringatan barang mendekati kadaluarsa.
5.  Menerapkan metode FEFO (First Expired, First Out) pada proses barang
    keluar.
6.  Membantu petugas gudang mencari barang dengan cepat.
7.  Menyediakan riwayat transaksi untuk kebutuhan monitoring dan audit.

### 1.4 Ruang Lingkup

**Termasuk dalam versi awal:**

-   Login, registrasi, dan lupa password.
-   Dashboard admin.
-   Dashboard user gudang/lapangan.
-   Master produk dan kategori.
-   Pencatatan barang masuk/batch.
-   Monitoring stok.
-   Barang keluar.
-   Rekomendasi batch berdasarkan FEFO.
-   Riwayat transaksi.
-   Stock opname.
-   Kelola pengguna oleh admin.
-   Cetak surat jalan/bukti pengeluaran.

**Di luar scope versi awal:**

-   Pembelian/purchase order.
-   Akuntansi dan pembukuan.
-   Integrasi ERP eksternal.
-   Integrasi barcode scanner khusus.
-   Integrasi supplier secara otomatis.

------------------------------------------------------------------------

## 2. Pengguna dan Hak Akses

Sistem memiliki dua role utama: **Admin** dan **User**.

### 2.1 Admin

Admin memiliki akses penuh terhadap sistem dan bertanggung jawab
terhadap pengelolaan data.

Hak akses:

-   melihat dashboard;
-   melihat seluruh stok;
-   menambah, mengubah, dan menghapus data barang;
-   mengelola batch dan lokasi penyimpanan;
-   memproses barang keluar;
-   melihat riwayat transaksi;
-   melakukan audit dan rekonsiliasi stock opname;
-   mengelola pengguna;
-   menyetujui akun baru;
-   mengaktifkan/nonaktifkan akun;
-   mencetak surat jalan.

### 2.2 User Gudang/Lapangan

User berfokus pada aktivitas operasional.

Hak akses:

-   melihat dashboard operasional;
-   mencari produk dan lokasi rak;
-   melihat jumlah stok;
-   melihat informasi batch;
-   membuat atau mencatat permintaan barang keluar;
-   melakukan konfirmasi pengambilan barang;
-   melakukan stock opname;
-   melihat riwayat transaksi yang relevan;
-   mencetak bukti pengeluaran apabila diberikan hak akses.

### 2.3 Matriks Hak Akses

  Modul                 Admin                User
  --------------------- -------------------- ------------------------------
  Login                 Ya                   Ya
  Registrasi            Ya                   Ya
  Lupa Password         Ya                   Ya
  Dashboard             Penuh                Ringkasan operasional
  Lihat Stok            Ya                   Ya
  Tambah Barang/Batch   Ya                   Tidak
  Edit Barang/Batch     Ya                   Tidak
  Hapus Barang/Batch    Ya                   Tidak
  Barang Keluar         Ya                   Ya, sesuai alur
  FEFO                  Otomatis             Mengikuti rekomendasi sistem
  Stock Opname          Audit/Rekonsiliasi   Input stok fisik
  Riwayat Transaksi     Penuh                Terbatas
  Kelola User           Ya                   Tidak
  Approve User          Ya                   Tidak
  Cetak Surat Jalan     Ya                   Sesuai hak akses
  Logout                Ya                   Ya

------------------------------------------------------------------------

## 3. Alur Bisnis Utama

### 3.1 Alur Login

1.  Pengguna membuka halaman login.
2.  Pengguna memasukkan username/email dan password.
3.  Sistem melakukan validasi.
4.  Jika valid, sistem memeriksa role pengguna.
5.  Sistem mengarahkan pengguna ke dashboard sesuai role.
6.  Jika akun berstatus pending/inactive, pengguna tidak dapat mengakses
    sistem.

### 3.2 Alur Barang Masuk

1.  Admin menerima informasi barang dari supplier.
2.  Admin membuka menu **Tambah Barang**.
3.  Admin memilih atau membuat produk.
4.  Admin memasukkan data batch.
5.  Sistem melakukan validasi tanggal dan jumlah.
6.  Data batch disimpan.
7.  Stok bertambah sesuai jumlah yang dimasukkan.
8.  Batch langsung dapat dipantau pada daftar inventaris.

**Data minimum:**

-   Nama produk
-   Kategori
-   Nomor batch
-   Tanggal masuk
-   Tanggal kadaluarsa
-   Supplier/PT asal
-   Jumlah
-   Satuan
-   Lokasi penyimpanan
-   Catatan

### 3.3 Alur Barang Keluar

1.  User/Admin memilih produk.
2.  Sistem menampilkan batch yang tersedia.
3.  Sistem mengurutkan batch berdasarkan tanggal kadaluarsa terdekat.
4.  Sistem memberikan rekomendasi batch FEFO.
5.  Pengguna memasukkan jumlah yang akan dikeluarkan.
6.  Sistem memvalidasi ketersediaan stok.
7.  Jika valid, stok batch dikurangi.
8.  Transaksi disimpan ke riwayat.
9.  Sistem dapat menghasilkan surat jalan/bukti pengeluaran.

### 3.4 Aturan FEFO

FEFO berarti **First Expired, First Out**.

Ketika produk memiliki beberapa batch, sistem harus memprioritaskan
batch dengan tanggal kadaluarsa paling dekat.

Contoh:

  Batch   Expired         Stok Prioritas
  ------- ------------ ------- -----------
  A-001   15-09-2026      40 L 1
  A-002   20-12-2026      80 L 2
  A-003   15-03-2027     100 L 3

Jika pengguna mengeluarkan 20 L, sistem merekomendasikan **Batch
A-001**.

### 3.5 Alur Stock Opname

1.  Petugas memilih lokasi/rak.
2.  Sistem menampilkan stok menurut data sistem.
3.  Petugas menghitung stok fisik.
4.  Petugas memasukkan jumlah fisik.
5.  Sistem menghitung selisih.
6.  Jika terdapat selisih, sistem menandainya untuk pemeriksaan.
7.  Admin melakukan rekonsiliasi apabila diperlukan.
8.  Hasil stock opname disimpan sebagai riwayat.

------------------------------------------------------------------------

## 4. Kebutuhan Fungsional

### 4.1 Autentikasi

**FR-AUTH-01 --- Login**

Sistem harus menyediakan login menggunakan username/email dan password.

**FR-AUTH-02 --- Registrasi**

Sistem harus menyediakan pendaftaran akun baru dengan:

-   nama lengkap;
-   username;
-   email;
-   password;
-   divisi/unit.

Akun baru berstatus `pending` sampai disetujui admin.

**FR-AUTH-03 --- Lupa Password**

Sistem menyediakan mekanisme reset password melalui email terdaftar.

**FR-AUTH-04 --- Logout**

Sistem harus mengakhiri sesi pengguna secara aman.

------------------------------------------------------------------------

### 4.2 Dashboard Admin

Dashboard admin harus menampilkan:

1.  Total stok.
2.  Barang masuk bulan berjalan.
3.  Barang keluar bulan berjalan.
4.  Jumlah batch mendekati kadaluarsa.
5.  Jumlah stok rendah.
6.  Grafik stok berdasarkan kategori.
7.  Grafik tren barang masuk dan keluar.
8.  Monitoring batch dengan tanggal kadaluarsa terdekat.
9.  Shortcut menuju modul yang sering digunakan.

### 4.3 Dashboard User

Dashboard user harus lebih sederhana dan berorientasi operasional.

Komponen:

-   pencarian barang;
-   pencarian lokasi rak;
-   stok yang tersedia;
-   daftar tugas/pengeluaran;
-   alert barang yang perlu diprioritaskan;
-   shortcut stock opname;
-   transaksi terbaru.

### 4.4 Master Produk

Admin dapat:

-   melihat produk;
-   menambah produk;
-   mengubah produk;
-   menghapus produk jika tidak memiliki transaksi yang mengikat;
-   menentukan kategori;
-   menentukan satuan.

Kategori awal dapat berupa:

-   Herbisida
-   Fungisida
-   Insektisida
-   Pupuk
-   Perekat
-   Lainnya

### 4.5 Inventaris dan Batch

Setiap batch menyimpan:

-   produk;
-   kategori;
-   nomor batch;
-   supplier/PT asal;
-   tanggal masuk;
-   tanggal kadaluarsa;
-   jumlah stok;
-   satuan;
-   lokasi simpan;
-   catatan.

Sistem harus menyediakan pencarian dan filter berdasarkan:

-   nama produk;
-   kategori;
-   nomor batch;
-   supplier;
-   lokasi;
-   status kadaluarsa.

### 4.6 Alert Kadaluarsa

Sistem menggunakan tiga tingkat status:

  Status      Kondisi                  Tampilan
  ----------- ------------------------ ----------
  Aman        \> 60 hari               Normal
  Perhatian   30--60 hari              Warning
  Kritis      \< 30 hari               Critical
  Expired     Sudah melewati tanggal   Expired

Batas tersebut dapat dibuat configurable pada backend.

### 4.7 Alert Stok Rendah

Sistem dapat memberikan peringatan ketika stok suatu produk berada di
bawah batas minimum.

Batas minimum dapat disimpan sebagai konfigurasi produk atau kategori.

### 4.8 Barang Keluar

Form barang keluar minimal berisi:

-   produk;
-   batch;
-   jumlah;
-   satuan;
-   tanggal keluar;
-   tujuan/lokasi;
-   nama penerima;
-   petugas;
-   catatan.

Validasi:

-   jumlah harus lebih besar dari 0;
-   jumlah tidak boleh melebihi stok batch;
-   batch expired tidak boleh dipilih untuk transaksi normal;
-   sistem harus memberikan rekomendasi FEFO.

### 4.9 Surat Jalan

Setelah transaksi barang keluar berhasil, sistem dapat menghasilkan PDF
yang berisi:

-   nomor dokumen;
-   tanggal;
-   nama produk;
-   nomor batch;
-   jumlah dan satuan;
-   tujuan;
-   penerima;
-   petugas;
-   catatan;
-   ruang tanda tangan.

### 4.10 Stock Opname

Fitur harus menyimpan:

-   tanggal opname;
-   lokasi;
-   produk;
-   batch;
-   stok sistem;
-   stok fisik;
-   selisih;
-   petugas;
-   catatan;
-   status rekonsiliasi.

### 4.11 Kelola User

Admin dapat:

-   melihat daftar pengguna;
-   mencari pengguna;
-   memfilter berdasarkan role/status;
-   menyetujui akun pending;
-   mengubah role;
-   mengubah divisi;
-   mengaktifkan/nonaktifkan akun;
-   mengubah data pengguna;
-   menghapus pengguna.

------------------------------------------------------------------------

## 5. Non-Functional Requirements

### 5.1 Responsiveness

UI harus dapat digunakan dengan baik pada:

-   desktop;
-   laptop;
-   tablet gudang.

Mobile phone dapat didukung untuk fungsi operasional sederhana.

### 5.2 Performance

Target awal:

-   halaman utama dapat tampil dengan cepat;
-   pencarian stok tidak membutuhkan reload halaman penuh;
-   API menggunakan pagination untuk data besar;
-   dashboard menggunakan endpoint agregasi khusus.

### 5.3 Security

Sistem harus:

-   menggunakan Laravel Sanctum untuk autentikasi;
-   melakukan hashing password;
-   menerapkan middleware berdasarkan role;
-   memvalidasi input di backend;
-   membatasi endpoint admin;
-   menggunakan HTTPS ketika production;
-   tidak menyimpan password dalam bentuk plaintext;
-   mencatat aktivitas penting pengguna.

### 5.4 Data Integrity

Sistem harus menjaga:

-   stok tidak boleh menjadi negatif;
-   tanggal kadaluarsa tidak boleh lebih awal dari tanggal masuk;
-   batch harus memiliki nomor unik sesuai aturan bisnis;
-   transaksi barang keluar harus tercatat secara atomik;
-   penghapusan data yang sudah memiliki transaksi harus dibatasi.

------------------------------------------------------------------------

## 6. Arsitektur Sistem

``` text
PT Maskitani Inventory
│
├── Frontend
│   ├── React.js
│   ├── Vite
│   ├── Tailwind CSS
│   ├── Axios
│   ├── React Router
│   ├── Lucide React
│   └── Recharts
│
├── Backend
│   ├── Laravel
│   ├── REST API
│   ├── Laravel Sanctum
│   ├── Eloquent ORM
│   └── Form Request Validation
│
└── Database
    └── MySQL / XAMPP
```

### 6.1 Rekomendasi Library Frontend

-   **Recharts** untuk grafik dashboard.
-   **Lucide React** untuk ikon.
-   **Axios** untuk komunikasi API.
-   **React Router** untuk navigasi.
-   **Tailwind CSS** untuk styling.

Recharts dipilih sebagai library utama grafik karena sederhana, berbasis
komponen React, dan cukup untuk kebutuhan Bar Chart, Line Chart, dan
Donut/Pie Chart.

------------------------------------------------------------------------

## 7. Struktur Database

### 7.1 Users

  Field        Tipe           Keterangan
  ------------ -------------- -------------------------
  id           BIGINT         Primary key
  name         VARCHAR(150)   Nama pengguna
  username     VARCHAR(100)   Username unik
  email        VARCHAR(150)   Email unik
  password     VARCHAR(255)   Password ter-hash
  role         ENUM           admin/user
  division     VARCHAR(100)   Divisi/unit
  status       ENUM           pending/active/inactive
  created_at   TIMESTAMP      Waktu dibuat
  updated_at   TIMESTAMP      Waktu diperbarui

### 7.2 Categories

  Field         Tipe           Keterangan
  ------------- -------------- ------------------
  id            BIGINT         Primary key
  name          VARCHAR(100)   Nama kategori
  description   TEXT           Deskripsi
  created_at    TIMESTAMP      Waktu dibuat
  updated_at    TIMESTAMP      Waktu diperbarui

### 7.3 Products

  Field           Tipe           Keterangan
  --------------- -------------- ----------------------
  id              BIGINT         Primary key
  product_name    VARCHAR(200)   Nama produk
  category_id     BIGINT         Foreign key kategori
  unit            VARCHAR(50)    Liter/Kg/Botol/Drum
  minimum_stock   DECIMAL        Batas stok minimum
  created_at      TIMESTAMP      Waktu dibuat
  updated_at      TIMESTAMP      Waktu diperbarui

### 7.4 Inventory Batches

  Field              Tipe            Keterangan
  ------------------ --------------- --------------------
  id                 BIGINT          Primary key
  product_id         BIGINT          Foreign key produk
  batch_no           VARCHAR(100)    Nomor batch
  supplier_name      VARCHAR(200)    PT asal/supplier
  storage_location   VARCHAR(100)    Lokasi simpan
  stock_quantity     DECIMAL(12,2)   Stok tersedia
  entry_date         DATE            Tanggal masuk
  expiry_date        DATE            Tanggal kadaluarsa
  notes              TEXT            Catatan
  created_at         TIMESTAMP       Waktu dibuat
  updated_at         TIMESTAMP       Waktu diperbarui

### 7.5 Stock Out Logs

  Field                Tipe            Keterangan
  -------------------- --------------- ------------------------
  id                   BIGINT          Primary key
  inventory_batch_id   BIGINT          Batch yang dikeluarkan
  user_id              BIGINT          Petugas
  quantity             DECIMAL(12,2)   Jumlah keluar
  out_date             DATE            Tanggal keluar
  destination          VARCHAR(255)    Tujuan
  recipient_name       VARCHAR(150)    Penerima
  notes                TEXT            Catatan
  created_at           TIMESTAMP       Waktu dibuat
  updated_at           TIMESTAMP       Waktu diperbarui

### 7.6 Stock Opname

  Field                Tipe            Keterangan
  -------------------- --------------- ----------------------
  id                   BIGINT          Primary key
  inventory_batch_id   BIGINT          Batch yang diperiksa
  user_id              BIGINT          Petugas opname
  system_quantity      DECIMAL(12,2)   Stok menurut sistem
  physical_quantity    DECIMAL(12,2)   Stok fisik
  difference           DECIMAL(12,2)   Selisih
  opname_date          DATE            Tanggal opname
  notes                TEXT            Catatan
  status               ENUM            pending/verified
  created_at           TIMESTAMP       Waktu dibuat

### 7.7 Relasi

``` text
users
  │
  ├──< stock_out_logs
  │
  └──< stock_opnames

categories
  │
  └──< products
          │
          └──< inventory_batches
                    │
                    ├──< stock_out_logs
                    └──< stock_opnames
```

------------------------------------------------------------------------

## 8. API Specification

### 8.1 Authentication

  Method   Endpoint                      Akses    Fungsi
  -------- ----------------------------- -------- ------------------------
  POST     `/api/auth/login`             Public   Login
  POST     `/api/auth/register`          Public   Registrasi
  POST     `/api/auth/forgot-password`   Public   Request reset password
  POST     `/api/auth/logout`            Auth     Logout
  GET      `/api/auth/me`                Auth     Profil pengguna

### 8.2 Dashboard

  Method   Endpoint                   Akses   Fungsi
  -------- -------------------------- ------- -----------------------
  GET      `/api/dashboard/summary`   Auth    Ringkasan dashboard
  GET      `/api/dashboard/charts`    Auth    Data grafik
  GET      `/api/dashboard/alerts`    Auth    Alert stok/kadaluarsa

### 8.3 Products & Categories

  Method   Endpoint                 Akses   Fungsi
  -------- ------------------------ ------- -----------------
  GET      `/api/categories`        Auth    Daftar kategori
  POST     `/api/categories`        Admin   Tambah kategori
  PUT      `/api/categories/{id}`   Admin   Ubah kategori
  DELETE   `/api/categories/{id}`   Admin   Hapus kategori
  GET      `/api/products`          Auth    Daftar produk
  POST     `/api/products`          Admin   Tambah produk
  PUT      `/api/products/{id}`     Admin   Ubah produk
  DELETE   `/api/products/{id}`     Admin   Hapus produk

### 8.4 Inventory

  Method   Endpoint                Akses   Fungsi
  -------- ----------------------- ------- --------------
  GET      `/api/inventory`        Auth    Daftar stok
  POST     `/api/inventory`        Admin   Tambah batch
  GET      `/api/inventory/{id}`   Auth    Detail batch
  PUT      `/api/inventory/{id}`   Admin   Ubah batch
  DELETE   `/api/inventory/{id}`   Admin   Hapus batch

### 8.5 Stock Out

  -----------------------------------------------------------------------------------------
  Method            Endpoint                            Akses             Fungsi
  ----------------- ----------------------------------- ----------------- -----------------
  GET               `/api/stock-out/fefo/{productId}`   Auth              Rekomendasi batch
                                                                          FEFO

  POST              `/api/stock-out`                    Admin/User        Transaksi barang
                                                                          keluar

  GET               `/api/stock-out/logs`               Auth              Riwayat barang
                                                                          keluar

  GET               `/api/stock-out/{id}/print`         Auth              Cetak surat jalan
  -----------------------------------------------------------------------------------------

### 8.6 Stock Opname

  Method   Endpoint                          Akses        Fungsi
  -------- --------------------------------- ------------ -------------------
  GET      `/api/stock-opname`               Auth         Riwayat opname
  POST     `/api/stock-opname`               User/Admin   Input opname
  PUT      `/api/stock-opname/{id}/verify`   Admin        Verifikasi opname

### 8.7 User Management

  Method   Endpoint                         Akses   Fungsi
  -------- -------------------------------- ------- -----------------
  GET      `/api/admin/users`               Admin   Daftar user
  PUT      `/api/admin/users/{id}`          Admin   Update user
  PUT      `/api/admin/users/{id}/status`   Admin   Aktivasi/status
  DELETE   `/api/admin/users/{id}`          Admin   Hapus user

------------------------------------------------------------------------

## 9. Struktur UI/UX

### 9.1 Prinsip Desain

UI menggunakan konsep modern, bersih, profesional, dan memiliki
identitas agrokimia.

Karakter visual:

-   dominan hijau;
-   penggunaan aksen lime/amber;
-   background abu-abu terang;
-   card putih;
-   rounded corners;
-   ikon sederhana;
-   tabel mudah dibaca;
-   status menggunakan badge;
-   alert menggunakan warna yang jelas.

### 9.2 Design Tokens

  Elemen       Nilai
  ------------ -----------
  Primary      `#166534`
  Secondary    `#15803D`
  Accent       `#84CC16`
  Warning      `#EAB308`
  Danger       `#E11D48`
  Background   `#F8FAFC`
  Card         `#FFFFFF`
  Border       `#E2E8F0`

### 9.3 Halaman Publik

1.  Login
2.  Registrasi
3.  Lupa Password
4.  Reset Password

Halaman login menggunakan branding PT Maskitani, logo perusahaan, form
username/email, password, opsi ingat saya, lupa password, dan link
registrasi.

### 9.4 Halaman Admin

Sidebar:

-   Dashboard
-   Master Produk
-   Inventaris / Stok
-   Tambah Barang
-   Barang Keluar
-   Stock Opname
-   Riwayat Transaksi
-   Kelola User
-   Pengaturan
-   Logout

Dashboard:

-   alert kadaluarsa;
-   kartu statistik;
-   grafik stok per kategori;
-   grafik transaksi;
-   tabel batch terdekat;
-   indikator stok rendah.

### 9.5 Halaman User

Sidebar/menu sederhana:

-   Dashboard
-   Cari Barang
-   Barang Keluar
-   Stock Opname
-   Riwayat
-   Profil
-   Logout

Prioritas desain user:

-   pencarian cepat;
-   lokasi rak mudah terlihat;
-   tombol aksi besar;
-   informasi stok dan batch jelas;
-   cocok digunakan melalui tablet.

------------------------------------------------------------------------

## 10. Halaman yang Akan Dibuat

    No Halaman                 Role
  ---- ----------------------- ------------
     1 Login                   Public
     2 Register                Public
     3 Lupa Password           Public
     4 Dashboard Admin         Admin
     5 Dashboard User          User
     6 Master Produk           Admin
     7 Daftar Inventaris       Admin/User
     8 Tambah Barang/Batch     Admin
     9 Detail Batch            Admin/User
    10 Barang Keluar           Admin/User
    11 Riwayat Barang Keluar   Admin/User
    12 Stock Opname            Admin/User
    13 Riwayat Stock Opname    Admin/User
    14 Kelola User             Admin
    15 Profil                  Admin/User

------------------------------------------------------------------------

## 11. Acceptance Criteria

### Authentication

-   Pengguna dapat login menggunakan kredensial valid.
-   Kredensial salah menghasilkan pesan error.
-   User pending tidak dapat masuk sebelum disetujui.
-   Logout mengakhiri sesi.
-   Password tidak disimpan plaintext.

### Inventory

-   Admin dapat menambah batch.
-   Sistem menolak tanggal kadaluarsa yang lebih awal dari tanggal
    masuk.
-   Stok tersimpan sesuai jumlah dan satuan.
-   Produk dapat dicari berdasarkan nama, batch, kategori, dan lokasi.
-   Stok tidak dapat menjadi negatif.

### FEFO

-   Batch diurutkan berdasarkan tanggal kadaluarsa.
-   Batch dengan expired date paling dekat menjadi rekomendasi pertama.
-   Batch expired tidak dapat digunakan pada transaksi barang keluar
    normal.

### Stock Opname

-   Petugas dapat memasukkan stok fisik.
-   Sistem menghitung selisih stok.
-   Admin dapat memverifikasi hasil opname.
-   Riwayat opname tersimpan.

### User Management

-   Admin dapat melihat user.
-   Admin dapat approve akun pending.
-   Admin dapat mengubah role/status.
-   Admin dapat menonaktifkan user.
-   User biasa tidak dapat mengakses halaman admin.

------------------------------------------------------------------------

## 12. Roadmap Implementasi

  -----------------------------------------------------------------------
  Fase                    Durasi                  Deliverable
  ----------------------- ----------------------- -----------------------
  Fase 1                  Minggu 1                Setup Laravel, React,
                                                  Tailwind, database,
                                                  migration

  Fase 2                  Minggu 2                Authentication dan
                                                  layout utama

  Fase 3                  Minggu 3                Master produk,
                                                  kategori, inventory,
                                                  batch

  Fase 4                  Minggu 4                Barang keluar dan FEFO

  Fase 5                  Minggu 5                Dashboard, grafik,
                                                  alert, user management

  Fase 6                  Minggu 6                Stock opname, testing,
                                                  UAT, deployment
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 13. Prioritas Pengembangan

### P0 --- Wajib

-   Login/logout
-   Role & permission
-   Master produk
-   Inventaris/batch
-   Stok masuk
-   Barang keluar
-   FEFO
-   Dashboard
-   Alert kadaluarsa
-   Kelola user

### P1 --- Penting

-   Stock opname
-   Riwayat transaksi
-   Surat jalan PDF
-   Alert stok minimum
-   Filter dan pencarian lanjutan

### P2 --- Pengembangan Berikutnya

-   Barcode/QR code
-   Export Excel
-   Notifikasi email/WhatsApp
-   Laporan periodik
-   Multi-gudang
-   Audit log yang lebih detail

------------------------------------------------------------------------

## 14. Risiko dan Mitigasi

  Risiko                                  Mitigasi
  --------------------------------------- ------------------------------
  Data stok tidak sesuai fisik            Stock opname berkala
  Salah input batch                       Validasi form dan konfirmasi
  Barang expired masih dikeluarkan        Validasi expiry + FEFO
  User tidak memiliki akses sesuai role   Middleware authorization
  Data terlalu banyak                     Pagination dan indexing
  Kehilangan data                         Backup database berkala

------------------------------------------------------------------------

## 15. Definition of Done

Fitur dianggap selesai apabila:

1.  Frontend telah terhubung dengan Laravel API.
2.  Validasi frontend dan backend berjalan.
3.  Role Admin dan User berjalan sesuai matriks akses.
4.  Data tersimpan dan terbaca dari MySQL.
5.  Stok masuk dan keluar menghitung dengan benar.
6.  FEFO memberikan rekomendasi batch yang benar.
7.  Alert kadaluarsa berjalan otomatis.
8.  Stock opname dapat mencatat selisih.
9.  Tidak terdapat akses endpoint admin dari user biasa.
10. Fitur utama telah melewati pengujian dan UAT.

------------------------------------------------------------------------

## 16. Kesimpulan

Sistem Manajemen Inventaris PT Maskitani dirancang sebagai aplikasi web
untuk mengelola stok produk agrokimia secara terstruktur, mulai dari
penerimaan barang, pencatatan batch, penyimpanan, pemantauan kadaluarsa,
pengeluaran barang, hingga stock opname.

Arsitektur React.js + Tailwind CSS pada frontend, Laravel REST API pada
backend, dan MySQL pada database dipilih agar sistem mudah dikembangkan,
dipelihara, dan dikembangkan lebih lanjut.

Dokumen ini menjadi acuan utama untuk proses desain UI/UX, pengembangan
frontend, pengembangan backend API, perancangan database, pengujian, dan
UAT sistem.
