const ACCOUNT_CODE = {
  in: "4", // pendapatan
  out: "5", // belanja
  cost: "6", // pembiayaan
};

const COLORS = {
  main: "#1C4F49",
  mainDark: "#18423d",
  secondary: "#FC671A",
  secondaryOpacity: "rgba(252, 103, 26, 0.3)",
  info: "#1677FF",
  success: "#22C55E",
  danger: "#EF4444",
  disable: "#64748B",
  white: "#FFFFFF",
  black: "#000000",
};
/* 
  Usernames can only have: 
  - Letters (a-zA-Z) 
  - Numbers (0-9)
  - Dots (.)
  - Underscores (_)
*/
const REGEX_USERNAME = /^[a-zA-Z0-9_.]+$/;
const DATE_UTC = "Asia/Jakarta";
const DATE_FORMAT_DB = "YYYY-MM-DD";
const DATE_FORMAT_VIEW = "DD MMMM YYYY";
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const PAGINATION = { pagination: { current: 1, pageSize: 10 } };
const MESSAGE = {
  add: "Data berhasil ditambah",
  edit: "Data berhasil diperbarui",
  delete: "Data berhasil dihapus",
};
const MENU_ITEM = [
  {
    key: "/",
    label: "Beranda",
    roles: [1, 2, 3, 4],
    nav: "/",
  },
  {
    key: "/rekening",
    label: "Master Rekening",
    roles: [1, 3],
    nav: "rekening",
  },
  {
    key: "/transaksi",
    label: "Data Entry",
    roles: [1, 2, 3, 4],
    children: [
      {
        key: "/anggaran",
        label: "Data Anggaran",
        roles: [1, 2, 3, 4],
        children: [
          {
            key: "/anggaran/pendapatan",
            label: "Pendapatan",
            nav: "transaksi/anggaran/pendapatan",
            roles: [1, 2, 3, 4],
          },
          {
            key: "/anggaran/belanja",
            label: "Belanja",
            nav: "transaksi/anggaran/belanja",
            roles: [1, 2, 3, 4],
          },
          {
            key: "/anggaran/pembiayaan",
            label: "Pembiayaan",
            nav: "transaksi/anggaran/pembiayaan",
            roles: [1, 2, 3, 4],
          },
        ],
      },
      {
        key: "/realisasi",
        label: "Data Realisasi",
        roles: [1, 2, 3, 4],
        children: [
          {
            key: "/realisasi/pendapatan",
            label: "Pendapatan",
            nav: "transaksi/realisasi/pendapatan",
            roles: [1, 2, 3, 4],
          },
          {
            key: "/realisasi/belanja",
            label: "Belanja",
            nav: "transaksi/realisasi/belanja",
            roles: [1, 2, 3, 4],
          },
          {
            key: "/realisasi/pembiayaan",
            label: "Pembiayaan",
            nav: "transaksi/realisasi/pembiayaan",
            roles: [1, 2, 3, 4],
          },
          {
            key: "/realisasi/download-template",
            label: "Download Template",
            nav: null,
            roles: [2, 4],
          },
        ],
      },
    ],
  },
  {
    key: "/laporan",
    label: "Laporan",
    roles: [1, 2, 3, 4],
    children: [
      {
        key: "/laporan/realisasi-anggaran-kota",
        label: "Realisasi Anggaran Kab/Kota",
        nav: "laporan/realisasi-anggaran-kota",
        roles: [1, 2, 3, 4],
      },
      {
        key: "/laporan/realisasi-anggaran-gabungan-kota",
        label: "Realisasi Anggaran Seluruh Kab/Kota",
        nav: "laporan/realisasi-anggaran-gabungan-kota",
        roles: [1, 3],
      },
      {
        key: "/laporan/rekapitulasi-pendapatan-dan-belanja",
        label: "Rekapitulasi Pendapatan & Belanja",
        nav: "laporan/rekapitulasi-pendapatan-dan-belanja",
        roles: [1, 3],
      },
    ],
  },
  {
    key: "/pengaturan",
    label: "Pengaturan",
    roles: [1, 3],
    children: [
      {
        key: "/pengaturan/kota",
        label: "Kota",
        nav: "pengaturan/kota",
        roles: [1, 3],
      },
      {
        key: "/pengaturan/penanda-tangan",
        label: "Penanda Tangan",
        nav: "pengaturan/penanda-tangan",
        roles: [1, 3],
      },
      {
        key: "/pengaturan/pengguna",
        label: "Pengguna",
        nav: "pengaturan/pengguna",
        roles: [1, 3],
      },
    ],
  },
];
const MENU_NAVIGATION = {
  rekening: "Rekening Akun",
  kelompok: "Rekening Kelompok",
  jenis: "Rekening Jenis",
  objek: "Rekening Objek",
  objek_detail: "Rekening Objek Detail",
  objek_detail_sub: "Rekening Objek Detail Sub",
  "/transaksi/anggaran/pendapatan": "Data Anggaran Pendapatan",
  "/transaksi/anggaran/belanja": "Data Anggaran Belanja",
  "/transaksi/anggaran/pembiayaan": "Data Anggaran Pembiayaan",
  "/transaksi/realisasi/pendapatan": "Data Realisasi Pendapatan",
  "/transaksi/realisasi/belanja": "Data Realisasi Belanja",
  "/transaksi/realisasi/pembiayaan": "Data Realisasi Pembiayaan",
  "/laporan/realisasi-anggaran-kota": "Laporan Realisasi Anggaran Kab/Kota",
  "/laporan/realisasi-anggaran-gabungan-kota":
    "Laporan Realisasi Anggaran Seluruh Kab/Kota",
  "/laporan/rekapitulasi-pendapatan-dan-belanja":
    "Laporan Rekapitulasi Pendapatan & Belanja",
  "/pengaturan/kota": "Pengaturan Kota",
  "/pengaturan/penanda-tangan": "Pengaturan Penanda Tangan",
  "/pengaturan/pengguna": "Pengaturan Pengguna",
};
const EXPORT_TARGET = {
  city: {
    filename: `SIBEDA-MASTER-KOTA`,
    headers: [
      { header: "No", key: "no", width: 5 },
      { header: "Nama Kota", key: "label", width: 30 },
      { header: "Aktif", key: "active", width: 10 },
    ],
  },
  signer: {
    filename: `SIBEDA-MASTER-PENANDA-TANGAN`,
    headers: [
      { header: "No", key: "no", width: 5 },
      { header: "NIP", key: "nip", width: 20 },
      { header: "Nama", key: "fullname", width: 35 },
      { header: "Jabatan", key: "title", width: 35 },
      { header: "Aktif", key: "active", width: 10 },
    ],
  },
  user: {
    filename: `SIBEDA-MASTER-PENGGUNA`,
    headers: [
      { header: "No", key: "no", width: 5 },
      { header: "Nama Pengguna", key: "username", width: 35 },
      { header: "Nama", key: "fullname", width: 35 },
      { header: "Jabatan", key: "title", width: 35 },
      { header: "Aktif", key: "active", width: 10 },
    ],
  },
  account_base: {
    filename: `SIBEDA-MASTER-REKENING-AKUN`,
    headers: [
      { header: "No", key: "no", width: 5 },
      { header: "Label", key: "label", width: 10 },
      { header: "Keterangan", key: "remark", width: 35 },
      { header: "Aktif", key: "active", width: 10 },
    ],
  },
  account_group: {
    filename: `SIBEDA-MASTER-REKENING-KELOMPOK`,
    headers: [
      { header: "No", key: "no", width: 5 },
      { header: "Akun Rekening", key: "account_base_label", width: 35 },
      { header: "Label", key: "label", width: 10 },
      { header: "Keterangan", key: "remark", width: 35 },
      { header: "Aktif", key: "active", width: 10 },
    ],
  },
  account_type: {
    filename: `SIBEDA-MASTER-REKENING-JENIS`,
    headers: [
      { header: "No", key: "no", width: 5 },
      { header: "Kelompok Rekening", key: "account_group_label", width: 35 },
      { header: "Label", key: "label", width: 10 },
      { header: "Keterangan", key: "remark", width: 35 },
      { header: "Aktif", key: "active", width: 10 },
    ],
  },
  account_object: {
    filename: `SIBEDA-MASTER-REKENING-OBJEK`,
    headers: [
      { header: "No", key: "no", width: 5 },
      { header: "Jenis Rekening", key: "account_type_label", width: 35 },
      { header: "Label", key: "label", width: 35 },
      { header: "Keterangan", key: "remark", width: 35 },
      { header: "Aktif", key: "active", width: 10 },
    ],
  },
  account_object_detail: {
    filename: `SIBEDA-MASTER-REKENING-OBJEK-DETAIL`,
    headers: [
      { header: "No", key: "no", width: 5 },
      { header: "Objek Rekening", key: "account_object_label", width: 35 },
      { header: "Label", key: "label", width: 35 },
      { header: "Keterangan", key: "remark", width: 35 },
      { header: "Aktif", key: "active", width: 10 },
    ],
  },
  account_object_detail_sub: {
    filename: `SIBEDA-MASTER-REKENING-OBJEK-DETAIL-SUB`,
    headers: [
      { header: "No", key: "no", width: 5 },
      {
        header: "Objek Detail Rekening",
        key: "account_object_detail_label",
        width: 35,
      },
      { header: "Label", key: "label", width: 35 },
      { header: "Keterangan", key: "remark", width: 35 },
      { header: "Aktif", key: "active", width: 10 },
    ],
  },
  budget: {
    filename: `SIBEDA-MASTER-DATA-ENTRY-ANGGARAN`,
    headers: [
      { header: "No", key: "no", width: 5 },
      { header: "Tanggal", key: "date", width: 20 },
      { header: "Kab/Kota", key: "city_label", width: 35 },
      {
        header: "Rekening",
        key: "account_object_detail_sub_label",
        width: 35,
      },
      { header: "Anggaran", key: "amount", width: 20 },
    ],
  },
  realization: {
    filename: `SIBEDA-MASTER-DATA-ENTRY-REALISASI`,
    headers: [
      { header: "No", key: "no", width: 5 },
      { header: "Tanggal", key: "date", width: 20 },
      { header: "Kab/Kota", key: "city_label", width: 35 },
      {
        header: "Rekening",
        key: "account_object_detail_sub_label",
        width: 35,
      },
      { header: "Realisasi", key: "amount", width: 20 },
    ],
  },
};
const CUSTOM_ROUTE_ACCOUNT = {
  rekening: ["beranda", "rekening"],
  kelompok: ["beranda", "rekening", "kelompok"],
  jenis: ["beranda", "rekening", "kelompok", "jenis"],
  objek: ["beranda", "rekening", "kelompok", "jenis", "objek"],
  objek_detail: [
    "beranda",
    "rekening",
    "kelompok",
    "jenis",
    "objek",
    "objek_detail",
  ],
  objek_detail_sub: [
    "beranda",
    "rekening",
    "kelompok",
    "jenis",
    "objek",
    "objek_detail",
    "objek_detail_sub",
  ],
};

export {
  ACCOUNT_CODE,
  COLORS,
  MENU_ITEM,
  MENU_NAVIGATION,
  REGEX_USERNAME,
  PAGINATION,
  MESSAGE,
  EXPORT_TARGET,
  DATE_UTC,
  DATE_FORMAT_VIEW,
  DATE_FORMAT_DB,
  MONTHS,
  CUSTOM_ROUTE_ACCOUNT,
};
