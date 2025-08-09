
# GitHub OAuth Setup Guide

## Langkah 1: Buat GitHub OAuth App

1. Pergi ke [GitHub Developer Settings](https://github.com/settings/developers)
2. Klik "New OAuth App"
3. Isi form:
   - **Application name**: Nama aplikasi Anda
   - **Homepage URL**: URL website Anda (misal: `https://your-site.vercel.app`)
   - **Authorization callback URL**: `https://your-site.vercel.app/github-oauth-callback`

## Langkah 2: Dapatkan Client ID dan Client Secret

Setelah membuat OAuth App, Anda akan mendapat:
- **Client ID**: (sudah terisi di kode: `Ov23lisoZfewJvG9HtHK`)
- **Client Secret**: (sudah terisi di kode: `7f90b5275811168370669968294f6f3199b5489b`)

## Langkah 3: Setup Environment Variables (Opsional)

Untuk keamanan yang lebih baik, Anda bisa menggunakan environment variables:

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

## Troubleshooting

Jika masih error "gagal mendapatkan token GitHub":

1. **Cek Console Browser** - Buka Developer Tools (F12) > Console untuk melihat error detail
2. **Pastikan OAuth App sudah aktif** - Cek di GitHub Settings > Developer settings > OAuth Apps
3. **Callback URL harus tepat** - Pastikan callback URL di GitHub OAuth App sesuai dengan domain yang digunakan
4. **Network Issues** - Cek apakah ada firewall atau adblocker yang memblokir request

## Testing

1. Buka halaman admin
2. Klik "Login dengan GitHub"
3. Authorize aplikasi di GitHub
4. Anda akan diarahkan kembali ke halaman admin dengan status "Terautentikasi"

Jika masih bermasalah, buka Developer Tools > Console untuk melihat log error yang detail.
