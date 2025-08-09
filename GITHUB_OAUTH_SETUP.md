
# Setup GitHub OAuth

## 1. Environment Variables
Tambahkan ke Replit Secrets atau file `.env`:

```
GITHUB_CLIENT_ID=Ov23lisoZfewJvG9HtHK
GITHUB_CLIENT_SECRET=your_actual_secret_here
```

## 2. GitHub OAuth App Configuration
1. Buka https://github.com/settings/developers
2. Klik "New OAuth App"
3. Application name: `Website Mahapala Narotama`
4. Homepage URL: `https://your-repl-name.username.repl.co`
5. Authorization callback URL: `https://your-repl-name.username.repl.co/github-oauth-callback`

## 3. Repository Setup
Pastikan repository target sudah ada dan accessible:
- Repository: `mahapalanarotama/OfficialWebsite`
- Branch: `main`
- Folder untuk upload: `uploads/images/`

## 4. Testing
1. Login ke admin page
2. Buka form tambah/edit dengan image upload
3. Klik "Login dengan GitHub"
4. Authorize aplikasi
5. Upload gambar untuk test

## 5. Troubleshooting
- Jika OAuth gagal: Periksa callback URL di GitHub settings
- Jika upload gagal: Periksa permissions repository dan token scope
- Jika raw URL tidak benar: Pastikan path repository benar
